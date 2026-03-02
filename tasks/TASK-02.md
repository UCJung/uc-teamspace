# TASK-02: Back-end — 인증 + 팀·파트·팀원 관리 API

> **Phase:** 2
> **선행 TASK:** TASK-01
> **목표:** JWT 인증 체계 구축, 팀·파트·팀원 CRUD API 완성, RBAC 가드 구현

---

## Step 1 — 계획서

### 1.1 작업 범위

Passport.js + JWT 기반 인증 시스템(Access Token 15분 / Refresh Token 7일)을 구현한다. 역할 기반 접근 제어(RBAC)를 위한 가드와 데코레이터를 작성하고, 팀·파트·팀원 관리 CRUD API를 완성한다. 전역 응답 인터셉터, 예외 필터, 유효성 검증 파이프를 설정한다.

### 1.2 API 엔드포인트

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| POST | `/api/v1/auth/login` | 로그인 (JWT 발급) | 전체 |
| POST | `/api/v1/auth/refresh` | 토큰 갱신 | 전체 |
| GET | `/api/v1/auth/me` | 현재 사용자 정보 | 인증 필요 |
| GET | `/api/v1/teams/:teamId` | 팀 정보 조회 | 인증 필요 |
| GET | `/api/v1/teams/:teamId/parts` | 파트 목록 | 인증 필요 |
| GET | `/api/v1/teams/:teamId/members` | 팀원 목록 (파트별 필터 가능) | 인증 필요 |
| POST | `/api/v1/members` | 팀원 등록 | LEADER |
| PATCH | `/api/v1/members/:id` | 팀원 수정 | LEADER |

---

## Step 2 — 체크리스트

### 2.1 공통 인프라 (common/)

- [ ] `common/interceptors/response.interceptor.ts` — `{ success, data, message }` 응답 포맷 변환
- [ ] `common/filters/http-exception.filter.ts` — 전역 예외 필터 (`{ success: false, data: null, message, errorCode }`)
- [ ] `common/filters/business-exception.ts` — 커스텀 비즈니스 예외 클래스
- [ ] `common/pipes/validation.pipe.ts` — class-validator 기반 전역 유효성 검증
- [ ] `common/decorators/current-user.decorator.ts` — `@CurrentUser()` 요청에서 사용자 추출
- [ ] `common/decorators/roles.decorator.ts` — `@Roles(MemberRole.LEADER)` 역할 지정
- [ ] `common/guards/jwt-auth.guard.ts` — JWT 토큰 검증 가드
- [ ] `common/guards/roles.guard.ts` — 역할 기반 접근 제어 가드
- [ ] `common/dto/pagination.dto.ts` — page, limit 쿼리 DTO
- [ ] `main.ts`에 전역 파이프, 필터, 인터셉터 등록

### 2.2 인증 모듈 (auth/)

- [ ] `auth/auth.module.ts` — PassportModule, JwtModule 등록
- [ ] `auth/auth.controller.ts` — login, refresh, me 엔드포인트
- [ ] `auth/auth.service.ts`
  - `login(email, password)` — bcrypt 비교 → Access + Refresh Token 발급
  - `refresh(refreshToken)` — Redis에서 검증 → 새 Access Token 발급
  - `getMe(userId)` — 현재 사용자 정보 반환
- [ ] `auth/strategies/jwt.strategy.ts` — JWT 토큰 디코딩 전략
- [ ] `auth/strategies/local.strategy.ts` — 이메일+비밀번호 검증 전략
- [ ] `auth/dto/login.dto.ts` — email, password 검증
- [ ] `auth/dto/token-response.dto.ts`
- [ ] Access Token 만료: 15분, Refresh Token 만료: 7일
- [ ] Refresh Token Redis 저장·검증·삭제 로직
- [ ] 단위 테스트: 로그인 성공/실패, 토큰 갱신, 만료 처리

### 2.3 팀 관리 모듈 (team/)

- [ ] `team/team.module.ts`
- [ ] `team/team.controller.ts` — 팀 조회, 파트 목록, 팀원 목록 엔드포인트
- [ ] `team/team.service.ts` — 팀 조회 로직
- [ ] `team/part.service.ts` — 파트 CRUD
- [ ] `team/member.service.ts`
  - 팀원 등록 (비밀번호 해싱)
  - 팀원 수정 (역할 변경, 파트 변경)
  - 소프트 삭제 (isActive = false)
  - 팀원 목록 (파트 필터, isActive 필터)
- [ ] `team/dto/create-member.dto.ts` — name, email, role, partId 검증
- [ ] `team/dto/update-member.dto.ts` — PartialType
- [ ] 팀원 등록 시 이메일 중복 체크
- [ ] 팀원 삭제 시 isActive = false (소프트 삭제)
- [ ] 단위 테스트: 팀원 CRUD, 권한 검증
- [ ] E2E 테스트: 로그인 → 팀원 목록 조회 → 팀원 등록

---

## Step 3 — 완료 검증

```bash
# 1. DB 기동 확인
docker compose up -d postgres redis

# 2. 빌드
cd packages/backend && bun run build

# 3. 단위 테스트
cd packages/backend && bun run test

# 4. E2E 테스트
cd packages/backend && bun run test:e2e

# 5. 전체 린트
cd ../.. && bun run lint

# 6. API 수동 확인 (서버 기동 후)
cd packages/backend && bun run start:dev &
sleep 3

# 로그인
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"leader@example.com","password":"password123"}'

# 토큰으로 me 조회
# curl -H "Authorization: Bearer <token>" http://localhost:3000/api/v1/auth/me

# 팀원 목록
# curl -H "Authorization: Bearer <token>" http://localhost:3000/api/v1/teams/<teamId>/members

kill %1
```
