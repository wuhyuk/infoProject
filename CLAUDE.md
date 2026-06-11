# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

한국 국내 정부 혜택/지원금 필터링 서비스 — 사용자가 개인 정보(나이, 지역, 소득분위, 취업상태 등)를 입력하면 조건에 맞는 혜택을 필터링해 보여주는 웹 애플리케이션.

- **백엔드**: `infoBack/` — Spring Boot 4.0.6, Java 21, Gradle
- **프론트엔드**: `infoFront/frontend/` — React 19, react-router-dom v7, axios

## 명령어

**백엔드** (`infoBack/` 디렉토리):
```bash
./gradlew bootRun        # 백엔드 실행 (포트 8080)
./gradlew build          # 전체 빌드 + 테스트
./gradlew test --tests "com.example.infoBack.SomeTest"
```

**프론트엔드** (`infoFront/frontend/` 디렉토리):
```bash
npm start      # 개발 서버 (포트 3000, 백엔드 8080으로 프록시)
npm run build  # 프로덕션 빌드
```

## 아키텍처

### 백엔드 (`infoBack/src/main/java/com/example/infoBack/`)
config/
├── SecurityConfig.java         JWT 필터 체인, CORS, OAuth2, PasswordEncoder
├── AdminInitializer.java       최초 실행 시 관리자 계정 자동 생성
├── WelfareApiProperties.java   data.go.kr API URL/Key 바인딩
└── WelfareConfig.java          RestTemplate 빈 등록
security/
├── JwtUtil.java                토큰 발급/검증 (HS256, Base64 secret)
├── JwtFilter.java              OncePerRequestFilter — Authorization 헤더 파싱
└── CustomUserDetailsService.java   UserDetailsService 구현 (email로 조회)
entity/
├── User.java                   users 테이블 (email unique, @OneToOne → UserProfile)
├── UserProfile.java            user_profile 테이블 (birthYear, gender, region 등)
└── Benefit.java                benefit 테이블
dto/
├── SignupRequest / LoginRequest / LoginResponse
├── UserProfileUpdateRequest / UserProfileResponse (from(User) 정적 팩토리)
├── BenefitFilterRequest / BenefitResponse
└── ErrorResponse
controller/
├── AuthController        GET /api/auth/check-id, POST /api/auth/signup, /login, /reset-password (public)
├── UserController        GET/PUT /api/users/me  (JWT 필요)
├── BenefitController     GET /api/benefits, POST /api/benefits/filter (public)
├── AdminController       /api/admin/** (관리자 권한)
└── AnnouncementController GET /api/announcements (public)
service/
├── AuthService           회원가입, 로그인, 비밀번호 재설정
├── UserService           프로필 조회/수정
├── BenefitService        필터링 로직
├── WelfareApiService     data.go.kr 복지 API 연동
└── PolicyNewsService     공공데이터 보도자료 API (30분 주기 캐시)
scheduler/BenefitSyncScheduler   data.go.kr 매일 새벽 3시 자동 동기화
exception/GlobalExceptionHandler  IllegalArgumentException→400, BadCredentials→401

**인증 흐름**: 로그인 → JWT 발급 → 클라이언트가 `Authorization: Bearer <token>` 헤더로 전송 → JwtFilter 검증 → SecurityContext 설정  
**소셜 로그인**: Google / Naver OAuth2 — `/login/oauth2/code/{provider}` 콜백 → JWT 발급 → 프론트 `/oauth/callback`으로 리다이렉트

**DB**: MySQL 8.0 (`jdbc:mysql://localhost:3306/infodb`)  
`spring.jpa.hibernate.ddl-auto=update` 로 스키마 자동 관리, 최초 실행 시 `data.sql` 삽입

### 프론트엔드 (`infoFront/frontend/src/`)
context/
├── AuthContext.jsx        user 상태 + loginUser/logoutUser (localStorage 기반)
└── AdminContext.jsx       관리자 인증 상태 관리
api/
├── axiosInstance.js       JWT 인터셉터 + 401 시 자동 로그아웃
├── authApi.js             checkUserId, signup, login, resetPassword
├── userApi.js             getMyProfile, updateProfile, updateAccount
├── benefitApi.js          getAllBenefits, getFilteredBenefits
└── adminApi.js            관리자용 CRUD API
pages/
├── HomePage               소개 + CTA
├── LoginPage / SignupPage 인증 (AuthPage.css 공유)
├── FilterPage             혜택 검색 폼 — 로그인 시 프로필 자동 불러오기
├── ResultPage             navigation state로 결과 수신 + 인라인 검색(제목·설명·기관) + 카테고리 필터
├── MyPage                 프로필 조회/수정 + 로그아웃
├── ProfileSetupPage       소셜 로그인 후 초기 프로필 설정
├── OAuthCallbackPage      OAuth2 콜백 처리 (토큰 저장 후 리다이렉트)
├── AnnouncementPage       정책 소식 목록 + 인라인 검색(제목·부제목) + 부처별 필터
├── AdminPage              관리자 대시보드 (혜택 CRUD, 회원 조회, 통계)
└── AdminLoginPage         관리자 전용 로그인

**라우팅**: `/` `/filter` `/results` `/login` `/signup` `/mypage` `/profile-setup` `/oauth/callback` `/announcements` `/admin` `/admin/login`  
**프록시**: `package.json` `"proxy": "http://localhost:8080"` — 개발 시 /api/* 자동 전달

### DB 스키마

| 테이블 | 주요 컬럼 |
|--------|-----------|
| `users` | id, email(unique, Java필드명 userId), password(bcrypt), name, role, provider, provider_id, created_at |
| `user_profile` | id, user_id(FK), birth_year, gender, region, income_level, employment_status, has_disability, family_type |
| `benefit` | id, title, category, description, min_age, max_age, target_region, max_income_level, employment_status, requires_disability, disability_grade, family_type, requires_gender, requires_foreign_worker, requires_north_korean, min_children, apply_url, organization |

### 필터링 조건 (BenefitService)

`null` 필드는 조건 없음으로 처리. `targetRegion`이 "전국"이면 전국 허용.
`maxIncomeLevel`: 사용자 소득분위 ≤ benefit.maxIncomeLevel 이면 매칭.

---

## 워크플로우 오케스트레이션

### 1. 계획 우선 원칙
- 3단계 이상이거나 아키텍처 결정이 필요한 작업은 반드시 플랜 모드로 진입
- 작업 중 문제가 발생하면 즉시 중단하고 재계획
- 플랜 모드는 구현뿐 아니라 검증 단계에도 활용

### 2. 서브에이전트 전략
- 메인 컨텍스트 창을 깔끔하게 유지하기 위해 서브에이전트를 적극 활용
- 조사, 탐색, 병렬 분석 작업은 서브에이전트에 위임
- 복잡한 문제는 서브에이전트를 통해 더 많은 연산을 투입
- 집중된 실행을 위해 서브에이전트당 하나의 작업만 담당

### 3. 자기 개선 루프
- 사용자로부터 수정 피드백을 받은 후: `tasks/lessons.md`에 패턴 업데이트
- 동일한 실수를 방지하는 규칙을 직접 작성
- 실수율이 낮아질 때까지 반복 개선
- 세션 시작 시 관련 프로젝트의 lessons 파일 검토

### 4. 완료 전 검증
- 작동 여부를 증명하기 전까지 작업 완료로 표시하지 않음
- 필요 시 메인 코드와 변경 사항 간의 동작 차이를 비교
- "시니어 엔지니어가 이 코드를 승인할 것인가?" 자문
- 테스트 실행, 로그 확인, 정확성 입증

### 5. 우아한 코드 추구 (균형 있게)
- 비사소한 변경의 경우: "더 우아한 방법이 있는가?" 잠시 검토
- 해결책이 임시방편처럼 느껴진다면: "지금 알고 있는 모든 것을 바탕으로 우아한 해결책을 구현"
- 단순하고 명확한 수정은 이 단계 생략 — 과도한 설계 지양
- 결과물을 제시하기 전에 스스로 검토

### 6. 자율적 버그 수정
- 버그 리포트를 받으면 바로 수정. 단계별 안내 요청하지 않음
- 로그, 에러, 실패한 테스트를 기반으로 해결
- 사용자의 컨텍스트 전환 불필요
- 별도 지시 없이 실패한 CI 테스트도 수정

---

## 작업 관리

1. **계획 먼저**: 체크 가능한 항목으로 `tasks/todo.md`에 계획 작성
2. **계획 검토**: 구현 시작 전 확인
3. **진행 추적**: 완료된 항목은 바로 체크
4. **변경 설명**: 각 단계마다 변경 사항 요약 제공
5. **결과 문서화**: `tasks/todo.md`에 검토 섹션 추가
6. **교훈 기록**: 수정 후 `tasks/lessons.md` 업데이트

---

## 핵심 원칙

- **단순성 우선**: 모든 변경은 가능한 한 단순하게. 최소한의 코드에만 영향을 줄 것.
- **철저함**: 근본 원인을 찾을 것. 임시방편 금지. 시니어 개발자 수준 유지.
- **최소 영향**: 변경은 필요한 부분에만 한정. 새로운 버그 유입 방지.