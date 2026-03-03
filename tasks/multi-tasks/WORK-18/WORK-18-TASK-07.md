# WORK-18-TASK-07: 프론트엔드 — 팀장/PM/관리자 페이지

> **Phase:** 5
> **선행 TASK:** TASK-05, TASK-06
> **목표:** 팀장 취합/승인, PM 투입현황, 관리자 현황 페이지를 구현한다

---

## Step 1 — 계획서

### 1.1 작업 범위

팀장용 시간표 취합 조회/승인 페이지, PM용 프로젝트 투입현황 페이지, 관리자용 전체 현황/최종 승인/엑셀 페이지를 구현한다. 팀원×프로젝트 횡스크롤 매트릭스 테이블을 포함한다.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| Page | `src/pages/TeamTimesheetReview.tsx` — 팀장 취합/승인 |
| Page | `src/pages/ProjectAllocation.tsx` — PM 투입현황 |
| Page | `src/pages/admin/AdminTimesheetOverview.tsx` — 관리자 현황 |
| API | `src/api/timesheet.api.ts` — 팀장/PM/관리자 API 추가 |
| Hook | `src/hooks/useTimesheet.ts` — 관련 훅 추가 |
| Router | `src/App.tsx` — 라우트 3개 추가 |
| Layout | `src/components/layout/Sidebar.tsx` — 역할 기반 메뉴 추가 |

---

## Step 2 — 체크리스트

### 2.1 API + Hook 확장

- [ ] `timesheet.api.ts`: getTeamSummary(teamId, yearMonth)
- [ ] `timesheet.api.ts`: getTeamMembersStatus(teamId, yearMonth)
- [ ] `timesheet.api.ts`: approveTimesheet(id), rejectTimesheet(id, comment)
- [ ] `timesheet.api.ts`: getProjectAllocationMonthly(projectId, yearMonth)
- [ ] `timesheet.api.ts`: getProjectAllocationYearly(projectId, year)
- [ ] `timesheet.api.ts`: approveProjectTimesheet(projectId, yearMonth)
- [ ] `timesheet.api.ts`: getAdminOverview(yearMonth), adminApprove(yearMonth), adminExport(yearMonth)
- [ ] `useTimesheet.ts`: useTeamSummary, useTeamMembersStatus, useApproveTimesheet, useRejectTimesheet
- [ ] `useTimesheet.ts`: useProjectAllocation, useApproveProjectTimesheet
- [ ] `useTimesheet.ts`: useAdminTimesheetOverview, useAdminApprove

### 2.2 TeamTimesheetReview.tsx

- [ ] 월 선택 UI
- [ ] 팀원 제출현황 목록 (이름, 상태, 총근무시간, 제출일)
- [ ] 팀원×프로젝트 투입 매트릭스 테이블 (횡스크롤)
  - 행: 팀원명
  - 열: 프로젝트명별 투입시간/비율
- [ ] 개별 시간표 승인/반려 버튼 (반려 시 사유 입력 모달)

### 2.3 ProjectAllocation.tsx

- [ ] 월간/연간 탭 전환
- [ ] 월간: 프로젝트명 rowspan + 투입인원명/시간/비율 테이블
- [ ] 연간: 1~12월 열 헤더, 행=프로젝트-인원, 셀=시간/비율
- [ ] 월간 승인 버튼

### 2.4 AdminTimesheetOverview.tsx

- [ ] 월 선택 UI
- [ ] 팀별 제출/승인 현황 요약 카드
- [ ] 전체 프로젝트별·인원별 투입시간/비율 테이블
- [ ] 최종 승인 버튼 (모든 팀+PM 승인 완료 시만 활성)
- [ ] 엑셀 다운로드 버튼

### 2.5 라우팅 + 사이드바

- [ ] `/timesheet/team-review` → TeamTimesheetReview (LEADER 권한)
- [ ] `/timesheet/project-allocation` → ProjectAllocation (PM, managedProjects 존재 시)
- [ ] `/admin/timesheet` → AdminTimesheetOverview (ADMIN 권한)
- [ ] 사이드바 메뉴 역할 기반 표시

---

## Step 3 — 완료 검증

```bash
# 1. 프론트엔드 빌드
cd packages/frontend && bun run build

# 2. 프론트엔드 린트
cd packages/frontend && bun run lint

# 3. 전체 빌드
cd ../.. && bun run build

# 4. 수동 확인 필요 항목 (브라우저)
# - LEADER 로그인 → /timesheet/team-review → 매트릭스 횡스크롤 확인
# - 승인/반려 버튼 동작 확인
# - ADMIN 로그인 → /admin/timesheet → 현황 표시 확인
```
