# WORK-18-TASK-02: 공유 타입 + 유틸리티 + 상수

> **Phase:** 2
> **선행 TASK:** TASK-01
> **목표:** shared 패키지에 타임시트 타입/유틸을 추가하고 프론트엔드 라벨 상수를 확장한다

---

## Step 1 — 계획서

### 1.1 작업 범위

Prisma 스키마와 동기화된 TypeScript 타입을 shared 패키지에 정의한다. 달력 생성·주말 판별 등 타임시트 전용 유틸 함수를 추가하고, 프론트엔드에서 사용할 라벨/배리언트 상수를 확장한다.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| Shared 타입 | `packages/shared/types/timesheet.ts` — 타임시트 관련 인터페이스·타입 |
| Shared 유틸 | `packages/shared/constants/timesheet-utils.ts` — yearMonth 유틸, 달력 생성, 근무일 계산 |
| Shared 수정 | `packages/shared/types/team.ts` — Member에 position, jobTitle 추가 |
| Shared 수정 | `packages/shared/types/project.ts` — Project에 managerId, department, description 추가 |
| Shared 수정 | `packages/shared/index.ts` — 새 export 추가 |
| Frontend | `packages/frontend/src/constants/labels.ts` — 라벨 상수 확장 |

---

## Step 2 — 체크리스트

### 2.1 shared/types/timesheet.ts

- [ ] `Position` 타입 (9개 값)
- [ ] `AttendanceType` 타입 (5개 값)
- [ ] `WorkType` 타입 (4개 값)
- [ ] `TimesheetStatus` 타입 (4개 값)
- [ ] `ApprovalType` 타입 (3개 값)
- [ ] `MonthlyTimesheet` 인터페이스
- [ ] `TimesheetEntry` 인터페이스
- [ ] `TimesheetWorkLog` 인터페이스
- [ ] `TimesheetApproval` 인터페이스
- [ ] `TimesheetWithEntries` (조인 응답 타입)
- [ ] `TeamTimesheetSummaryRow` (팀 요약 행)
- [ ] `ProjectAllocationRow` (프로젝트 투입 행)
- [ ] `AdminTimesheetOverviewRow` (관리자 현황 행)

### 2.2 shared/constants/timesheet-utils.ts

- [ ] `getYearMonth(date: Date): string` — "2026-03" 형식 반환
- [ ] `parseYearMonth(yearMonth: string): { year: number; month: number }`
- [ ] `getMonthDays(yearMonth: string): Date[]` — 해당 월 전체 날짜 배열
- [ ] `isWeekend(date: Date): boolean` — 토/일 판별
- [ ] `getWorkingDays(yearMonth: string): number` — 주말 제외 근무일수
- [ ] `getRequiredHours(attendance: AttendanceType): number` — 근무=8, 반차=4, 연차/공휴일=0

### 2.3 기존 Shared 타입 수정

- [ ] `types/team.ts`: Member 인터페이스에 `position?: string`, `jobTitle?: string` 추가
- [ ] `types/project.ts`: Project 인터페이스에 `managerId?: string`, `department?: string`, `description?: string` 추가
- [ ] `types/project.ts`: ProjectStatus에 `'PENDING'` 추가

### 2.4 shared/index.ts + types/index.ts

- [ ] `types/index.ts`: `export * from './timesheet'` 추가
- [ ] `index.ts`: `export * from './constants/timesheet-utils'` 추가

### 2.5 frontend/constants/labels.ts 확장

- [ ] `POSITION_LABEL` — 9개 직위 한글 라벨
- [ ] `ATTENDANCE_LABEL` — 5개 근태 한글 라벨
- [ ] `WORK_TYPE_LABEL` — 4개 업무방식 한글 라벨
- [ ] `TIMESHEET_STATUS_LABEL` — 4개 상태 한글 라벨
- [ ] `TIMESHEET_STATUS_VARIANT` — 상태별 배지 색상
- [ ] `PROJECT_STATUS_LABEL`에 `PENDING: '승인대기'` 추가

---

## Step 3 — 완료 검증

```bash
# 1. shared 빌드 확인
cd packages/shared && bun run build 2>&1 || echo "shared has no build script, check tsc"

# 2. 전체 빌드 확인 (shared → backend/frontend 의존성)
cd ../.. && bun run build

# 3. TypeScript 타입 체크
cd packages/frontend && bunx tsc --noEmit
cd ../backend && bunx tsc --noEmit
```
