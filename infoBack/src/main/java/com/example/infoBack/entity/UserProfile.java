package com.example.infoBack.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_profile")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    private Integer birthYear;
    private String gender;
    private String region;
    private Integer incomeLevel;
    private String employmentStatus;
    private Boolean hasDisability;
    private String disabilityGrade;        // "경증" | "중증"
    private String familyType;

    private Boolean isForeignWorker;
    private Boolean isNorthKoreanDefector;
    private String maritalStatus;          // "미혼" | "기혼" | "이혼" | "사별"
    private Integer numberOfChildren;

    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onSave() {
        updatedAt = LocalDateTime.now();
    }

    public Integer getAge() {
        if (birthYear == null) return null;
        return LocalDate.now().getYear() - birthYear;
    }
}
