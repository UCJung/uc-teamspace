# WORK-08: 주간보고 작성 방식 변경 — 프로젝트 그룹 기반 UI

> Created: 2026-03-02
> Project: 주간업무보고 시스템
> Tech Stack: React 18 + TypeScript, NestJS 11, Prisma 6, TanStack Query v5
> Status: PLANNED
> Tasks: 5

---

## 개요

주간업무 작성 화면의 인터랙션 방식을 **"행 추가 → 프로젝트 선택"** 에서
**"프로젝트 추가 → 해당 프로젝트에 업무 행 추가"** 로 변경한다.


변경 후 화면 구조 (프로젝트 그룹 기반):

  [ + 프로젝트 추가 ]  (툴바 버튼 -> 레이어 팝업으로 프로젝트 선택)

  +-- 프로젝트 A ------------------------------------------+
  |  코드: PRJ-A  [+ 업무 추가]  [프로젝트 제거]          |
  |  +---------------------------------------------------+  |
  |  | #  | 진행업무(한일)  | 예정업무(할일)  | 비고    |  |
  |  | 1  |  ...           |  ...           |  ...    |  |
  |  +---------------------------------------------------+  |
  +----------------------------------------------------------+

---

## 현재 상태 분석

### 데이터 모델
- WorkItem 에 projectId?: string 이 있어 프로젝트가 선택적이다.
- DB 스키마에서 projectId 는 이미 nullable(String?) 이다.
- 한 WeeklyReport 안에 동일 프로젝트의 WorkItem 이 여러 개 존재 가능한 구조.

### 현재 프론트엔드 흐름
1. MyWeeklyReport.tsx — [+ 행 추가] 버튼 클릭 -> handleAddItem() -> projectId: undefined 로 WorkItem 생성
2. EditableGrid.tsx — 각 행의 프로젝트명 셀에 인라인 드롭다운(ProjectDropdown)으로 프로젝트를 선택
3. ProjectDropdown.tsx — ACTIVE 상태 프로젝트를 COMMON/EXECUTION 그룹으로 보여주는 플로팅 드롭다운

### 현재 백엔드 흐름
- POST /weekly-reports/:id/work-items — projectId 는 선택적(optional)
- PATCH /work-items/:id — projectId 포함 부분 업데이트 가능
- GET /weekly-reports/me?week= — workItems 에 project { id, name, code } include 됨

### 변경 영향 범위
- 프론트엔드: 대부분의 변경이 집중됨 (그리드 구조, 툴바, 신규 모달)
- 백엔드: projectId 가 이미 optional 이므로 스키마 변경 불필요. 프로젝트별 WorkItem 일괄 삭제 API 신규 추가 필요.

---

## 변경 사항 요약

| 구분 | 변경 전 | 변경 후 |
|------|---------|---------|
| 행 추가 | [+ 행 추가] -> projectId 없는 빈 행 생성 | 삭제 (그룹 내 [+ 업무 추가]로 대체) |
| 프로젝트 선택 | 각 행 첫 셀 인라인 드롭다운 | 삭제 |
| 프로젝트 추가 | 없음 | [+ 프로젝트 추가] 버튼 -> 레이어 팝업 |
| 그리드 레이아웃 | 단일 테이블 (프로젝트명 컬럼 포함) | 프로젝트별 그룹 테이블 |
| 중복 방지 | 없음 | 이미 추가된 프로젝트는 팝업에서 비활성화 |
| 프로젝트 제거 | 없음 | 그룹 헤더의 [제거] -> WorkItem 전체 삭제 확인 |
| 컬럼 구성 | 프로젝트명/코드/진행/예정/비고/액션 | 순번/진행/예정/비고/액션 |
| 새 업무 추가 | projectId 없이 빈 행 생성 | 그룹 헤더 [+ 업무 추가] -> projectId 포함 빈 행 |

---

## TASK 목록

| TASK | 제목 | 의존성 | 상태 |
|------|------|--------|------|
| WORK-08-TASK-01 | 백엔드: 프로젝트별 WorkItem 일괄 삭제 API 추가 | 없음 | pending |
| WORK-08-TASK-02 | 신규 컴포넌트: ProjectSelectModal | 없음 | pending |
| WORK-08-TASK-03 | EditableGrid 리팩토링: 프로젝트 그룹 구조로 전환 | TASK-02 | pending |
| WORK-08-TASK-04 | MyWeeklyReport 페이지 통합: 툴바 및 흐름 변경 | TASK-01, TASK-03 | pending |
| WORK-08-TASK-05 | 전주 불러오기 모달 UI 보정: 프로젝트 그룹핑 | TASK-04 | pending |

---

## TASK 상세

---

### WORK-08-TASK-01: 백엔드 — 프로젝트별 WorkItem 일괄 삭제 API 추가

**목적**

그룹 헤더의 "프로젝트 제거" 기능이 호출할 API가 없으므로,
DELETE /api/v1/weekly-reports/:reportId/work-items?projectId=:projectId 엔드포인트를 추가한다.

**수정 대상 파일**

| 경로 | 액션 | 설명 |
|------|------|------|
| packages/backend/src/weekly-report/work-item.service.ts | MODIFY | deleteByProject() 메서드 추가 |
| packages/backend/src/weekly-report/report.controller.ts | MODIFY | DELETE /:reportId/work-items 라우트 추가 |

**상세 작업 내용**

1. work-item.service.ts 에 deleteByProject(reportId, projectId, memberId) 메서드를 추가한다.
   - 기존 findReportAndVerify 를 재사용하여 WeeklyReport 소유권 확인
   - prisma.workItem.deleteMany({ where: { weeklyReportId: reportId, projectId } }) 로 일괄 삭제
   - 반환값: { deleted: number }

2. report.controller.ts 에 DELETE 엔드포인트를 추가한다.
   - 경로: DELETE /:reportId/work-items
   - Query param: projectId (required string)
   - Guard: JwtAuthGuard
   - @CurrentUser() 로 memberId 를 받아 서비스에 전달
   - 응답: { success: true, data: { deleted: number } }

**완료 기준**

- [ ] deleteByProject 메서드가 소유권 검증과 함께 정상 동작한다
- [ ] DELETE /:reportId/work-items?projectId=xxx 라우트가 존재한다
- [ ] 백엔드 빌드 오류 없음

**Verify**
```bash
cd /c/rnd/weekly-report/packages/backend && bun run build 2>&1 | tail -20
```

---

### WORK-08-TASK-02: 신규 컴포넌트 — ProjectSelectModal

**목적**

"+ 프로젝트 추가" 버튼 클릭 시 나타나는 레이어 팝업 컴포넌트를 신규 작성한다.
기존 ProjectDropdown(인라인 플로팅)과 달리 Modal 래퍼를 사용하는 독립 컴포넌트다.

**수정 대상 파일**

| 경로 | 액션 | 설명 |
|------|------|------|
| packages/frontend/src/components/grid/ProjectSelectModal.tsx | CREATE | 프로젝트 선택 모달 |

**상세 작업 내용**

1. Props 인터페이스:
   - open: boolean
   - onClose: () => void
   - onSelect: (project: Project) => void
   - alreadySelectedIds: string[]  — 이미 추가된 프로젝트 ID 목록

2. 내부 구조 (기존 Modal 컴포넌트 래퍼 사용):
   - 모달 제목: "프로젝트 추가"
   - 검색 입력창 (placeholder: "프로젝트 검색...")
   - useProjects({ status: 'ACTIVE' }) 로 ACTIVE 프로젝트 목록 조회
   - COMMON / EXECUTION 카테고리별 그룹 헤더로 구분
   - alreadySelectedIds 포함 프로젝트: 회색 표시 + "추가됨" 배지 + 클릭 불가 (cursor-not-allowed)
   - 선택 가능 항목: 클릭 즉시 onSelect(project) + onClose() 호출

3. 스타일 지침:
   - 모달 너비: w-[440px]
   - 목록 영역: max-h-[360px] overflow-y-auto
   - 이미 추가된 항목: 배경 var(--gray-light), 텍스트 var(--text-sub)
   - 선택 가능 항목 hover: 배경 var(--primary-bg)
   - 카테고리 헤더: 배경 var(--tbl-header), 색상 var(--text-sub), uppercase + tracking-widest

**완료 기준**

- [ ] ProjectSelectModal.tsx 파일이 생성되었다
- [ ] 이미 선택된 프로젝트가 "추가됨" 배지와 함께 클릭 불가 상태로 표시된다
- [ ] COMMON / EXECUTION 그룹 구분이 정상 표시된다
- [ ] 검색 필터링이 동작한다
- [ ] TypeScript 컴파일 오류 없음

**Verify**
```bash
cd /c/rnd/weekly-report/packages/frontend && bun run build 2>&1 | tail -20
```

---

### WORK-08-TASK-03: EditableGrid 리팩토링 — 프로젝트 그룹 구조로 전환

**목적**

EditableGrid.tsx 를 프로젝트별 그룹 구조(헤더 + 하위 테이블)로 전면 재구성한다.

**수정 대상 파일**

| 경로 | 액션 | 설명 |
|------|------|------|
| packages/frontend/src/components/grid/EditableGrid.tsx | MODIFY | 프로젝트 그룹 구조로 전면 재구성 |

**상세 작업 내용**

1. Props 인터페이스 변경:
   - onUpdateItem: data 타입에서 projectId 제거 (셀 편집 3종: doneWork, planWork, remarks)
   - onAddItem: (projectId: string) => void  (projectId 필수, 기존은 인자 없음)
   - onDeleteProject: (projectId: string) => void  (신규 추가)

2. WorkItem 그룹핑 로직 (useMemo):
   - workItems 를 projectId 기준으로 Map 에 그룹화
   - 그룹 순서: workItems 배열 최초 등장 순서 유지
   - 각 그룹: { project: WorkItem['project'], items: WorkItem[] }

3. 컬럼 구성 변경 (6컬럼 -> 5컬럼):
   - 기존: 프로젝트명(14%) / 코드(7%) / 진행(28%) / 예정(28%) / 비고(17%) / 액션(6%)
   - 변경: 순번(4%) / 진행업무(33%) / 예정업무(33%) / 비고(24%) / 액션(6%)

4. 그룹 헤더 렌더링:
   - 프로젝트명 pill: var(--primary-bg) 배경 + var(--primary) 색상 (기존 스타일 재사용)
   - 코드: font-mono text-[var(--text-sub)] text-[11px]
   - [+ 업무 추가]: Button variant="outline" 소형 — onAddItem(projectId) 호출
   - [x 제거]: disabled 시 숨김, 클릭 시 삭제 확인 모달 후 onDeleteProject(projectId) 호출
   - 헤더 행 배경: var(--tbl-header), 하단 border: var(--gray-border)

5. 프로젝트 그룹 삭제 확인 모달:
   - 기존 ConfirmModal 재사용
   - 메시지: "[프로젝트명] 프로젝트의 업무항목 N개가 모두 삭제됩니다. 계속하시겠습니까?"
   - danger prop 적용

6. 빈 상태 메시지 변경:
   - "추가된 프로젝트가 없습니다. 상단 [+ 프로젝트 추가] 버튼을 눌러 프로젝트를 추가하세요."

7. 제거 사항:
   - ProjectDropdown import 및 사용 코드 전체 제거
   - 하단 dashed "프로젝트 선택 / 행 추가" 행 제거

8. 유지 사항:
   - 확대 편집(ExpandedEditor) 기능 및 케밥 메뉴
   - GridCell 편집 로직 (doneWork, planWork, remarks)
   - 행 삭제 ConfirmModal

**완료 기준**

- [ ] 프로젝트 그룹별 헤더 + 하위 테이블 구조로 렌더링된다
- [ ] 각 그룹 헤더에 [+ 업무 추가], [x 제거] 버튼이 존재한다
- [ ] 행 편집(셀 클릭 편집)이 정상 동작한다
- [ ] 행 삭제(케밥 메뉴)가 정상 동작한다
- [ ] 프로젝트명 셀 인라인 드롭다운이 제거되었다
- [ ] 하단 dashed 행이 제거되었다
- [ ] TypeScript 컴파일 오류 없음

**Verify**
```bash
cd /c/rnd/weekly-report/packages/frontend && bun run build 2>&1 | tail -20
```

---

### WORK-08-TASK-04: MyWeeklyReport 페이지 통합 — 툴바 및 흐름 변경

**목적**

MyWeeklyReport.tsx 와 관련 훅/API 파일을 수정하여 새로운 프로젝트 그룹 기반 UI 흐름을 완성한다.

**수정 대상 파일**

| 경로 | 액션 | 설명 |
|------|------|------|
| packages/frontend/src/pages/MyWeeklyReport.tsx | MODIFY | 툴바 + 핸들러 전면 변경 |
| packages/frontend/src/hooks/useWorkItems.ts | MODIFY | useDeleteWorkItemsByProject 훅 추가 |
| packages/frontend/src/api/weekly-report.api.ts | MODIFY | deleteWorkItemsByProject API 메서드 추가 |

**상세 작업 내용**

1. weekly-report.api.ts — deleteWorkItemsByProject 메서드 추가:
   - DELETE /weekly-reports/{reportId}/work-items?projectId={projectId}
   - 반환 타입: { data: { deleted: number } }

2. useWorkItems.ts — useDeleteWorkItemsByProject(week, reportId) 훅 추가:
   - mutationFn: projectId -> weeklyReportApi.deleteWorkItemsByProject(reportId, projectId)
   - onSuccess: queryClient.invalidateQueries(['weekly-report', week])

3. MyWeeklyReport.tsx 변경 항목:

   a. 상태 추가: projectSelectOpen (boolean, useState)

   b. 훅 추가: deleteByProjectMutation = useDeleteWorkItemsByProject(currentWeek, report?.id ?? '')

   c. handleAddItem 변경 — projectId 필수 인자로 수정:
      addItemMutation.mutateAsync({ projectId, doneWork: '', planWork: '', remarks: '' })

   d. handleDeleteProject(projectId) 신규 추가:
      deleteByProjectMutation.mutate(projectId, { onError: () => addToast('danger', ...) })

   e. alreadySelectedIds (useMemo):
      workItems 의 projectId 중복 제거 배열

   f. handleProjectSelect(project) 신규 추가:
      - alreadySelectedIds 에 포함: addToast('warn', '이미 추가된 프로젝트입니다.') 후 리턴
      - 미포함: handleAddItem(project.id) + setProjectSelectOpen(false)

   g. 툴바 버튼 변경:
      - [+ 행 추가] 버튼 제거
      - [+ 프로젝트 추가] 버튼 추가 (variant="outline") -> setProjectSelectOpen(true)

   h. ProjectSelectModal import 및 렌더링 추가 (open, onClose, onSelect, alreadySelectedIds props)

   i. EditableGrid props 변경:
      - onAddItem={handleAddItem}
      - onDeleteProject={handleDeleteProject}
      - onUpdateItem 에서 projectId 관련 제거

**완료 기준**

- [ ] 툴바에 [+ 행 추가] 없고 [+ 프로젝트 추가] 버튼이 있다
- [ ] [+ 프로젝트 추가] 클릭 시 ProjectSelectModal 이 열린다
- [ ] 프로젝트 선택 후 해당 그룹이 생성되고 첫 빈 업무 행이 자동 추가된다
- [ ] 이미 추가된 프로젝트는 모달에서 비활성화(추가됨 표시)된다
- [ ] [제거] 버튼으로 프로젝트 그룹 전체를 삭제할 수 있다
- [ ] 전체 모노레포 빌드 성공

**Verify**
```bash
cd /c/rnd/weekly-report && bun run build 2>&1 | tail -30
```

---

### WORK-08-TASK-05: 전주 불러오기(carry-forward) 모달 UI 보정

**목적**

carry-forward 모달의 항목 목록을 프로젝트별로 그룹핑하여 표시하도록 보정한다.

**수정 대상 파일**

| 경로 | 액션 | 설명 |
|------|------|------|
| packages/frontend/src/pages/MyWeeklyReport.tsx | MODIFY | carry-forward 모달 내 목록 렌더링 수정 |

**상세 작업 내용**

1. prevWorkItems 를 projectId 기준으로 그룹핑 (useMemo):
   Map 구조 = { project, items[] }, 최초 등장 순서 유지

2. 모달 내 렌더링 변경:
   - 그룹별 프로젝트 헤더 표시 (pill 스타일, var(--primary-bg)/var(--primary))
   - 각 항목 체크박스: 기존 동작 유지 (개별 선택/해제)
   - 전체 선택/전체 해제 버튼: 동작 유지

3. 목록 영역 max-h: 300px -> 400px 확장

**완료 기준**

- [ ] 전주 불러오기 모달에서 프로젝트별 그룹 헤더가 표시된다
- [ ] 개별 항목 체크박스 선택/해제가 정상 동작한다
- [ ] 전체 선택/전체 해제가 정상 동작한다
- [ ] TypeScript 컴파일 오류 없음

**Verify**
```bash
cd /c/rnd/weekly-report/packages/frontend && bun run build 2>&1 | tail -20
```

---

## 의존성 DAG

```
WORK-08-TASK-01 (백엔드 API 추가)
        |
        +--------------------------------------------+
                                                     |
WORK-08-TASK-02 (ProjectSelectModal 신규 작성)       |
        |                                            |
        v                                            |
WORK-08-TASK-03 (EditableGrid 그룹 구조 재구성)      |
        |                                            |
        +--------------------------------------------+
                          |
                          v
           WORK-08-TASK-04 (MyWeeklyReport 통합)
                          |
                          v
           WORK-08-TASK-05 (carry-forward 모달 보정)
```

- TASK-01 과 TASK-02 는 독립적 -> 병렬 작업 가능
- TASK-03 은 TASK-02 완료 후 수행
- TASK-04 는 TASK-01 (백엔드 API) + TASK-03 (그리드) 모두 필요
- TASK-05 는 TASK-04 완료 후 동일 파일 추가 수정
