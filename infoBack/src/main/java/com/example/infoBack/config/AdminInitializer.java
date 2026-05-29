package com.example.infoBack.config;

import com.example.infoBack.entity.User;
import com.example.infoBack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.username:admin}")
    private String adminUsername;

    @Value("${admin.password:admin}")
    private String adminPassword;

    @EventListener(ApplicationReadyEvent.class)
    public void createAdminIfAbsent() {
        if (!userRepository.existsByUserId(adminUsername)) {
            User admin = User.builder()
                    .userId(adminUsername)
                    .password(passwordEncoder.encode(adminPassword))
                    .name("관리자")
                    .role("ADMIN")
                    .build();
            userRepository.save(admin);
        }
    }
}
