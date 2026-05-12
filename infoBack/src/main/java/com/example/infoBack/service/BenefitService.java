package com.example.infoBack.service;

import com.example.infoBack.dto.BenefitFilterRequest;
import com.example.infoBack.dto.BenefitResponse;
import com.example.infoBack.entity.Benefit;
import com.example.infoBack.repository.BenefitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BenefitService {

    private final BenefitRepository benefitRepository;

    public List<BenefitResponse> getAllBenefits() {
        return benefitRepository.findAll()
                .stream()
                .map(BenefitResponse::from)
                .collect(Collectors.toList());
    }

    public List<BenefitResponse> getFilteredBenefits(BenefitFilterRequest req) {
        return benefitRepository.findAll()
                .stream()
                .filter(b -> matchesAge(b, req.getAge()))
                .filter(b -> matchesRegion(b, req.getRegion()))
                .filter(b -> matchesIncomeLevel(b, req.getIncomeLevel()))
                .filter(b -> matchesEmploymentStatus(b, req.getEmploymentStatus()))
                .filter(b -> matchesDisability(b, req.getHasDisability()))
                .filter(b -> matchesDisabilityGrade(b, req.getHasDisability(), req.getDisabilityGrade()))
                .filter(b -> matchesFamilyType(b, req.getFamilyType()))
                .filter(b -> matchesGender(b, req.getGender()))
                .filter(b -> matchesForeignWorker(b, req.getIsForeignWorker()))
                .filter(b -> matchesNorthKorean(b, req.getIsNorthKoreanDefector()))
                .filter(b -> matchesChildren(b, req.getNumberOfChildren()))
                .map(BenefitResponse::from)
                .collect(Collectors.toList());
    }

    private boolean matchesAge(Benefit b, Integer age) {
        if (age == null) return true;
        if (b.getMinAge() != null && age < b.getMinAge()) return false;
        if (b.getMaxAge() != null && age > b.getMaxAge()) return false;
        return true;
    }

    private boolean matchesRegion(Benefit b, String region) {
        if (b.getTargetRegion() == null || b.getTargetRegion().equals("전국")) return true;
        if (region == null) return false;
        return b.getTargetRegion().contains(region) || region.contains(b.getTargetRegion());
    }

    private boolean matchesIncomeLevel(Benefit b, Integer incomeLevel) {
        if (b.getMaxIncomeLevel() == null) return true;
        if (incomeLevel == null) return true;
        return incomeLevel <= b.getMaxIncomeLevel();
    }

    private boolean matchesEmploymentStatus(Benefit b, String status) {
        if (b.getEmploymentStatus() == null) return true;
        if (status == null) return false;
        return b.getEmploymentStatus().equals(status);
    }

    private boolean matchesDisability(Benefit b, Boolean hasDisability) {
        if (!Boolean.TRUE.equals(b.getRequiresDisability())) return true;
        return Boolean.TRUE.equals(hasDisability);
    }

    private boolean matchesFamilyType(Benefit b, String familyType) {
        if (b.getFamilyType() == null) return true;
        if (familyType == null) return false;
        return b.getFamilyType().equals(familyType);
    }

    private boolean matchesGender(Benefit b, String gender) {
        if (b.getRequiresGender() == null) return true;
        return b.getRequiresGender().equals(gender);
    }

    private boolean matchesForeignWorker(Benefit b, Boolean isForeignWorker) {
        if (!Boolean.TRUE.equals(b.getRequiresForeignWorker())) return true;
        return Boolean.TRUE.equals(isForeignWorker);
    }

    private boolean matchesNorthKorean(Benefit b, Boolean isNorthKorean) {
        if (!Boolean.TRUE.equals(b.getRequiresNorthKorean())) return true;
        return Boolean.TRUE.equals(isNorthKorean);
    }

    private boolean matchesDisabilityGrade(Benefit b, Boolean hasDisability, String disabilityGrade) {
        if (b.getDisabilityGrade() == null) return true;
        if (!Boolean.TRUE.equals(hasDisability)) return false;
        if ("중증".equals(b.getDisabilityGrade())) return "중증".equals(disabilityGrade);
        return true; // "경증" = 장애인이면 누구나 가능
    }

    private boolean matchesChildren(Benefit b, Integer numberOfChildren) {
        if (b.getMinChildren() == null) return true;
        if (numberOfChildren == null) return false;
        return numberOfChildren >= b.getMinChildren();
    }
}
