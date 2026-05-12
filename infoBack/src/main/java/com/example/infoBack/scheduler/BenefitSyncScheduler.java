package com.example.infoBack.scheduler;

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

    // 앱 시작 후 백그라운드에서 초기 동기화 (기존 데이터가 있으면 스킵)
    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        Thread t = new Thread(() -> {
            if (welfareApiService.hasData()) {
                log.info("기존 복지 데이터 존재 — 초기 동기화 스킵 (매일 새벽 3시 정기 동기화)");
                return;
            }
            log.info("복지서비스 초기 동기화 시작...");
            int count = welfareApiService.syncAll();
            if (count > 0) {
                log.info("초기 동기화 완료: {}건 갱신", count);
            }
        }, "welfare-sync-startup");
        t.setDaemon(true);
        t.start();
    }

    // 매일 새벽 3시 정기 동기화
    @Scheduled(cron = "${welfare.api.sync-cron}")
    public void scheduledSync() {
        log.info("복지서비스 정기 동기화 시작...");
        int count = welfareApiService.syncAll();
        log.info("정기 동기화 완료: {}건 갱신", count);
    }
}
