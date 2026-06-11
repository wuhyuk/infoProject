package com.example.infoBack.controller;

import com.example.infoBack.dto.UserAccountUpdateRequest;
import com.example.infoBack.dto.UserProfileResponse;
import com.example.infoBack.dto.UserProfileUpdateRequest;
import com.example.infoBack.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMyProfile(Authentication auth) {
        return ResponseEntity.ok(userService.getProfile(auth.getName()));
    }

    @PutMapping("/me/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            Authentication auth,
            @Valid @RequestBody UserProfileUpdateRequest request) {
        return ResponseEntity.ok(userService.updateProfile(auth.getName(), request));
    }

    @PatchMapping("/me/account")
    public ResponseEntity<UserProfileResponse> updateAccount(
            Authentication auth,
            @RequestBody UserAccountUpdateRequest request) {
        return ResponseEntity.ok(userService.updateAccount(auth.getName(), request));
    }
}
