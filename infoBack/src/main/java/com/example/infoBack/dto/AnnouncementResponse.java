package com.example.infoBack.dto;

import lombok.Builder;
import lombok.Getter;

@Getter @Builder
public class AnnouncementResponse {
    private String id;
    private String title;
    private String subTitle;
    private String department;  // 한국어 표시명 (UI 출력용)
    private String deptCode;    // 영어 코드 (필터링 비교용 — 인코딩 이슈 없음)
    private String date;
    private String url;
}
