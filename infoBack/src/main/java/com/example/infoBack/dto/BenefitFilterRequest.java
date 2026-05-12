package com.example.infoBack.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class BenefitFilterRequest {

    @NotNull
    @Min(0) @Max(120)
    private Integer age;

    private String region;

    @Min(1) @Max(10)
    private Integer incomeLevel;

    private String employmentStatus;

    private Boolean hasDisability;
    private String disabilityGrade;

    private String familyType;

    private String gender;
    private Boolean isForeignWorker;
    private Boolean isNorthKoreanDefector;
    private Integer numberOfChildren;
}
