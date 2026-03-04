# WORK-21-TASK-04 수행 결과 보고서

> 작업일: 2026-03-04
> 작업자: Claude Code
> 상태: **완료**

---

## 1. 작업 개요

시간표 내보내기, 배치 저장, Admin 팀 목록, 업무항목 정렬 API의 쿼리 비효율 4건을 최적화했다.

---

## 2. 완료 기준 달성 현황

| 기준 | 결과 |
|------|------|
| TASK MD 체크리스트 전 항목 완료 | ✅ |
| 기존 API 응답 형태 유지 | ✅ |
| 엑셀 생성 결과 동일 | ✅ |
| batchSave 결과 동일 | ✅ |
| 빌드 오류 0건 (`bun run build` 성공) | ✅ |
| 린트 오류 0건 (`bun run lint` 성공) | ✅ |
| 테스트 153개 전 통과 (`bun run test` 성공) | ✅ |
| 결과 보고서 생성 완료 | ✅ |

---

## 3. 체크리스트 완료 현황

### 2.1 ISSUE-07 수정
| 항목 | 결과 |
|------|------|
| TimesheetWithDetail 타입을 select 기반으로 변경 | ✅ |
| generateMonthlyExcel의 findMany를 select 방식으로 변경 | ✅ |
| buildSummarySheet, buildProjectMatrixSheet 동작 확인 (접근 필드 변경 없음) | ✅ |
| TypeScript 타입 오류 없음 확인 | ✅ |

### 2.2 ISSUE-13 수정
| 항목 | 결과 |
|------|------|
| batchSave 트랜잭션 내 로직 교체 (1 deleteMany + N update) | ✅ |
| 반환 타입이 기존과 동일함을 확인 | ✅ |
| 빈 workLogs 케이스 처리 (undefined로 분기) | ✅ |

### 2.3 ISSUE-10 수정
| 항목 | 결과 |
|------|------|
| admin.service.ts listTeams의 _count where 조건 제거 | ✅ |
| 응답 필드 memberCount 유지 (전체 멤버 수로 의미 변경) | ✅ |

### 2.4 ISSUE-06 수정
| 항목 | 결과 |
|------|------|
| work-item.service.ts reorder 메서드 시작부에 상한선 가드 추가 | ✅ |
| BusinessException 에러코드: REORDER_LIMIT_EXCEEDED | ✅ |
| 코드 주석으로 배치 upsert 미적용 사유 명시 | ✅ |

### 2.5 빌드/린트/테스트
| 항목 | 결과 |
|------|------|
| bun run build 성공 | ✅ |
| bun run lint 성공 | ✅ |
| bun run test 성공 (153개 통과) | ✅ |

---

## 4. 발견 이슈 및 수정 내역

### 이슈 #1 — ISSUE-13 구현 시 테스트 호환성 문제

**증상**: 처음 ISSUE-13 구현에서 `deleteMany + Promise.all(updates) + createMany + findMany(결과재조회)` 패턴을 사용하자, 기존 테스트 2건이 실패했다.
- `should save all entries successfully when all owned and DRAFT`: result가 undefined 반환
- `should use findMany once for batch ownership verification (no N+1)`: findMany 호출 횟수가 2회

**원인**: 기존 테스트는 트랜잭션 내부 `findMany` 결과를 mock하지 않았고, 소유권 검증 `findMany`가 1회만 호출될 것을 가정하고 있었다.

**수정**: `createMany + findMany` 재조회 방식 대신, 1번 `deleteMany`(일괄 삭제) + N번 `update(nested create)` 방식으로 변경. 이로써:
- deleteMany: N → 1 쿼리 (핵심 최적화)
- 트랜잭션 내 추가 findMany 불필요 → 기존 반환 형태 유지
- 모든 테스트 통과

---

## 5. 최종 검증 결과

```
$ bun run build
$ nest build
(exit 0 — 오류 없음)

$ bun run lint
$ eslint "{src,test}/**/*.ts"
(exit 0 — 오류 없음)

$ bun run test
 153 pass
 0 fail
 306 expect() calls
Ran 153 tests across 15 files. [6.36s]
```

---

## 6. 후속 TASK 유의사항

없음. WORK-21의 모든 TASK가 완료되었다.

---

## 7. 산출물 목록

### 수정 파일

| 파일 | 변경 내용 |
|------|-----------|
| `packages/backend/src/timesheet/timesheet-export.service.ts` | ISSUE-07: TimesheetWithDetail 타입 및 findMany를 include→select로 최소화 (createdAt, updatedAt 등 불필요 컬럼 제외) |
| `packages/backend/src/timesheet/timesheet-entry.service.ts` | ISSUE-13: batchSave 트랜잭션 내 N번 deleteMany → 1번 deleteMany + N번 update(nested create)로 최적화 |
| `packages/backend/src/admin/admin.service.ts` | ISSUE-10: listTeams _count.teamMemberships에서 ACTIVE correlated subquery 제거 |
| `packages/backend/src/weekly-report/work-item.service.ts` | ISSUE-06: reorder 메서드 상한선 가드 추가 (50개 초과 시 REORDER_LIMIT_EXCEEDED 에러) |
| `tasks/multi-tasks/WORK-21/WORK-21-TASK-04-result.md` | 본 결과 보고서 |
