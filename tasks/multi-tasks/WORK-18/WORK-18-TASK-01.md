# WORK-18-TASK-01: DB 스키마 변경 + 마이그레이션

> **Phase:** 1
> **선행 TASK:** 없음
> **목표:** 근무시간표 기능에 필요한 Enum·모델·관계를 Prisma 스키마에 추가하고 마이그레이션 + 시드를 실행한다

---

## Step 1 — 계획서

### 1.1 작업 범위

기존 Prisma 스키마에 5개 Enum과 4개 새 모델을 추가하고, Member/Project/ProjectStatus 기존 모델을 확장한다. 마이그레이션을 실행하여 DB를 동기화하고, seed.ts에 직위(position) 정보를 반영한다.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| Prisma | `packages/backend/prisma/schema.prisma` — Enum 5개 + 모델 4개 + 기존 모델 변경 |
| Migration | `packages/backend/prisma/migrations/YYYYMMDD_work18_timesheet_and_fields/` |
| Seed | `packages/backend/prisma/seed.ts` — 기존 멤버에 position 할당 |

---

## Step 2 — 체크리스트

### 2.1 Enum 추가 (5개)

- [ ] `Position` — DIRECTOR, GENERAL_MANAGER, DEPUTY_MANAGER, ASSISTANT_MANAGER, STAFF, PRINCIPAL_RESEARCHER, SENIOR_RESEARCHER, RESEARCHER, ASSOCIATE_RESEARCHER
- [ ] `AttendanceType` — WORK, HOLIDAY_WORK, ANNUAL_LEAVE, HALF_DAY_LEAVE, HOLIDAY
- [ ] `WorkType` — OFFICE, FIELD, REMOTE, BUSINESS_TRIP
- [ ] `TimesheetStatus` — DRAFT, SUBMITTED, APPROVED, REJECTED
- [ ] `ApprovalType` — LEADER, PROJECT_MANAGER, ADMIN

### 2.2 기존 모델 변경

- [ ] `Member`: + `position Position?`, + `jobTitle String?`
- [ ] `Member`: + `timesheets MonthlyTimesheet[]`, `managedProjects Project[]("ProjectManager")`, `timesheetApprovals TimesheetApproval[]` 관계
- [ ] `Project`: + `managerId String?`, + `department String?`, + `description String?`
- [ ] `Project`: + `manager Member?("ProjectManager")` 관계, + `timesheetWorkLogs TimesheetWorkLog[]` 관계
- [ ] `ProjectStatus`: + `PENDING` 값 추가
- [ ] `Team`: + `timesheets MonthlyTimesheet[]` 관계

### 2.3 새 모델 (4개)

- [ ] `MonthlyTimesheet` — id, memberId(FK), teamId(FK), yearMonth, status(TimesheetStatus), submittedAt?
  - `@@unique([memberId, teamId, yearMonth])`, `@@index([yearMonth])`, `@@index([teamId])`, `@@index([memberId])`
- [ ] `TimesheetEntry` — id, timesheetId(FK), date(@db.Date), attendance(AttendanceType)
  - `@@unique([timesheetId, date])`, `@@index([timesheetId])`, onDelete: Cascade
- [ ] `TimesheetWorkLog` — id, entryId(FK), projectId(FK), hours(Float), workType(WorkType)
  - `@@index([entryId])`, `@@index([projectId])`, onDelete: Cascade
- [ ] `TimesheetApproval` — id, timesheetId(FK), approverId(FK→Member), approvalType, status, comment?, approvedAt?, autoApproved
  - `@@unique([timesheetId, approvalType])`, onDelete: Cascade

### 2.4 마이그레이션 + 시드

- [ ] `bunx prisma migrate dev --name work18_timesheet_and_fields` 성공
- [ ] `bunx prisma generate` 성공
- [ ] `seed.ts`: 기존 멤버에 position 할당 (홍길동=null, 최수진=SENIOR_RESEARCHER 등)
- [ ] `bunx prisma db seed` 성공

---

## Step 3 — 완료 검증

```bash
# 1. Prisma Client 생성 + 마이그레이션
cd packages/backend
bunx prisma generate
bunx prisma migrate dev --name work18_timesheet_and_fields

# 2. 시드 실행
bunx prisma db seed

# 3. DB 테이블 확인
docker compose exec postgres psql -U dev -d uc_teamspace -c "\dt" | grep -E "monthly_timesheets|timesheet_entries|timesheet_work_logs|timesheet_approvals"

# 4. 기존 테이블 컬럼 확인
docker compose exec postgres psql -U dev -d uc_teamspace -c "\d members" | grep -E "position|job_title"
docker compose exec postgres psql -U dev -d uc_teamspace -c "\d projects" | grep -E "manager_id|department|description"

# 5. 빌드 확인
cd ../.. && bun run build
```
