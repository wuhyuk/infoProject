package com.example.infoBack.security.oauth2;

import com.example.infoBack.entity.User;
import com.example.infoBack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private static final Logger log = LoggerFactory.getLogger(CustomOAuth2UserService.class);
    // BCrypt 패턴이 아니므로 어떤 비밀번호로도 일치하지 않아 보안상 안전
    private static final String SOCIAL_ONLY_PASSWORD = "SOCIAL_LOGIN_ONLY";

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        OAuth2UserInfo userInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(registrationId, oAuth2User.getAttributes());

        String provider   = registrationId.toUpperCase();
        String providerId = userInfo.getId();
        String email      = userInfo.getEmail();
        String name       = userInfo.getName();

        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException(new OAuth2Error("missing_email"),
                    "소셜 계정에 이메일 정보가 없습니다. 이메일 제공에 동의해주세요.");
        }

        // 이미 같은 소셜 계정으로 가입된 경우 → 기존 사용자 반환
        Optional<User> existingByProvider = userRepository.findByProviderAndProviderId(provider, providerId);
        if (existingByProvider.isPresent()) {
            log.info("기존 소셜 사용자 로그인: provider={}, email={}", provider, email);
            return new CustomOAuth2User(oAuth2User, existingByProvider.get().getUserId());
        }

        // 같은 이메일로 이미 가입된 계정이 있는 경우 → 제공자 구분하여 안내
        Optional<User> existingByEmail = userRepository.findByUserId(email);
        if (existingByEmail.isPresent()) {
            String existingProvider = existingByEmail.get().getProvider();
            if ("LOCAL".equals(existingProvider)) {
                throw new OAuth2AuthenticationException(new OAuth2Error("email_already_exists"),
                        "이미 이메일/비밀번호로 가입된 계정입니다. 일반 로그인을 이용해주세요.");
            } else {
                // 다른 소셜 계정이 같은 이메일을 사용 중 (예: 네이버 연락처 이메일 중복)
                throw new OAuth2AuthenticationException(new OAuth2Error("email_social_conflict"),
                        "이미 " + existingProvider + " 계정으로 가입된 이메일입니다. 해당 소셜 로그인을 이용해주세요.");
            }
        }

        // 신규 소셜 사용자 등록
        log.info("신규 소셜 사용자 등록: provider={}, email={}", provider, email);
        User newUser = User.builder()
                .userId(email)
                .name(name != null ? name : email)
                .password(SOCIAL_ONLY_PASSWORD)
                .provider(provider)
                .providerId(providerId)
                .build();
        userRepository.save(newUser);

        return new CustomOAuth2User(oAuth2User, email);
    }
}
