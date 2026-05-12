package com.example.infoBack.config;

import com.example.infoBack.entity.User;
import com.example.infoBack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @EventListener(ApplicationReadyEvent.class)
    public void createAdminIfAbsent() {
        if (!userRepository.existsByUserId("admin")) {
            User admin = User.builder()
                    .userId("admin")
                    .password(passwordEncoder.encode("admin"))
                    .name("관리자")
                    .role("ADMIN")
                    .build();
            userRepository.save(admin);
        }
    }
}
