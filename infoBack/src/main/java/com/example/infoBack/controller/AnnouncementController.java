package com.example.infoBack.controller;

import com.example.infoBack.dto.AnnouncementResponse;
import com.example.infoBack.service.PolicyNewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final PolicyNewsService policyNewsService;

    @GetMapping
    public ResponseEntity<List<AnnouncementResponse>> getAnnouncements(
            @RequestParam(defaultValue = "14") int days) {
        return ResponseEntity.ok(policyNewsService.getRecentNews(days));
    }
}
