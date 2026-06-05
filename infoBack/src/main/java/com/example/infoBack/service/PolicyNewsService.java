package com.example.infoBack.service;

import com.example.infoBack.config.WelfareApiProperties;
import com.example.infoBack.dto.AnnouncementResponse;
import com.example.infoBack.dto.welfare.PolicyNewsApiResponse;
import com.example.infoBack.dto.welfare.PressReleaseItem;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.HtmlUtils;

import java.text.Normalizer;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PolicyNewsService {

    private final WelfareApiProperties props;
    private final RestTemplate restTemplate;
    private final XmlMapper xmlMapper;

    private static final DateTimeFormatter API_FMT      = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final DateTimeFormatter API_DATE_FMT = DateTimeFormatter.ofPattern("MM/dd/yyyy HH:mm:ss");
    private static final DateTimeFormatter DISPLAY_FMT  = DateTimeFormatter.ofPattern("yyyy.MM.dd");

    // MinisterCode(숫자 코드) → 부처명 매핑
    private static final Map<String, String> CODE_TO_DEPT = Map.ofEntries(
            Map.entry("102", "교육부"),
            Map.entry("108", "행정안전부"),
            Map.entry("112", "보건복지부"),
            Map.entry("113", "환경부"),
            Map.entry("114", "고용노동부"),
            Map.entry("115", "여성가족부"),
            Map.entry("116", "국토교통부"),
            Map.entry("118", "중소벤처기업부"),
            Map.entry("119", "금융위원회"),
            Map.entry("B102", "교육부"),
            Map.entry("B108", "행정안전부"),
            Map.entry("B112", "보건복지부"),
            Map.entry("B114", "고용노동부"),
            Map.entry("B115", "여성가족부"),
            Map.entry("B116", "국토교통부"),
            Map.entry("B118", "중소벤처기업부"),
            Map.entry("B119", "금융위원회")
    );

    // 한국어 부처명 → 영어 코드: 필터 비교는 ASCII 코드로만 수행 (한글 인코딩 이슈 완전 제거)
    private static final Map<String, String> DEPT_TO_CODE = Map.of(
            "보건복지부", "HEALTH",
            "고용노동부", "EMPLOYMENT",
            "금융위원회", "FINANCE",
            "국토교통부", "LAND",
            "여성가족부", "GENDER",
            "교육부",     "EDUCATION",
            "행정안전부", "ADMIN",
            "중소벤처기업부", "SME"
    );

    // Set 반복 순서가 비결정적이므로, ministerNm 정규화에는 순서가 보장된 List 사용
    // (긴 이름을 앞에 두어 잘못된 prefix 매칭 방지)
    private static final List<String> DEPT_NORMALIZE_LIST = List.of(
            "중소벤처기업부", "국토교통부", "여성가족부", "행정안전부",
            "보건복지부", "고용노동부", "금융위원회", "교육부"
    );

    // 1시간 메모리 캐시 (volatile: 멀티스레드 가시성 보장)
    private volatile List<AnnouncementResponse> cache;
    private volatile long cacheExpiry = 0;

    public void forceRefresh() {
        synchronized (this) {
            cacheExpiry = 0;
            cache = null;
        }
        getRecentNews(14);
    }

    public List<AnnouncementResponse> getRecentNews(int days) {
        // 빠른 경로: 캐시 유효하면 즉시 반환
        if (System.currentTimeMillis() < cacheExpiry && cache != null) {
            return cache;
        }
        synchronized (this) {
            // 두 스레드가 동시에 만료를 감지했을 때 한 번만 갱신 (double-checked locking)
            if (System.currentTimeMillis() < cacheExpiry && cache != null) {
                return cache;
            }
            if (!props.isConfigured()) {
                log.warn("복지 API 키가 설정되지 않아 정책 소식을 불러올 수 없습니다.");
                return Collections.emptyList();
            }
            try {
                List<AnnouncementResponse> result = fetchNews(days);
                cache = result;
                cacheExpiry = System.currentTimeMillis() + 3_600_000L;
                log.info("정책 소식 로드 완료: {}건", result.size());
                return result;
            } catch (Exception e) {
                log.error("정책브리핑 API 오류: {}", e.getMessage(), e);
                return cache != null ? cache : Collections.emptyList();
            }
        }
    }

    private List<AnnouncementResponse> fetchNews(int days) throws Exception {
        List<PressReleaseItem> allItems = new ArrayList<>();
        LocalDate date  = LocalDate.now();
        LocalDate limit = date.minusDays(days);

        // 이 API는 날짜 범위를 줘도 startDate 하루 치만 반환 — 1일 단위로 조회
        int consecutiveErrors = 0;
        while (!date.isBefore(limit)) {
            List<PressReleaseItem> fetched = fetchChunk(date, date);
            if (fetched.isEmpty()) {
                consecutiveErrors++;
                if (consecutiveErrors >= 2) {
                    log.warn("연속 2일 API 오류 — 조회 중단 ({})", date);
                    break;
                }
            } else {
                consecutiveErrors = 0;
                allItems.addAll(fetched);
            }

            date = date.minusDays(1);
            if (!date.isBefore(limit)) {
                // 연속 호출 rate limit 방지
                try { Thread.sleep(300); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); break; }
            }
        }

        List<AnnouncementResponse> result = allItems.stream()
                .filter(item -> isWelfareRelated(resolveDept(item)))
                .map(this::toResponse)
                .collect(Collectors.toList());

        log.info("필터링 후 정책 소식: {}건 / 전체 {}건", result.size(), allItems.size());
        // 처음 10건: deptCode(ASCII)로 출력하여 콘솔 인코딩 무관하게 확인
        result.stream().limit(10).forEach(a ->
                log.info("  [기사] deptCode='{}', title='{}'", a.getDeptCode(),
                        a.getTitle() != null ? a.getTitle().substring(0, Math.min(30, a.getTitle().length())) : ""));
        // 부처별 집계 (ASCII 코드 기준)
        result.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getDeptCode().isEmpty() ? "(unknown)" : a.getDeptCode(),
                        Collectors.counting()))
                .forEach((code, cnt) -> log.info("  부처 분포: {} → {}건", code, cnt));
        return result;
    }

    private List<PressReleaseItem> fetchChunk(LocalDate from, LocalDate to) {
        String url = props.getNewsUrl()
                + "?serviceKey=" + props.getKey()
                + "&startDate=" + from.format(API_FMT)
                + "&endDate="   + to.format(API_FMT)
                + "&numOfRows=100";

        log.info("정책브리핑 API 요청: {} ~ {}", from, to);

        try {
            String xml = restTemplate.getForObject(url, String.class);
            if (xml == null || xml.isBlank()) {
                log.warn("정책브리핑 API 응답 비어 있음 ({} ~ {})", from, to);
                return Collections.emptyList();
            }
            if (xml.contains("THREE_DAYS_OVER_ERROR") || xml.contains("resultCode>98")) {
                log.warn("THREE_DAYS_OVER_ERROR 수신 ({} ~ {}) — 해당 구간 건너뜀", from, to);
                return Collections.emptyList();
            }
            List<PressReleaseItem> items = parseItems(xml);
            log.info("청크 ({} ~ {}): {}건", from, to, items.size());
            return items;
        } catch (Exception e) {
            // 외부 공공 API 장애 — 우리 코드 문제 아님, WARN 레벨로 기록
            log.warn("정책브리핑 API 오류 ({} ~ {}): {}", from, to, e.getMessage());
            return Collections.emptyList();
        }
    }

    // 실제 API 구조: response > body > NewsItem (복수)
    private List<PressReleaseItem> parseItems(String xml) {
        try {
            PolicyNewsApiResponse apiResponse = xmlMapper.readValue(xml, PolicyNewsApiResponse.class);
            if (apiResponse.getBody() != null && apiResponse.getBody().getNewsItems() != null) {
                List<PressReleaseItem> items = apiResponse.getBody().getNewsItems();
                log.info("파싱 성공: {}건", items.size());
                // 처음 3건의 원시 부처 필드를 유니코드 이스케이프로 출력 (Windows 콘솔 인코딩 무관)
                items.stream().limit(3).forEach(item -> {
                    String codeRaw  = item.getMinisterCode();
                    String nmRaw    = item.getMinisterNm();
                    String korDept  = resolveDept(item);
                    String deptCode = DEPT_TO_CODE.getOrDefault(korDept, "(N/A)");
                    log.info("  [RAW] ministerCode(\\u:{}) ministerNm(\\u:{}) -> deptCode='{}'",
                            toUnicodeEscapes(codeRaw),
                            toUnicodeEscapes(nmRaw),
                            deptCode);
                });
                return items;
            }
        } catch (Exception e) {
            log.warn("XML 파싱 실패: {}", e.getMessage());
        }
        return Collections.emptyList();
    }

    /** 비ASCII 문자를 \\uXXXX 형태로 변환 — Windows CP949 콘솔에서도 판독 가능 */
    private String toUnicodeEscapes(String s) {
        if (s == null) return "null";
        StringBuilder sb = new StringBuilder();
        for (char c : s.toCharArray()) {
            if (c > 127) sb.append(String.format("\\u%04X", (int) c));
            else sb.append(c);
        }
        return sb.toString();
    }

    /** 부처명 정규화.
     *  정책브리핑 API는 MinisterNm이 없고 MinisterCode 필드에 부처명을 직접 넣는 경우가 있음.
     *  두 필드 모두 normalizeDeptName으로 동일하게 처리한다. */
    private String resolveDept(PressReleaseItem item) {
        // 1순위: ministerNm
        if (item.getMinisterNm() != null && !item.getMinisterNm().isBlank()) {
            return normalizeDeptName(item.getMinisterNm().trim());
        }
        // 2순위: ministerCode
        // — 숫자 코드(예: "112")이면 CODE_TO_DEPT로 매핑
        // — 한글 부처명이 직접 들어온 경우(API 실측 행태)는 normalizeDeptName으로 정규화
        if (item.getMinisterCode() != null && !item.getMinisterCode().isBlank()) {
            String code = item.getMinisterCode().trim();
            String fromCode = CODE_TO_DEPT.get(code);
            if (fromCode != null) return fromCode;
            return normalizeDeptName(code);
        }
        return "";
    }

    /** "보건복지부장관" → "보건복지부" 등 직책·하위 부서 접미사 제거. 매칭 없으면 원값 반환.
     *  NFC 정규화로 API 응답 한글의 유니코드 형태 차이(NFC/NFD)를 흡수한다. */
    private String normalizeDeptName(String raw) {
        String nfc = Normalizer.normalize(raw, Normalizer.Form.NFC);
        for (String dept : DEPT_NORMALIZE_LIST) {
            if (nfc.startsWith(dept)) return dept;
        }
        return nfc;
    }

    private boolean isWelfareRelated(String department) {
        return DEPT_TO_CODE.containsKey(department);
    }

    private AnnouncementResponse toResponse(PressReleaseItem item) {
        String date = "";
        if (item.getApproveDate() != null && !item.getApproveDate().isBlank()) {
            try {
                // 실제 API 날짜 형식: "MM/dd/yyyy HH:mm:ss"
                date = LocalDateTime.parse(item.getApproveDate().trim(), API_DATE_FMT)
                        .toLocalDate()
                        .format(DISPLAY_FMT);
            } catch (Exception ignored) {}
        }
        String korDept  = resolveDept(item);
        String deptCode = DEPT_TO_CODE.getOrDefault(korDept, "");
        return AnnouncementResponse.builder()
                .id(item.getNewsItemId())
                .title(decodeHtml(item.getTitle()))
                .subTitle(decodeHtml(item.getSubTitle1()))
                .department(korDept)
                .deptCode(deptCode)
                .date(date)
                .url(item.getOriginalUrl())
                .build();
    }

    private String decodeHtml(String s) {
        if (s == null || s.isBlank()) return s;
        return HtmlUtils.htmlUnescape(s);
    }
}
