package com.example.infoBack.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "benefit")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Benefit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String externalId;   // 공공데이터 servId (샘플 데이터는 null)

    private String source;       // "api" | null(샘플)

    private String title;
    private String category;

    @Column(length = 2000)
    private String description;

    private Integer minAge;
    private Integer maxAge;
    private String targetRegion;
    private Integer maxIncomeLevel;
    private String employmentStatus;
    private Boolean requiresDisability;
    private String familyType;

    private String applyUrl;
    private String organization;

    private String requiresGender;         // null=무관, "남성", "여성"
    private Boolean requiresForeignWorker; // true=외국인근로자 전용
    private Boolean requiresNorthKorean;   // true=탈북민 전용
    private String disabilityGrade;        // null=무관, "경증"=경증이상, "중증"=중증만
    private Integer minChildren;           // null=무관, N=자녀 N명 이상
}
