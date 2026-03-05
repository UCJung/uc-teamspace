# WORK-23-TASK-08 수행 결과 보고서

> 작업일: 2026-03-05
> 작업자: Claude Code
> 상태: **완료**

---

## 1. 작업 개요

MyTasks 페이지에 3가지 보기 모드(칸반보드/리스트/주간뷰) 토글 기능을 추가하고, 칸반보드는 TODO/IN_PROGRESS/DONE 3개 컬럼으로 구성하며 드래그앤드롭으로 상태 전환이 가능하도록 구현했다. 기본 보기 모드는 칸반보드로 설정했다.

---

## 2. 완료 기준 달성 현황

- [x] ViewModeToggle 컴포넌트 구현 (3개 보기 모드 아이콘 버튼)
- [x] TaskKanbanCard 컴포넌트 구현 (카드 형태 작업 표시)
- [x] TaskKanban 컴포넌트 구현 (3개 컬럼 칸반보드 + DnD)
- [x] TaskWeeklyView 컴포넌트 구현 (7개 요일 + 예정업무 컬럼)
- [x] MyTasks.tsx 수정 (보기 모드 전환 로직)
- [x] 프론트엔드 빌드 오류 없음
- [x] 전체 테스트 통과
- [x] CSS 변수 사용 (HEX 하드코딩 제거)

---

## 3. 체크리스트 완료 현황

### 3.1 ViewModeToggle 컴포넌트
- [x] 3개 보기 모드 아이콘 버튼: 칸반보드 (LayoutGrid), 리스트 (List), 주간뷰 (CalendarDays)
- [x] 현재 활성 모드 강조 표시
- [x] 모드 전환 시 콜백 호출

### 3.2 TaskKanbanCard 컴포넌트
- [x] 카드 형태로 작업 표시 (제목, 프로젝트 배지, 우선순위 배지, 마감일, 메모 미리보기)
- [x] DONE 상태: 소요시간 배지 표시
- [x] 카드 클릭 시 상세 패널 열기
- [x] @dnd-kit useSortable 적용 (드래그 가능)
- [x] 카드 스타일: 흰색 배경, 그림자, 라운드, 좌측 우선순위 컬러 바

### 3.3 TaskKanban 컴포넌트 (칸반보드)
- [x] 3개 컬럼: TODO(할일), IN_PROGRESS(진행중), DONE(완료)
- [x] 각 컬럼 헤더에 상태명 + 작업 건수 표시
- [x] 각 컬럼에 해당 상태의 TaskKanbanCard 배치
- [x] @dnd-kit DndContext: 카드를 다른 컬럼으로 드래그하면 상태 자동 전환
  - TODO→IN_PROGRESS 이동 시: status=IN_PROGRESS + startedAt=now API 호출
  - TODO/IN_PROGRESS→DONE 이동 시: toggleDone API 호출
  - DONE→TODO 이동 시: toggleDone API (되돌리기)
- [x] 같은 컬럼 내 드래그로 순서 변경 (reorder)
- [x] 빈 컬럼에도 드롭 영역 표시
- [x] 컬럼 색상: TODO=기본, IN_PROGRESS=primary, DONE=ok

### 3.4 TaskWeeklyView 컴포넌트 (주간뷰)
- [x] 7개 컬럼: 일 / 월 / 화 / 수 / 목 / 금 / 토 + 예정업무
- [x] 이번 주 기준 날짜 헤더 표시 (예: "3/2 월")
- [x] 주차 네비게이션: 이전 주 / 다음 주 이동 버튼
- [x] IN_PROGRESS 작업: `startedAt` 기준 요일 컬럼에 배치
- [x] DONE 작업: `completedAt` 기준 요일 컬럼에 배치
- [x] TODO 작업 (미진행): "예정업무" 컬럼에 배치
- [x] 카드는 TaskKanbanCard 재사용 (간소화 버전)
- [x] 해당 주에 시작/완료된 작업만 표시 (범위 밖은 미표시)

### 3.5 MyTasks 페이지 수정
- [x] 기본 보기 모드: `kanban` (칸반보드)
- [x] viewMode state: `kanban` | `list` | `weekly`
- [x] 헤더 영역에 ViewModeToggle 배치
- [x] viewMode에 따라 TaskList / TaskKanban / TaskWeeklyView 조건부 렌더링
- [x] TaskQuickInput과 TaskFilterBar는 모든 모드에서 공통 표시
- [x] TaskDetailPanel은 모든 모드에서 공통 동작

### 3.6 테스트
- [x] 프론트엔드 빌드 오류 없음
- [x] 전체 테스트 통과

---

## 4. 발견 이슈 및 수정 내역

### 이슈 #1 — CSS 변수 미사용 (HEX 하드코딩)
**증상**: TaskKanbanCard.tsx에서 우선순위 색상을 HEX로 하드코딩함 (`#6B5CE7`, `#E67E22`, `#E74C3C`)
**원인**: 초기 구현 시 스타일 가이드 미참조
**수정**: CSS 변수로 교체 (`var(--primary)`, `var(--warn)`, `var(--danger)`)

### 이슈 #2 — TaskWeeklyView 주간 기준 오류
**증상**: 주간뷰에서 날짜 계산이 로컬 시간대 기준으로 처리되어 일~토 배치 오류 발생
**원인**: startedAt/completedAt은 UTC이지만 요일 계산에서 로컬 시간대 미적용
**수정**: getDay() 대신 UTC 기준 getUTCDay() 사용, 날짜 계산 로직 수정

---

## 5. 최종 검증 결과

### 5.1 빌드 검증
```
✓ 프론트엔드 빌드 성공
✓ 전체 빌드 성공
✓ 린트 검사 통과
```

### 5.2 테스트 검증
```
✓ 모든 테스트 통과 (E2E + 단위 테스트)
```

### 5.3 수동 확인 필요
- 칸반보드 기본 표시 확인 (3개 컬럼)
- 카드 드래그로 상태 전환 확인
- 리스트 보기로 전환 확인
- 주간뷰로 전환 후 날짜별 배치 확인
- 주차 네비게이션 동작 확인

---

## 6. 후속 TASK 유의사항

해당 없음

---

## 7. 산출물 목록

### 신규 생성 파일

| 파일 | 설명 |
|------|------|
| `packages/frontend/src/components/personal-task/ViewModeToggle.tsx` | 보기 모드 전환 아이콘 버튼 (칸반/리스트/주간뷰) |
| `packages/frontend/src/components/personal-task/TaskKanbanCard.tsx` | 작업 카드 컴포넌트 (@dnd-kit 드래그 가능) |
| `packages/frontend/src/components/personal-task/TaskKanban.tsx` | 칸반보드 컴포넌트 (3개 컬럼 + DnD 기반 상태 전환) |
| `packages/frontend/src/components/personal-task/TaskWeeklyView.tsx` | 주간뷰 컴포넌트 (요일별 배치 + 주차 네비게이션) |

### 수정 파일

| 파일 | 변경 내용 |
|------|----------|
| `packages/frontend/src/pages/MyTasks.tsx` | 보기 모드 전환 로직, ViewModeToggle 배치, 조건부 렌더링 추가 |

---

## 결론

WORK-23-TASK-08을 성공적으로 완료했다. MyTasks 페이지는 이제 3가지 보기 모드(칸반보드/리스트/주간뷰)를 지원하며, 칸반보드는 드래그앤드롭을 통한 직관적인 상태 전환이 가능하다. 기본 보기 모드는 칸반보드로 설정되었고, 모든 검증을 통과했다.
