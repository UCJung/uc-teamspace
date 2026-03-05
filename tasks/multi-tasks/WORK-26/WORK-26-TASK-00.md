# WORK-26-TASK-00: DB 스키마 마이그레이션 — 시간 포함 DateTime으로 전환

> **Phase:** 0
> **선행 TASK:** 없음
> **목표:** PersonalTask의 scheduledDate(@db.Date)와 dueDate(@db.Date)를 DateTime(@db.Timestamp(3))으로 변경하여 시간 정보를 저장할 수 있도록 한다.

---

## Step 1 — 계획서

### 1.1 작업 범위

PersonalTask 모델의 두 날짜 필드를 `@db.Date`에서 `@db.Timestamp(3)`으로 변경한다.
기존 `@db.Date`로 저장된 데이터는 PostgreSQL 마이그레이션 SQL에서 `::timestamp`로 캐스팅하여 보존한다.
컬럼 타입 변경이므로 `ALTER TABLE ... ALTER COLUMN ... TYPE timestamp(3) USING ...` SQL이 필요하다.
Prisma 인덱스(`@@index([memberId, teamId, dueDate])`, `@@index([memberId, teamId, scheduledDate])`)도 유지한다.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| 수정 | `packages/backend/prisma/schema.prisma` — scheduledDate, dueDate 타입 변경 |
| 생성 | `packages/backend/prisma/migrations/YYYYMMDDHHMMSS_work26_datetime_upgrade/migration.sql` |

---

## Step 2 — 체크리스트

### 2.1 schema.prisma 수정
- [ ] `PersonalTask.scheduledDate DateTime? @db.Date` → `DateTime? @db.Timestamp(3)` 변경
- [ ] `PersonalTask.dueDate DateTime? @db.Date` → `DateTime? @db.Timestamp(3)` 변경
- [ ] 기존 인덱스(`@@index([memberId, teamId, dueDate])`, `@@index([memberId, teamId, scheduledDate])`) 유지 확인

### 2.2 마이그레이션 SQL
- [ ] `bunx prisma migrate dev --name work26_datetime_upgrade` 실행
- [ ] 생성된 migration.sql에 `ALTER COLUMN ... TYPE timestamp(3) USING scheduled_date::timestamp` 포함 확인
- [ ] 기존 date 값이 00:00:00으로 변환됨 확인 (dev DB에서 SELECT로 검증)

### 2.3 Prisma Client 재생성
- [ ] `bunx prisma generate` 성공
- [ ] TypeScript 타입 `DateTime?` 정상 반영 확인

### 2.4 테스트
- [ ] 기존 마이그레이션 이력 깨지지 않음
- [ ] `bunx prisma migrate status` — Applied 상태 정상

---

## Step 3 — 완료 검증

```bash
cd packages/backend

# 1. 마이그레이션 실행
bunx prisma migrate dev --name work26_datetime_upgrade

# 2. Prisma Client 재생성
bunx prisma generate

# 3. 마이그레이션 상태 확인
bunx prisma migrate status

# 4. DB에서 컬럼 타입 확인
# psql에서: \d personal_tasks
# scheduled_date | timestamp(3) without time zone
# due_date       | timestamp(3) without time zone
```
