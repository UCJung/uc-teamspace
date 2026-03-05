# WORK-25-TASK-01: DB 스키마 + 백엔드 API — scheduledDate 필드 추가

> **Phase:** 1
> **선행 TASK:** 없음
> **목표:** PersonalTask 모델에 scheduledDate(예정일) 필드를 추가하고, DTO 및 서비스 레이어에 반영한다.

## 요청사항
[추가기능] 작업 항목 추가 - 예정일 항목을 추가
- 주간보기 : 예정일이 있는 작업을 해당 날짜에 열에 표시

---

## Step 1 — 계획서

### 1.1 작업 범위
`packages/backend/prisma/schema.prisma`의 `PersonalTask` 모델에 `scheduledDate DateTime? @db.Date` 필드를 추가하고 Prisma 마이그레이션을 실행한다. `CreatePersonalTaskDto`와 `UpdatePersonalTaskDto`에 `scheduledDate` 필드를 추가하고, `personal-task.service.ts`의 create/update/list 로직에서 해당 필드를 올바르게 처리하도록 수정한다.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| 수정 | `packages/backend/prisma/schema.prisma` — PersonalTask.scheduledDate 추가 |
| 생성 | `packages/backend/prisma/migrations/..._add_scheduled_date_to_personal_task/` — 마이그레이션 |
| 수정 | `packages/backend/src/personal-task/dto/create-personal-task.dto.ts` — scheduledDate 필드 추가 |
| 수정 | `packages/backend/src/personal-task/dto/update-personal-task.dto.ts` — scheduledDate 필드 추가 |
| 수정 | `packages/backend/src/personal-task/personal-task.service.ts` — create/update 반영 |

---

## Step 2 — 체크리스트

### 2.1 Prisma 스키마 수정
- [ ] `PersonalTask` 모델에 `scheduledDate DateTime? @db.Date` 추가 (dueDate 아래)
- [ ] `@@index([memberId, teamId, scheduledDate])` 인덱스 추가

### 2.2 Prisma 마이그레이션
- [ ] `bunx prisma migrate dev --name add_scheduled_date_to_personal_task` 실행
- [ ] `personal_tasks` 테이블에 `scheduled_date DATE` 컬럼 생성 확인
- [ ] `bunx prisma generate` 로 Prisma Client 재생성

### 2.3 DTO 수정
- [ ] `CreatePersonalTaskDto`에 `@IsOptional() @IsDateString() scheduledDate?: string` 추가
- [ ] `UpdatePersonalTaskDto`에 동일 필드 추가

### 2.4 서비스 레이어 수정
- [ ] `personal-task.service.ts` create() 메서드에 `scheduledDate` 포함
- [ ] `personal-task.service.ts` update() 메서드에 `scheduledDate` 포함
- [ ] 목록 조회(list) 응답에 `scheduledDate` 필드 자동 포함 확인 (Prisma select/include 여부)

### 2.5 테스트
- [ ] 백엔드 빌드 통과: `bun run build`
- [ ] `bun run test` 기존 테스트 통과

---

## Step 3 — 완료 검증

```bash
# 1. 마이그레이션 실행
cd packages/backend
bunx prisma migrate dev --name add_scheduled_date_to_personal_task

# 2. 백엔드 빌드
bun run build

# 3. 테스트
bun run test

# 4. DB 컬럼 확인 (psql 또는 prisma studio)
bunx prisma studio
# personal_tasks 테이블에 scheduled_date 컬럼 존재 확인

# 5. API 동작 확인 (서버 기동 후)
# PATCH /api/v1/personal-tasks/:id { "scheduledDate": "2026-03-10" }
# GET  /api/v1/personal-tasks?teamId=... → 응답에 scheduledDate 포함 확인
```
