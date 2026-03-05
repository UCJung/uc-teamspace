# WORK-26-TASK-01: 백엔드 DTO/Service API — 시간 포함 날짜 처리

> **Phase:** 1
> **선행 TASK:** WORK-26-TASK-00
> **목표:** scheduledDate, dueDate 필드가 ISO 8601 datetime 문자열("2026-03-05T14:00:00")을 수용하고, 기존 날짜만 전달하는 경우(날짜+T00:00:00)도 정상 동작하도록 서비스 로직을 업데이트한다.

---

## Step 1 — 계획서

### 1.1 작업 범위

DTO는 기존 `@IsDateString()`이 ISO 8601 datetime을 그대로 지원하므로 검증 로직 변경은 최소화된다.
Service의 period 필터(today/this-week/this-month/overdue) 날짜 비교는 `@db.Date` 기준에서
`@db.Timestamp` 기준으로 변경해야 한다 (날짜 경계를 UTC 기준으로 재점검).
응답 시 `scheduledDate`와 `dueDate`는 ISO datetime 문자열로 직렬화되어 프론트엔드에 전달된다.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| 수정 | `packages/backend/src/personal-task/dto/create-personal-task.dto.ts` |
| 수정 | `packages/backend/src/personal-task/dto/update-personal-task.dto.ts` |
| 수정 | `packages/backend/src/personal-task/personal-task.service.ts` |
| 수정 | `packages/backend/src/personal-task/personal-task.service.spec.ts` |

---

## Step 2 — 체크리스트

### 2.1 DTO 업데이트
- [ ] `create-personal-task.dto.ts`: `scheduledDate`, `dueDate` — `@IsDateString()` 유지, 주석에 datetime 지원 명시
- [ ] `update-personal-task.dto.ts`: 동일 패턴 적용

### 2.2 Service 날짜 처리 로직
- [ ] `period=today` 필터: `dueDate` gte/lt 비교 — timestamp 기준 정상 동작 확인
- [ ] `period=this-week` 필터: timestamp 기준 재검토
- [ ] `period=overdue` 필터: 현재 시각 기준으로 `dueDate < now()` 처리
- [ ] `createPersonalTask`: `dueDate`, `scheduledDate` Prisma에 DateTime으로 저장 (ISO 문자열 → new Date() 변환)
- [ ] `updatePersonalTask`: 동일 패턴
- [ ] `createRecurringTasksIfNeeded`: scheduledDate 처리 — 시간 없이 날짜만 설정되므로 00:00:00으로 처리

### 2.3 응답 직렬화
- [ ] 응답 DTO에서 `scheduledDate`, `dueDate`가 ISO datetime 문자열로 반환됨 확인
- [ ] `null` 값 처리 정상 (시간 없는 경우 null 반환)

### 2.4 테스트
- [ ] `personal-task.service.spec.ts` 기존 테스트 통과 확인
- [ ] datetime 저장 테스트 케이스 추가 (시간 있는 경우, 날짜만 있는 경우)

---

## Step 3 — 완료 검증

```bash
cd packages/backend

# 1. 빌드 확인
bun run build

# 2. 테스트 실행
bun run test

# 3. API 수동 확인 (서버 실행 후)
# 시간 포함 예정일 생성
# curl -X PATCH http://localhost:3000/api/v1/personal-tasks/{id} \
#   -H "Authorization: Bearer {token}" \
#   -H "Content-Type: application/json" \
#   -d '{"scheduledDate": "2026-03-05T14:00:00.000Z"}'
```
