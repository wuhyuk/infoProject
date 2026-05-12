package com.example.infoBack.dto;

import com.example.infoBack.entity.Benefit;
import lombok.Getter;

@Getter
public class BenefitResponse {

    private Long id;
    private String title;
    private String category;
    private String description;
    private String organization;
    private String applyUrl;
    private String targetSummary;

    public static BenefitResponse from(Benefit benefit) {
        BenefitResponse res = new BenefitResponse();
        res.id = benefit.getId();
        res.title = benefit.getTitle();
        res.category = benefit.getCategory();
        res.description = benefit.getDescription();
        res.organization = benefit.getOrganization();
        res.applyUrl = benefit.getApplyUrl();
        res.targetSummary = buildTargetSummary(benefit);
        return res;
    }

    private static String buildTargetSummary(Benefit b) {
        StringBuilder sb = new StringBuilder();
        if (b.getMinAge() != null || b.getMaxAge() != null) {
            if (b.getMinAge() != null) sb.append(b.getMinAge()).append("세");
            sb.append("~");
            if (b.getMaxAge() != null) sb.append(b.getMaxAge()).append("세");
            sb.append(" ");
        }
        if (b.getTargetRegion() != null && !b.getTargetRegion().equals("전국")) {
            sb.append(b.getTargetRegion()).append(" ");
        }
        if (b.getMaxIncomeLevel() != null) {
            sb.append("소득 ").append(b.getMaxIncomeLevel()).append("분위 이하 ");
        }
        if (Boolean.TRUE.equals(b.getRequiresDisability())) {
            sb.append("장애인 ");
        }
        if (b.getFamilyType() != null) {
            sb.append(b.getFamilyType()).append(" ");
        }
        String result = sb.toString().trim();
        return result.isEmpty() ? "전국민" : result;
    }
}
