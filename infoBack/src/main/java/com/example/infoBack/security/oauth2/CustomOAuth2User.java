package com.example.infoBack.security.oauth2;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Map;

public class CustomOAuth2User implements OAuth2User {

    private final OAuth2User oAuth2User;
    private final String userId; // DB에 저장된 email (우리 시스템의 식별자)

    public CustomOAuth2User(OAuth2User oAuth2User, String userId) {
        this.oAuth2User = oAuth2User;
        this.userId = userId;
    }

    @Override
    public Map<String, Object> getAttributes() { return oAuth2User.getAttributes(); }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return oAuth2User.getAuthorities(); }

    @Override
    public String getName() { return userId; } // OAuth2SuccessHandler에서 JWT 생성에 사용
}
