# WORK-22-TASK-01 수행 결과 보고서

> 작업일: 2026-03-04
> 작업자: Claude Code
> 상태: **완료**

---

## 1. 작업 개요

`packages/backend/src/weekly-report/part-summary.service.ts`에서 `Member.partId`를 직접 쿼리 조건으로 사용하는 5개 메서드를 `TeamMembership` 기반으로 전환했다. 응답 형태는 기존과 동일하게 유지했으며, `isActive` 필터는 Member 레벨에서 계속 적용했다.

---

## 2. 완료 기준 달성 현황

| 항목 | 상태 |
|------|------|
| getPartWeeklyStatus TeamMembership 기반 전환 | ✅ |
| getPartSubmissionStatus TeamMembership 기반 전환 | ✅ |
| loadMemberRows PART/TEAM scope TeamMembership 기반 전환 | ✅ |
| getTeamMembersWeeklyStatus Part.members 제거 | ✅ |
| getTeamWeeklyOverview Part.members 제거 | ✅ |
| 기존 API 응답 형태 유지 | ✅ |
| 단위 테스트 업데이트 및 통과 | ✅ |
| bun run build 성공 | ✅ |
| bun run test 전체 통과 (157 tests) | ✅ |

---

## 3. 체크리스트 완료 현황

| 소분류 | 항목 | 상태 |
|--------|------|------|
| 2.1 getPartWeeklyStatus | Part.teamId 조회 로직 추가 | ✅ |
| 2.1 getPartWeeklyStatus | TeamMembership 기반 memberIds 조회로 전환 | ✅ |
| 2.1 getPartWeeklyStatus | 응답 객체 partId/partName 필드 유지 | ✅ |
| 2.2 getPartSubmissionStatus | TeamMembership 기반 memberIds 조회로 전환 | ✅ |
| 2.2 getPartSubmissionStatus | Member 조회 조건을 id in memberIds로 변경 | ✅ |
| 2.3 loadMemberRows | memberFilter를 memberIds 배열로 교체 | ✅ |
| 2.3 loadMemberRows | TeamMembership 기반 memberIds 조회 로직 추가 | ✅ |
| 2.4 getTeamMembersWeeklyStatus | Part.members 대신 TeamMembership 기반으로 팀원 조회 | ✅ |
| 2.4 getTeamMembersWeeklyStatus | 파트별 그룹화 로직 유지 | ✅ |
| 2.5 getTeamWeeklyOverview | Part.members 대신 TeamMembership 기반으로 팀원 조회 | ✅ |
| 2.5 getTeamWeeklyOverview | 파트별 그룹화 로직 유지 | ✅ |
| 2.6 테스트 | getPartWeeklyStatus TeamMembership 기반 조회 검증 | ✅ |
| 2.6 테스트 | getPartSubmissionStatus TeamMembership 기반 조회 검증 | ✅ |
| 2.6 테스트 | bun run test 전체 통과 | ✅ |

---

## 4. 발견 이슈 및 수정 내역

### 이슈 #1 — loadMemberRows의 memberNames 필드에서 member.part 참조 제거

**증상**: loadMemberRows에서 멤버 include 시 `part: true`를 통해 파트명을 조회하고 `member.part?.name`으로 사용하고 있었음.

**원인**: TeamMembership 기반으로 전환하면서 Member include에서 `part`를 제거하고 `teamMemberships`로 교체해야 함.

**수정**: `partNameMap`(Map<partId, partName>)을 사전에 구성하고, Member include에서 `teamMemberships: { where: { partId: { not: null } }, select: { partId: true } }`를 통해 partId를 가져온 후 `partNameMap.get(member.teamMemberships[0]?.partId ?? '')`로 파트명을 조회.

### 이슈 #2 — 미사용 Prisma 네임스페이스 import 제거

**증상**: `Prisma.MemberWhereInput` 타입을 loadMemberRows에서 사용하고 있었으나 TeamMembership 기반으로 변경 후 더 이상 사용하지 않음.

**원인**: memberFilter 변수 타입이 제거됨.

**수정**: import에서 `Prisma` 네임스페이스 제거. `import { ReportStatus, SummaryScope } from '@prisma/client';`

---

## 5. 최종 검증 결과

```
bun run build
$ nest build
(빌드 성공, 출력 없음)

bun run test
bun test v1.3.10 (30e609e0)
...
 157 pass
 0 fail
 311 expect() calls
Ran 157 tests across 15 files. [3.06s]
```

---

## 6. 후속 TASK 유의사항

- `Part.members` relation (Member.partId 기반)은 다른 서비스 파일에서도 사용될 수 있으므로, WORK-22의 다음 TASK에서 추가 점검 필요.
- WORK-22-TASK-04(DB 마이그레이션)에서 `Member.partId` 컬럼 제거 시 이 파일에는 영향 없음 (이미 TeamMembership 기반으로 전환 완료).

---

## 7. 산출물 목록

| 구분 | 파일 | 설명 |
|------|------|------|
| 수정 | `packages/backend/src/weekly-report/part-summary.service.ts` | 5개 메서드를 TeamMembership 기반으로 전환, Prisma import 정리 |
| 수정 | `packages/backend/src/weekly-report/part-summary.service.spec.ts` | getPartWeeklyStatus/getPartSubmissionStatus 테스트 업데이트, 신규 테스트 케이스 추가 |
| 수정 | `tasks/multi-tasks/WORK-22/WORK-22-TASK-01.md` | 체크리스트 완료 표시 |
| 생성 | `tasks/multi-tasks/WORK-22/WORK-22-TASK-01-result.md` | 결과 보고서 |
