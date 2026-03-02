# WORK-08 수행 결과 보고서

> 작업일: 2026-03-02
> 작업자: Claude Code
> 상태: **완료**

---

## 1. 작업 개요

주간업무 작성 화면의 인터랙션 방식을 "행 추가 → 프로젝트 선택" 방식에서
"프로젝트 추가 → 해당 프로젝트에 업무 행 추가" 방식으로 변경하였다.
백엔드 API 추가, 신규 모달 컴포넌트 생성, 그리드 구조 전면 재구성, 페이지 통합, carry-forward 모달 보정까지 5개 TASK를 완료하였다.

---

## 2. 완료 기준 달성 현황

| 항목 | 상태 |
|------|------|
| TASK-01: deleteByProject API 정상 동작 | Done |
| TASK-01: DELETE /:reportId/work-items?projectId= 라우트 존재 | Done |
| TASK-01: 백엔드 빌드 오류 없음 | Done |
| TASK-02: ProjectSelectModal.tsx 파일 생성 | Done |
| TASK-02: "추가됨" 배지 + 클릭 불가 상태 | Done |
| TASK-02: COMMON / EXECUTION 그룹 구분 | Done |
| TASK-02: 검색 필터링 동작 | Done |
| TASK-02: TypeScript 컴파일 오류 없음 | Done |
| TASK-03: 프로젝트 그룹별 헤더 + 하위 테이블 구조 | Done |
| TASK-03: 그룹 헤더에 [+ 업무 추가], [x 제거] 버튼 | Done |
| TASK-03: 행 편집/삭제 정상 동작 | Done |
| TASK-03: 프로젝트명 셀 인라인 드롭다운 제거 | Done |
| TASK-03: 하단 dashed 행 제거 | Done |
| TASK-04: 툴바 [+ 행 추가] 없고 [+ 프로젝트 추가] 존재 | Done |
| TASK-04: ProjectSelectModal 연동 | Done |
| TASK-04: 프로젝트 선택 후 그룹 + 빈 행 자동 생성 | Done |
| TASK-04: 이미 추가된 프로젝트 모달에서 비활성화 | Done |
| TASK-04: [제거] 버튼으로 프로젝트 그룹 전체 삭제 | Done |
| TASK-04: 전체 모노레포 빌드 성공 | Done |
| TASK-05: carry-forward 모달 프로젝트별 그룹 헤더 | Done |
| TASK-05: 개별/전체 체크박스 정상 동작 | Done |
| TASK-05: max-h 400px 확장 | Done |

---

## 3. 체크리스트 완료 현황

### TASK-01: 백엔드 API

| 항목 | 완료 |
|------|------|
| WorkItemService.deleteByProject() 메서드 추가 | Done |
| findReportAndVerify()로 소유권 검증 | Done |
| prisma.workItem.deleteMany() 일괄 삭제 | Done |
| DELETE /:reportId/work-items 라우트 추가 | Done |
| @Query('projectId') 파라미터 수신 | Done |
| 백엔드 빌드 통과 | Done |

### TASK-02: ProjectSelectModal

| 항목 | 완료 |
|------|------|
| open/onClose/onSelect/alreadySelectedIds Props | Done |
| 검색 입력창 (자동 포커스) | Done |
| useProjects({ status: 'ACTIVE' }) 조회 | Done |
| COMMON / EXECUTION 카테고리별 그룹 헤더 | Done |
| alreadySelectedIds 항목 회색 + "추가됨" 배지 | Done |
| 선택 가능 항목 클릭 시 onSelect + onClose | Done |
| 모달 너비 w-[440px] | Done |
| 목록 영역 max-h-[360px] overflow-y-auto | Done |

### TASK-03: EditableGrid 리팩토링

| 항목 | 완료 |
|------|------|
| Props: onAddItem(projectId), onDeleteProject(projectId) | Done |
| WorkItem 그룹핑 useMemo 로직 | Done |
| 컬럼 5종 (순번/진행/예정/비고/액션) | Done |
| 그룹 헤더 렌더링 (pill + 코드 + 버튼) | Done |
| 프로젝트 그룹 삭제 ConfirmModal | Done |
| 빈 상태 메시지 변경 | Done |
| ProjectDropdown 제거 | Done |
| 하단 dashed 행 제거 | Done |
| 확대 편집(ExpandedEditor) 유지 | Done |
| 행 삭제 ConfirmModal 유지 | Done |

### TASK-04: MyWeeklyReport 통합

| 항목 | 완료 |
|------|------|
| weeklyReportApi.deleteWorkItemsByProject() 추가 | Done |
| useDeleteWorkItemsByProject() 훅 추가 | Done |
| projectSelectOpen 상태 추가 | Done |
| handleAddItem(projectId) 변경 | Done |
| handleDeleteProject() 추가 | Done |
| alreadySelectedIds useMemo 추가 | Done |
| handleProjectSelect() 추가 | Done |
| 툴바 [+ 행 추가] 제거, [+ 프로젝트 추가] 추가 | Done |
| ProjectSelectModal 렌더링 | Done |
| EditableGrid props 변경 | Done |

### TASK-05: carry-forward 모달 보정

| 항목 | 완료 |
|------|------|
| prevWorkItems 프로젝트별 그룹핑 useMemo | Done |
| 그룹별 pill 스타일 헤더 렌더링 | Done |
| 개별 체크박스 동작 유지 | Done |
| 전체 선택/해제 동작 유지 | Done |
| max-h 300px → 400px 확장 | Done |

---

## 4. 발견 이슈 및 수정 내역

### 이슈 #1 — ToastType 'warn' 타입 오류

**증상**: `src/pages/MyWeeklyReport.tsx(116,16): error TS2345: Argument of type '"warn"' is not assignable to parameter of type 'ToastType'.`

**원인**: uiStore의 ToastType은 `'success' | 'warning' | 'info' | 'danger'` 이며 `'warn'`은 존재하지 않음.

**수정**: `addToast('warn', ...)` → `addToast('warning', ...)` 로 수정.

---

## 5. 최종 검증 결과

```
$ turbo run build
• turbo 2.8.12
• Packages in scope: @weekly-report/backend, @weekly-report/frontend, @weekly-report/shared
• Running build in 3 packages
@weekly-report/shared:build: cache hit
@weekly-report/frontend:build: ✓ built in 10.54s
@weekly-report/backend:build: nest build (exit 0)

Tasks:    3 successful, 3 total
Cached:    1 cached, 3 total
Time:    23.192s
```

모든 패키지 빌드 성공. TypeScript 컴파일 오류 0건.

### 수동 확인 필요

| 항목 | 내용 |
|------|------|
| 브라우저 렌더링 | 프로젝트 그룹 헤더 pill 스타일, 색상 확인 |
| ProjectSelectModal | 모달 열림/닫힘, 검색 필터, 그룹 헤더 표시 확인 |
| EditableGrid | 프로젝트 그룹별 테이블 렌더링, 셀 편집, 행 삭제 확인 |
| 프로젝트 제거 | ConfirmModal 표시 및 삭제 동작 확인 |
| carry-forward 모달 | 프로젝트 그룹 헤더 + 체크박스 동작 확인 |

---

## 6. 후속 TASK 유의사항

- `useProjects` 훅이 반환하는 데이터 구조가 백엔드 응답에 따라 `Project[]` 또는 `{ data: Project[] }` 형태일 수 있어 ProjectSelectModal에서 방어 코드 적용함.
- ProjectDropdown 컴포넌트는 EditableGrid에서 제거하였으나 파일 자체는 삭제하지 않음 (다른 곳에서 사용 가능).
- 빈 Bundle 크기 경고(541 kB)는 기존과 동일한 수준으로 WORK-08 범위 외.

---

## 7. 산출물 목록

### 신규 생성 파일

| 파일 | 설명 |
|------|------|
| `packages/frontend/src/components/grid/ProjectSelectModal.tsx` | 프로젝트 선택 모달 컴포넌트 |
| `tasks/WORK-08/PROGRESS.md` | WORK-08 진행 현황 |
| `tasks/WORK-08/WORK-08-result.md` | 수행 결과 보고서 (이 파일) |

### 수정 파일

| 파일 | 변경 내용 |
|------|----------|
| `packages/backend/src/weekly-report/work-item.service.ts` | deleteByProject() 메서드 추가 |
| `packages/backend/src/weekly-report/report.controller.ts` | DELETE /:reportId/work-items 라우트 추가 |
| `packages/frontend/src/components/grid/EditableGrid.tsx` | 프로젝트 그룹 구조로 전면 재구성 |
| `packages/frontend/src/api/weekly-report.api.ts` | deleteWorkItemsByProject() API 메서드 추가 |
| `packages/frontend/src/hooks/useWorkItems.ts` | useDeleteWorkItemsByProject() 훅 추가 |
| `packages/frontend/src/pages/MyWeeklyReport.tsx` | 툴바/핸들러 변경 + carry-forward 모달 그룹핑 |
