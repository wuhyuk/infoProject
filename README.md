# 정보나라 (InfoProject)

> 나에게 맞는 정부 혜택·지원금을 한 번에 찾아주는 필터링 서비스

개인 정보(나이, 지역, 소득분위, 취업상태 등)를 입력하면 조건에 맞는 국가·지자체 혜택을 자동으로 필터링해 보여주는 웹 애플리케이션입니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 혜택 필터링 | 나이 · 지역 · 소득분위 · 취업상태 · 장애 · 성별 · 가족유형 · 자녀 수 등 다중 조건 필터 |
| 회원 인증 | 이메일 인증 기반 회원가입 / JWT 로그인 / 비밀번호 찾기 |
| 마이페이지 | 개인 프로필 조회 · 수정, 로그인 시 필터 폼 자동 채우기 |
| 정책 소식 | 공공데이터 보도자료 API 연동 (30분 주기 갱신) |
| 관리자 패널 | 혜택 데이터 CRUD, 회원 조회, 통계 대시보드 |
| 공공데이터 동기화 | data.go.kr 복지 API 매일 새벽 3시 자동 동기화 |

---

## 기술 스택

### 백엔드
- **Java 21** · **Spring Boot 3**
- **Spring Security** + **JWT** (HS256)
- **Spring Data JPA** + **H2** (파일 기반, 개발용)
- **Gradle**

### 프론트엔드
- **React 19** · **react-router-dom v7**
- **Axios** (JWT 인터셉터 + 401 자동 로그아웃)
- **Context API** (인증 상태 전역 관리)

---

## 프로젝트 구조

```
infoProject/
├── infoBack/          # Spring Boot 백엔드 (포트 8080)
│   └── src/main/java/com/example/infoBack/
│       ├── config/        SecurityConfig, AdminInitializer, WelfareConfig
│       ├── controller/    Auth, User, Benefit, Admin, Announcement
│       ├── service/       Auth, User, Benefit, WelfareApi, PolicyNews, EmailVerification
│       ├── entity/        User, UserProfile, Benefit
│       ├── dto/           요청/응답 DTO
│       ├── security/      JwtUtil, JwtFilter, CustomUserDetailsService
│       ├── scheduler/     BenefitSyncScheduler (매일 새벽 3시)
│       └── exception/     GlobalExceptionHandler
└── infoFront/frontend/ # React 프론트엔드 (포트 3000)
    └── src/
        ├── api/           axiosInstance, authApi, userApi, benefitApi, adminApi
        ├── context/       AuthContext, AdminContext
        ├── components/    Header, BenefitCard
        └── pages/         Home, Filter, Result, Login, Signup, MyPage,
                           ProfileSetup, Announcement, AdminLogin, Admin
```

---

## 로컬 실행

### 사전 요구사항
- Java 21+
- Node.js 18+

### 1. 백엔드 실행

```bash
cd infoBack
./gradlew bootRun
# → http://localhost:8080
# H2 콘솔: http://localhost:8080/h2-console
```

### 2. 프론트엔드 실행

```bash
cd infoFront/frontend
npm install
npm start
# → http://localhost:3000
```

> 프론트엔드는 `package.json`의 `"proxy": "http://localhost:8080"` 설정으로 `/api/*` 요청을 백엔드로 자동 전달합니다.

---

## API 엔드포인트

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| POST | `/api/auth/signup` | 회원가입 | 불필요 |
| POST | `/api/auth/login` | 로그인 (JWT 발급) | 불필요 |
| GET | `/api/users/me` | 내 프로필 조회 | JWT |
| PUT | `/api/users/me` | 내 프로필 수정 | JWT |
| GET | `/api/benefits` | 전체 혜택 목록 | 불필요 |
| POST | `/api/benefits/filter` | 조건 기반 혜택 필터 | 불필요 |
| GET | `/api/announcements` | 정책 소식 목록 | 불필요 |

---

## 필터링 조건

`null` 필드는 "조건 없음"으로 처리됩니다.

| 필터 | 설명 |
|------|------|
| 나이 | 혜택의 `minAge` ≤ 사용자 나이 ≤ `maxAge` |
| 지역 | `targetRegion`이 "전국"이면 전국 허용, 아니면 지역 매칭 |
| 소득분위 | 사용자 소득분위 ≤ 혜택의 `maxIncomeLevel` |
| 취업상태 | 정확히 일치 |
| 장애 여부 / 등급 | 중증/경증 구분 처리 |
| 성별 | 남성/여성/무관 |
| 가족유형 | 한부모, 다문화 등 |
| 외국인 근로자 / 탈북민 | 전용 혜택 별도 필터 |
| 자녀 수 | 최소 자녀 수 이상인 경우 매칭 |

---

## DB 스키마

| 테이블 | 주요 컬럼 |
|--------|-----------|
| `users` | id, email(unique), password(bcrypt), name, created_at |
| `user_profile` | id, user_id(FK), birth_year, gender, region, income_level, employment_status, has_disability, family_type |
| `benefit` | id, title, category, description, min_age, max_age, target_region, max_income_level, employment_status, requires_disability, disability_grade, family_type, requires_gender, requires_foreign_worker, requires_north_korean, min_children, apply_url, organization |

---

## 이메일 인증 설정 (선택)

`application.properties`에서 Gmail SMTP 주석을 해제하고 앱 비밀번호를 입력하면 실제 인증 메일이 발송됩니다. 설정하지 않으면 백엔드 콘솔에 인증 코드가 출력됩니다.

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

---

## 페이지 라우팅

| 경로 | 페이지 |
|------|--------|
| `/` | 홈 (서비스 소개 + CTA) |
| `/filter` | 혜택 검색 폼 |
| `/results` | 필터 결과 |
| `/login` | 로그인 |
| `/signup` | 회원가입 |
| `/mypage` | 마이페이지 |
| `/profile-setup` | 초기 프로필 설정 |
| `/announcements` | 정책 소식 |
| `/admin` | 관리자 대시보드 |
