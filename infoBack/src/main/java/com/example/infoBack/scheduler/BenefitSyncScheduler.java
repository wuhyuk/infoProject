package com.example.infoBack.scheduler;

import com.example.infoBack.service.PolicyNewsService;
import com.example.infoBack.service.WelfareApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class BenefitSyncScheduler {

    private final WelfareApiService welfareApiService;
    private final PolicyNewsService policyNewsService;

    // 앱 시작 후 백그라운드에서 초기 동기화
    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        Thread t = new Thread(() -> {
            // API 데이터가 없을 때만 동기화 (있으면 매일 새벽 3시 정기 동기화로 갱신)
            if (!welfareApiService.hasApiData()) {
                log.info("공공 API 혜택 데이터 없음 — 초기 동기화 시작...");
                WelfareApiService.SyncResult result = welfareApiService.syncAll();
                if (result.total() > 0) {
                    log.info("초기 동기화 완료: 신규 {}건, 갱신 {}건", result.created(), result.updated());
                }
            } else {
                log.info("공공 API 혜택 데이터 존재 — 동기화 스킵 (매일 새벽 3시 정기 동기화)");
            }
            log.info("정책 소식 초기 로드 시작...");
            policyNewsService.forceRefresh();
            log.info("정책 소식 초기 로드 완료");
        }, "welfare-sync-startup");
        t.setDaemon(true);
        t.start();
    }

    // 매일 새벽 3시 정기 동기화
    @Scheduled(cron = "${welfare.api.sync-cron}")
    public void scheduledSync() {
        log.info("복지서비스 정기 동기화 시작...");
        WelfareApiService.SyncResult result = welfareApiService.syncAll();
        log.info("정기 동기화 완료: 신규 {}건, 갱신 {}건", result.created(), result.updated());
    }

    // 30분마다 정책 소식 캐시 갱신 (정각/30분)
    @Scheduled(cron = "${welfare.api.news-refresh-cron}")
    public void scheduledNewsRefresh() {
        log.info("정책 소식 정기 갱신 시작...");
        policyNewsService.forceRefresh();
        log.info("정책 소식 갱신 완료");
    }
}
