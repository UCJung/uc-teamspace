# WORK-20-TASK-05: 시간표 서비스 테스트 코드 작성

> **Phase:** 3
> **선행 TASK:** WORK-20-TASK-02, WORK-20-TASK-03
> **목표:** WORK-18~19에서 추가된 시간표 관련 4개 서비스(timesheet, timesheet-entry, timesheet-approval, timesheet-stats)의 핵심 비즈니스 로직에 대한 단위 테스트를 작성하여 기능 회귀를 방지한다.

---

## Step 1 — 계획서

### 1.1 작업 범위

WORK-18~19에서 추가된 시간표 5개 서비스 중 4개(`timesheet.service.ts`, `timesheet-entry.service.ts`, `timesheet-approval.service.ts`, `timesheet-stats.service.ts`)에 spec 파일이 전혀 없다. 기존 서비스들(auth, admin, project, team-join, member, report, work-item, carry-forward, part-summary)은 모두 spec이 존재하는 것과 일관성을 맞춘다.

각 서비스의 핵심 비즈니스 로직(생성, 제출, 권한 검증, 상태 전환, 통계 조회)을 단위 테스트로 커버한다. PrismaService는 mock으로 대체한다. TASK-02에서 개선된 N+1 해소 로직과 TASK-03에서 수정된 Enum 일원화가 반영된 코드를 기준으로 작성한다.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| CREATE | packages/backend/src/timesheet/timesheet.service.spec.ts |
| CREATE | packages/backend/src/timesheet/timesheet-entry.service.spec.ts |
| CREATE | packages/backend/src/timesheet/timesheet-approval.service.spec.ts |
| CREATE | packages/backend/src/timesheet/timesheet-stats.service.spec.ts |

---

## Step 2 — 체크리스트

### 2.1 테스트 공통 설정 준비

- [ ] 기존 spec 파일(예: `admin.service.spec.ts`, `report.service.spec.ts`) 패턴 참조
- [ ] PrismaService mock 패턴 파악: `{ provide: PrismaService, useValue: { ... } }` 방식
- [ ] 각 spec에서 공통으로 사용할 Prisma mock 구조 설계
- [ ] NestJS Testing 모듈 설정 패턴 확인 (`Test.createTestingModule`)

### 2.2 timesheet.service.spec.ts 작성

- [ ] `TimesheetService` 테스트 모듈 설정: PrismaService mock 포함
- [ ] **create 테스트**:
  - 시나리오 1: 해당 yearMonth에 시간표가 없으면 새로 생성하여 반환
  - 시나리오 2: 이미 존재하는 yearMonth 시간표가 있으면 기존 것을 반환 (중복 생성 방지)
- [ ] **submit 테스트**:
  - 시나리오 1: DRAFT 상태 → SUBMITTED 성공
  - 시나리오 2: 이미 SUBMITTED/APPROVED 상태 → 에러 반환 (이미 제출됨)
  - 시나리오 3: 존재하지 않는 timesheetId → NotFoundException 또는 BusinessException
- [ ] **소유권 검증 테스트** (있는 경우):
  - 본인 시간표가 아닌 경우 ForbiddenException 반환

### 2.3 timesheet-entry.service.spec.ts 작성

- [ ] `TimesheetEntryService` 테스트 모듈 설정
- [ ] **saveEntry 테스트**:
  - 시나리오 1: 소유자가 DRAFT 시간표에 정상 저장
  - 시나리오 2: SUBMITTED 상태 시간표에 수정 시도 → 에러 반환 (수정 불가)
  - 시나리오 3: 타인 소유 시간표에 저장 시도 → ForbiddenException
- [ ] **batchSave 테스트** (TASK-02 개선 내용 반영):
  - 시나리오 1: timesheetId 기반 일괄 소유권 검증 — 모두 본인 소유이면 저장 성공
  - 시나리오 2: 배치 중 하나라도 타인 timesheetId가 포함되면 전체 거부
  - 시나리오 3: SUBMITTED 상태인 timesheetId가 배치에 포함되면 전체 거부

### 2.4 timesheet-approval.service.spec.ts 작성

- [ ] `TimesheetApprovalService` 테스트 모듈 설정
- [ ] **leaderApprove 테스트**:
  - 시나리오 1: SUBMITTED → LEADER_APPROVED 성공
  - 시나리오 2: DRAFT 상태 시간표에 승인 시도 → 에러 (SUBMITTED 상태 아님)
  - 시나리오 3: 존재하지 않는 ID → 에러
- [ ] **leaderReject 테스트**:
  - 시나리오 1: comment 없이 거부 시도 → 에러 (comment 필수)
  - 시나리오 2: comment 포함하여 정상 거부 → REJECTED 상태
  - 시나리오 3: SUBMITTED 상태 아닌 경우 거부 시도 → 에러
- [ ] **batchLeaderApprove 테스트**:
  - 시나리오 1: 여러 SUBMITTED 시간표 일괄 승인 → 모두 LEADER_APPROVED
  - 시나리오 2: 일부가 SUBMITTED 상태 아닌 경우의 처리 (전체 실패 또는 부분 성공 정책 확인)
- [ ] **findAndVerifySubmitted 헬퍼 테스트** (private이면 간접 테스트):
  - SUBMITTED 상태 시간표 조회 성공
  - 존재하지 않으면 에러

### 2.5 timesheet-stats.service.spec.ts 작성

- [ ] `TimesheetStatsService` 테스트 모듈 설정
- [ ] **getTeamMembersStatus 테스트** (TASK-02 N+1 개선 반영):
  - 시나리오 1: 팀원 목록과 yearMonth를 받아 각 팀원의 시간표 상태 반환
  - 시나리오 2: 시간표가 없는 팀원은 null/기본값 반환
  - 핵심 검증: `findMany` 1회 호출 여부 (N+1이 아님)
- [ ] **getProjectAllocationMonthly 테스트** (간단한 케이스):
  - 투입 인원의 시간표 조회 후 프로젝트별 집계 반환
- [ ] Mock Prisma 응답 데이터 설계 (팀원, 시간표, 프로젝트 데이터)

### 2.6 전체 테스트 통과 확인

- [ ] 4개 spec 파일 모두 `bun run test` 시 통과
- [ ] 기존 spec 파일들이 영향받지 않는지 확인 (전체 테스트 suite 통과)
- [ ] 각 서비스별 핵심 비즈니스 로직 커버리지 확인

---

## Step 3 — 완료 검증

```bash
# 1. 4개 spec 파일 생성 확인
ls packages/backend/src/timesheet/timesheet.service.spec.ts
ls packages/backend/src/timesheet/timesheet-entry.service.spec.ts
ls packages/backend/src/timesheet/timesheet-approval.service.spec.ts
ls packages/backend/src/timesheet/timesheet-stats.service.spec.ts

# 2. 시간표 서비스 테스트만 실행
cd packages/backend && bun run test --testPathPattern="timesheet"

# 3. 전체 테스트 suite 실행 (기존 테스트 회귀 없음 확인)
cd packages/backend && bun run test

# 4. 테스트 커버리지 확인 (선택사항)
cd packages/backend && bun run test --coverage 2>/dev/null || echo "커버리지 미지원 시 생략"
```
