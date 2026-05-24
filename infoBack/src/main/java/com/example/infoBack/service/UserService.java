package com.example.infoBack.service;

import com.example.infoBack.dto.UserAccountUpdateRequest;
import com.example.infoBack.dto.UserProfileResponse;
import com.example.infoBack.dto.UserProfileUpdateRequest;
import com.example.infoBack.entity.User;
import com.example.infoBack.entity.UserProfile;
import com.example.infoBack.repository.UserProfileRepository;
import com.example.infoBack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String userId) {
        User user = getUser(userId);
        return UserProfileResponse.from(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(String userId, UserProfileUpdateRequest req) {
        User user = getUser(userId);
        UserProfile profile = userProfileRepository.findByUser(user)
                .orElse(UserProfile.builder().user(user).build());

        profile.setBirthYear(req.getBirthYear());
        profile.setGender(req.getGender());
        profile.setRegion(req.getRegion());
        profile.setIncomeLevel(req.getIncomeLevel());
        profile.setEmploymentStatus(req.getEmploymentStatus());
        profile.setHasDisability(req.getHasDisability());
        profile.setDisabilityGrade(req.getDisabilityGrade());
        profile.setFamilyType(req.getFamilyType());
        profile.setIsForeignWorker(req.getIsForeignWorker());
        profile.setIsNorthKoreanDefector(req.getIsNorthKoreanDefector());
        profile.setMaritalStatus(req.getMaritalStatus());
        profile.setNumberOfChildren(req.getNumberOfChildren());

        UserProfile saved = userProfileRepository.save(profile);
        user.setProfile(saved);
        return UserProfileResponse.from(user);
    }

    @Transactional
    public UserProfileResponse updateAccount(String userId, UserAccountUpdateRequest req) {
        User user = getUser(userId);

        String newName = req.getName();
        if (newName != null && !newName.isBlank()) {
            user.setName(newName.trim());
        }

        String newPassword = req.getNewPassword();
        if (newPassword != null && !newPassword.isBlank()) {
            if (!"LOCAL".equals(user.getProvider())) {
                throw new IllegalArgumentException("소셜 로그인 계정은 비밀번호를 변경할 수 없습니다.");
            }
            String current = req.getCurrentPassword();
            if (current == null || current.isBlank()) {
                throw new IllegalArgumentException("현재 비밀번호를 입력해주세요.");
            }
            if (!passwordEncoder.matches(current, user.getPassword())) {
                throw new IllegalArgumentException("현재 비밀번호가 올바르지 않습니다.");
            }
            if (newPassword.length() < 6) {
                throw new IllegalArgumentException("새 비밀번호는 6자 이상이어야 합니다.");
            }
            user.setPassword(passwordEncoder.encode(newPassword));
        }

        userRepository.save(user);
        return UserProfileResponse.from(user);
    }

    private User getUser(String userId) {
        return userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }
}
