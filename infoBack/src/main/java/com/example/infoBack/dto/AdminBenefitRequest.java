package com.example.infoBack.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class AdminBenefitRequest {
    private String title;
    private String category;
    private String description;
    private Integer minAge;
    private Integer maxAge;
    private String targetRegion;
    private Integer maxIncomeLevel;
    private String employmentStatus;
    private Boolean requiresDisability;
    private String familyType;
    private String requiresGender;
    private Boolean requiresForeignWorker;
    private Boolean requiresNorthKorean;
    private String disabilityGrade;
    private Integer minChildren;
    private String applyUrl;
    private String organization;
}
