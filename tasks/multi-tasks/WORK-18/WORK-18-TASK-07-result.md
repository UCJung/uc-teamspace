# WORK-18-TASK-07 수행 결과 보고서

> 작업일: 2026-03-04
> 작업자: Claude Code
> 상태: **완료**

---

## 1. 작업 개요

팀장용 시간표 취합/승인 페이지, PM용 프로젝트 투입현황 페이지, 관리자용 전체 현황/최종 승인/엑셀 다운로드 페이지를 구현하였다. 팀원×프로젝트 횡스크롤 매트릭스, 월간/연간 투입현황, 팀별 요약 카드, 역할 기반 사이드바 메뉴를 포함한다.

---

## 2. 완료 기준 달성 현황

| 항목 | 상태 |
|------|------|
| TASK MD 체크리스트 전 항목 완료 | ✅ |
| API 함수 추가 (팀장/PM/관리자) | ✅ |
| Hook 추가 (팀장/PM/관리자) | ✅ |
| TeamTimesheetReview.tsx 구현 | ✅ |
| ProjectAllocation.tsx 구현 | ✅ |
| AdminTimesheetOverview.tsx 구현 | ✅ |
| App.tsx 라우트 3개 추가 | ✅ |
| Sidebar.tsx 역할 기반 메뉴 추가 | ✅ |
| CSS 변수 사용 (HEX 하드코딩 없음) | ✅ |
| 빌드 오류 0건 | ✅ |
| 린트 오류 0건 | ✅ |

---

## 3. 체크리스트 완료 현황

### 2.1 API + Hook 확장

| 항목 | 상태 |
|------|------|
| `timesheet.api.ts`: getTeamMembersStatus | ✅ |
| `timesheet.api.ts`: getTeamSummary | ✅ |
| `timesheet.api.ts`: approveTimesheet, rejectTimesheet | ✅ |
| `timesheet.api.ts`: getProjectAllocationMonthly | ✅ |
| `timesheet.api.ts`: getProjectAllocationYearly | ✅ |
| `timesheet.api.ts`: approveProjectTimesheet | ✅ |
| `timesheet.api.ts`: getAdminOverview, adminApprove, adminExport | ✅ |
| `useTimesheet.ts`: useTeamMembersStatus, useTeamSummary | ✅ |
| `useTimesheet.ts`: useApproveTimesheet, useRejectTimesheet | ✅ |
| `useTimesheet.ts`: useManagedProjects, useProjectAllocationMonthly/Yearly | ✅ |
| `useTimesheet.ts`: useApproveProjectTimesheet | ✅ |
| `useTimesheet.ts`: useAdminTimesheetOverview, useAdminApprove | ✅ |

### 2.2 TeamTimesheetReview.tsx

| 항목 | 상태 |
|------|------|
| 월 선택 UI (ChevronLeft/Right) | ✅ |
| 팀원 제출현황 목록 (이름, 상태, 총근무시간, 제출일 등) | ✅ |
| 팀원×프로젝트 투입 매트릭스 (횡스크롤, sticky 열) | ✅ |
| 개별 승인/반려 버튼 (반려 시 사유 입력 모달) | ✅ |

### 2.3 ProjectAllocation.tsx

| 항목 | 상태 |
|------|------|
| 월간/연간 탭 전환 | ✅ |
| 월간: 투입인원/시간/비율 테이블 + 비율 bar | ✅ |
| 연간: 1~12월 열 헤더, 행=투입시간/인원 | ✅ |
| 월간 승인 버튼 | ✅ |
| 프로젝트 선택 드롭다운 (관리 프로젝트 목록) | ✅ |

### 2.4 AdminTimesheetOverview.tsx

| 항목 | 상태 |
|------|------|
| 월 선택 UI | ✅ |
| 팀별 제출/승인 현황 요약 카드 (4개) | ✅ |
| 전체 팀별 현황 테이블 (진행률 bar 포함) | ✅ |
| 최종 승인 버튼 (팀장 승인 완료 조건부 활성) | ✅ |
| 엑셀 다운로드 버튼 (blob 다운로드) | ✅ |

### 2.5 라우팅 + 사이드바

| 항목 | 상태 |
|------|------|
| `/timesheet/team-review` → TeamTimesheetReview (LEADER/ADMIN) | ✅ |
| `/timesheet/project-allocation` → ProjectAllocation | ✅ |
| `/admin/timesheet` → AdminTimesheetOverview | ✅ |
| Sidebar: LEADER "시간표 취합" 메뉴 (ClipboardCheck) | ✅ |
| Sidebar: PM "프로젝트 투입현황" 메뉴 (BarChart3, managedProjects 존재 시) | ✅ |
| AdminLayout: "근무시간표 관리" 메뉴 (Clock) | ✅ |

---

## 4. 발견 이슈 및 수정 내역

### 이슈 #1 — 사이드바 NavLink 중복 로직

**증상**: MENU_GROUPS 렌더링 시 인라인으로 NavLink를 작성하고, PM 동적 메뉴에서도 동일 패턴이 필요해 중복 발생.

**원인**: 기존 Sidebar 구조가 정적 배열 + 인라인 렌더링으로 되어 있어 동적 메뉴 추가 시 중복 발생.

**수정**: `SidebarNavLink` 헬퍼 컴포넌트를 Sidebar.tsx 내부에 추가하여 재사용. 기존 MENU_GROUPS 렌더링 루프도 SidebarNavLink를 사용하도록 변경.

---

## 5. 최종 검증 결과

### 빌드 결과

```
Tasks:    3 successful, 3 total
Cached:    1 cached, 3 total
Time:    57.065s
✓ built in 35.80s
```

### 린트 결과

```
✖ 7 problems (0 errors, 7 warnings)
```

신규 파일에서 발생한 오류/경고 없음. 기존 경고 7건은 이전부터 존재하던 항목임.

### 수동 확인 필요

| 항목 | 설명 |
|------|------|
| LEADER 로그인 → `/timesheet/team-review` | 팀원 현황 목록 표시, 매트릭스 횡스크롤 동작 확인 |
| 승인/반려 버튼 | 반려 모달 표시, 사유 입력 후 반려 처리 동작 |
| PM 사이드바 메뉴 | managedProjects가 있는 계정으로 로그인 시 "프로젝트 투입현황" 메뉴 표시 |
| `/timesheet/project-allocation` | 월간/연간 탭 전환, 프로젝트 선택 드롭다운 동작 |
| ADMIN → `/admin/timesheet` | 팀별 현황 카드, 최종 승인 버튼 활성 조건 확인 |
| 엑셀 다운로드 | 다운로드 버튼 클릭 시 `.xlsx` 파일 저장 확인 |

---

## 6. 후속 TASK 유의사항

- `ProjectAllocation` 페이지는 `GET /api/v1/projects/managed` 엔드포인트를 사용하여 관리 프로젝트 목록을 조회한다. 해당 엔드포인트는 백엔드에 이미 구현되어 있음.
- PM 메뉴는 `useManagedProjects` 훅 결과가 비어 있으면 표시되지 않는다. 초기 로딩 시 메뉴가 잠깐 없다가 나타날 수 있음 (비동기 데이터 로딩).
- `AdminTimesheetOverview`의 최종 승인 조건은 `teams.every(t => t.leaderApproved === t.submitted)`로 구현됨. 팀원이 0명인 팀은 조건 예외 처리됨.

---

## 7. 산출물 목록

### 수정 파일

| 파일 | 변경 내용 |
|------|-----------|
| `packages/frontend/src/api/timesheet.api.ts` | 팀장/PM/관리자 API 함수 및 타입 추가 |
| `packages/frontend/src/hooks/useTimesheet.ts` | 팀장/PM/관리자 훅 추가 |
| `packages/frontend/src/App.tsx` | 라우트 3개 추가 (team-review, project-allocation, admin/timesheet) |
| `packages/frontend/src/components/layout/Sidebar.tsx` | SidebarNavLink 컴포넌트 추가, 시간표 취합 메뉴 및 PM 동적 메뉴 추가 |
| `packages/frontend/src/components/layout/AdminLayout.tsx` | 근무시간표 관리 메뉴 추가 |

### 신규 생성 파일

| 파일 | 설명 |
|------|------|
| `packages/frontend/src/pages/TeamTimesheetReview.tsx` | 팀장 시간표 취합/승인 페이지 |
| `packages/frontend/src/pages/ProjectAllocation.tsx` | PM 프로젝트 투입현황 페이지 (월간/연간) |
| `packages/frontend/src/pages/admin/AdminTimesheetOverview.tsx` | 관리자 근무시간표 현황/최종승인/엑셀 페이지 |
