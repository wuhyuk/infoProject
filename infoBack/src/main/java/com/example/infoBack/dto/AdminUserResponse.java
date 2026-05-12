package com.example.infoBack.dto;

import com.example.infoBack.entity.User;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class AdminUserResponse {
    private final Long id;
    private final String userId;
    private final String name;
    private final String role;
    private final LocalDateTime createdAt;

    private AdminUserResponse(Long id, String userId, String name, String role, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.role = role;
        this.createdAt = createdAt;
    }

    public static AdminUserResponse from(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getUserId(),
                user.getName(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
}
