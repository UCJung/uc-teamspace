# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# 주간업무보고 시스템 — 개발 마스터 가이드

> Claude Code가 이 프로젝트에서 작업할 때 **반드시 이 파일을 먼저 읽고 시작**한다.
> 모든 판단 기준, 컨벤션, 작업 프로세스는 이 파일이 최우선이다.

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 프로젝트명 | 주간업무보고 시스템 |
| 대상 조직 | 선행연구개발팀 (DX 파트 4명, AX 파트 5명, 총 9명) |
| 핵심 기능 | ① 팀·파트·팀원 관리  ② 프로젝트 관리  ③ 주간업무 작성(그리드 UI)  ④ 파트 취합보고  ⑤ 팀장 조회·Excel 내보내기 |
| 업무 작성 구조 | 프로젝트별 업무항목 → 세부업무(`*`) → 상세작업(`ㄴ`) 3단계 |
| 주요 사용자 | 팀원(개인 작성), 파트장(파트 취합), 팀장(전체 조회) |

---

## 2. 참조 문서 위치

```
docs/
├── 주간업무보고_시스템_설계_요구사항.md      ← 시스템 개요 + 기능 요구사항 + 데이터 모델 + 화면 구성
├── 주간업무보고_개발_아키텍처_설계서.md      ← 기술 스택 + 모듈 구조 + DB 스키마 + API 설계
├── STYLE_GUIDE_WEB.md                       ← React 스타일 가이드 (색상·컴포넌트)
├── 선행연구개발팀_주간업무.xlsx              ← 현행 엑셀 원본 (업무 구조 참고용)
└── weekly-report-ui-mockup.jsx              ← UI 시안 (React 컴포넌트)

tasks/
└── TASK-00.md ~ TASK-10.md                  ← TASK별 상세 체크리스트 + 프롬프트
```

---

## 3. 작업 프로세스 (모든 TASK 공통 필수)

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  1. 계획수립  │───▶│  2. 계획검토  │───▶│  3. 계획승인  │───▶│  4. 작업수행  │───▶│  5. 검증실행  │───▶│  6. 결과보고  │
│  Claude 작성  │    │  담당자 확인  │    │  담당자 승인  │    │  Claude 실행  │    │  자동 실행    │    │  보고서 생성  │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
                                                                                        │ 오류 시
                                                                                        ▼
                                                                                  수정 후 재실행
```

### 프로세스 규칙
- Claude는 각 TASK 시작 시 **계획서를 확인하고 즉시 작업을 수행**한다 (별도 승인 불필요)
- 작업 중 불명확한 사항은 즉시 질문하고 확인 후 진행한다
- 각 산출물 완료 시 해당 TASK 체크리스트에 즉시 체크한다
- **작업수행 완료 후 해당 TASK MD의 "Step 3 — 완료 검증" 명령어를 자동으로 실행한다**
- 검증 실패 시 원인을 분석·수정하고 해당 검증 항목을 재실행한다
- **모든 검증 항목 통과 후 `tasks/TASK-XX-수행결과.md`를 자동으로 생성한다** (섹션 14 템플릿 준수)
- 자동화 불가 UI 검증(브라우저 렌더링, 그리드 셀 편집 동작, 색상 육안 확인 등)은 수행결과 보고서 섹션 5에 **"수동 확인 필요"** 항목으로 명시한다
- **검증 완료 + 수행결과 보고서 생성 후, 해당 TASK 단위로 Git 커밋한다** (push는 하지 않음)
  - 커밋 메시지 형식: `TASK-XX: {TASK 제목 요약}`
  - 예시: `TASK-01: DB 설계 및 초기화 (Prisma 스키마 + 시드)`
  - 커밋 범위: 해당 TASK에서 생성·수정한 파일 + 수행결과 보고서
- **커밋 완료 후, 다음 순서의 TASK를 자동으로 시작한다** (계획 확인 → 즉시 작업 수행)

---

## 4. 전체 개발 Phase

| Phase | TASK | 내용 | 선행 |
|---|---|---|---|
| 0 | TASK-00 | 환경 설정 및 프로젝트 초기화 (모노레포 + Docker) | 없음 |
| 1 | TASK-01 | DB 설계 및 초기화 (Prisma 스키마 + 마스터 데이터 시드) | TASK-00 |
| 2 | TASK-02 | Back-end: 인증 + 팀·파트·팀원 관리 API | TASK-01 |
| 3 | TASK-03 | Back-end: 프로젝트 관리 API | TASK-02 |
| 4 | TASK-04 | Back-end: 주간업무 CRUD + 자동저장 + 전주 불러오기 API | TASK-03 |
| 5 | TASK-05 | Back-end: 파트 취합·팀 조회·Excel 내보내기 API | TASK-04 |
| 6 | TASK-06 | Front-end: 초기화 + 공통 컴포넌트 + 레이아웃 | TASK-00 |
| 7 | TASK-07 | Front-end: 팀·파트·프로젝트 관리 화면 | TASK-06, TASK-03 |
| 8 | TASK-08 | Front-end: 주간업무 작성 그리드 화면 (핵심) | TASK-07, TASK-04 |
| 9 | TASK-09 | Front-end: 파트 현황·취합보고·팀장 조회 화면 | TASK-08, TASK-05 |
| 10 | TASK-10 | 통합 테스트 및 배포 | TASK-09 |

---

## 5. 기술 스택

### Back-end
```
Node.js 22 LTS / Bun 1.2+ (패키지 매니저 + 테스트 러너)
NestJS 11 + TypeScript 5.x
Prisma 6.x (ORM + 마이그레이션)
Passport.js + JWT (Access 15분 / Refresh 7일, Redis 저장)
class-validator + class-transformer (DTO 검증)
ExcelJS (Excel 내보내기)
PostgreSQL 16
Redis 7
Bun Test + Supertest (테스트)
```

### Front-end
```
React 18 + TypeScript 5.x / Vite 6
Tailwind CSS 4
TanStack Table v8 (스프레드시트 그리드)
TanStack Query v5 (서버 상태 + 낙관적 업데이트)
Zustand v5 (클라이언트 상태)
React Router v7
Axios (JWT 인터셉터)
Tiptap v2 (리치 텍스트 셀 편집)
Vitest + Playwright (테스트)
```

### 모노레포
```
Turborepo 2.x (빌드 오케스트레이션)
packages/backend    — NestJS API
packages/frontend   — React SPA
packages/shared     — 공유 타입 + 유틸 (주차 계산 등)
```

---

## 6. 빌드 및 실행 명령어

### 인프라 (Docker)
```bash
docker compose up -d                # PostgreSQL 16 + Redis 7 기동
docker compose down                 # 중지
docker compose logs -f postgres     # DB 로그 확인
```

### 모노레포 루트
```bash
bun install                         # 전체 의존성 설치
bun run dev                         # 백엔드 + 프론트엔드 동시 실행 (Turborepo)
bun run build                       # 전체 빌드
bun run lint                        # 전체 린트
bun run test                        # 전체 테스트
```

### Back-end
```bash
cd packages/backend
bun run start:dev                   # NestJS 개발 서버 (localhost:3000)
bun run build                       # 프로덕션 빌드
bun run test                        # 단위 테스트
bun run test:e2e                    # E2E 테스트 (Supertest)
bunx prisma migrate dev             # DB 마이그레이션 실행
bunx prisma migrate deploy          # 운영 마이그레이션 적용
bunx prisma db seed                 # 마스터 데이터 시드
bunx prisma studio                  # DB GUI (localhost:5555)
bunx prisma generate                # Prisma Client 재생성
```

### Front-end
```bash
cd packages/frontend
bun run dev                         # Vite 개발 서버 (localhost:5173)
bun run build                       # 프로덕션 빌드
bun run lint                        # ESLint
bun run test                        # Vitest 단위 테스트
bunx playwright test                # E2E 테스트
```

### DB 상태 확인
```sql
-- 팀·파트·팀원 확인
SELECT m.name, m.role, p.name AS part FROM members m JOIN parts p ON m.part_id = p.id;
-- 프로젝트 목록 확인
SELECT name, code, category, status FROM projects ORDER BY category, name;
-- 주간업무 작성 현황
SELECT m.name, wr.week_label, wr.status, COUNT(wi.id) AS items
FROM weekly_reports wr
JOIN members m ON wr.member_id = m.id
LEFT JOIN work_items wi ON wi.weekly_report_id = wr.id
GROUP BY m.name, wr.week_label, wr.status;
```

---

## 7. 디렉터리 구조

```
weekly-report-system/
├── CLAUDE.md                                 ← 이 파일
├── docs/                                     ← 설계 문서
│   ├── 주간업무보고_시스템_설계_요구사항.md
│   ├── 주간업무보고_개발_아키텍처_설계서.md
│   └── STYLE_GUIDE_WEB.md
├── tasks/                                    ← TASK MD + 수행결과
│   └── TASK-00.md ~ TASK-10.md
├── docker-compose.yml
├── docker-compose.dev.yml
├── turbo.json
├── package.json                              ← 워크스페이스 루트
│
├── packages/
│   ├── shared/                               ← 공유 타입·유틸
│   │   ├── types/
│   │   │   ├── weekly-report.ts
│   │   │   ├── team.ts
│   │   │   └── project.ts
│   │   ├── constants/
│   │   │   └── week-utils.ts                 ← 주차 계산 함수
│   │   └── package.json
│   │
│   ├── backend/                              ← NestJS API 서버
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── common/                       ← 공통 (가드, 필터, 파이프, 데코레이터)
│   │   │   │   ├── decorators/               ←   @Roles, @CurrentUser
│   │   │   │   ├── guards/                   ←   JwtAuthGuard, RolesGuard
│   │   │   │   ├── interceptors/             ←   응답 변환, 로깅
│   │   │   │   ├── filters/                  ←   전역 예외 필터
│   │   │   │   └── dto/                      ←   PaginationDto 등
│   │   │   ├── auth/                         ← 인증 모듈
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── strategies/               ←   JWT, Local 전략
│   │   │   │   └── dto/
│   │   │   ├── team/                         ← 팀 관리 모듈
│   │   │   │   ├── team.module.ts
│   │   │   │   ├── team.controller.ts
│   │   │   │   ├── team.service.ts
│   │   │   │   ├── part.service.ts
│   │   │   │   ├── member.service.ts
│   │   │   │   └── dto/
│   │   │   ├── project/                      ← 프로젝트 관리 모듈
│   │   │   │   ├── project.module.ts
│   │   │   │   ├── project.controller.ts
│   │   │   │   ├── project.service.ts
│   │   │   │   └── dto/
│   │   │   ├── weekly-report/                ← 주간업무 관리 모듈 (핵심)
│   │   │   │   ├── weekly-report.module.ts
│   │   │   │   ├── report.controller.ts
│   │   │   │   ├── report.service.ts
│   │   │   │   ├── work-item.service.ts
│   │   │   │   ├── carry-forward.service.ts  ←   전주 할일 → 이번주 한일
│   │   │   │   ├── part-summary.controller.ts
│   │   │   │   ├── part-summary.service.ts
│   │   │   │   └── dto/
│   │   │   ├── export/                       ← Excel 내보내기 모듈
│   │   │   │   ├── export.module.ts
│   │   │   │   ├── export.controller.ts
│   │   │   │   └── excel.service.ts
│   │   │   └── prisma/                       ← Prisma 서비스
│   │   │       ├── prisma.module.ts
│   │   │       └── prisma.service.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts                       ← 마스터 데이터 시드
│   │   ├── test/
│   │   └── package.json
│   │
│   └── frontend/                             ← React SPA
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx
│       │   ├── api/                          ← API 클라이언트
│       │   │   ├── client.ts                 ←   Axios 인스턴스 + JWT 인터셉터
│       │   │   ├── weekly-report.api.ts
│       │   │   ├── team.api.ts
│       │   │   └── project.api.ts
│       │   ├── hooks/                        ← TanStack Query 커스텀 훅
│       │   │   ├── useWeeklyReport.ts
│       │   │   ├── useWorkItems.ts
│       │   │   ├── useTeamMembers.ts
│       │   │   └── useProjects.ts
│       │   ├── stores/                       ← Zustand 스토어
│       │   │   ├── authStore.ts
│       │   │   ├── uiStore.ts
│       │   │   └── gridStore.ts              ←   그리드 편집 상태 (포커스 셀, 변경 큐)
│       │   ├── components/
│       │   │   ├── layout/                   ← Sidebar, Header, AppLayout
│       │   │   ├── ui/                       ← Badge, Button, Modal, Toast, SummaryCard
│       │   │   └── grid/                     ← 스프레드시트 그리드 컴포넌트 (핵심)
│       │   │       ├── EditableGrid.tsx      ←   TanStack Table 기반 편집 그리드
│       │   │       ├── GridCell.tsx           ←   인라인 편집 셀
│       │   │       ├── ExpandedEditor.tsx     ←   확대 편집 패널
│       │   │       ├── FormattedText.tsx      ←   [항목]/*세부/ㄴ상세 서식 렌더링
│       │   │       └── ProjectDropdown.tsx    ←   프로젝트 선택 드롭다운
│       │   ├── pages/
│       │   │   ├── Dashboard.tsx
│       │   │   ├── MyWeeklyReport.tsx        ←   그리드 작성 화면 (핵심)
│       │   │   ├── MyHistory.tsx
│       │   │   ├── PartStatus.tsx
│       │   │   ├── PartSummary.tsx
│       │   │   ├── TeamStatus.tsx
│       │   │   ├── TeamMgmt.tsx
│       │   │   └── ProjectMgmt.tsx
│       │   ├── styles/
│       │   │   └── globals.css               ←   CSS 변수 전체 선언
│       │   └── types/
│       ├── public/
│       ├── vite.config.ts
│       ├── tailwind.config.ts
│       └── package.json
│
└── docker/
    ├── Dockerfile.backend
    ├── Dockerfile.frontend
    └── nginx.conf
```

---

## 8. DB 핵심 규칙

### Prisma 스키마 엔티티 6종

| 엔티티 | 핵심 규칙 |
|---|---|
| Team | 팀 이름 UNIQUE. 하위에 Part를 가짐 |
| Part | 팀 내 파트명 UNIQUE (`@@unique([teamId, name])`). 파트장 지정 |
| Member | email UNIQUE. role: `LEADER` / `PART_LEADER` / `MEMBER`. 소프트 삭제 시 `isActive = false` |
| Project | 팀 내 프로젝트코드 UNIQUE (`@@unique([teamId, code])`). category: `COMMON` / `EXECUTION`. status: `ACTIVE` / `HOLD` / `COMPLETED` |
| WeeklyReport | 팀원당 주차당 1건 (`@@unique([memberId, weekStart])`). status: `DRAFT` / `SUBMITTED` |
| WorkItem | WeeklyReport에 종속. doneWork(한일), planWork(할일), remarks(비고) — `@db.Text` |
| PartSummary | 파트당 주차당 1건 (`@@unique([partId, weekStart])`). 파트장이 취합 작성 |
| SummaryWorkItem | PartSummary에 종속 |

### 소프트 삭제 원칙
- `DELETE` SQL / Prisma `delete` 사용 금지
- Member: `isActive = false`
- Project: `status = 'COMPLETED'`
- WeeklyReport, WorkItem: `onDelete: Cascade` (Report 삭제 시 하위 WorkItem 자동 삭제)

### 마스터 데이터 시드 (seed.ts)
시드 실행 시 아래 데이터를 자동 생성한다.

| 데이터 | 내용 |
|--------|------|
| 팀 | 선행연구개발팀 1개 |
| 파트 | DX, AX 2개 |
| 팀원 | 9명 (정우철/LEADER, 문선홍/PART_LEADER, 나머지/MEMBER) |
| 프로젝트 | 공통 3개 + 수행 8개 = 총 11개 (현행 엑셀 기준값설정 시트 기준) |

---

## 9. API 공통 규칙

### 응답 형식
```json
// 성공
{ "success": true, "data": { ... }, "message": null }
// 목록 (페이지네이션)
{ "success": true, "data": [ ... ], "pagination": { "page": 1, "limit": 20, "total": 45, "totalPages": 3 } }
// 에러
{ "success": false, "data": null, "message": "해당 주간업무를 찾을 수 없습니다.", "errorCode": "WEEKLY_REPORT_NOT_FOUND" }
```

### URL 규칙
```
GET/POST  /api/v1/{resource}
GET/PATCH/DELETE  /api/v1/{resource}/{id}
POST  /api/v1/{resource}/{action}          예) /api/v1/weekly-reports/carry-forward
```

### 주요 API 엔드포인트

| Module | Method | Endpoint | 설명 |
|--------|--------|----------|------|
| Auth | POST | `/api/v1/auth/login` | 로그인 (JWT 발급) |
| Auth | POST | `/api/v1/auth/refresh` | 토큰 갱신 |
| Auth | GET | `/api/v1/auth/me` | 현재 사용자 정보 |
| Team | GET | `/api/v1/teams/:teamId/parts` | 파트 목록 |
| Team | GET | `/api/v1/teams/:teamId/members` | 팀원 목록 |
| Team | POST | `/api/v1/members` | 팀원 등록 |
| Team | PATCH | `/api/v1/members/:id` | 팀원 수정 |
| Project | GET | `/api/v1/projects` | 프로젝트 목록 |
| Project | POST | `/api/v1/projects` | 프로젝트 생성 |
| Project | PATCH | `/api/v1/projects/:id` | 프로젝트 수정 |
| Weekly | GET | `/api/v1/weekly-reports/me?week=2026-W09` | 내 주간업무 조회 |
| Weekly | POST | `/api/v1/weekly-reports` | 주간업무 생성 |
| Weekly | PATCH | `/api/v1/weekly-reports/:id` | 상태 변경 (제출) |
| Weekly | POST | `/api/v1/weekly-reports/:id/work-items` | 업무항목 추가 |
| Weekly | PATCH | `/api/v1/work-items/:id` | 업무항목 수정 (자동저장) |
| Weekly | DELETE | `/api/v1/work-items/:id` | 업무항목 삭제 |
| Weekly | POST | `/api/v1/weekly-reports/carry-forward` | 전주 할일 → 이번주 한일 |
| Part | GET | `/api/v1/parts/:partId/weekly-status?week=` | 파트원 업무 현황 |
| Part | GET | `/api/v1/parts/:partId/submission-status?week=` | 작성 현황 |
| Part | POST | `/api/v1/part-summaries` | 파트 취합보고 생성 |
| Part | POST | `/api/v1/part-summaries/:id/auto-merge` | 자동 취합 |
| Part | PATCH | `/api/v1/part-summaries/:id` | 취합보고 수정·제출 |
| Team | GET | `/api/v1/teams/:teamId/weekly-overview?week=` | 팀 전체 현황 |
| Export | GET | `/api/v1/export/excel?type=part&partId=&week=` | Excel 다운로드 |

---

## 10. 코딩 컨벤션

### Back-end (NestJS)
- 응답: 모든 컨트롤러는 통일된 응답 인터셉터를 통해 `{ success, data, message }` 형태로 반환
- 예외: 커스텀 `BusinessException(errorCode, message)`을 사용하고, 전역 ExceptionFilter에서 처리
- 모듈 구조: 각 모듈은 `module.ts`, `controller.ts`, `service.ts`, `dto/` 로 구성
- DTO: `class-validator` 데코레이터로 입력값 검증, `class-transformer`로 변환
- 로깅: NestJS 내장 Logger 사용 (`this.logger.log/warn/error`)
- 트랜잭션: Prisma `$transaction()`을 사용한 명시적 트랜잭션

### Front-end (React)
- 색상: CSS 변수 `var(--primary)` 사용 — **HEX 하드코딩 절대 금지**
- 타입: `I` 접두사 금지, PascalCase 사용 (예: `WeeklyReport`, `WorkItem`)
- 상태: 서버 상태는 TanStack Query, UI 상태는 Zustand — 혼용 금지
- 자동저장: `useMutation` + `onMutate`(낙관적 업데이트) + debounce 500ms
- 그리드 셀 편집: `gridStore`에서 `focusedCell`, `editingValue`, `dirtyMap` 관리
- 컴포넌트: 파일 1개 = 컴포넌트 1개, default export 사용

### 공통
- 주차 계산: `packages/shared/constants/week-utils.ts` 의 공유 함수 사용 (프론트·백 동일 로직)
- weekLabel 형식: `"2026-W09"` (ISO 8601 주차)
- weekStart 형식: `DateTime` (해당 주 월요일 00:00:00 UTC)

---

## 11. 색상 시스템

| 역할 | HEX | CSS 변수 |
|---|---|---|
| Primary | `#6B5CE7` | `--primary` |
| Primary Dark | `#5647CC` | `--primary-dark` |
| Primary BG | `#EDE9FF` | `--primary-bg` |
| Accent | `#F5A623` | `--accent` |
| OK 정상 | `#27AE60` | `--ok` |
| OK BG | `#E8F8F0` | `--ok-bg` |
| Warn 경고 | `#E67E22` | `--warn` |
| Warn BG | `#FFF3E0` | `--warn-bg` |
| Danger 위험 | `#E74C3C` | `--danger` |
| Danger BG | `#FDECEA` | `--danger-bg` |
| Text | `#1C2333` | `--text` |
| Text Sub | `#6C7A89` | `--text-sub` |
| Border | `#E0E4EA` | `--gray-border` |
| Page BG | `#F0F2F5` | `--gray-light` |
| Table Header | `#F4F6FA` | `--tbl-header` |
| Row Alt | `#F8F9FB` | `--row-alt` |
| Sidebar BG | `#181D2E` | — |
| Sidebar Active | `#252D48` | — |

---

## 12. 핵심 비즈니스 로직

### 12.1 전주 할일 → 이번주 한일 불러오기 (carry-forward)
```
POST /api/v1/weekly-reports/carry-forward
Body: { "targetWeek": "2026-W09", "sourceWorkItemIds": ["id1", "id2"] }

1. 전주(W08) WeeklyReport에서 선택된 WorkItem 조회
2. 이번주(W09) WeeklyReport 생성 (없으면 새로 생성)
3. 각 WorkItem의 planWork → 새 WorkItem의 doneWork로 복사
   - projectId 유지, planWork·remarks는 빈 값
4. 생성된 WorkItem 목록 반환
```

### 12.2 자동저장 (Autosave) 흐름
```
셀 편집 완료 (onBlur)
  → Zustand gridStore 즉시 업데이트 (UI 반영)
  → Debounce 500ms
  → TanStack Query mutation: PATCH /api/v1/work-items/:id
  → 성공: 캐시 무효화 + 저장 표시 | 실패: 롤백 + 토스트 알림
```

### 12.3 파트 자동 취합 (auto-merge)
```
POST /api/v1/part-summaries/:id/auto-merge

1. 해당 파트 팀원들의 WeeklyReport(해당 주차) 전체 조회
2. WorkItem을 Project별로 그룹화
3. 동일 프로젝트의 doneWork, planWork를 줄바꿈으로 병합
4. SummaryWorkItem으로 생성 → 파트장이 편집 가능
```

### 12.4 역할별 접근 권한 (RBAC)

| API 그룹 | LEADER (팀장) | PART_LEADER (파트장) | MEMBER (팀원) |
|----------|:---:|:---:|:---:|
| 본인 주간업무 CRUD | ✅ | ✅ | ✅ |
| 소속 파트원 업무 조회 | ✅ 전체 | ✅ 소속 파트만 | ❌ |
| 파트 취합보고 작성 | ❌ | ✅ 소속 파트만 | ❌ |
| 팀 전체 조회 | ✅ | ❌ | ❌ |
| 팀·파트·프로젝트 관리 | ✅ | ❌ | ❌ |
| Excel 내보내기 | ✅ | ✅ 소속 파트 | ❌ |

### 12.5 업무 작성 서식 규칙
진행업무, 예정업무 셀의 텍스트는 아래 패턴으로 구조화 렌더링한다.

| 입력 패턴 | 의미 | 렌더링 |
|----------|------|--------|
| `[텍스트]` | 업무항목 (1단계) | 볼드, Primary 색상 |
| `*텍스트` | 세부업무 (2단계) | 불릿(•) 변환, 1단 들여쓰기 |
| `ㄴ텍스트` | 상세작업 (3단계) | 2단 들여쓰기, 보조 텍스트 색상 |

---

## 13. 완료 기준 (Definition of Done)

각 TASK는 아래를 **모두 만족**해야 완료로 인정한다.

- [ ] TASK MD 체크리스트 전 항목 완료
- [ ] 요구사항 문서(설계서) 기능 100% 구현
- [ ] 스타일 가이드 색상·크기 하드코딩 없음 (CSS 변수 사용)
- [ ] Back-end: 단위 테스트 작성 및 통과
- [ ] Front-end: 컴포넌트 단위 테스트 작성 및 통과
- [ ] 빌드 오류 0건 (`bun run build` 성공)
- [ ] 린트 오류 0건 (`bun run lint` 성공)
- [ ] 주요 예외 케이스 처리 확인
- [ ] `tasks/TASK-XX-수행결과.md` 생성 완료

---

## 14. 수행결과 보고서 규칙

### 생성 조건
- TASK MD **"Step 3 — 완료 검증"의 자동화 가능한 모든 항목이 통과**된 후 생성한다
- 수동 확인 항목(브라우저 렌더링, 그리드 인터랙션, 색상 확인 등)은 보고서 **섹션 5에 "수동 확인 필요"로 별도 표기**한다

### 파일 경로
```
tasks/TASK-XX-수행결과.md   (XX = 두 자리 TASK 번호, 예: TASK-01-수행결과.md)
```

### 필수 섹션 구성

```markdown
# TASK-XX 수행 결과 보고서

> 작업일: YYYY-MM-DD
> 작업자: Claude Code
> 상태: **완료**

---

## 1. 작업 개요
(해당 TASK의 목적 1~2줄 요약)

---

## 2. 완료 기준 달성 현황
(TASK MD의 완료 기준 항목별 ✅ / ❌ 표)

---

## 3. 체크리스트 완료 현황
(TASK MD의 체크리스트 항목을 소분류별 표로 정리)

---

## 4. 발견 이슈 및 수정 내역
(작업 중 발생한 오류·수정 사항을 이슈별로 기술)
(이슈가 없으면 "발견된 이슈 없음" 으로 기재)

각 이슈는 아래 형식으로 작성한다:
### 이슈 #N — 이슈 제목
**증상**: 오류 메시지 또는 현상
**원인**: 원인 분석
**수정**: 수정 파일 및 변경 내용

---

## 5. 최종 검증 결과
(빌드 로그, 테스트 결과, 실행 확인 내용 기재)

---

## 6. 후속 TASK 유의사항
(다음 TASK 진행 시 알아야 할 사항, 없으면 생략)

---

## 7. 산출물 목록
(신규 생성 파일 / 수정 파일 전체 목록을 표로 기재)
```

### 작성 원칙
- 이슈가 없더라도 섹션 4는 **반드시 포함**한다 ("발견된 이슈 없음" 기재)
- 빌드/테스트 결과는 실제 출력 로그를 코드 블록으로 첨부한다
- 수정 파일이 없으면 섹션 7의 "수정 파일" 표를 생략한다
