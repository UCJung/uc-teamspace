# WORK-18-TASK-04: 백엔드 — 프로젝트 변경 + 생성 요청/승인

> **Phase:** 3
> **선행 TASK:** TASK-01, TASK-02
> **목표:** Project 모델 변경사항을 기존 API에 반영하고 프로젝트 생성 요청/승인 워크플로우를 구현한다

---

## Step 1 — 계획서

### 1.1 작업 범위

기존 project/admin 서비스에 managerId, department, description 필드를 반영한다. 팀장/파트장이 프로젝트 생성을 요청(status=PENDING)하고, Admin이 코드를 입력하여 승인(status→ACTIVE)하는 워크플로우를 추가한다.

### 1.2 API 엔드포인트

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| POST | `/api/v1/projects/request` | 프로젝트 생성 요청 | LEADER, PART_LEADER |
| PATCH | `/api/v1/admin/projects/:id/approve` | 프로젝트 승인 (코드 입력) | ADMIN |
| GET | `/api/v1/projects/managed` | 내가 책임자인 프로젝트 | 인증 필요 |

---

## Step 2 — 체크리스트

### 2.1 기존 API 수정

- [ ] `project.service.ts`: findAll/findById에 manager 관계 include 추가
- [ ] `project.service.ts`: create/update에 managerId, department, description 필드 반영
- [ ] `admin.service.ts`: createProject에 managerId, department, description 반영
- [ ] `admin.service.ts`: updateProject에 새 필드 반영
- [ ] `admin.service.ts`: listProjects에 manager include 추가

### 2.2 DTO 업데이트

- [ ] `create-project.dto.ts`: + managerId?(string), department?(string), description?(string) 옵셔널
- [ ] `update-project.dto.ts`: 새 필드 반영 (PartialType)
- [ ] 새 DTO: `request-project.dto.ts` — name, category, managerId?, department?, description? (code 없음)
- [ ] 새 DTO: `approve-project.dto.ts` — code(string, 필수)

### 2.3 프로젝트 생성 요청 API

- [ ] `POST /api/v1/projects/request` — status=PENDING, code=null 또는 빈값으로 생성
- [ ] LEADER 또는 PART_LEADER 권한 체크
- [ ] managerId 미지정 시 요청자 본인으로 설정

### 2.4 프로젝트 승인 API

- [ ] `PATCH /api/v1/admin/projects/:id/approve` — code 입력, status→ACTIVE
- [ ] ADMIN 권한 체크
- [ ] code 중복 검증 (기존 ACTIVE 프로젝트와)
- [ ] PENDING 상태가 아니면 에러

### 2.5 내 책임 프로젝트 API

- [ ] `GET /api/v1/projects/managed` — managerId == currentUser.id 인 프로젝트 목록
- [ ] status 필터 옵션 (ACTIVE/PENDING)

### 2.6 기존 로직 보호

- [ ] 팀 프로젝트 추가 시 ACTIVE 상태만 허용 (team-project.service 검증)

---

## Step 3 — 완료 검증

```bash
# 1. 빌드
cd packages/backend && bun run build

# 2. 전체 린트
cd ../.. && bun run lint

# 3. API 테스트
cd packages/backend && bun run start:dev &
sleep 3

# 프로젝트 생성 요청 (LEADER 토큰)
curl -X POST http://localhost:3000/api/v1/projects/request \
  -H "Authorization: Bearer <leader-token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"신규과제","category":"EXECUTION","department":"DX"}'

# 프로젝트 승인 (ADMIN 토큰)
curl -X PATCH "http://localhost:3000/api/v1/admin/projects/<id>/approve" \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"code":"과제0030"}'

# 내 책임 프로젝트 조회
curl "http://localhost:3000/api/v1/projects/managed" \
  -H "Authorization: Bearer <leader-token>"

kill %1
```
