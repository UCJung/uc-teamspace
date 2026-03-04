# WORK-20-TASK-02 수행 결과 보고서

> 작업일: 2026-03-04
> 작업자: Claude Code
> 상태: **완료**

---

## 1. 작업 개요

`timesheet-stats.service.ts`의 5개 N+1 쿼리 패턴을 일괄 조회 + 메모리 집계 방식으로 전환하고, `timesheet-entry.service.ts`의 batchSave 보안 취약점을 수정하며, `timesheet-approval.service.ts`의 adminApprove/projectApprove에 `$transaction` 배열 방식을 적용했다.

---

## 2. 완료 기준 달성 현황

| 항목 | 상태 |
|------|------|
| TASK MD 체크리스트 전 항목 완료 | ✅ |
| N+1 쿼리 5개 모두 해소 | ✅ |
| batchSave 보안 취약점 수정 | ✅ |
| 트랜잭션 적용 (adminApprove, projectApprove) | ✅ |
| findAndVerifySubmitted 헬퍼 메서드 추출 | ✅ |
| 기존 입출력 인터페이스 유지 | ✅ |
| 빌드 오류 0건 (`bun run build`) | ✅ |
| 린트 오류 0건 (`bun run lint`) | ✅ |

---

## 3. 체크리스트 완료 현황

### 3.1 timesheet-stats.service.ts — N+1 해소

| 항목 | 상태 |
|------|------|
| B-1: getTeamMembersStatus — findUnique N회 → findMany 1회 + Map 매핑 | ✅ |
| B-2: getProjectAllocationMonthly — findFirst N회 → findMany 1회 + Map 매핑 | ✅ |
| B-4: getAdminOverview — 팀별 findMany N회 → 전체 findMany 1회 + teamId별 그룹핑 | ✅ |
| B-4: getAdminOverview — PM 승인 findFirst N회 → findMany 1회 + Set 집합 조회 | ✅ |
| B-5: getProjectAllocationSummary — 프로젝트별 findMany+count N회 → 일괄 조회 후 메모리 집계 | ✅ |
| B-6: getProjectAllocationYearly — 12개월 Promise.all → 연간 데이터 1회 조회 후 월별 집계 | ✅ |

### 3.2 timesheet-entry.service.ts — batchSave 보안 강화

| 항목 | 상태 |
|------|------|
| 첫 번째 엔트리 기반 검증 → 모든 entryId 목록으로 findMany 일괄 조회 | ✅ |
| 조회된 엔트리 수 != 요청 수 → NOT_FOUND 예외 | ✅ |
| 모든 엔트리 소유권 확인 (unauthorizedEntry 검사) | ✅ |
| 모든 엔트리의 시간표 상태 확인 (submittedEntry 검사) | ✅ |

### 3.3 timesheet-approval.service.ts — 트랜잭션 강화 및 헬퍼 추출

| 항목 | 상태 |
|------|------|
| projectApprove 루프 → ops 배열 구성 후 `$transaction(ops)` | ✅ |
| adminApprove 루프 → 팀장 승인 없는 것 필터 후 `$transaction(ops)` | ✅ |
| `findAndVerifySubmitted` 헬퍼 메서드 추출 | ✅ |
| leaderApprove — 헬퍼 사용 리팩터링 | ✅ |
| leaderReject — 헬퍼 사용 리팩터링 | ✅ |

### 3.4 빌드 검증

| 항목 | 상태 |
|------|------|
| `bun run build` 빌드 오류 0건 | ✅ |
| `bun run lint` 린트 오류 0건 | ✅ |

---

## 4. 발견 이슈 및 수정 내역

### 이슈 #1 — TASK-01에서 이미 ProjectStatus/TeamStatus enum 사용으로 변경

**증상**: TASK-01 작업으로 `timesheet-stats.service.ts` 임포트에 `ProjectStatus`, `TeamStatus`가 추가되어 있었고, 해당 enum이 메서드 내부에서 사용 중이었음

**원인**: TASK-01이 `'ACTIVE'` 문자열을 enum 값으로 교체하는 리팩터링을 포함했음

**수정**: 임포트 수정 시도 후 사용처 확인 후 원래대로 유지 — 임포트를 그대로 두어 빌드 정상 처리

---

## 5. 최종 검증 결과

```
# N+1 패턴 잔존 여부 확인
grep -n "findUnique\|findFirst\|Promise.all" timesheet-stats.service.ts
→ findUnique: project 조회 2곳 (단건 조회, 정상)
→ findFirst: 없음 (제거됨)
→ Promise.all: 없음 (제거됨)

# 트랜잭션 확인
grep -n "\$transaction" timesheet-approval.service.ts
→ line 23: leaderApprove (async tx)
→ line 61: batchLeaderApprove (async tx)
→ line 110: leaderReject (async tx)
→ line 199: projectApprove (ops 배열)
→ line 259: adminApprove (ops 배열)

# batchSave 검증
grep -n "timesheetId\|ownerId\|memberId\|entryIds\|entriesWithTimesheet" timesheet-entry.service.ts
→ entryIds, entriesWithTimesheet 사용 확인 (일괄 검증 적용됨)

# 빌드
bun run build → 오류 없음 (dist/ 아티팩트 생성 확인)

# 린트
bun run lint → 오류 없음
```

---

## 6. 후속 TASK 유의사항

- `getAdminOverview`의 PM 승인 집계는 "프로젝트 매니저(approverId) === 프로젝트(managerId)" 매핑으로 처리. 매니저 1명이 여러 프로젝트를 담당하는 경우를 올바르게 처리함
- `getProjectAllocationSummary`에서 `pmApprovalStatus`가 기존에 `TimesheetStatus.APPROVED` enum 값으로 반환되던 것을 유지함 (TASK-01 변경사항)

---

## 7. 산출물 목록

### 수정 파일

| 파일 | 변경 내용 |
|------|----------|
| `packages/backend/src/timesheet/timesheet-stats.service.ts` | B-1/B-2/B-4/B-5/B-6 N+1 해소 (5개 패턴) |
| `packages/backend/src/timesheet/timesheet-entry.service.ts` | B-8 batchSave 소유권 일괄 검증 보안 강화 |
| `packages/backend/src/timesheet/timesheet-approval.service.ts` | B-3 projectApprove/adminApprove 트랜잭션 적용, findAndVerifySubmitted 헬퍼 추출 |

### 신규 생성 파일

| 파일 | 설명 |
|------|------|
| `tasks/multi-tasks/WORK-20/WORK-20-TASK-02-result.md` | 수행 결과 보고서 |
