# WORK-20-TASK-02: Backend N+1 쿼리 및 효율성 개선

> **Phase:** 2
> **선행 TASK:** WORK-20-TASK-01
> **목표:** timesheet-stats.service.ts의 N+1 쿼리 패턴을 일괄 조회 + 메모리 집계 방식으로 전환하고, batchSave 보안 취약점을 수정하며, 승인 서비스에 트랜잭션을 적용한다.

---

## Step 1 — 계획서

### 1.1 작업 범위

`timesheet-stats.service.ts`는 5개의 N+1 쿼리 패턴을 포함하고 있다. `getTeamMembersStatus`는 팀원 수(N)만큼 findUnique를 개별 실행하고, `getProjectAllocationMonthly`는 투입 인원 수(N)만큼 findFirst를 개별 실행한다. `getAdminOverview`는 팀 수(N)만큼 findMany를 루프 실행하고, `getProjectAllocationSummary`는 프로젝트별 루프에서 findMany + count 이중 조회(O(N²)) 패턴을 사용한다. `getProjectAllocationYearly`는 12개월을 Promise.all로 병렬 처리하여 최대 12개 쿼리를 발생시킨다. 모두 일괄 조회 + 메모리 내 집계 방식으로 개선한다.

`timesheet-entry.service.ts`의 batchSave는 배치의 첫 번째 엔트리만으로 소유권 확인 후 나머지는 검증 없이 처리하는 보안 취약점이 있다. timesheetId 기반의 일괄 검증으로 수정한다.

`timesheet-approval.service.ts`의 adminApprove, projectApprove는 루프 내에서 create/update를 개별 실행하므로 부분 실패 시 데이터 불일치가 발생할 수 있다. `prisma.$transaction([...ops])` 배열 방식으로 묶어 원자성을 보장한다.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| MODIFY | packages/backend/src/timesheet/timesheet-stats.service.ts |
| MODIFY | packages/backend/src/timesheet/timesheet-entry.service.ts |
| MODIFY | packages/backend/src/timesheet/timesheet-approval.service.ts |

---

## Step 2 — 체크리스트

### 2.1 timesheet-stats.service.ts — getTeamMembersStatus N+1 해소

- [ ] 현재 코드 파악: 팀원 루프 내 `monthlyTimesheet.findUnique` 호출 위치 확인 (line ~29~113)
- [ ] 개선: 팀원 ID 목록으로 `monthlyTimesheet.findMany({ where: { memberId: { in: memberIds }, yearMonth } })` 한 번 조회
- [ ] 조회 결과를 `Map<memberId, MonthlyTimesheet>`로 변환 후 팀원별 매핑 처리
- [ ] 반환 데이터 구조가 기존과 동일한지 확인

### 2.2 timesheet-stats.service.ts — getProjectAllocationMonthly N+1 해소

- [ ] 현재 코드 파악: 투입 인원 루프 내 `monthlyTimesheet.findFirst` 호출 위치 확인 (line ~279~294)
- [ ] 개선: 관련 memberId 목록으로 `monthlyTimesheet.findMany` 한 번 조회
- [ ] 결과를 Map으로 변환 후 메모리에서 매핑

### 2.3 timesheet-stats.service.ts — getAdminOverview 팀별 루프 N+1 해소

- [ ] 현재 코드 파악: 팀 루프 내 `monthlyTimesheet.findMany` + `approvalExists` 조회 위치 확인 (line ~430~513)
- [ ] 개선: 전체 yearMonth 데이터를 한 번에 조회 (`findMany({ where: { yearMonth } })`)
- [ ] 결과를 `teamId`별로 그룹핑하여 메모리에서 집계
- [ ] approvalExists도 해당 yearMonth 전체를 한 번에 조회하여 Map으로 관리

### 2.4 timesheet-stats.service.ts — getProjectAllocationSummary 이중 N+1 해소

- [ ] 현재 코드 파악: 프로젝트별 루프에서 `findMany + count` 이중 조회 위치 확인 (line ~352~415)
- [ ] 개선: 관련 데이터를 한 번에 일괄 조회
- [ ] 메모리에서 프로젝트별 집계 수행

### 2.5 timesheet-stats.service.ts — getProjectAllocationYearly 월별 쿼리 최적화

- [ ] 현재 코드 파악: 12개월 Promise.all로 병렬 findMany 위치 확인 (line ~318~348)
- [ ] 개선: 연간 데이터 한 번에 조회 (`where: { yearMonth: { startsWith: year } }` 또는 범위 조건)
- [ ] 메모리에서 월별 그룹 집계

### 2.6 timesheet-entry.service.ts — batchSave 보안 취약점 수정

- [ ] 현재 코드 파악: 첫 번째 엔트리 기반 소유권 확인 로직 확인 (line ~68~129)
- [ ] 개선: entries 배열에서 고유 timesheetId 목록 추출
- [ ] 해당 timesheetId들이 모두 요청자 소유인지 `findMany`로 일괄 검증
- [ ] 소유권 위반 timesheetId가 하나라도 있으면 전체 거부
- [ ] SUBMITTED 상태인 시간표 포함 시 수정 거부 로직 확인 및 강화

### 2.7 timesheet-approval.service.ts — 트랜잭션 적용

- [ ] 현재 코드 파악: adminApprove 루프 내 개별 create/update 위치 확인 (line ~212~229)
- [ ] 개선: 루프에서 ops 배열 구성 후 `prisma.$transaction(ops)` 한 번에 실행
- [ ] projectApprove 동일 처리 (line ~263~285)
- [ ] leaderApprove/leaderReject의 공통 검증 패턴 확인
- [ ] `private findAndVerifySubmitted(id: string)` 헬퍼 메서드 추출 (leaderApprove, leaderReject 공통 사용)

### 2.8 빌드 검증

- [ ] `cd packages/backend && bun run build` 실행하여 빌드 오류 0건 확인

---

## Step 3 — 완료 검증

```bash
# 1. N+1 패턴이 제거되었는지 확인 (루프 내 단일 findUnique/findFirst 잔존 여부)
grep -n "findUnique\|findFirst" packages/backend/src/timesheet/timesheet-stats.service.ts

# 2. 트랜잭션 적용 확인
grep -n "\$transaction" packages/backend/src/timesheet/timesheet-approval.service.ts

# 3. batchSave 검증 로직 확인
grep -n "timesheetId\|ownerId\|memberId" packages/backend/src/timesheet/timesheet-entry.service.ts

# 4. 백엔드 빌드 확인
cd packages/backend && bun run build
```
