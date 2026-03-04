# WORK-21: DB 쿼리 성능 최적화

> Created: 2026-03-04
> Project: UC TeamSpace
> Tech Stack: NestJS 11 / Prisma 6 / PostgreSQL 16 / Bun
> Status: PLANNED

## 요청사항

DB 구조 성능 이슈 분석 결과를 기반으로 최적화 작업 진행

---

## Goal

사전 분석된 20건의 DB 성능 이슈 중 17건(ISSUE-08, 09, 19 제외)을 4개 TASK로 나누어 수정한다.
스키마 인덱스 추가(TASK-01) 후 timesheet-stats 최적화(TASK-02)와 주간업무/취합 최적화(TASK-03)를 병렬 진행하고,
이후 시간표/Admin 서비스 최적화(TASK-04)를 진행한다.

---

## Task Dependency Graph

TASK-01 (스키마 인덱스 추가)
  |
  +---> TASK-02 (timesheet-stats CRITICAL/HIGH 최적화)  ---+
  |                                                         |
  +---> TASK-03 (주간업무/취합보고 쿼리 최적화)            +---> TASK-04 (시간표/Admin 최적화)

TASK-02와 TASK-03은 TASK-01 완료 후 병렬 실행 가능.
TASK-04는 TASK-01, TASK-02 완료 후 실행.

---

## Tasks

### WORK-21-TASK-01: Prisma 스키마 인덱스 추가 + 마이그레이션

- **Depends on**: (없음)
- **Scope**: schema.prisma에 5개 인덱스를 추가하고 Prisma 마이그레이션을 생성한다.
- **ISSUE 대상**: ISSUE-04, ISSUE-12, ISSUE-14, ISSUE-15, ISSUE-16
- **Files**:
  - packages/backend/prisma/schema.prisma
  - packages/backend/prisma/migrations/[날짜]_add_perf_indexes/

변경 상세:

| 모델 | 추가 인덱스 | 대응 ISSUE | 효과 |
|------|------------|------------|------|
| PartSummary | @@index([teamId, weekStart]) | ISSUE-04 | TEAM scope 취합보고 풀 스캔 제거 |
| TeamJoinRequest | @@index([memberId, teamId, status]) | ISSUE-12 | 가입 신청 복합 조건 조회 최적화 |
| Project | @@index([status]) | ISSUE-14 | ACTIVE 프로젝트 필터 최적화 |
| Part | @@index([teamId, sortOrder]) | ISSUE-15 | 파트 정렬 조회 최적화 |
| TimesheetApproval | @@index([approverId, approvalType]) | ISSUE-16 | PM 승인 조회 최적화 |

- **Acceptance Criteria**:
  - [ ] PartSummary에 @@index([teamId, weekStart]) 추가
  - [ ] TeamJoinRequest에 @@index([memberId, teamId, status]) 추가
  - [ ] Project에 @@index([status]) 추가
  - [ ] Part에 @@index([teamId, sortOrder]) 추가
  - [ ] TimesheetApproval에 @@index([approverId, approvalType]) 추가
  - [ ] bunx prisma migrate dev 성공
  - [ ] bunx prisma generate 성공
  - [ ] bun run build 성공
- **Verify**:
  cd packages/backend && bunx prisma migrate dev --name add_perf_indexes
  cd packages/backend && bunx prisma generate
  cd packages/backend && bun run build

---

### WORK-21-TASK-02: timesheet-stats.service.ts CRITICAL/HIGH 최적화

- **Depends on**: WORK-21-TASK-01
- **Scope**: timesheet-stats.service.ts의 CRITICAL 1건, HIGH 1건, MEDIUM 1건을 수정한다.
  조회 API에서의 쓰기 부수효과 제거, entries 전량 로드 개선, 독립 쿼리 병렬화.
- **ISSUE 대상**: ISSUE-01 (CRITICAL), ISSUE-02 (HIGH), ISSUE-11 (MEDIUM)
- **Files**:
  - packages/backend/src/timesheet/timesheet-stats.service.ts
  - packages/backend/src/timesheet/timesheet.controller.ts

변경 상세:

ISSUE-01 (checkAndAutoApprove) - CRITICAL
  현재: getProjectAllocationMonthly (GET) 내부에서 checkAndAutoApprove 호출.
  for 루프로 timesheetApproval.create N회 실행.
  수정 1: for 루프를 createMany(skipDuplicates: true) 1회로 통합.
  수정 2: getProjectAllocationMonthly에서 checkAndAutoApprove 호출 제거 (읽기/쓰기 분리).
  수정 3: POST /api/v1/timesheets/auto-approve 엔드포인트 추가.

ISSUE-02 (getTeamMembersStatus) - HIGH
  현재: entries: { include: { workLogs: true } } - workLogs 전체 컬럼 로드.
  수정: entries select를 { attendance: true, workLogs: { select: { hours: true } } }로 변경.

ISSUE-11 (getAdminOverview) - MEDIUM
  현재: projectsWithEntries와 후속 pmApprovals 조회가 순차 실행.
  수정: Promise.all로 병렬 조회.

- **Acceptance Criteria**:
  - [ ] checkAndAutoApprove 내 for 루프를 createMany로 전환
  - [ ] getProjectAllocationMonthly에서 checkAndAutoApprove 호출 제거
  - [ ] TimesheetStatsService에 triggerAutoApprove public 메서드 추가
  - [ ] timesheet.controller.ts에 POST auto-approve 엔드포인트 추가
  - [ ] getTeamMembersStatus entries include를 select로 변경 (attendance, hours만)
  - [ ] getAdminOverview Promise.all 병렬화 적용
  - [ ] bun run build 성공
  - [ ] bun run lint 성공
- **Verify**:
  cd packages/backend && bun run build && bun run lint

---

### WORK-21-TASK-03: 주간업무/취합보고 쿼리 최적화

- **Depends on**: WORK-21-TASK-01
- **Scope**: part-summary.service.ts, work-item.service.ts, team-join.service.ts 3개 파일의 쿼리 비효율 5건 수정.
- **ISSUE 대상**: ISSUE-03 (HIGH), ISSUE-05 (HIGH), ISSUE-17 (LOW), ISSUE-18 (LOW), ISSUE-20 (LOW)
- **Files**:
  - packages/backend/src/weekly-report/part-summary.service.ts
  - packages/backend/src/weekly-report/work-item.service.ts
  - packages/backend/src/team/team-join.service.ts

변경 상세:

ISSUE-03 (4단계 중첩 JOIN 분리) - HIGH
  대상: getTeamMembersWeeklyStatus, getTeamWeeklyOverview.
  현재: Part -> members -> weeklyReports -> workItems -> project 4단계 중첩.
  수정: 2단계 쿼리로 분리.
    1단계: part.findMany + members (workItems 없이)
    2단계: weeklyReport.findMany + workItems (memberId in [...], weekStart 조건)
    Map(memberId -> report)으로 조합.

ISSUE-05 (자동저장 중복 SELECT 제거) - HIGH
  대상: work-item.service.ts update 메서드.
  현재: findWorkItemAndVerify가 weeklyReport include 반환 후 weeklyReport.findUnique 재호출.
  수정: workItem.weeklyReport를 직접 참조.

ISSUE-17 (findById 불필요한 include 제거) - LOW
  대상: part-summary.service.ts findById private 메서드.
  현재: include: { summaryWorkItems: true } - 존재 확인에 불필요.
  수정: select로 필요 필드(id, status, partId, teamId, weekStart, scope, weekLabel)만 조회.

ISSUE-18 (업무항목 추가 aggregate 제거) - LOW
  대상: work-item.service.ts create 메서드.
  현재: aggregate(_max.sortOrder) + workItem.create = 2 쿼리.
  수정: findFirst({ orderBy: { sortOrder: desc }, select: { sortOrder: true } })로 대체.

ISSUE-20 (권한 확인 2회 조회 통합) - LOW
  대상: team-join.service.ts assertLeaderOrPartLeader.
  현재: teamMembership.findUnique -> 조건 불충족 시 member.findUnique 추가 (최악 2회 순차).
  수정: Promise.all([teamMembership.findUnique, member.findUnique])로 병렬 조회.

- **Acceptance Criteria**:
  - [ ] getTeamMembersWeeklyStatus 쿼리 2단계 분리 완료
  - [ ] getTeamWeeklyOverview 쿼리 2단계 분리 완료
  - [ ] work-item update 중복 weeklyReport SELECT 제거
  - [ ] part-summary findById include를 select로 변경
  - [ ] work-item create aggregate를 findFirst로 전환
  - [ ] team-join assertLeaderOrPartLeader Promise.all 병렬 조회 적용
  - [ ] bun run build 성공
  - [ ] bun run lint 성공
- **Verify**:
  cd packages/backend && bun run build && bun run lint

---

### WORK-21-TASK-04: 시간표/Admin 서비스 쿼리 최적화

- **Depends on**: WORK-21-TASK-01, WORK-21-TASK-02
- **Scope**: timesheet-export.service.ts, timesheet-entry.service.ts, admin.service.ts 최적화 및 reorder 상한선 가드 추가.
- **ISSUE 대상**: ISSUE-07 (HIGH), ISSUE-13 (MEDIUM), ISSUE-10 (MEDIUM), ISSUE-06 (HIGH)
- **Files**:
  - packages/backend/src/timesheet/timesheet-export.service.ts
  - packages/backend/src/timesheet/timesheet-entry.service.ts
  - packages/backend/src/admin/admin.service.ts
  - packages/backend/src/weekly-report/work-item.service.ts (ISSUE-06)

변경 상세:

ISSUE-07 (엑셀 생성 select 최소화) - HIGH
  현재: entries: { include: { workLogs: { include: { project } } } } - 전량 로드.
  수정: entries select { date, attendance, workLogs: select { hours, projectId, project: select { id, name, code } } }
       approvals select { approvalType, status, approvedAt, approver: select { id, name } }
  TimesheetWithDetail 타입도 select 기반으로 변경.

ISSUE-13 (batchSave deleteMany + createMany 통합) - MEDIUM
  현재: for...of 루프로 엔트리마다 deleteMany + update 순차 실행 (N*2 쿼리).
  수정:
    1. timesheetWorkLog.deleteMany({ where: { entryId: { in: entryIds } } }) 1회
    2. timesheetEntry.update Promise.all 병렬화 (attendance 업데이트)
    3. timesheetWorkLog.createMany 1회
    4. timesheetEntry.findMany로 재조회 반환 (createMany는 결과 미반환).

ISSUE-10 (admin listTeams _count correlated subquery) - MEDIUM
  현재: _count teamMemberships where { member: { accountStatus: ACTIVE } } - correlated subquery.
  수정: where 조건 제거, 전체 팀원 수 반환으로 단순화.

ISSUE-06 (reorder 상한선 가드) - HIGH
  현재: 항목 수 제한 없이 N개 개별 UPDATE.
  수정: dto.items.length > 50 시 BusinessException('REORDER_LIMIT_EXCEEDED') 발생.
  코드 주석으로 Prisma 제약(updateMany 조건별 값 다르게 불가) 기재.

- **Acceptance Criteria**:
  - [ ] timesheet-export entries/approvals select 최소화
  - [ ] TimesheetWithDetail 타입 select 기반으로 업데이트
  - [ ] batchSave deleteMany + Promise.all + createMany 통합
  - [ ] batchSave 반환값: findMany 재조회로 유지
  - [ ] admin listTeams _count where 조건 제거
  - [ ] work-item reorder 상한선(50개) 가드 추가
  - [ ] bun run build 성공
  - [ ] bun run lint 성공
  - [ ] bun run test 성공
- **Verify**:
  cd packages/backend && bun run build && bun run lint && bun run test

---

## 최적화 대상 파일 요약

| 파일 | 관련 TASK | 대상 ISSUE |
|------|-----------|------------|
| packages/backend/prisma/schema.prisma | TASK-01 | ISSUE-04, 12, 14, 15, 16 |
| packages/backend/src/timesheet/timesheet-stats.service.ts | TASK-02 | ISSUE-01, 02, 11 |
| packages/backend/src/timesheet/timesheet.controller.ts | TASK-02 | ISSUE-01 |
| packages/backend/src/weekly-report/part-summary.service.ts | TASK-03 | ISSUE-03, 17 |
| packages/backend/src/weekly-report/work-item.service.ts | TASK-03, TASK-04 | ISSUE-05, 18, 06 |
| packages/backend/src/team/team-join.service.ts | TASK-03 | ISSUE-20 |
| packages/backend/src/timesheet/timesheet-export.service.ts | TASK-04 | ISSUE-07 |
| packages/backend/src/timesheet/timesheet-entry.service.ts | TASK-04 | ISSUE-13 |
| packages/backend/src/admin/admin.service.ts | TASK-04 | ISSUE-10 |
