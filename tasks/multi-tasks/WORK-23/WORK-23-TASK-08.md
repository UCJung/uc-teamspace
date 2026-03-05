# WORK-23-TASK-08: 목록 보기 개선 — 칸반보드 + 주간업무 보기

> **Phase:** 추가
> **선행 TASK:** WORK-23-TASK-07
> **목표:** 개인 작업 목록을 칸반보드(기본), 리스트, 주간뷰 3가지 보기 모드로 전환할 수 있도록 개선한다

## 요청사항
1. 칸반보드 형태로 상태별 보기 기능: 목록형 보기/칸반보드 보기를 토글할 수 있어야 함 (카드형 작업 보기 추가). 업무 카드를 드래그앤드롭으로 이동(상태 전환) 시킬 수 있어야 함.
2. 주간업무 보기 기능: 열 컬럼을 주간 일~토로 해서 각 진행중인 업무의 시작일 기준으로 조회, 완료된 업무는 완료일에 표시, 미진행 업무는 별도의 예정업무 열을 추가하여 표시
3. 기본 업무 보기는 칸반보드 형태

---

## Step 1 — 계획서

### 1.1 작업 범위
MyTasks 페이지에 3가지 보기 모드(칸반보드/리스트/주간뷰) 토글 기능을 추가한다. 칸반보드는 TODO/IN_PROGRESS/DONE 3개 컬럼으로 작업 카드를 표시하며 카드를 드래그앤드롭으로 다른 컬럼으로 이동하면 상태가 자동 전환된다. 주간뷰는 일~토 6개 컬럼 + 예정업무 1개 컬럼으로 구성하여 시작일/완료일 기준으로 작업을 배치한다. 기본 보기 모드는 칸반보드로 설정한다.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| Component | `packages/frontend/src/components/personal-task/TaskKanban.tsx` |
| Component | `packages/frontend/src/components/personal-task/TaskKanbanCard.tsx` |
| Component | `packages/frontend/src/components/personal-task/TaskWeeklyView.tsx` |
| Component | `packages/frontend/src/components/personal-task/ViewModeToggle.tsx` |
| 수정 | `packages/frontend/src/pages/MyTasks.tsx` — 보기 모드 전환 로직 |
| 수정 | `packages/frontend/src/stores/uiStore.ts` — 보기 모드 상태 저장 (선택) |

---

## Step 2 — 체크리스트

### 2.1 ViewModeToggle 컴포넌트
- [ ] 3개 보기 모드 아이콘 버튼: 칸반보드 (LayoutGrid), 리스트 (List), 주간뷰 (CalendarDays)
- [ ] 현재 활성 모드 강조 표시
- [ ] 모드 전환 시 콜백 호출

### 2.2 TaskKanbanCard 컴포넌트
- [ ] 카드 형태로 작업 표시 (제목, 프로젝트 배지, 우선순위 배지, 마감일, 메모 미리보기)
- [ ] DONE 상태: 소요시간 배지 표시
- [ ] 카드 클릭 시 상세 패널 열기
- [ ] @dnd-kit useSortable 적용 (드래그 가능)
- [ ] 카드 스타일: 흰색 배경, 그림자, 라운드, 좌측 우선순위 컬러 바

### 2.3 TaskKanban 컴포넌트 (칸반보드)
- [ ] 3개 컬럼: TODO(할일), IN_PROGRESS(진행중), DONE(완료)
- [ ] 각 컬럼 헤더에 상태명 + 작업 건수 표시
- [ ] 각 컬럼에 해당 상태의 TaskKanbanCard 배치
- [ ] @dnd-kit DndContext: 카드를 다른 컬럼으로 드래그하면 상태 자동 전환
  - TODO→IN_PROGRESS 이동 시: status=IN_PROGRESS + startedAt=now API 호출
  - TODO/IN_PROGRESS→DONE 이동 시: toggleDone API 호출
  - DONE→TODO 이동 시: toggleDone API (되돌리기)
- [ ] 같은 컬럼 내 드래그로 순서 변경 (reorder)
- [ ] 빈 컬럼에도 드롭 영역 표시
- [ ] 컬럼 색상: TODO=기본, IN_PROGRESS=primary, DONE=ok

### 2.4 TaskWeeklyView 컴포넌트 (주간뷰)
- [ ] 7개 컬럼: 일 / 월 / 화 / 수 / 목 / 금 / 토 + 예정업무
- [ ] 이번 주 기준 날짜 헤더 표시 (예: "3/2 월")
- [ ] 주차 네비게이션: 이전 주 / 다음 주 이동 버튼
- [ ] IN_PROGRESS 작업: `startedAt` 기준 요일 컬럼에 배치
- [ ] DONE 작업: `completedAt` 기준 요일 컬럼에 배치
- [ ] TODO 작업 (미진행): "예정업무" 컬럼에 배치
- [ ] 카드는 TaskKanbanCard 재사용 (간소화 버전)
- [ ] 해당 주에 시작/완료된 작업만 표시 (범위 밖은 미표시)

### 2.5 MyTasks 페이지 수정
- [ ] 기본 보기 모드: `kanban` (칸반보드)
- [ ] viewMode state: `kanban` | `list` | `weekly`
- [ ] 헤더 영역에 ViewModeToggle 배치
- [ ] viewMode에 따라 TaskList / TaskKanban / TaskWeeklyView 조건부 렌더링
- [ ] TaskQuickInput과 TaskFilterBar는 모든 모드에서 공통 표시
- [ ] TaskDetailPanel은 모든 모드에서 공통 동작

### 2.6 테스트
- [ ] 프론트엔드 빌드 오류 없음
- [ ] 전체 테스트 통과
- [ ] 칸반보드 DnD 상태 전환 동작 확인 (수동)
- [ ] 주간뷰 날짜 배치 확인 (수동)

---

## Step 3 — 완료 검증

```bash
# 1. 프론트엔드 빌드
cd packages/frontend
bun run build

# 2. 전체 빌드
cd ../..
bun run build

# 3. 테스트
bun run test

# 4. 수동 확인
bun run dev
# - http://localhost:5173/my-tasks 칸반보드 기본 표시 확인
# - 카드 드래그로 상태 전환 확인
# - 리스트 보기 전환 확인
# - 주간뷰 전환 + 날짜별 배치 확인
```
