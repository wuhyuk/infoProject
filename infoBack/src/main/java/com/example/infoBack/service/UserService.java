package com.example.infoBack.service;

import com.example.infoBack.dto.UserProfileResponse;
import com.example.infoBack.dto.UserProfileUpdateRequest;
import com.example.infoBack.entity.User;
import com.example.infoBack.entity.UserProfile;
import com.example.infoBack.repository.UserProfileRepository;
import com.example.infoBack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

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

    private User getUser(String userId) {
        return userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }
}
