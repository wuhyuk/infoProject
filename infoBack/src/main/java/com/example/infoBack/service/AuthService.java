package com.example.infoBack.service;

import com.example.infoBack.dto.LoginRequest;
import com.example.infoBack.dto.LoginResponse;
import com.example.infoBack.dto.SignupRequest;
import com.example.infoBack.entity.User;
import com.example.infoBack.repository.UserRepository;
import com.example.infoBack.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public void signup(SignupRequest req) {
        if (userRepository.existsByUserId(req.getUserId())) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }
        User user = User.builder()
                .userId(req.getUserId())
                .password(passwordEncoder.encode(req.getPassword()))
                .name(req.getName())
                .build();
        userRepository.save(user);
    }

    public LoginResponse login(LoginRequest req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUserId(), req.getPassword())
        );
        User user = userRepository.findByUserId(req.getUserId()).orElseThrow();
        String token = jwtUtil.generateToken(req.getUserId());
        return new LoginResponse(token, user.getName(), user.getUserId(), user.getRole());
    }
}
