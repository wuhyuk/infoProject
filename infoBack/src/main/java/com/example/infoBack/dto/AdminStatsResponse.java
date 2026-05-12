package com.example.infoBack.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Map;

@Getter
@AllArgsConstructor
public class AdminStatsResponse {
    private long totalBenefits;
    private long totalUsers;
    private Map<String, Long> benefitsByCategory;
    private long newUsersThisWeek;
}
