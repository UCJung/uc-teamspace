# WORK-24-TASK-02: 백엔드 — TaskStatusDef CRUD API

> **Phase:** 2
> **선행 TASK:** WORK-24-TASK-01
> **목표:** 팀별 작업 상태 정의를 관리하는 5개 REST 엔드포인트를 구현하고, 팀 생성/승인 시 기본 3상태를 자동 생성하는 서비스 메서드를 추가한다

---

## Step 1 — 계획서

### 1.1 작업 범위

`team` 모듈 내에 `task-status.service.ts`를 신규 생성하여 TaskStatusDef CRUD 로직을 구현한다. `team.controller.ts`에 5개 엔드포인트를 추가하고, `team.module.ts`에 서비스를 등록한다. 삭제 시 카테고리당 최소 1개 유지 제약을 검증하고, 삭제된 상태에 속한 PersonalTask를 해당 카테고리의 isDefault 상태로 자동 이전한다. `createDefaultStatuses` 메서드는 TASK-06에서 seed 및 팀 승인 로직과 연결한다.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| Service (신규) | `packages/backend/src/team/task-status.service.ts` |
| DTO (신규) | `packages/backend/src/team/dto/create-task-status.dto.ts` |
| DTO (신규) | `packages/backend/src/team/dto/update-task-status.dto.ts` |
| DTO (신규) | `packages/backend/src/team/dto/reorder-task-statuses.dto.ts` |
| Controller (수정) | `packages/backend/src/team/team.controller.ts` — 엔드포인트 5개 추가 |
| Module (수정) | `packages/backend/src/team/team.module.ts` — TaskStatusService 등록 |

---

## Step 2 — 체크리스트

### 2.1 DTO 작성

- [ ] `create-task-status.dto.ts` 작성
  - `name: string` — `@IsString()`, `@MaxLength(20)`, `@IsNotEmpty()`
  - `category: TaskStatusCategory` — `@IsEnum(TaskStatusCategory)`
  - `color: string` — `@IsString()`, `@Matches(/^#[0-9A-Fa-f]{6}$/)`, `@IsOptional()`
  - `isDefault?: boolean` — `@IsBoolean()`, `@IsOptional()`
- [ ] `update-task-status.dto.ts` 작성
  - `name?: string`, `color?: string`, `isDefault?: boolean` — 모두 Optional
  - `PartialType(CreateTaskStatusDto)` 활용 (category는 수정 불가 — 제외)
- [ ] `reorder-task-statuses.dto.ts` 작성
  - `items: { id: string; sortOrder: number }[]` — `@IsArray()`, `@ValidateNested({each: true})`

### 2.2 TaskStatusService 구현

- [ ] `task-status.service.ts` 파일 생성, `@Injectable()` 데코레이터 적용
- [ ] `PrismaService` 의존성 주입
- [ ] `getByTeam(teamId: string)` 메서드: isDeleted=false 목록 조회 (sortOrder ASC)
- [ ] `create(teamId: string, dto: CreateTaskStatusDto)` 메서드
  - sortOrder 자동 배정 (현재 팀 최대 sortOrder + 1)
  - isDefault=true인 경우 해당 카테고리의 기존 isDefault를 false로 전환
- [ ] `update(teamId: string, id: string, dto: UpdateTaskStatusDto)` 메서드
  - 팀 소유 확인 (teamId mismatch → 404)
  - isDefault=true인 경우 동일 카테고리 기존 isDefault false 전환
- [ ] `delete(teamId: string, id: string)` 메서드 (소프트 삭제)
  - 팀 소유 확인
  - 카테고리당 최소 1개 유지 검증: 삭제 후 해당 카테고리 active 상태 0개이면 `BusinessException` (400)
  - 해당 상태에 속한 PersonalTask를 동일 카테고리의 isDefault 상태로 자동 이전 (`$transaction` 사용)
  - `isDeleted = true` 업데이트
- [ ] `reorder(teamId: string, dto: ReorderTaskStatusesDto)` 메서드
  - `$transaction`으로 items 배열 순회하며 sortOrder 업데이트
- [ ] `createDefaultStatuses(teamId: string, tx?: PrismaClient)` 메서드
  - 기본 3상태 INSERT (BEFORE_START: '할일'/#6C7A89, IN_PROGRESS: '진행중'/#6B5CE7, COMPLETED: '완료'/#27AE60)
  - 모두 isDefault=true, sortOrder 0/1/2
  - 트랜잭션 지원 (Prisma `$transaction` 내에서 호출 가능하도록 `tx` 파라미터 수용)

### 2.3 TeamController 엔드포인트 추가

- [ ] `GET /api/v1/teams/:teamId/task-statuses` — `getTaskStatuses(teamId)` → 팀원 이상 접근
- [ ] `POST /api/v1/teams/:teamId/task-statuses` — `createTaskStatus(teamId, dto)` → 팀장(LEADER) 권한
- [ ] `PATCH /api/v1/teams/:teamId/task-statuses/reorder` — `reorderTaskStatuses(teamId, dto)` → 팀장 권한
- [ ] `PATCH /api/v1/teams/:teamId/task-statuses/:id` — `updateTaskStatus(teamId, id, dto)` → 팀장 권한
- [ ] `DELETE /api/v1/teams/:teamId/task-statuses/:id` — `deleteTaskStatus(teamId, id)` → 팀장 권한
- [ ] 각 엔드포인트에 `@UseGuards(JwtAuthGuard, RolesGuard)`, `@Roles(...)` 데코레이터 적용
- [ ] reorder와 :id PATCH 라우트 순서 주의 (reorder가 :id 앞에 위치해야 함)

### 2.4 TeamModule 등록

- [ ] `team.module.ts`의 `providers` 배열에 `TaskStatusService` 추가
- [ ] import 구문 추가

### 2.5 단위 테스트

- [ ] `task-status.service.spec.ts` 작성
  - `getByTeam`: isDeleted=false 필터 확인
  - `delete`: 마지막 상태 삭제 시 BusinessException 발생 확인
  - `delete`: PersonalTask 자동 이전 확인 (mock)
  - `createDefaultStatuses`: 3개 상태 생성 확인

### 2.6 빌드/린트 확인

- [ ] `cd packages/backend && bun run build` 오류 0건
- [ ] `bun run lint` 오류 0건
- [ ] `bun run test` 통과

---

## Step 3 — 완료 검증

```bash
# 1. 백엔드 빌드
cd /c/rnd/uc-teamspace/packages/backend
bun run build

# 2. 린트
bun run lint

# 3. 단위 테스트
bun run test

# 4. 개발 서버 기동 후 API 수동 확인 (별도 터미널)
# bun run start:dev

# 5. API 테스트 (서버 기동 후)
# 로그인 토큰 획득 후 아래 명령 실행

# 5-1. 팀 상태 목록 조회
# curl -H "Authorization: Bearer {TOKEN}" \
#   http://localhost:3000/api/v1/teams/{TEAM_ID}/task-statuses

# 5-2. 상태 추가
# curl -X POST -H "Authorization: Bearer {TOKEN}" \
#   -H "Content-Type: application/json" \
#   -d '{"name":"검토중","category":"IN_PROGRESS","color":"#3498DB"}' \
#   http://localhost:3000/api/v1/teams/{TEAM_ID}/task-statuses

# 5-3. 순서 변경
# curl -X PATCH -H "Authorization: Bearer {TOKEN}" \
#   -H "Content-Type: application/json" \
#   -d '{"items":[{"id":"{ID1}","sortOrder":0},{"id":"{ID2}","sortOrder":1}]}' \
#   http://localhost:3000/api/v1/teams/{TEAM_ID}/task-statuses/reorder

# 5-4. 상태 삭제 (카테고리 최소 1개 제약 테스트)
# curl -X DELETE -H "Authorization: Bearer {TOKEN}" \
#   http://localhost:3000/api/v1/teams/{TEAM_ID}/task-statuses/{ID}
```
