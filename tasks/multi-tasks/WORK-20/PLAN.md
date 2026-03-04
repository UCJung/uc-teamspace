# WORK-20: 코드 품질점검 및 리팩토링

> Created: 2026-03-04
> Project: UC TeamSpace
> Tech Stack: NestJS 11 / React 18 / Prisma 6 / Bun
> Status: PLANNED

## 요청사항

참조: tasks/Require/Require-08.md

최근 다양한 수정(WORK-17~19)이 발생하여 전체 구조에 대한 품질 점검과 리팩토링 작업이 필요하다.

- 코드 재사용성: 여러 곳에서 중복 구현된 코드를 점검하여 재사용 가능한 구조로 리팩토링
- 코드 효율성: 실행속도/응답속도 단축, 동시접근 부하 대응 측면의 검토 및 리팩토링
- 코드 일원화: 코드 스타일 및 규칙을 일원화하여 가독성/유지보수성 향상
- 리팩토링 시 TEST CODE 작성: 기능 문제가 없도록 진행
- 계획 수립 후 순차적 진행


---

## 코드베이스 분석 결과

### A. 코드 재사용성 이슈

#### A-1. Backend: week-utils.ts 이중 유지 문제 (심각도: HIGH)
- 파일: packages/backend/src/weekly-report/week-utils.ts
- 문제: packages/shared/constants/week-utils.ts와 완전히 동일한 로직을 백엔드에 별도로 복사 유지
- 현황: 파일 최상단 주석에 "shared/constants/week-utils.ts 와 동일한 로직"이라고 명시되어 있으나 분리 유지 중
- 영향 범위: report.service.ts, part-summary.service.ts, carry-forward.service.ts, excel.service.ts 모두 로컬 week-utils.ts를 import

#### A-2. Backend: 페이지네이션 로직 중복 (심각도: MEDIUM)
- 파일: admin.service.ts (listAccounts, listTeams, listProjects 각 메서드)
- 문제: page/limit/skip 계산 패턴이 admin.service.ts에 3회, team-join.service.ts에 1회 중복
- 수정 방향: common/utils/pagination.util.ts 헬퍼 함수로 추출

#### A-3. Backend: 페이지네이션 응답 객체 중복 (심각도: MEDIUM)
- 파일: admin.service.ts, team-join.service.ts, project.service.ts
- 문제: { data, pagination: { page, limit, total, totalPages } } 형태 응답 조립이 4곳에서 중복
- 수정 방향: buildPaginationResponse(data, total, page, limit) 유틸 함수로 추출

#### A-4. Backend: 역할 확인 로직 중복 (심각도: HIGH)
- 파일: team-join.service.ts (assertLeaderOrPartLeader), project.service.ts (validateLeaderOrPartLeader)
- 문제: TeamMembership 기반 역할 확인 후 Member 테이블 fallback 조회하는 패턴이 두 서비스에서 유사하게 구현됨
- 현황: team-join.service.ts의 assertLeaderOrPartLeader는 최악의 경우 3회 DB 쿼리 발생

#### A-5. Backend: findById 패턴 반복 (심각도: LOW)
- 파일: report.service.ts, part-summary.service.ts, team-project.service.ts, project.service.ts, timesheet.service.ts
- 문제: findUnique + not found → BusinessException 패턴이 각 서비스마다 독립 구현됨

#### A-6. Frontend: 날짜 문자열 변환 함수 인라인 중복 (심각도: MEDIUM)
- 파일: pages/MyTimesheet.tsx (line 67-72: dateToString 함수)
- 문제: packages/shared에 이미 관련 유틸이 있음에도 페이지 내에 인라인으로 동일 기능 구현

#### A-7. Frontend: TimesheetPopup 시간표 표시 로직 중복 (심각도: MEDIUM)
- 파일: pages/TeamTimesheetReview.tsx (TimesheetPopup 컴포넌트)
- 문제: MyTimesheet.tsx의 렌더링 로직과 동일한 테이블 표시 구조를 내부 컴포넌트로 재구현

#### A-8. Backend: 정렬(reorder) 트랜잭션 패턴 중복 (심각도: LOW)
- 파일: team.service.ts, member.service.ts, team-project.service.ts, project.service.ts, work-item.service.ts
- 문제: orderedIds.map((id, index) => prisma.X.update({sortOrder: index})) 패턴 5회 반복


---

### B. 코드 효율성 이슈

#### B-1. Backend: N+1 쿼리 — getTeamMembersStatus (심각도: HIGH)
- 파일: timesheet-stats.service.ts (line 29~113)
- 문제: 팀원 수(N)만큼 monthlyTimesheet.findUnique가 별도 실행
- 수정 방향: 한 번의 findMany + Map 으로 일괄 조회 후 매핑

#### B-2. Backend: N+1 쿼리 — getProjectAllocationMonthly (심각도: HIGH)
- 파일: timesheet-stats.service.ts (line 279~294)
- 문제: 투입 인원 수(N)만큼 monthlyTimesheet.findFirst가 별도 실행
- 수정 방향: 한 번의 findMany + Map으로 일괄 처리

#### B-3. Backend: adminApprove, projectApprove 루프 내 DB ops — 트랜잭션 미적용 (심각도: MEDIUM)
- 파일: timesheet-approval.service.ts (line 212~229, 263~285)
- 문제: 시간표별로 루프 내에서 create/update 개별 실행. 트랜잭션 없어 부분 실패 위험
- 수정 방향: prisma.$transaction([...ops]) 배열 방식으로 묶기

#### B-4. Backend: getAdminOverview N+1 — 팀별 루프에서 DB 조회 (심각도: HIGH)
- 파일: timesheet-stats.service.ts (line 430~513)
- 문제: 팀 수(N)만큼 monthlyTimesheet.findMany + 루프 내 approvalExists 추가 조회
- 수정 방향: 전체 yearMonth 데이터 한 번에 조회 후 teamId별 groupBy 적용

#### B-5. Backend: getProjectAllocationSummary 이중 N+1 (심각도: HIGH)
- 파일: timesheet-stats.service.ts (line 352~415)
- 문제: 프로젝트별 루프에서 findMany + count 이중 조회 — O(N^2) 패턴
- 수정 방향: 관련 데이터를 한번에 일괄 조회하고 메모리에서 집계

#### B-6. Backend: getProjectAllocationYearly 월별 N 쿼리 (심각도: MEDIUM)
- 파일: timesheet-stats.service.ts (line 318~348)
- 문제: 12개월을 Promise.all으로 병렬 findMany — 최대 12개 쿼리
- 수정 방향: 연간 데이터 한 번에 조회 후 메모리에서 월별 집계

#### B-7. Backend: MemberService.reorder — 불필요한 재조회 (심각도: LOW)
- 파일: member.service.ts (line 111~121)
- 문제: reorder 완료 후 findByTeam(teamId) 재조회. 단순 { reordered: N } 반환으로 충분

#### B-8. Backend: TimesheetEntryService.batchSave — 첫 번째 엔트리만 권한 확인 (심각도: MEDIUM)
- 파일: timesheet-entry.service.ts (line 68~129)
- 문제: 배치의 첫 번째 엔트리로만 소유권 확인하고 나머지는 검증 없이 처리 — 보안 취약점
- 수정 방향: timesheetId 기반으로 한 번에 검증

#### B-9. Frontend: useAdminAccounts 응답 이중 .data 접근 (심각도: LOW)
- 파일: hooks/useAdmin.ts (line 19)
- 문제: r.data.data.data — 3중 .data 접근으로 가독성 저하

---

### C. 코드 일원화 이슈

#### C-1. Backend: admin.service.ts ConfigService 주입 불일치 (심각도: MEDIUM)
- 파일: admin.service.ts
- 문제: ConfigService가 주입되어 있으나 DEFAULT_PASSWORD 하나에만 사용. spec 파일에서 ConfigService mock이 누락되어 테스트 실패 가능성

#### C-2. Backend: timesheet-approval.service.ts 반복되는 검증 패턴 (심각도: LOW)
- 파일: timesheet-approval.service.ts
- 문제: leaderApprove, leaderReject에서 동일한 시간표 존재 확인 + 상태 확인 패턴 반복
- 수정 방향: private findAndVerifySubmitted(id) 헬퍼 추출

#### C-3. Backend: part-summary.service.ts의 autoMerge — 레거시 Member.partId 사용 (심각도: MEDIUM)
- 파일: part-summary.service.ts (line 88-89)
- 문제: Member 테이블의 레거시 partId 컬럼 직접 사용. 다중 팀 소속(TeamMembership) 구조와 불일치
- 현황: loadMemberRows는 TeamMembership 기반으로 올바르게 구현됨, autoMerge만 구버전 방식 유지
- 수정 방향: autoMerge를 loadMemberRows와 동일하게 TeamMembership 기반으로 통일

#### C-4. Backend: 문자열 리터럴 상태값 사용 (심각도: LOW)
- 파일: timesheet.service.ts, timesheet-stats.service.ts
- 문제: TimesheetStatus Enum 대신 문자열 리터럴 'DRAFT', 'SUBMITTED' 등을 직접 사용
- 현황: timesheet-approval.service.ts는 Enum 올바르게 사용 중 — 파일 간 불일치

#### C-5. Frontend: useMyTeams hook에서 any 타입 사용 (심각도: LOW)
- 파일: hooks/useTeams.ts (line 22)
- 문제: (r.data.data as any[]).map(...) — 타입 안전성 부재
- 수정 방향: MyTeamItem 타입 정의 및 사용

#### C-6. Frontend: TeamTimesheetReview.tsx 내부 inline useQuery 사용 (심각도: LOW)
- 파일: pages/TeamTimesheetReview.tsx (line 33-37)
- 문제: 컴포넌트 내부에서 직접 useQuery 사용. useTimesheetDetail(id) 훅으로 추출해야 일관성 유지

#### C-7. Backend: timesheet-stats.service.ts의 as any 강제 캐스팅 (심각도: LOW)
- 파일: timesheet-stats.service.ts (line 196)
- 문제: (ts.member as any).jobTitle — Prisma select에 jobTitle 포함 누락으로 강제 타입 캐스팅

#### C-8. Backend: 테스트 없는 신규 서비스들 (심각도: HIGH)
- 파일: timesheet.service.ts, timesheet-entry.service.ts, timesheet-approval.service.ts, timesheet-stats.service.ts, timesheet-export.service.ts
- 문제: WORK-18~19에서 추가된 시간표 관련 5개 서비스에 spec 파일이 전혀 없음
- 현황: 기존 서비스들(auth, admin, project, team-join, member, report, work-item, carry-forward, part-summary)은 모두 spec 존재


---

## Goal

실제 코드 분석을 통해 발견된 구체적 이슈들을 카테고리별로 리팩토링한다. 총 3개 분야(재사용성·효율성·일원화)의 이슈를 순차적으로 수정하고, 각 TASK에 테스트 코드를 작성하여 기능 회귀를 방지한다.

---

## Task Dependency Graph

```
WORK-20-TASK-01
(Backend 공통 유틸 추출: week-utils 통합, pagination 유틸, reorder 헬퍼)
   |
   +----------------------------+
   v                            v
WORK-20-TASK-02          WORK-20-TASK-03
(Backend N+1 쿼리 개선,   (Backend 일원화: 레거시 코드
 트랜잭션 보강)             정리, Enum, any 타입 제거)
   |                            |
   +----------+-----------------+
              v
       WORK-20-TASK-04         (WORK-20-TASK-02 + TASK-03 완료 후 병렬 가능)
(Frontend: 중복 컴포넌트,       WORK-20-TASK-05
 inline query, any 타입 제거)   (시간표 서비스 테스트 코드 작성)
```

---

## Tasks

### WORK-20-TASK-01: Backend 공통 유틸 추출 및 코드 재사용성 개선
- **Depends on**: (없음)
- **Scope**: week-utils shared 통합, pagination 유틸 추출, reorder 헬퍼 추출
- **Files**:

| 구분 | 파일 | 작업 |
|------|------|------|
| DELETE | packages/backend/src/weekly-report/week-utils.ts | 삭제 (shared로 통합) |
| CREATE | packages/backend/src/common/utils/pagination.util.ts | 페이지네이션 헬퍼 |
| CREATE | packages/backend/src/common/utils/reorder.util.ts | 정렬 트랜잭션 헬퍼 |
| CREATE | packages/backend/src/common/utils/pagination.util.spec.ts | 유틸 단위 테스트 |
| MODIFY | packages/backend/src/admin/admin.service.ts | pagination 유틸 적용 |
| MODIFY | packages/backend/src/team/team-join.service.ts | pagination 유틸 적용 |
| MODIFY | packages/backend/src/project/project.service.ts | pagination, reorder 유틸 적용 |
| MODIFY | packages/backend/src/team/team.service.ts | reorder 유틸 적용 |
| MODIFY | packages/backend/src/team/member.service.ts | reorder 유틸 적용 |
| MODIFY | packages/backend/src/team/team-project.service.ts | reorder 유틸 적용 |
| MODIFY | packages/backend/src/weekly-report/work-item.service.ts | reorder 유틸 적용 |
| MODIFY | packages/backend/src/weekly-report/report.service.ts | shared week-utils import |
| MODIFY | packages/backend/src/weekly-report/part-summary.service.ts | shared week-utils import |
| MODIFY | packages/backend/src/weekly-report/carry-forward.service.ts | shared week-utils import |
| MODIFY | packages/backend/src/export/excel.service.ts | shared week-utils import |

- **Acceptance Criteria**:
  - [ ] week-utils.ts 로컬 복사본 제거, shared 패키지로 일원화
  - [ ] pagination 유틸 함수가 admin, team-join, project 서비스에 적용됨
  - [ ] reorder 유틸이 5개 서비스에 적용됨
  - [ ] pagination 유틸 단위 테스트 통과
  - [ ] bun run build 성공
- **Verify**:
  ```bash
  cd packages/backend && bun run test && bun run build
  ```

### WORK-20-TASK-02: Backend N+1 쿼리 및 효율성 개선
- **Depends on**: WORK-20-TASK-01
- **Scope**: timesheet-stats.service.ts의 N+1 패턴 해소, 배치 검증 보강, 승인 서비스 트랜잭션 강화
- **Files**:

| 구분 | 파일 | 작업 |
|------|------|------|
| MODIFY | packages/backend/src/timesheet/timesheet-stats.service.ts | N+1 해소 |
| MODIFY | packages/backend/src/timesheet/timesheet-entry.service.ts | 배치 검증 보강 |
| MODIFY | packages/backend/src/timesheet/timesheet-approval.service.ts | 트랜잭션화, 헬퍼 추출 |

- **Acceptance Criteria**:
  - [ ] getTeamMembersStatus: N번 findUnique → 1번 findMany + Map 매핑
  - [ ] getProjectAllocationMonthly: N번 findFirst → 1번 findMany + Map
  - [ ] getAdminOverview: 팀별 루프 DB 조회 → 일괄 조회 + 메모리 집계
  - [ ] getProjectAllocationSummary: 이중 N+1 → 일괄 조회
  - [ ] batchSave: 첫 번째 엔트리만 검증하는 취약점 수정
  - [ ] adminApprove/projectApprove → 트랜잭션으로 묶음
  - [ ] bun run build 성공
- **Verify**:
  ```bash
  cd packages/backend && bun run build
  ```

### WORK-20-TASK-03: Backend 코드 일원화 (레거시, Enum, 타입 정리)
- **Depends on**: WORK-20-TASK-01
- **Scope**: autoMerge TeamMembership 기반 교체, TimesheetStatus Enum 일원화, as any 제거, ConfigService 주입 정리
- **Files**:

| 구분 | 파일 | 작업 |
|------|------|------|
| MODIFY | packages/backend/src/weekly-report/part-summary.service.ts | autoMerge TeamMembership 기반으로 변경 |
| MODIFY | packages/backend/src/timesheet/timesheet.service.ts | 문자열 → TimesheetStatus Enum |
| MODIFY | packages/backend/src/timesheet/timesheet-stats.service.ts | 문자열 → TimesheetStatus Enum, as any 제거 |
| MODIFY | packages/backend/src/admin/admin.service.ts | ConfigService 주입 정리 |
| MODIFY | packages/backend/src/admin/admin.service.spec.ts | ConfigService mock 추가 |
| MODIFY | packages/backend/src/weekly-report/part-summary.service.spec.ts | autoMerge 테스트 보완 |

- **Acceptance Criteria**:
  - [ ] autoMerge에서 Member.partId 직접 사용 제거, TeamMembership 쿼리로 변경
  - [ ] TimesheetStatus.* Enum 사용 일관화 (문자열 리터럴 0건)
  - [ ] (ts.member as any).jobTitle 제거, select에 jobTitle 명시적 포함
  - [ ] admin.service.spec.ts 테스트 통과
  - [ ] bun run build 성공
- **Verify**:
  ```bash
  cd packages/backend && bun run test && bun run build
  ```

### WORK-20-TASK-04: Frontend 중복 코드 및 타입 정리
- **Depends on**: WORK-20-TASK-02, WORK-20-TASK-03
- **Scope**: TimesheetPopup 공통 컴포넌트 분리, inline useQuery 커스텀 훅으로 교체, any 타입 제거
- **Files**:

| 구분 | 파일 | 작업 |
|------|------|------|
| CREATE | packages/frontend/src/components/ui/TimesheetDetailPopup.tsx | 공통 시간표 상세 팝업 컴포넌트 |
| MODIFY | packages/frontend/src/hooks/useTimesheet.ts | useTimesheetDetail 훅 추가 |
| MODIFY | packages/frontend/src/pages/TeamTimesheetReview.tsx | 공통 컴포넌트 사용 |
| MODIFY | packages/frontend/src/pages/MyTimesheet.tsx | dateToString 인라인 함수 제거 |
| MODIFY | packages/frontend/src/hooks/useTeams.ts | any[] 제거, MyTeamItem 타입 정의 |
| MODIFY | packages/frontend/src/api/team.api.ts | MyTeamItem 타입 export |

- **Acceptance Criteria**:
  - [ ] TeamTimesheetReview.tsx 내부 TimesheetPopup 컴포넌트 → 공통 컴포넌트로 분리
  - [ ] inline useQuery → useTimesheetDetail(id) 훅으로 교체
  - [ ] MyTimesheet.tsx의 dateToString 인라인 함수 제거
  - [ ] useMyTeams의 as any[] 제거, MyTeamItem 타입 사용
  - [ ] bun run build 성공, bun run test 통과
- **Verify**:
  ```bash
  cd packages/frontend && bun run build && bun run test
  ```

### WORK-20-TASK-05: 시간표 서비스 테스트 코드 작성
- **Depends on**: WORK-20-TASK-02, WORK-20-TASK-03
- **Scope**: WORK-18~19에서 추가된 시간표 4개 서비스의 핵심 비즈니스 로직 단위 테스트 작성
- **Files**:

| 구분 | 파일 | 작업 |
|------|------|------|
| CREATE | packages/backend/src/timesheet/timesheet.service.spec.ts | 생성 및 제출 테스트 |
| CREATE | packages/backend/src/timesheet/timesheet-entry.service.spec.ts | 저장 및 배치 저장 테스트 |
| CREATE | packages/backend/src/timesheet/timesheet-approval.service.spec.ts | 승인/반려 테스트 |
| CREATE | packages/backend/src/timesheet/timesheet-stats.service.spec.ts | 통계 조회 테스트 |

- **Acceptance Criteria**:
  - [ ] TimesheetService: create (이미 존재 시 기존 반환), submit (검증 실패 에러, 성공 시 SUBMITTED) 테스트
  - [ ] TimesheetEntryService: saveEntry (소유권 검증, SUBMITTED 수정 불가), batchSave (timesheetId 기반 검증) 테스트
  - [ ] TimesheetApprovalService: leaderApprove (SUBMITTED → APPROVED), leaderReject (comment 필수), batchLeaderApprove 테스트
  - [ ] TimesheetStatsService: getTeamMembersStatus 기본 동작 테스트
  - [ ] 전체 spec 파일 bun run test 통과
- **Verify**:
  ```bash
  cd packages/backend && bun run test
  ```
