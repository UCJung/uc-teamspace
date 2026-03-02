# WORK-15: 사용자 계정 신청/승인 및 멀티팀 지원

> 요구사항 출처: `tasks/Require/Require-04.md`
> 작성일: 2026-03-02

---

## 1. 요구사항 요약

| 항목 | 내용 |
|------|------|
| ADMIN 역할 | 시스템 관리자 — 계정 승인, 팀 생성 승인 |
| 계정 신청 | 로그인 화면에서 회원가입 (성명, 이메일, 비밀번호) |
| 계정 상태 관리 | 신청 → 승인 → 사용중 → 사용종료 |
| 팀 생성 신청 | 로그인 후 팀 생성 요청 → 관리자 승인 → 신청자가 팀장 |
| 팀 상태 관리 | 신청 → 승인 → 사용중 → 사용종료 |
| 멀티팀 소속 | 한 사용자가 여러 팀에 소속 가능 |
| 팀 랜딩 화면 | 팀 검색/필터, 팀 생성 신청, 멤버 신청 |
| 멤버 신청/승인 | 팀에 가입 신청 → 팀장/파트장 승인/거절 |
| 비밀번호 변경 | 최초 로그인 시 강제 변경 + 수시 변경 가능 |
| 최초 로그인 | 비밀번호 변경 레이어 팝업 필수 |

---

## 2. 아키텍처 영향 분석

### 2.1 DB 스키마 변경

**새로 추가되는 enum:**
```
AccountStatus: PENDING | APPROVED | ACTIVE | INACTIVE
TeamStatus:    PENDING | APPROVED | ACTIVE | INACTIVE
JoinRequestStatus: PENDING | APPROVED | REJECTED
```

**MemberRole enum 변경:**
```
기존: LEADER | PART_LEADER | MEMBER
변경: ADMIN | LEADER | PART_LEADER | MEMBER
```

**Member 모델 변경:**
| 필드 | 변경 내용 |
|------|----------|
| partId | `String` → `String?` (optional) — 팀 미소속 사용자 허용 |
| accountStatus | 새 필드 `AccountStatus @default(PENDING)` |
| mustChangePassword | 새 필드 `Boolean @default(true)` |

**Team 모델 변경:**
| 필드 | 변경 내용 |
|------|----------|
| teamStatus | 새 필드 `TeamStatus @default(PENDING)` |
| requestedById | 새 필드 `String?` — 팀 생성 신청자 |

**새로운 모델:**

```prisma
model TeamMembership {
  id        String       @id @default(cuid())
  memberId  String
  teamId    String
  partId    String?
  roles     MemberRole[] @default([MEMBER])
  sortOrder Int          @default(0)

  member    Member @relation(fields: [memberId], references: [id])
  team      Team   @relation(fields: [teamId], references: [id])
  part      Part?  @relation(fields: [partId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([memberId, teamId])
  @@map("team_memberships")
}

model TeamJoinRequest {
  id        String            @id @default(cuid())
  memberId  String
  teamId    String
  status    JoinRequestStatus @default(PENDING)

  member    Member @relation(fields: [memberId], references: [id])
  team      Team   @relation(fields: [teamId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([memberId, teamId, status])
  @@map("team_join_requests")
}
```

### 2.2 기존 코드 영향도

| 영역 | 영향 | 설명 |
|------|------|------|
| Auth 모듈 | 높음 | login에 accountStatus 체크, register 추가, change-password 추가 |
| Team 모듈 | 높음 | TeamMembership 기반 조회, join-request 기능 추가 |
| RolesGuard | 중간 | TeamMembership에서 팀별 역할 조회로 변경 |
| 프론트엔드 authStore | 중간 | User 타입에 accountStatus, mustChangePassword 추가 |
| 프론트엔드 Sidebar | 중간 | 팀 메뉴, 사용자 정보 메뉴 구조 변경 |
| 프론트엔드 라우팅 | 중간 | 팀 랜딩, 어드민 화면 추가 |
| WeeklyReport | 낮음 | teamId 컨텍스트 추가 고려 (현재는 memberId로 충분) |

---

## 3. TASK 분해 및 의존성 DAG

```
TASK-01 (DB 스키마 변경)
    │
    ├── TASK-02 (Admin API) ──────────── → TASK-06 (Admin 화면)
    │
    ├── TASK-03 (계정 신청/비번 API) ──── → TASK-05 (계정 신청/비번 화면)
    │
    └── TASK-04 (팀 목록/신청 API) ────── → TASK-07 (팀 랜딩 화면)
                                          → TASK-08 (멤버 신청 승인 UI)
                                                      │
                                               TASK-09 (통합 검증) ←── 전체 완료 후
```

---

## 4. TASK 상세

### TASK-01: DB 스키마 변경 및 마이그레이션

**목적:** 계정 상태, 팀 상태, 멀티팀 소속을 지원하는 DB 구조 마련

**체크리스트:**
- [ ] `AccountStatus`, `TeamStatus`, `JoinRequestStatus` enum 추가
- [ ] `MemberRole`에 `ADMIN` 추가
- [ ] `Member` 모델: `partId` optional, `accountStatus`, `mustChangePassword` 추가
- [ ] `Team` 모델: `teamStatus`, `requestedById` 추가
- [ ] `TeamMembership` 모델 생성
- [ ] `TeamJoinRequest` 모델 생성
- [ ] Prisma 마이그레이션 작성 및 실행
- [ ] 마이그레이션: 기존 Member 데이터 → TeamMembership 자동 생성
- [ ] seed.ts 업데이트: ADMIN 계정 생성, 기존 팀원 TeamMembership 연동
- [ ] 기존 데이터 무결성 검증

**산출물:** `prisma/schema.prisma`, 마이그레이션 파일, `seed.ts`

---

### TASK-02: Back-end ADMIN 관리 API

**목적:** 시스템 관리자의 계정/팀 관리 기능

**선행:** TASK-01

**API 설계:**
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/v1/admin/accounts` | 계정 목록 (상태별 필터) |
| PATCH | `/api/v1/admin/accounts/:id/status` | 계정 상태 변경 (승인 시 메일 발송) |
| GET | `/api/v1/admin/teams` | 팀 목록 (상태별 필터) |
| PATCH | `/api/v1/admin/teams/:id/status` | 팀 상태 변경 (승인 시 신청자→팀장) |

**체크리스트:**
- [ ] `AdminModule` 생성 (admin.module.ts, admin.controller.ts, admin.service.ts)
- [ ] `AdminGuard` — ADMIN 역할 전용 가드
- [ ] 계정 목록 API (페이지네이션, 상태 필터)
- [ ] 계정 상태 변경 API (승인 시 이메일 알림 — 로거 기반 or SMTP)
- [ ] 팀 목록 API (페이지네이션, 상태 필터)
- [ ] 팀 상태 변경 API (승인 시 TeamMembership + 신청자 LEADER 역할 자동 생성)
- [ ] 단위 테스트

**산출물:** `src/admin/` 모듈 전체

---

### TASK-03: Back-end 계정 신청 + 비밀번호 변경 API

**목적:** 회원가입 및 비밀번호 관리 기능

**선행:** TASK-01

**API 설계:**
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/v1/auth/register` | 계정 신청 (성명, 이메일, 비밀번호) |
| POST | `/api/v1/auth/change-password` | 비밀번호 변경 (현재/신규 비밀번호) |

**체크리스트:**
- [ ] `POST /api/v1/auth/register` — 계정 신청 (accountStatus: PENDING)
- [ ] 이메일 중복 검사
- [ ] 비밀번호 해싱 (bcrypt)
- [ ] `POST /api/v1/auth/change-password` — 현재 비밀번호 검증 + 신규 비밀번호 설정
- [ ] 비밀번호 변경 시 `mustChangePassword = false` 설정
- [ ] 로그인 로직 수정:
  - accountStatus가 PENDING이면 "승인 대기중" 에러
  - accountStatus가 INACTIVE이면 "사용 종료된 계정" 에러
  - accountStatus가 APPROVED이면 ACTIVE로 변경
  - 응답에 `mustChangePassword` 플래그 포함
- [ ] RegisterDto, ChangePasswordDto 작성
- [ ] 단위 테스트

**산출물:** auth 모듈 수정 파일, DTO

---

### TASK-04: Back-end 팀 목록/검색/신청/멤버 가입 API

**목적:** 팀 검색, 팀 생성 신청, 멤버 가입 신청/승인

**선행:** TASK-01

**API 설계:**
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/v1/teams` | 팀 목록 (검색, 필터: all/joined/unjoined) |
| POST | `/api/v1/teams/request` | 팀 생성 신청 (teamName) |
| POST | `/api/v1/teams/:teamId/join` | 멤버 가입 신청 |
| GET | `/api/v1/teams/:teamId/join-requests` | 멤버 신청 목록 (팀장/파트장 전용) |
| PATCH | `/api/v1/teams/:teamId/join-requests/:id` | 멤버 신청 승인/거절 |
| GET | `/api/v1/my/teams` | 내 소속 팀 목록 |

**체크리스트:**
- [ ] 팀 목록 API — 검색(팀명), 필터(전체/소속/미소속), 페이지네이션
- [ ] 팀 생성 신청 API — Team(teamStatus: PENDING) 생성
- [ ] 멤버 가입 신청 API — TeamJoinRequest 생성
- [ ] 멤버 신청 목록 API — 팀장/파트장만 조회 가능
- [ ] 멤버 신청 승인 API — 승인 시 TeamMembership 생성 + 파트 배정
- [ ] 멤버 신청 거절 API — status: REJECTED (재신청 가능)
- [ ] 내 소속 팀 목록 API — TeamMembership 기반 조회
- [ ] 기존 TeamController 수정: TeamMembership 기반 멤버 조회
- [ ] 단위 테스트

**산출물:** team 모듈 수정, 새 DTO

---

### TASK-05: Front-end 로그인 화면 계정 신청 + 비밀번호 변경 UI

**목적:** 계정 신청 폼, 비밀번호 변경 모달, 최초 로그인 강제 변경

**선행:** TASK-03

**체크리스트:**
- [ ] Login.tsx에 "계정 신청" 링크 추가
- [ ] `RegisterPage.tsx` 또는 로그인 내 탭 전환으로 신청 폼 구현
  - 입력: 성명, 이메일, 비밀번호, 비밀번호 확인
  - 유효성 검사: 이메일 형식, 비밀번호 일치, 최소 길이
  - 신청 완료 시 "관리자 승인 후 로그인 가능" 안내
- [ ] `ChangePasswordModal.tsx` 컴포넌트 생성
  - 입력: 현재 비밀번호, 신규 비밀번호, 신규 비밀번호 확인
  - 화면 중앙 레이어 팝업
- [ ] authStore 수정: User 타입에 `mustChangePassword` 추가
- [ ] 로그인 성공 후 `mustChangePassword === true`이면 ChangePasswordModal 강제 오픈
- [ ] 비밀번호 변경 완료 후 정상 진입 허용
- [ ] auth API 모듈에 register, changePassword 함수 추가

**산출물:** RegisterPage.tsx, ChangePasswordModal.tsx, authStore 수정

---

### TASK-06: Front-end ADMIN 관리 화면

**목적:** 시스템 관리자의 계정/팀 관리 UI

**선행:** TASK-02

**체크리스트:**
- [ ] App.tsx에 `/admin/*` 라우트 추가 (ADMIN 전용)
- [ ] `AdminLayout.tsx` — 어드민 전용 사이드바/헤더
- [ ] `AccountManagement.tsx` 페이지
  - 계정 목록 (테이블): 성명, 이메일, 상태, 가입일
  - 상태 필터 (전체/신청/승인/사용중/종료)
  - 상태 변경 버튼 (승인, 종료 등)
- [ ] `TeamManagement.tsx` 페이지 (admin 용)
  - 팀 목록: 팀명, 신청자, 상태, 신청일
  - 상태 필터
  - 상태 변경 버튼 (승인, 종료 등)
- [ ] admin API 모듈 생성 (`api/admin.api.ts`)
- [ ] TanStack Query 훅 (`hooks/useAdmin.ts`)

**산출물:** AdminLayout, AccountManagement, TeamManagement 페이지

---

### TASK-07: Front-end 팀 랜딩 화면 + 팀 선택 로직

**목적:** 로그인 후 팀 선택/검색/신청 화면, 사이드바 구조 변경

**선행:** TASK-04, TASK-05

**체크리스트:**
- [ ] `TeamLanding.tsx` 페이지
  - 팀 검색 (팀명 키워드)
  - 검색 필터: 전체, 소속팀, 미소속팀
  - 팀 목록 카드/테이블: 팀명, 팀장, (미소속 시 "멤버신청" 버튼)
  - "팀 생성 신청" 버튼 → 레이어 팝업 (팀명 입력)
- [ ] `TeamCreateRequestModal.tsx` — 팀 생성 신청 팝업
- [ ] 팀 선택 로직:
  - 소속팀 0개 또는 2개 이상 → TeamLanding이 초기 화면
  - 소속팀 1개 → 해당 팀 화면으로 바로 이동
- [ ] `teamStore.ts` (Zustand) — 현재 선택된 팀 관리
- [ ] Sidebar.tsx 수정:
  - 최상단에 "팀" 메뉴 추가
  - 사용자 정보 영역에:
    - 소속 팀 목록 (클릭 시 해당 팀으로 이동)
    - 비밀번호 변경 메뉴 (클릭 시 ChangePasswordModal)
- [ ] App.tsx 라우팅 수정: 팀 랜딩 → 팀 선택 → 기존 화면 흐름
- [ ] team API 모듈 수정 (`api/team.api.ts`)

**산출물:** TeamLanding, TeamCreateRequestModal, teamStore, Sidebar 수정

---

### TASK-08: Front-end 팀 파트관리 멤버 신청 승인/거절 UI

**목적:** 기존 팀 관리 화면에서 멤버 가입 신청 처리

**선행:** TASK-04, TASK-07

**체크리스트:**
- [ ] TeamMgmt.tsx 수정:
  - 팀원 목록 하단 또는 별도 섹션에 "멤버 신청 목록" 표시
  - 신청자 정보: 성명, 이메일, 신청일
  - 승인 / 거절 버튼
- [ ] 승인 시: 파트 배정 선택 모달 (어느 파트에 배정할지)
- [ ] 거절 시: 확인 다이얼로그 후 거절
- [ ] 거절된 사용자 재신청 가능 (목록에서 사라짐)
- [ ] TanStack Query 훅 연동

**산출물:** TeamMgmt.tsx 수정, JoinRequestSection 컴포넌트

---

### TASK-09: 통합 검증

**목적:** 전체 플로우 검증 및 빌드/린트 확인

**선행:** TASK-05, TASK-06, TASK-07, TASK-08

**체크리스트:**
- [ ] 전체 빌드 통과 (`bun run build`)
- [ ] 전체 린트 통과 (`bun run lint`)
- [ ] 전체 테스트 통과 (`bun run test`)
- [ ] 플로우 검증:
  1. 계정 신청 → 관리자 승인 → 최초 로그인 → 비밀번호 변경
  2. 팀 생성 신청 → 관리자 승인 → 팀장으로 설정
  3. 팀 검색 → 멤버 가입 신청 → 팀장 승인
  4. 다중 팀 소속 시 팀 선택 화면
  5. ADMIN 화면에서 계정/팀 관리
- [ ] DB 마이그레이션 무결성 확인
- [ ] 수행결과 보고서 생성

**산출물:** 테스트 결과, 수행결과 보고서

---

## 5. 기술 설계 메모

### 5.1 ADMIN 계정 초기 설정
- seed.ts에서 ADMIN 계정 1개 생성 (email: admin@system.local, 초기 비밀번호)
- ADMIN은 어떤 팀에도 소속되지 않는 시스템 관리자
- ADMIN 전용 라우트: `/admin/*`

### 5.2 이메일 발송
- 1차: NestJS Logger로 콘솔에 이메일 내용 출력 (개발 환경)
- 2차(선택): Nodemailer SMTP 연동 — 환경 변수로 설정

### 5.3 비밀번호 해싱
- bcrypt 사용 (기존 auth 모듈과 동일)
- salt rounds: 10

### 5.4 프론트엔드 팀 컨텍스트
- Zustand `teamStore`에 `currentTeamId` 저장
- API 호출 시 `currentTeamId`를 쿼리 파라미터 또는 헤더로 전달
- Sidebar, Header에서 현재 팀 표시

### 5.5 마이그레이션 전략
- 기존 Member.partId 데이터를 TeamMembership으로 복사 (SQL 마이그레이션)
- 기존 Member.roles를 TeamMembership.roles로 복사
- 기존 Member.partId는 optional로 변경 (하위 호환)
- 기존 팀원의 accountStatus는 ACTIVE로 설정
- 기존 팀원의 mustChangePassword는 false로 설정
- 기존 팀의 teamStatus는 ACTIVE로 설정
