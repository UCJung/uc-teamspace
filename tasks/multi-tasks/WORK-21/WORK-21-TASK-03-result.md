# WORK-21-TASK-03 수행 결과 보고서

> 작업일: 2026-03-04
> 작업자: Claude Code
> 상태: **완료**

---

## 1. 작업 개요

`part-summary.service.ts`, `work-item.service.ts`, `team-join.service.ts`의 쿼리 비효율 5건을 수정하여 DB 왕복 횟수를 줄이고 불필요한 include를 제거했다.

---

## 2. 완료 기준 달성 현황

| 항목 | 상태 |
|------|------|
| TASK MD 체크리스트 전 항목 완료 | ✅ |
| API 응답 형태 변경 없음 | ✅ |
| 빌드 오류 0건 (`bun run build` 성공) | ✅ |
| 린트 오류 0건 (`bun run lint` 성공) | ✅ |
| 테스트 153개 전부 통과 | ✅ |
| 결과 보고서 생성 완료 | ✅ |

---

## 3. 체크리스트 완료 현황

| 항목 | 상태 |
|------|------|
| ISSUE-03: getTeamMembersWeeklyStatus 2단계 쿼리 분리 | ✅ |
| ISSUE-03: getTeamWeeklyOverview 2단계 쿼리 분리 | ✅ |
| ISSUE-05: update 메서드 중복 weeklyReport.findUnique 제거 | ✅ |
| ISSUE-17: findById에서 summaryWorkItems include 제거 → select로 변경 | ✅ |
| ISSUE-18: aggregate → findFirst로 교체 | ✅ |
| ISSUE-20: assertLeaderOrPartLeader Promise.all 병렬 조회 통합 | ✅ |
| 테스트 spec 파일 업데이트 (mockPrisma.workItem.findFirst 추가, update 테스트 수정) | ✅ |
| bun run build 성공 | ✅ |
| bun run lint 성공 | ✅ |

---

## 4. 발견 이슈 및 수정 내역

### 이슈 #1 — work-item.service.spec.ts 테스트 실패

**증상**: `should throw if report is submitted` 테스트가 실패. `update` 메서드 호출 후 예외가 발생하지 않음.

**원인**: 기존 테스트는 `mockPrisma.weeklyReport.findUnique`로 SUBMITTED 상태를 mock했지만, 서비스 코드가 `workItem.weeklyReport.status`를 직접 참조하도록 변경되어 `weeklyReport.findUnique` mock이 무시됨. `mockWorkItem`에 포함된 `weeklyReport`는 DRAFT 상태였기 때문에 예외가 발생하지 않음.

**수정**:
- `work-item.service.spec.ts`의 `should throw if report is submitted` 테스트에서 `workItem.findUnique`가 SUBMITTED 상태의 `weeklyReport`를 포함한 workItem을 반환하도록 수정.
- `should update work item` 테스트에서 불필요한 `weeklyReport.findUnique` mock 라인 제거.

### 이슈 #2 — create 테스트의 aggregate mock 불일치

**증상**: `create` 테스트에서 `aggregate` mock이 있었지만, 서비스 코드가 `findFirst`로 변경되어 mock이 무시됨.

**원인**: ISSUE-18 수정으로 `aggregate` → `findFirst` 교체 후 spec 파일의 mock이 구버전 API를 참조.

**수정**: `mockPrisma.workItem.findFirst` mock 추가, `create` 테스트에서 `aggregate` mock을 `findFirst` mock으로 교체, `beforeEach`에 `findFirst.mockReset()` 추가.

### 이슈 #3 — 첫 번째 nest build 캐시 오류

**증상**: `nest build` 실행 시 `timesheet-stats.service.ts` line 441/515에서 `TS2451: Cannot redeclare block-scoped variable` 오류 발생.

**원인**: 이전 TASK-02에서 수정된 `timesheet-stats.service.ts`의 dist 빌드 캐시가 남아있어 이전 버전(변수가 중복 선언된 상태)과 충돌.

**수정**: `dist` 디렉터리 삭제 후 재빌드하여 해결.

---

## 5. 최종 검증 결과

```
# bun run build
$ nest build
(성공, 출력 없음)

# bun run lint
$ eslint "{src,test}/**/*.ts"
(성공, 출력 없음)

# bun run test
 153 pass
 0 fail
 306 expect() calls
Ran 153 tests across 15 files. [1.80s]
```

---

## 6. 후속 TASK 유의사항

- TASK-04에서 timesheet/admin 서비스 쿼리 최적화 작업 시, 이번 TASK와 동일한 방식(2단계 쿼리 분리, Promise.all 병렬화)을 참고하면 됨.
- `work-item.service.spec.ts`에서 `aggregate` mock이 남아있지만 실제 서비스 코드에서는 더 이상 사용하지 않음. 필요 시 cleanup 가능.

---

## 7. 산출물 목록

### 수정 파일

| 파일 | 변경 내용 |
|------|-----------|
| `packages/backend/src/weekly-report/part-summary.service.ts` | ISSUE-03: getTeamMembersWeeklyStatus, getTeamWeeklyOverview 4단계 중첩 JOIN → 2단계 쿼리 분리 + memberId-Map 조합. ISSUE-17: findById에서 summaryWorkItems include 제거 → select로 필요 필드만 조회. |
| `packages/backend/src/weekly-report/work-item.service.ts` | ISSUE-05: update 메서드에서 중복 weeklyReport.findUnique 제거, workItem.weeklyReport.status 직접 참조. ISSUE-18: aggregate → findFirst로 교체. |
| `packages/backend/src/team/team-join.service.ts` | ISSUE-20: assertLeaderOrPartLeader에서 순차 2회 조회 → Promise.all 단일 병렬 조회로 통합. |
| `packages/backend/src/weekly-report/work-item.service.spec.ts` | mockPrisma에 workItem.findFirst 추가, create 테스트 수정, update/submitted 테스트 수정. |
