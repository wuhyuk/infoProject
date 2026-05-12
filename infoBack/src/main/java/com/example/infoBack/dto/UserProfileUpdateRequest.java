package com.example.infoBack.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class UserProfileUpdateRequest {

    @Min(1900) @Max(2100)
    private Integer birthYear;

    private String gender;

    private String region;

    @Min(1) @Max(10)
    private Integer incomeLevel;

    private String employmentStatus;

    private Boolean hasDisability;
    private String disabilityGrade;

    private String familyType;

    private Boolean isForeignWorker;
    private Boolean isNorthKoreanDefector;
    private String maritalStatus;
    private Integer numberOfChildren;
}
