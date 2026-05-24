package com.example.infoBack.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor
public class UserAccountUpdateRequest {
    private String name;
    private String currentPassword;
    private String newPassword;
}
