# WORK-28 PLAN — 업무-작업 연계 및 주간보고 통합

> 작성일: 2026-03-06
> 상태: PLANNING

---

## 1. 배경 및 목적

현재 시스템에는 `PersonalTask`(개인 작업)와 `WorkItem`(주간업무 항목)이 분리되어 있다.
`importToWeekly` 기능으로 작업 → 주간보고 방향의 내보내기는 있지만,
**WorkItem 세부내용에서 연관 PersonalTask를 조회하거나 직접 연동하는 기능이 없다.**

이 WORK는 다음 세 가지를 구현한다:

1. **WorkItem 상세 패널에서 연관 PersonalTask 목록 조회** — 같은 프로젝트 + 해당 주차 기준으로 작업 목록 표시
2. **WorkItem ↔ PersonalTask 명시적 연결(링크) 지원** — `WorkItem`에 `linkedTaskId` 추가 (옵션)
3. **주간보고 작성 시 연관 작업 기반 자동 내용 채우기** — PersonalTask의 완료된 항목을 WorkItem doneWork에 제안

---

## 2. 현재 상태 분석

### 데이터 흐름
```
PersonalTask (작업)
  ├── projectId → Project
  ├── linkedWeekLabel → 주차 연결 (느슨한 연결)
  └── importToWeekly → WorkItem 생성 (역추적 불가)

WorkItem (주간업무 항목)
  ├── projectId → Project
  └── weeklyReportId → WeeklyReport
      └── memberId + weekLabel → 특정 멤버의 주차
```

### 문제점
- WorkItem에서 어떤 PersonalTask에서 생성됐는지 역추적 불가
- 업무 세부내용(WorkItem 상세) 화면에서 연관 작업을 볼 수 없음
- 주간보고 작성 그리드에서 해당 프로젝트의 완료 작업을 참조할 수 없음

---

## 3. 설계 결정

### 3-1. DB 스키마 변경 (최소화 원칙)

기존 `PersonalTask`에 `linkedWorkItemId` FK를 추가하여 양방향 연결 지원.
또는, **별도 테이블 없이 기존 `linkedWeekLabel`을 더 적극 활용** + API 레벨에서 JOIN 조회.

**결정: DB 스키마 변경 없음** — `PersonalTask.projectId` + `linkedWeekLabel` 조합으로
"같은 프로젝트 + 해당 주차"의 작업을 조회하는 새 API 엔드포인트를 추가한다.
이유: 마이그레이션 없이 기존 데이터를 활용 가능, 연계 데이터가 자연스럽게 일치.

### 3-2. 연계 로직

```
WorkItem 상세 조회 시:
  1. WorkItem.projectId + WeeklyReport.weekLabel 추출
  2. PersonalTask where { memberId, projectId, linkedWeekLabel = weekLabel, isDeleted: false } 조회
  3. linkedWeekLabel이 없는 경우: dueDate가 해당 주차 범위 내인 작업도 포함

주간보고 작성 그리드에서 "작업 기반 채우기" 버튼:
  1. 해당 WorkItem의 projectId + 현재 weekLabel 기준
  2. COMPLETED 카테고리 PersonalTask 목록 조회
  3. title 목록을 [항목명]\n*세부작업 형식으로 doneWork에 제안
```

### 3-3. UI 설계

**WorkItem 상세 (ExpandedEditor 또는 셀 확장 패널):**
- 오른쪽 사이드 섹션에 "연관 작업" 탭 추가
- 해당 프로젝트 + 주차의 PersonalTask 목록 표시 (완료/진행중/예정 구분)
- "주간보고에 반영" 버튼으로 선택 작업 내용을 doneWork/planWork에 추가

**주간보고 그리드 (WorkItem 행):**
- 각 행에 "작업 연동" 아이콘 버튼 추가
- 클릭 시 해당 프로젝트의 이번주 작업 목록 팝오버 표시

---

## 4. TASK 목록

| TASK | 제목 | 범위 | 의존 |
|------|------|------|------|
| TASK-01 | 백엔드: WorkItem별 연관 PersonalTask 조회 API | BE | - |
| TASK-02 | 백엔드: PersonalTask → WorkItem 연계 내용 반영 API 개선 | BE | TASK-01 |
| TASK-03 | 프론트엔드: ExpandedEditor에 연관 작업 패널 추가 | FE | TASK-01 |
| TASK-04 | 프론트엔드: MyWeeklyReport 그리드에 작업 연동 버튼 추가 | FE | TASK-03 |
| TASK-05 | 프론트엔드: 작업 내용 → 주간보고 자동 채우기 기능 | FE | TASK-04 |

---

## 5. 상세 TASK 설명

### TASK-01: 백엔드 — WorkItem별 연관 PersonalTask 조회 API

**파일:**
- `packages/backend/src/weekly-report/work-item.service.ts` — `getLinkedTasks()` 메서드 추가
- `packages/backend/src/weekly-report/report.controller.ts` — `GET /api/v1/work-items/:id/linked-tasks` 엔드포인트

**로직:**
```
GET /api/v1/work-items/:id/linked-tasks?teamId=xxx

1. workItem 조회 (projectId, weeklyReportId)
2. weeklyReport 조회 (weekLabel, memberId)
3. PersonalTask 조회:
   WHERE memberId = weeklyReport.memberId
     AND projectId = workItem.projectId
     AND isDeleted = false
     AND (
       linkedWeekLabel = weeklyReport.weekLabel
       OR (dueDate >= weekStart AND dueDate < weekEnd)
       OR (scheduledDate >= weekStart AND scheduledDate < weekEnd)
     )
4. taskStatus 포함하여 반환
```

### TASK-02: 백엔드 — PersonalTask 내용 → WorkItem 반영 API 개선

**파일:**
- `packages/backend/src/weekly-report/work-item.service.ts` — `applyTasksToWorkItem()` 메서드 추가
- `packages/backend/src/weekly-report/report.controller.ts` — `POST /api/v1/work-items/:id/apply-tasks`

**로직:**
```
POST /api/v1/work-items/:id/apply-tasks
Body: { taskIds: string[], appendMode: 'replace' | 'append' }

1. 대상 WorkItem + PersonalTask 목록 조회
2. COMPLETED 작업 → doneWork 텍스트 생성
   형식: "[프로젝트명]\n*작업1\n*작업2"
3. IN_PROGRESS/BEFORE_START 작업 → planWork 텍스트 생성
4. appendMode에 따라 기존 내용 교체 또는 추가
5. WorkItem 업데이트 후 반환
```

### TASK-03: 프론트엔드 — ExpandedEditor에 연관 작업 패널 추가

**파일:**
- `packages/frontend/src/components/grid/ExpandedEditor.tsx` — 연관 작업 사이드 패널 추가
- `packages/frontend/src/hooks/useWorkItems.ts` — `useLinkedTasks` 훅 추가
- `packages/frontend/src/api/weekly-report.api.ts` — `getLinkedTasks`, `applyTasksToWorkItem` API 추가

**UI 구성:**
```
[ExpandedEditor]
┌──────────────────────┬─────────────────────┐
│ 기존 편집 영역        │ 연관 작업 패널      │
│ - 프로젝트 선택      │ [완료] [진행중] [예정] │
│ - 한일 텍스트        │ ┌────────────────────┐│
│ - 할일 텍스트        │ │ ✓ 작업A (완료)    ││
│ - 비고              │ │ → 작업B (진행중)  ││
│                    │ │ ○ 작업C (예정)    ││
│                    │ └────────────────────┘│
│                    │ [선택항목 → 한일에 추가]│
│                    │ [선택항목 → 할일에 추가]│
└──────────────────────┴─────────────────────┘
```

### TASK-04: 프론트엔드 — MyWeeklyReport 그리드에 작업 연동 버튼 추가

**파일:**
- `packages/frontend/src/components/grid/EditableGrid.tsx` — 행 액션 영역에 작업 연동 아이콘 추가
- `packages/frontend/src/components/grid/LinkedTasksPopover.tsx` — 신규 컴포넌트

**UI 구성:**
- 각 WorkItem 행 끝에 `CheckSquare` 아이콘 (연관 작업 수 배지 포함)
- 클릭 시 팝오버로 해당 프로젝트+주차 PersonalTask 목록 표시
- 팝오버에서 "한일에 추가" / "할일에 추가" 버튼 제공

### TASK-05: 프론트엔드 — 작업 내용 → 주간보고 자동 채우기

**파일:**
- `packages/frontend/src/components/grid/LinkedTasksPopover.tsx` — 자동 채우기 로직
- `packages/frontend/src/hooks/useWorkItems.ts` — `useApplyTasksToWorkItem` 훅 추가

**로직:**
- 완료된 작업 선택 → "한일에 추가" 클릭 → `POST /api/v1/work-items/:id/apply-tasks`
- 응답으로 받은 업데이트된 WorkItem으로 캐시 업데이트
- 그리드에 즉시 반영 (낙관적 업데이트)

---

## 6. 기술 제약

- DB 마이그레이션 없음 (스키마 변경 없음)
- 기존 `importToWeekly` 플로우 유지 (하위 호환)
- CSS 변수만 사용 (HEX 하드코딩 금지)
- staleTime 준수: 연관 작업 조회 30s

---

## 7. 예상 결과

사용자 흐름:
```
1. 주간보고 작성 중 특정 WorkItem 행의 [작업 연동] 버튼 클릭
2. 팝오버에서 해당 프로젝트+주차 PersonalTask 목록 확인
3. 완료된 작업 선택 → "한일에 추가" 클릭
4. doneWork 필드에 선택한 작업 내용이 자동 반영
5. 또는 ExpandedEditor 열어서 사이드 패널에서 세부 편집
```
