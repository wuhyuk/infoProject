package com.example.infoBack.security;

import com.example.infoBack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
        com.example.infoBack.entity.User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + userId));

        String role = user.getRole() != null ? user.getRole() : "USER";
        String password = user.getPassword() != null ? user.getPassword() : "{noop}SOCIAL_OAUTH2";
        return User.builder()
                .username(user.getUserId())
                .password(password)
                .roles(role)
                .build();
    }
}
