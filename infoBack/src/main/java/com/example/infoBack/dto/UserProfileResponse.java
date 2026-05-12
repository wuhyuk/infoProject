package com.example.infoBack.dto;

import com.example.infoBack.entity.User;
import com.example.infoBack.entity.UserProfile;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter @Builder
public class UserProfileResponse {

    private Long id;
    private String userId;
    private String name;

    private Integer birthYear;
    private Integer age;
    private String gender;
    private String region;
    private Integer incomeLevel;
    private String employmentStatus;
    private Boolean hasDisability;
    private String disabilityGrade;
    private String familyType;

    private Boolean isForeignWorker;
    private Boolean isNorthKoreanDefector;
    private String maritalStatus;
    private Integer numberOfChildren;

    public static UserProfileResponse from(User user) {
        UserProfileResponseBuilder builder = UserProfileResponse.builder()
                .id(user.getId())
                .userId(user.getUserId())
                .name(user.getName());

        UserProfile profile = user.getProfile();
        if (profile != null) {
            Integer birthYear = profile.getBirthYear();
            builder.birthYear(birthYear)
                    .age(birthYear != null ? LocalDate.now().getYear() - birthYear : null)
                    .gender(profile.getGender())
                    .region(profile.getRegion())
                    .incomeLevel(profile.getIncomeLevel())
                    .employmentStatus(profile.getEmploymentStatus())
                    .hasDisability(profile.getHasDisability())
                    .disabilityGrade(profile.getDisabilityGrade())
                    .familyType(profile.getFamilyType())
                    .isForeignWorker(profile.getIsForeignWorker())
                    .isNorthKoreanDefector(profile.getIsNorthKoreanDefector())
                    .maritalStatus(profile.getMaritalStatus())
                    .numberOfChildren(profile.getNumberOfChildren());
        }

        return builder.build();
    }
}
