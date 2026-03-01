# TASK-03: Back-end — 프로젝트 관리 API

> **Phase:** 3
> **선행 TASK:** TASK-02
> **목표:** 프로젝트 CRUD API 완성 (분류별 조회, 상태 관리 포함)

---

## Step 1 — 계획서

### 1.1 작업 범위

프로젝트 관리 모듈을 구현한다. 프로젝트 등록/수정/삭제(소프트 삭제), 분류별(공통/수행) 조회, 상태 관리(ACTIVE/HOLD/COMPLETED) 기능을 제공한다. 프로젝트 관리는 LEADER 권한만 가능하며, 조회는 인증된 모든 사용자가 가능하다.

### 1.2 API 엔드포인트

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | `/api/v1/projects` | 프로젝트 목록 (필터: category, status, teamId) | 인증 필요 |
| GET | `/api/v1/projects/:id` | 프로젝트 상세 | 인증 필요 |
| POST | `/api/v1/projects` | 프로젝트 생성 | LEADER |
| PATCH | `/api/v1/projects/:id` | 프로젝트 수정 | LEADER |
| DELETE | `/api/v1/projects/:id` | 프로젝트 삭제 (status → COMPLETED) | LEADER |

---

## Step 2 — 체크리스트

### 2.1 프로젝트 모듈

- [ ] `project/project.module.ts` — PrismaModule import
- [ ] `project/project.controller.ts`
  - GET `/api/v1/projects` — 목록 조회 (category, status, teamId 필터)
  - GET `/api/v1/projects/:id` — 상세 조회
  - POST `/api/v1/projects` — 생성 (LEADER 권한)
  - PATCH `/api/v1/projects/:id` — 수정 (LEADER 권한)
  - DELETE `/api/v1/projects/:id` — 소프트 삭제 (LEADER 권한)
- [ ] `project/project.service.ts`
  - 프로젝트 목록 조회 (분류·상태 필터, 페이지네이션)
  - 프로젝트 생성 (teamId + code unique 검증)
  - 프로젝트 수정
  - 프로젝트 소프트 삭제 (status → COMPLETED)
  - 프로젝트코드 중복 체크 (같은 팀 내)

### 2.2 DTO

- [ ] `project/dto/create-project.dto.ts` — name, code, category, teamId 필수 검증
- [ ] `project/dto/update-project.dto.ts` — PartialType
- [ ] `project/dto/project-query.dto.ts` — category?, status?, teamId? 필터 + 페이지네이션

### 2.3 비즈니스 규칙

- [ ] 프로젝트코드 팀 내 UNIQUE 제약 검증
- [ ] DELETE 시 실제 삭제 대신 `status = COMPLETED` 변경 (소프트 삭제)
- [ ] ACTIVE 프로젝트만 주간업무 작성 시 선택 가능하도록 상태 필터 제공
- [ ] 프로젝트 삭제 시 연관 WorkItem 존재 여부 경고

### 2.4 테스트

- [ ] 단위 테스트: 프로젝트 CRUD 서비스 로직
- [ ] 단위 테스트: 프로젝트코드 중복 검증
- [ ] E2E 테스트: LEADER로 프로젝트 생성 → 조회 → 수정 → 삭제
- [ ] E2E 테스트: MEMBER로 프로젝트 생성 시도 → 403

---

## Step 3 — 완료 검증

```bash
# 1. 빌드
cd packages/backend && bun run build

# 2. 단위 테스트
cd packages/backend && bun run test

# 3. E2E 테스트
cd packages/backend && bun run test:e2e

# 4. 전체 린트
cd ../.. && bun run lint

# 5. API 수동 확인
cd packages/backend && bun run start:dev &
sleep 3

# 프로젝트 목록 조회
# curl -H "Authorization: Bearer <token>" "http://localhost:3000/api/v1/projects?category=COMMON"

# 프로젝트 생성 (LEADER 토큰)
# curl -X POST http://localhost:3000/api/v1/projects \
#   -H "Authorization: Bearer <token>" \
#   -H "Content-Type: application/json" \
#   -d '{"name":"테스트과제","code":"TEST001","category":"EXECUTION","teamId":"<teamId>"}'

kill %1
```
