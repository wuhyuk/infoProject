package com.example.infoBack.service;

import com.example.infoBack.config.WelfareApiProperties;
import com.example.infoBack.dto.welfare.WelfareItem;
import com.example.infoBack.dto.welfare.WelfareListResponse;
import com.example.infoBack.entity.Benefit;
import com.example.infoBack.repository.BenefitRepository;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WelfareApiService {

    private final WelfareApiProperties props;
    private final BenefitRepository benefitRepository;
    private final RestTemplate restTemplate;
    private final XmlMapper xmlMapper;

    private final AtomicBoolean syncing = new AtomicBoolean(false);
    private static final int PAGE_SIZE = 100;
    private static final int MAX_PAGES = 5;

    public int syncAll() {
        if (!props.isConfigured()) {
            log.warn("공공데이터 API 키가 설정되지 않아 동기화를 건너뜁니다.");
            return 0;
        }
        if (!syncing.compareAndSet(false, true)) {
            log.info("이미 동기화 중입니다.");
            return 0;
        }
        try {
            int count = syncCentral();
            log.info("복지서비스 동기화 완료: 총 {}건", count);
            return count;
        } finally {
            syncing.set(false);
        }
    }

    private int syncCentral() {
        int total = 0;
        for (int page = 1; page <= MAX_PAGES; page++) {
            try {
                String xml = fetchPage(props.getCentralUrl(), page);
                if (xml == null || xml.isBlank()) break;

                WelfareListResponse response = xmlMapper.readValue(xml, WelfareListResponse.class);
                List<WelfareItem> items = response.getServList();
                if (items == null || items.isEmpty()) break;

                upsertAll(items);
                total += items.size();
                log.info("중앙부처 복지서비스 {}페이지: {}건 저장", page, items.size());

                if (items.size() < PAGE_SIZE) break;
            } catch (Exception e) {
                log.error("중앙부처 복지서비스 {}페이지 오류: {}", page, e.getMessage());
                break;
            }
        }
        return total;
    }

    private String fetchPage(String baseUrl, int page) {
        String url = baseUrl
                + "?serviceKey=" + props.getKey()
                + "&callTp=L"
                + "&pageNo=" + page
                + "&numOfRows=" + PAGE_SIZE
                + "&srchKeyCode=001";
        return restTemplate.getForObject(url, String.class);
    }

    public boolean hasData() {
        return benefitRepository.count() > 0;
    }

    // SELECT 413번 + 개별 save 413번 → SELECT 1번(IN절) + saveAll 1번(단일 트랜잭션)
    private void upsertAll(List<WelfareItem> items) {
        List<WelfareItem> valid = items.stream()
                .filter(i -> i.getServId() != null && i.getServNm() != null)
                .collect(Collectors.toList());

        List<String> ids = valid.stream().map(WelfareItem::getServId).collect(Collectors.toList());
        Map<String, Benefit> existing = benefitRepository.findAllByExternalIdIn(ids)
                .stream().collect(Collectors.toMap(Benefit::getExternalId, b -> b));

        List<Benefit> toSave = valid.stream().map(item -> {
            Benefit b = existing.getOrDefault(item.getServId(),
                    Benefit.builder().externalId(item.getServId()).source("api").build());
            applyFields(b, item);
            return b;
        }).collect(Collectors.toList());

        benefitRepository.saveAll(toSave);
    }

    private void applyFields(Benefit b, WelfareItem item) {
        b.setTitle(item.getServNm());
        b.setCategory(parseCategory(
                item.getServNm(),
                item.getIntrsThemaNmArray(),
                item.getServTypeNm(),
                item.getTrgterIndvdlNmArray(),
                item.getLifeNmArray()
        ));
        b.setDescription(item.getServDgst());
        b.setOrganization(item.getJurMnofNm());
        b.setApplyUrl(item.getServDtlLink());

        AgeRange age = parseAgeRange(item.getLifeNmArray());
        b.setMinAge(age.min);
        b.setMaxAge(age.max);

        String target = item.getTrgterIndvdlNmArray();
        b.setRequiresDisability(parseDisability(target));
        b.setFamilyType(parseFamilyType(target));
        b.setMaxIncomeLevel(parseIncomeLevel(target));
        b.setEmploymentStatus(parseEmploymentStatus(target));
        b.setTargetRegion(null); // 중앙부처는 전국
    }

    // ── 매핑 헬퍼 ─────────────────────────────────────────────

    private record AgeRange(Integer min, Integer max) {}

    private AgeRange parseAgeRange(String lifeNmArray) {
        if (lifeNmArray == null || lifeNmArray.isBlank()) return new AgeRange(null, null);
        Integer min = null, max = null;
        for (String token : lifeNmArray.split("[,·\\s]+")) {
            AgeRange r = lifeToRange(token.trim());
            if (r.min != null && (min == null || r.min < min)) min = r.min;
            if (r.max != null && (max == null || r.max > max)) max = r.max;
        }
        return new AgeRange(min, max);
    }

    private AgeRange lifeToRange(String life) {
        return switch (life) {
            case "영유아" -> new AgeRange(0, 5);
            case "아동" -> new AgeRange(6, 12);
            case "청소년" -> new AgeRange(13, 18);
            case "청년" -> new AgeRange(19, 34);
            case "중장년" -> new AgeRange(35, 64);
            case "노년", "노인", "어르신" -> new AgeRange(65, null);
            case "임산부" -> new AgeRange(15, 49);
            default -> new AgeRange(null, null);
        };
    }

    private Boolean parseDisability(String target) {
        return target != null && target.contains("장애");
    }

    private String parseFamilyType(String target) {
        if (target == null) return null;
        if (target.contains("한부모")) return "한부모";
        if (target.contains("다자녀") || target.contains("다문화")) return "다자녀";
        if (target.contains("1인가구") || target.contains("독거")) return "1인가구";
        return null;
    }

    private Integer parseIncomeLevel(String target) {
        if (target == null) return null;
        if (target.contains("기초생활수급")) return 1;
        if (target.contains("차상위")) return 2;
        if (target.contains("저소득")) return 3;
        if (target.contains("중위소득 50") || target.contains("중위소득50")) return 5;
        return null;
    }

    private String parseEmploymentStatus(String target) {
        if (target == null) return null;
        if (target.contains("실업") || target.contains("구직") || target.contains("미취업")) return "실업";
        if (target.contains("재직") || target.contains("취업자")) return "취업";
        return null;
    }

    private String parseCategory(String title, String theme, String serviceType, String target, String life) {
        // 제목이 가장 신뢰도 높음 — 모든 필드를 결합해서 판별
        String all = nvl(title) + " " + nvl(theme) + " " + nvl(serviceType)
                   + " " + nvl(target) + " " + nvl(life);

        // 장애인지원: 가장 먼저 — 다른 카테고리(주거·의료·취업 등)와 겹쳐도 장애인 대상이면 우선
        if (all.contains("장애")) return "장애인지원";

        // 노인복지: 노인/어르신/고령/노령/실버
        if (all.contains("노인") || all.contains("어르신") || all.contains("고령")
                || all.contains("노령") || all.contains("실버")) return "노인복지";

        // 육아·가족: 임신·출산·보육·육아·아동·영유아·한부모
        if (all.contains("육아") || all.contains("보육") || all.contains("출산")
                || all.contains("임신") || all.contains("영아") || all.contains("영유아")
                || all.contains("아동수당") || all.contains("아동") || all.contains("한부모")
                || all.contains("다자녀") || all.contains("임산부")
                || all.contains("입양") || all.contains("가족돌봄")) return "육아·가족";

        // 주거: 주거·주택·임대·전세·월세·이사
        if (all.contains("주거") || all.contains("주택") || all.contains("임대")
                || all.contains("전세") || all.contains("월세")) return "주거";

        // 취업·고용: 취업·고용·일자리·실업·구직·창업·직업·채용·근로·재취업
        if (all.contains("취업") || all.contains("고용") || all.contains("일자리")
                || all.contains("실업") || all.contains("구직") || all.contains("창업")
                || all.contains("직업훈련") || all.contains("직업") || all.contains("채용")
                || all.contains("재취업") || all.contains("근로장려")) return "취업·고용";

        // 의료·건강: 의료·건강·보건·치료·재활·요양·간호·한의
        if (all.contains("의료") || all.contains("건강") || all.contains("보건")
                || all.contains("치료") || all.contains("재활") || all.contains("요양")
                || all.contains("간호") || all.contains("한의") || all.contains("정신건강")
                || all.contains("암") || all.contains("병원")) return "의료·건강";

        // 교육·장학: 교육·장학·학습·훈련·학교·대학·도서관·문화
        if (all.contains("교육") || all.contains("장학") || all.contains("학습")
                || all.contains("훈련") || all.contains("학교") || all.contains("대학")
                || all.contains("도서관") || all.contains("문화") || all.contains("청소년")
                || all.contains("수강") || all.contains("평생학습")) return "교육·장학";

        // 금융지원: 금융·대출·융자·장려금·수당·적금·저축·연금·급여
        if (all.contains("금융") || all.contains("대출") || all.contains("융자")
                || all.contains("장려금") || all.contains("수당") || all.contains("적금")
                || all.contains("저축") || all.contains("연금") || all.contains("지원금")
                || all.contains("급여")) return "금융지원";

        // 세금혜택: 세금·세제·감면·면세·조세·공제
        if (all.contains("세금") || all.contains("세제") || all.contains("감면")
                || all.contains("면세") || all.contains("조세") || all.contains("공제")
                || all.contains("면제세") || all.contains("세액")) return "세금혜택";

        // 생활지원: 기본값
        return "생활지원";
    }

    private String nvl(String s) {
        return s != null ? s : "";
    }
}
