package com.example.infoBack.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    private final ConcurrentHashMap<String, VerificationEntry> store = new ConcurrentHashMap<>();

    private static final long CODE_TTL_MS     = 5  * 60 * 1000L;
    private static final long VERIFIED_TTL_MS = 10 * 60 * 1000L;

    public void sendCode(String email) {
        String code = String.format("%06d", new SecureRandom().nextInt(1_000_000));
        store.put(email, new VerificationEntry(code, System.currentTimeMillis() + CODE_TTL_MS, false));

        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (sender != null) {
            sendEmail(sender, email, code);
        } else {
            log.info("[인증 코드] {} → {} (메일 미설정: 콘솔 출력)", email, code);
        }
    }

    public boolean verifyCode(String email, String code) {
        VerificationEntry entry = store.get(email);
        if (entry == null || entry.isExpired() || entry.verified()) return false;
        if (!entry.code().equals(code)) return false;
        store.put(email, new VerificationEntry(code, System.currentTimeMillis() + VERIFIED_TTL_MS, true));
        return true;
    }

    public boolean isVerified(String email) {
        VerificationEntry entry = store.get(email);
        return entry != null && entry.verified() && !entry.isExpired();
    }

    public void clear(String email) {
        store.remove(email);
    }

    private void sendEmail(JavaMailSender sender, String email, String code) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(email);
            msg.setSubject("[InfoService] 이메일 인증 코드");
            msg.setText("인증 코드: " + code + "\n\n5분 안에 입력해 주세요.\n이 이메일을 요청하지 않았다면 무시하세요.");
            sender.send(msg);
            log.info("인증 코드 발송 완료: {}", email);
        } catch (Exception e) {
            log.error("이메일 발송 실패: {}", e.getMessage());
            throw new IllegalStateException("이메일 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        }
    }

    private record VerificationEntry(String code, long expiryMs, boolean verified) {
        boolean isExpired() { return System.currentTimeMillis() > expiryMs; }
    }
}
