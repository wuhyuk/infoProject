package com.example.infoBack.repository;

import com.example.infoBack.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUserId(String userId);
    boolean existsByUserId(String userId);
    Optional<User> findByProviderAndProviderId(String provider, String providerId);
    List<User> findAllByRoleNot(String role);
    long countByRoleNot(String role);
    long countByRoleNotAndCreatedAtAfter(String role, LocalDateTime createdAt);
}
