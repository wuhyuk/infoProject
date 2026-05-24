package com.example.infoBack.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor
public class PasswordResetRequest {
    private String userId;
    private String name;
    private String newPassword;
}
