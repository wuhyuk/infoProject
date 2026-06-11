package com.example.infoBack.controller;

import com.example.infoBack.dto.*;
import com.example.infoBack.entity.Benefit;
import com.example.infoBack.entity.User;
import com.example.infoBack.repository.BenefitRepository;
import com.example.infoBack.repository.UserRepository;
import com.example.infoBack.security.JwtUtil;
import com.example.infoBack.service.WelfareApiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final BenefitRepository benefitRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final WelfareApiService welfareApiService;

    // ─── 관리자 로그인 ────────────────────────────────────────────────────────

    @PostMapping("/auth/login")
    public ResponseEntity<LoginResponse> adminLogin(@Valid @RequestBody AdminLoginRequest req) {
        User admin = userRepository.findByUserId(req.getUsername())
                .filter(u -> "ADMIN".equals(u.getRole()))
                .orElseThrow(() -> new IllegalArgumentException("관리자 계정이 존재하지 않습니다."));
        if (!passwordEncoder.matches(req.getPassword(), admin.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 올바르지 않습니다.");
        }
        String token = jwtUtil.generateToken(admin.getUserId());
        return ResponseEntity.ok(new LoginResponse(token, admin.getName(), admin.getUserId(), admin.getRole()));
    }

    // ─── 혜택 관리 ────────────────────────────────────────────────────────────

    @GetMapping("/benefits")
    public ResponseEntity<List<Benefit>> getAllBenefits() {
        return ResponseEntity.ok(benefitRepository.findAll());
    }

    @PostMapping("/benefits")
    public ResponseEntity<Benefit> createBenefit(@RequestBody AdminBenefitRequest req) {
        Benefit benefit = Benefit.builder()
                .title(req.getTitle())
                .category(req.getCategory())
                .description(req.getDescription())
                .minAge(req.getMinAge())
                .maxAge(req.getMaxAge())
                .targetRegion(req.getTargetRegion())
                .maxIncomeLevel(req.getMaxIncomeLevel())
                .employmentStatus(emptyToNull(req.getEmploymentStatus()))
                .requiresDisability(req.getRequiresDisability())
                .familyType(emptyToNull(req.getFamilyType()))
                .requiresGender(emptyToNull(req.getRequiresGender()))
                .requiresForeignWorker(req.getRequiresForeignWorker())
                .requiresNorthKorean(req.getRequiresNorthKorean())
                .disabilityGrade(emptyToNull(req.getDisabilityGrade()))
                .minChildren(req.getMinChildren())
                .applyUrl(req.getApplyUrl())
                .organization(req.getOrganization())
                .source("manual")
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(benefitRepository.save(benefit));
    }

    @PutMapping("/benefits/{id}")
    public ResponseEntity<Benefit> updateBenefit(@PathVariable Long id, @RequestBody AdminBenefitRequest req) {
        Benefit benefit = benefitRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("혜택을 찾을 수 없습니다."));
        benefit.setTitle(req.getTitle());
        benefit.setCategory(req.getCategory());
        benefit.setDescription(req.getDescription());
        benefit.setMinAge(req.getMinAge());
        benefit.setMaxAge(req.getMaxAge());
        benefit.setTargetRegion(req.getTargetRegion());
        benefit.setMaxIncomeLevel(req.getMaxIncomeLevel());
        benefit.setEmploymentStatus(emptyToNull(req.getEmploymentStatus()));
        benefit.setRequiresDisability(req.getRequiresDisability());
        benefit.setFamilyType(emptyToNull(req.getFamilyType()));
        benefit.setRequiresGender(emptyToNull(req.getRequiresGender()));
        benefit.setRequiresForeignWorker(req.getRequiresForeignWorker());
        benefit.setRequiresNorthKorean(req.getRequiresNorthKorean());
        benefit.setDisabilityGrade(emptyToNull(req.getDisabilityGrade()));
        benefit.setMinChildren(req.getMinChildren());
        benefit.setApplyUrl(req.getApplyUrl());
        benefit.setOrganization(req.getOrganization());
        benefit.setSource("manual"); // 관리자 수정 시 수동 관리로 전환 → 이후 API 동기화 덮어씌움 방지
        return ResponseEntity.ok(benefitRepository.save(benefit));
    }

    @DeleteMapping("/benefits/{id}")
    public ResponseEntity<Void> deleteBenefit(@PathVariable Long id) {
        benefitRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/benefits/sync")
    public ResponseEntity<Map<String, Object>> triggerSync() {
        WelfareApiService.SyncResult result = welfareApiService.syncAll();
        return ResponseEntity.ok(Map.of(
                "synced",   result.total(),
                "created",  result.created(),
                "updated",  result.updated()
        ));
    }

    // ─── 사용자 관리 ──────────────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        List<AdminUserResponse> users = userRepository.findAllByRoleNot("ADMIN").stream()
                .map(AdminUserResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ─── 통계 ─────────────────────────────────────────────────────────────────

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        long totalBenefits = benefitRepository.count();
        long totalUsers = userRepository.countByRoleNot("ADMIN");
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        long newUsersThisWeek = userRepository.countByRoleNotAndCreatedAtAfter("ADMIN", weekAgo);

        Map<String, Long> byCategory = benefitRepository.countByCategory().stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1]
                ));

        return ResponseEntity.ok(new AdminStatsResponse(totalBenefits, totalUsers, byCategory, newUsersThisWeek));
    }

    private String emptyToNull(String val) {
        return (val == null || val.isBlank()) ? null : val;
    }
}
