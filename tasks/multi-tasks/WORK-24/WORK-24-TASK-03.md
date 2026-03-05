# WORK-24-TASK-03: 백엔드 — PersonalTask 서비스 statusId 연동

> **Phase:** 3
> **선행 TASK:** WORK-24-TASK-02
> **목표:** personal-task.service.ts 전반의 TaskStatus enum 직접 참조를 제거하고 statusId + TaskStatusDef.category 기반 로직으로 전환한다

---

## Step 1 — 계획서

### 1.1 작업 범위

`personal-task.service.ts`에서 `TaskStatus.TODO`, `TaskStatus.IN_PROGRESS`, `TaskStatus.DONE` enum 값을 직접 비교하는 모든 로직을 `TaskStatusDef.category` 기반으로 교체한다. DTO에서 `status` 필드를 제거하고 `statusId`로 교체한다. 모든 조회 응답에 `taskStatus` 객체(name, color, category)를 포함시킨다. 집계 API(파트/팀 overview)는 category 기반 카운트로 변경하되, 응답 필드명(`todoCount`, `inProgressCount`, `doneCount`)은 하위 호환을 위해 유지한다.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| Service (수정) | `packages/backend/src/personal-task/personal-task.service.ts` |
| DTO (수정) | `packages/backend/src/personal-task/dto/create-personal-task.dto.ts` |
| DTO (수정) | `packages/backend/src/personal-task/dto/update-personal-task.dto.ts` |
| DTO (수정) | `packages/backend/src/personal-task/dto/list-personal-tasks-query.dto.ts` |

---

## Step 2 — 체크리스트

### 2.1 DTO 변경

- [ ] `create-personal-task.dto.ts`
  - `status?: TaskStatus` 필드 제거
  - `statusId?: string` 필드 추가 (`@IsString()`, `@IsOptional()`)
  - 미입력 시 팀 기본 BEFORE_START 상태로 자동 배정 (서비스 레이어에서 처리)
- [ ] `update-personal-task.dto.ts`
  - `status?: TaskStatus` 필드 제거
  - `statusId?: string` 필드 추가 (`@IsString()`, `@IsOptional()`)
- [ ] `list-personal-tasks-query.dto.ts`
  - `status?: TaskStatus` 필터 제거
  - `statusId?: string` 필터 추가 (`@IsString()`, `@IsOptional()`)
  - `category?: TaskStatusCategory` 필터 추가 (`@IsEnum()`, `@IsOptional()`)

### 2.2 PersonalTask include 상수 추가

- [ ] `personal-task.service.ts` 상단에 공통 include 상수 추출
  ```ts
  const TASK_INCLUDE = {
    taskStatus: { select: { id: true, name: true, color: true, category: true } },
    project: { select: { id: true, name: true, code: true } },
  } as const;
  ```

### 2.3 create 메서드 수정

- [ ] `statusId` 미입력 시 팀의 BEFORE_START 카테고리 isDefault 상태 조회 → statusId 자동 배정
- [ ] `status` 필드 제거 (Prisma create에서 status 사용 금지)
- [ ] 반환 시 `taskStatus` 포함

### 2.4 update 메서드 수정 (startedAt / completedAt 자동 처리)

- [ ] `statusId` 변경 시 신규 StatusDef 조회 → category 확인
- [ ] `category === IN_PROGRESS` && `startedAt === null` → `startedAt = new Date()`
- [ ] `category === COMPLETED` && `completedAt === null` → `completedAt = new Date()`, `elapsedMinutes` 계산
- [ ] `category !== COMPLETED` → `completedAt = null` (완료 취소)
- [ ] `category !== IN_PROGRESS` && 이전 category가 IN_PROGRESS → (startedAt은 유지)
- [ ] `status` 필드 완전 제거

### 2.5 toggleDone 메서드 수정

- [ ] 현재 작업의 `taskStatus.category` 조회
- [ ] `category === COMPLETED` → 팀의 BEFORE_START isDefault 상태로 statusId 변경, `completedAt = null`
- [ ] `category !== COMPLETED` → 팀의 COMPLETED isDefault 상태로 statusId 변경, `completedAt = new Date()`, elapsedMinutes 계산
- [ ] `TaskStatus.DONE` 직접 비교 구문 전체 제거

### 2.6 list 메서드 수정

- [ ] `where.status` 필터 제거
- [ ] `statusId` 필터: `where.statusId = dto.statusId` (직접 매핑)
- [ ] `category` 필터: `where.taskStatus = { category: dto.category }` (join 조건)
- [ ] 반환 데이터에 `taskStatus` 포함

### 2.7 getOne 메서드 수정

- [ ] `taskStatus` include 추가
- [ ] `status` 필드 응답에서 제거

### 2.8 getPartOverview / getTeamOverview 메서드 수정

- [ ] 집계 방식 변경: `status === TaskStatus.TODO` → `taskStatus.category === BEFORE_START`
- [ ] `todoCount`: `BEFORE_START` category 카운트
- [ ] `inProgressCount`: `IN_PROGRESS` category 카운트
- [ ] `doneCount`: `COMPLETED` category 카운트
- [ ] Prisma `groupBy` 사용 불가 (join 조건)이므로 `findMany` 후 JS에서 집계
- [ ] 응답 필드명 `todoCount`, `inProgressCount`, `doneCount` 유지 (하위 호환)

### 2.9 import-to-weekly / import-from-weekly 메서드 수정

- [ ] `status` 필드 참조 제거
- [ ] 완료 여부 판단: `taskStatus.category === COMPLETED` 사용
- [ ] 반환 시 `taskStatus` 포함

### 2.10 TaskStatus enum import 제거

- [ ] `import { TaskStatus } from '@prisma/client'` 구문 제거 확인
- [ ] `TaskStatus.TODO`, `TaskStatus.IN_PROGRESS`, `TaskStatus.DONE` 참조 0건 확인

### 2.11 단위 테스트

- [ ] `personal-task.service.spec.ts` 수정 또는 신규 작성
  - `create`: statusId 미입력 시 팀 기본 BEFORE_START 상태 자동 배정 확인
  - `update`: COMPLETED category로 변경 시 completedAt 자동 설정 확인
  - `toggleDone`: COMPLETED → BEFORE_START 전환 확인
  - `getPartOverview`: category 기반 카운트 집계 확인

### 2.12 빌드/린트/테스트 확인

- [ ] `cd packages/backend && bun run build` 오류 0건
- [ ] `bun run lint` 오류 0건
- [ ] `bun run test` 통과

---

## Step 3 — 완료 검증

```bash
# 1. 백엔드 빌드 (TaskStatus enum 참조 제거 후 타입 오류 없어야 함)
cd /c/rnd/uc-teamspace/packages/backend
bun run build

# 2. 린트
bun run lint

# 3. 단위 테스트
bun run test

# 4. 개발 서버 기동 후 API 수동 확인 (별도 터미널에서 실행)
# bun run start:dev

# 5. API 동작 확인 (서버 기동 후)

# 5-1. 작업 생성 (statusId 미입력 → BEFORE_START 자동 배정 확인)
# curl -X POST -H "Authorization: Bearer {TOKEN}" \
#   -H "Content-Type: application/json" \
#   -d '{"teamId":"{TEAM_ID}","title":"테스트 작업"}' \
#   http://localhost:3000/api/v1/personal-tasks
# 응답에 taskStatus.category === "BEFORE_START" 확인

# 5-2. 작업 상태 변경 (IN_PROGRESS → startedAt 자동 설정 확인)
# curl -X PATCH -H "Authorization: Bearer {TOKEN}" \
#   -H "Content-Type: application/json" \
#   -d '{"statusId":"{IN_PROGRESS_STATUS_ID}"}' \
#   http://localhost:3000/api/v1/personal-tasks/{TASK_ID}
# 응답에 startedAt 값 확인

# 5-3. 완료 토글 확인
# curl -X PATCH -H "Authorization: Bearer {TOKEN}" \
#   http://localhost:3000/api/v1/personal-tasks/{TASK_ID}/toggle-done
# 응답에 taskStatus.category === "COMPLETED", completedAt 값 확인

# 5-4. 파트 overview (category 기반 카운트 확인)
# curl -H "Authorization: Bearer {TOKEN}" \
#   "http://localhost:3000/api/v1/parts/{PART_ID}/task-overview?week=2026-W09"
# 응답에 todoCount, inProgressCount, doneCount 확인
```
