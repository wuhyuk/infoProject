package com.example.infoBack.controller;

import com.example.infoBack.dto.BenefitFilterRequest;
import com.example.infoBack.dto.BenefitResponse;
import com.example.infoBack.service.BenefitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/benefits")
@RequiredArgsConstructor
public class BenefitController {

    private final BenefitService benefitService;

    @GetMapping
    public ResponseEntity<List<BenefitResponse>> getAllBenefits() {
        return ResponseEntity.ok(benefitService.getAllBenefits());
    }

    @PostMapping("/filter")
    public ResponseEntity<List<BenefitResponse>> getFilteredBenefits(
            @Valid @RequestBody BenefitFilterRequest request) {
        return ResponseEntity.ok(benefitService.getFilteredBenefits(request));
    }
}
