# WORK-20-TASK-03: Backend 코드 일원화 (레거시, Enum, 타입 정리)

> **Phase:** 2
> **선행 TASK:** WORK-20-TASK-01
> **목표:** part-summary.service.ts의 autoMerge를 TeamMembership 기반으로 교체하고, timesheet 서비스 전반에서 문자열 리터럴 대신 TimesheetStatus Enum을 사용하도록 일원화하며, `as any` 캐스팅을 제거하고 admin.service.ts의 ConfigService 주입을 정리한다.

---

## Step 1 — 계획서

### 1.1 작업 범위

`part-summary.service.ts`의 `autoMerge` 메서드는 `Member.partId` 컬럼을 직접 사용하는 레거시 방식으로 구현되어 있다. 동일 파일의 `loadMemberRows`는 이미 `TeamMembership` 기반으로 올바르게 구현되어 있으므로, `autoMerge`도 동일한 방식으로 통일한다.

`timesheet.service.ts`와 `timesheet-stats.service.ts`는 `'DRAFT'`, `'SUBMITTED'`, `'APPROVED'` 등의 문자열 리터럴을 직접 사용하고 있으나, `timesheet-approval.service.ts`는 `TimesheetStatus.SUBMITTED` Enum을 올바르게 사용 중이다. 파일 간 불일치를 해소하여 모두 Enum을 사용하도록 통일한다.

`timesheet-stats.service.ts`의 `(ts.member as any).jobTitle` 캐스팅은 Prisma select에 `jobTitle` 필드가 누락되어 발생한 문제다. select에 `jobTitle`을 명시적으로 포함하여 `as any` 없이 타입 안전하게 접근한다.

`admin.service.ts`는 `ConfigService`가 주입되어 있으나 `DEFAULT_PASSWORD` 하나에만 사용되어 있고, `admin.service.spec.ts`에서 `ConfigService` mock이 누락되어 테스트 실패 가능성이 있다. spec 파일에 mock을 추가하여 테스트를 안정화한다.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| MODIFY | packages/backend/src/weekly-report/part-summary.service.ts |
| MODIFY | packages/backend/src/timesheet/timesheet.service.ts |
| MODIFY | packages/backend/src/timesheet/timesheet-stats.service.ts |
| MODIFY | packages/backend/src/admin/admin.service.ts |
| MODIFY | packages/backend/src/admin/admin.service.spec.ts |
| MODIFY | packages/backend/src/weekly-report/part-summary.service.spec.ts |

---

## Step 2 — 체크리스트

### 2.1 part-summary.service.ts — autoMerge TeamMembership 기반으로 전환

- [ ] `autoMerge` 메서드 현재 구현 확인: `Member.partId` 직접 사용 위치 파악 (line ~88-89)
- [ ] `loadMemberRows` 메서드의 TeamMembership 쿼리 패턴 파악 (참조용)
- [ ] `autoMerge` 메서드 수정: `member.partId` 대신 `TeamMembership.where({ partId, teamId })` 기반으로 대상 멤버 조회
- [ ] `autoMerge` 수정 시 teamId 파라미터 필요 여부 확인 및 처리
- [ ] 수정 후 기존 `autoMerge` 동작(파트 내 멤버의 주간업무 취합)이 동일하게 유지되는지 검증

### 2.2 part-summary.service.spec.ts — autoMerge 테스트 보완

- [ ] 기존 spec 파일 확인: autoMerge 관련 테스트 케이스 현황 파악
- [ ] TeamMembership 기반으로 변경된 autoMerge 동작을 검증하는 테스트 추가/수정
  - 정상 케이스: TeamMembership에 속한 멤버들의 주간업무가 취합되는지
  - 다른 파트 멤버는 포함되지 않는지
- [ ] `bun run test --testPathPattern="part-summary"` 통과 확인

### 2.3 timesheet.service.ts — TimesheetStatus Enum 일원화

- [ ] 파일 내 문자열 리터럴 사용 위치 전체 파악: `'DRAFT'`, `'SUBMITTED'`, `'APPROVED'`, `'REJECTED'` 검색
- [ ] `TimesheetStatus` Enum import 추가 (이미 있으면 생략)
- [ ] 모든 문자열 리터럴을 `TimesheetStatus.DRAFT`, `TimesheetStatus.SUBMITTED` 등으로 교체
- [ ] 교체 후 Prisma 타입 호환성 확인 (where 조건, create data 등)

### 2.4 timesheet-stats.service.ts — TimesheetStatus Enum 일원화 및 as any 제거

- [ ] 파일 내 문자열 리터럴 사용 위치 전체 파악
- [ ] `TimesheetStatus` Enum import 추가 (이미 있으면 생략)
- [ ] 모든 문자열 리터럴을 Enum으로 교체
- [ ] `(ts.member as any).jobTitle` 위치 확인 (line ~196)
- [ ] 해당 Prisma 쿼리의 `select` 절에 `member: { select: { ..., jobTitle: true } }` 추가
- [ ] `as any` 캐스팅 제거 후 타입 오류 없는지 확인

### 2.5 admin.service.ts — ConfigService 주입 정리

- [ ] `ConfigService` 사용 현황 파악: DEFAULT_PASSWORD 외 다른 사용처 확인
- [ ] DEFAULT_PASSWORD 하드코딩 또는 ConfigService 주입 방식 결정
  - ConfigService 유지가 적절하면 그대로 두되, spec mock만 추가
  - 상수 하드코딩이 적절하면 ConfigService 의존성 제거
- [ ] 결정에 따라 admin.service.ts 수정

### 2.6 admin.service.spec.ts — ConfigService mock 추가

- [ ] 기존 spec 파일 확인: 현재 providers 배열에 ConfigService 포함 여부 파악
- [ ] ConfigService mock 추가:
  ```typescript
  {
    provide: ConfigService,
    useValue: { get: jest.fn().mockReturnValue('defaultPassword123') },
  }
  ```
- [ ] `bun run test --testPathPattern="admin.service"` 통과 확인

### 2.7 테스트 및 빌드 검증

- [ ] `cd packages/backend && bun run test` 전체 통과 확인
- [ ] `cd packages/backend && bun run build` 빌드 오류 0건 확인
- [ ] 문자열 리터럴 잔존 여부 점검: `grep -rn "'DRAFT'\|'SUBMITTED'\|'APPROVED'" packages/backend/src/timesheet` 결과 0건

---

## Step 3 — 완료 검증

```bash
# 1. autoMerge에서 레거시 partId 직접 사용 잔존 여부 확인 (결과 없어야 통과)
grep -n "member\.partId\|where.*partId.*member" packages/backend/src/weekly-report/part-summary.service.ts

# 2. timesheet 서비스에 문자열 리터럴 잔존 여부 확인 (결과 없어야 통과)
grep -rn "'DRAFT'\|'SUBMITTED'\|'APPROVED'\|'REJECTED'" packages/backend/src/timesheet/timesheet.service.ts packages/backend/src/timesheet/timesheet-stats.service.ts

# 3. as any 캐스팅 잔존 여부 확인
grep -n "as any" packages/backend/src/timesheet/timesheet-stats.service.ts

# 4. 전체 테스트 및 빌드
cd packages/backend && bun run test && bun run build
```
