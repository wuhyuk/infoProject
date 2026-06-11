package com.example.infoBack.config;

import com.example.infoBack.security.JwtFilter;
import com.example.infoBack.security.oauth2.CustomOAuth2UserService;
import com.example.infoBack.security.oauth2.OAuth2SuccessHandler;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

    @Value("${app.frontend.url}")
    private String frontendUrl;

    private final JwtFilter jwtFilter;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            // OAuth2 authorization-code flow는 provider 리다이렉트와 콜백 사이에 state를 세션에 저장하므로 세션이 필요.
            // API 요청 인증은 JWT 필터가 독립적으로 처리하며, 세션은 OAuth2 state 저장 용도로만 사용.
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .sessionFixation(fixation -> fixation.newSession())
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    if (request.getRequestURI().startsWith("/api/")) {
                        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
                    } else {
                        log.warn("AuthenticationEntryPoint 발동 — URI: {}, 예외: {}",
                                request.getRequestURI(), authException.getMessage());
                        response.sendRedirect(frontendUrl + "/login?error=oauth_failed");
                    }
                })
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/oauth2/authorization/**").permitAll()
                .requestMatchers("/login/oauth2/code/**").permitAll()
                .requestMatchers("/error").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/admin/auth/login").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/benefits").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/benefits/filter").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/announcements").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .authorizationEndpoint(authz -> authz
                    .authorizationRequestRepository(new com.example.infoBack.security.oauth2.CookieOAuth2AuthorizationRequestRepository())
                )
                .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                .successHandler(oAuth2SuccessHandler)
                .failureHandler((request, response, exception) -> {
                    log.error("===== OAuth2 로그인 실패 =====");
                    log.error("예외 타입: {}", exception.getClass().getName());
                    log.error("메시지: {}", exception.getMessage());
                    if (exception.getCause() != null) {
                        log.error("원인: {} — {}", exception.getCause().getClass().getSimpleName(),
                                exception.getCause().getMessage());
                    }
                    if (exception instanceof OAuth2AuthenticationException oauthEx) {
                        log.error("OAuth2 에러 코드: {}", oauthEx.getError().getErrorCode());
                        log.error("OAuth2 에러 설명: {}", oauthEx.getError().getDescription());
                    }
                    log.error("=====");
                    String errorCode = "oauth_failed";
                    if (exception instanceof OAuth2AuthenticationException oauthEx) {
                        errorCode = switch (oauthEx.getError().getErrorCode()) {
                            case "email_already_exists" -> "email_exists";
                            case "email_social_conflict" -> "email_social_conflict";
                            case "missing_email"        -> "missing_email";
                            default                     -> "oauth_failed";
                        };
                    }
                    response.sendRedirect(frontendUrl + "/login?error=" + errorCode);
                })
            )
            .headers(headers -> headers
                .frameOptions(frame -> frame.sameOrigin())
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(frontendUrl));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
