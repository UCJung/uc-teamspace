# WORK-24-TASK-05: 프론트엔드 — 칸반/목록/필터 동적 상태 적용

> **Phase:** 4
> **선행 TASK:** WORK-24-TASK-03, WORK-24-TASK-04
> **목표:** 하드코딩된 3단계 상태 구조를 제거하고, 팀별 TaskStatusDef 기반의 동적 칸반 컬럼, 상태 배지, 필터 탭으로 전환한다

---

## Step 1 — 계획서

### 1.1 작업 범위

`personal-task.api.ts`의 타입에서 `status` 필드를 제거하고 `statusId + taskStatus` 객체로 교체한다. `TaskKanban.tsx`의 하드코딩 COLUMNS 배열을 `useTaskStatuses` 훅 기반 동적 컬럼으로 교체한다. 칸반 DnD에서 droppable ID를 `column-{statusId}` 패턴으로 변경한다. `TaskItem.tsx`에 상태 배지를 추가하고, `TaskKanbanCard.tsx`에도 상태 색상 표시를 추가한다. `TaskFilterBar.tsx`의 STATUS_OPTIONS를 동적 탭으로 교체한다. `labels.ts`에서 `TASK_STATUS_LABEL`, `TASK_STATUS_VARIANT` 상수를 deprecated 처리한다.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| API 타입 (수정) | `packages/frontend/src/api/personal-task.api.ts` — status 제거, statusId + taskStatus 추가 |
| Component (수정) | `packages/frontend/src/components/personal-task/TaskKanban.tsx` — 동적 컬럼 |
| Component (수정) | `packages/frontend/src/components/personal-task/TaskItem.tsx` — 상태 배지 추가 |
| Component (수정) | `packages/frontend/src/components/personal-task/TaskKanbanCard.tsx` — 상태 배지 추가 |
| Component (수정) | `packages/frontend/src/components/personal-task/TaskFilterBar.tsx` — 동적 상태 탭 |
| Component (수정) | `packages/frontend/src/components/personal-task/TaskDetailPanel.tsx` — 동적 상태 드롭다운 |
| Constants (수정) | `packages/frontend/src/constants/labels.ts` — TASK_STATUS_LABEL deprecated |

---

## Step 2 — 체크리스트

### 2.1 PersonalTask API 타입 변경 (personal-task.api.ts)

- [ ] `PersonalTask` 타입에서 `status: TaskStatus` 필드 제거
- [ ] `statusId: string` 필드 추가
- [ ] `taskStatus: { id: string; name: string; color: string; category: TaskStatusCategory }` 필드 추가
- [ ] `CreatePersonalTaskDto`에서 `status?` 제거, `statusId?` 추가
- [ ] `UpdatePersonalTaskDto`에서 `status?` 제거, `statusId?` 추가
- [ ] `ListPersonalTasksQuery`에서 `status?` 제거, `statusId?`, `category?` 추가
- [ ] `TaskStatus` 타입 import/export 제거 (백엔드 enum 제거 반영)
- [ ] `TaskStatusCategory` 타입 import (team.api.ts에서 re-export 또는 직접 정의)

### 2.2 TaskKanban 동적 컬럼 (TaskKanban.tsx)

- [ ] 하드코딩된 `COLUMNS` 배열 제거 (`TODO/IN_PROGRESS/DONE`)
- [ ] `useTaskStatuses(teamId)` 훅 호출하여 `statuses` 목록 획득
- [ ] `statuses` sortOrder 순으로 동적 컬럼 렌더링
  - 컬럼 헤더 색상: `taskStatusDef.color`
  - 컬럼 제목: `taskStatusDef.name`
  - 컬럼 배지 숫자: 해당 status의 작업 수
- [ ] Droppable ID 변경: `column-TODO` → `column-{statusId}` 패턴
- [ ] `getOverStatus` (또는 동등 함수) 재작성: droppable ID에서 statusId 추출
- [ ] DnD 이동 완료 시: `PATCH /api/v1/personal-tasks/:id` 호출 → body `{ statusId: targetStatusId }`
- [ ] 로딩 중(statuses 미로드 시) 스켈레톤 컬럼 표시

### 2.3 TaskKanbanCard 상태 표시 (TaskKanbanCard.tsx)

- [ ] 카드 하단 또는 헤더 영역에 상태 색상 인디케이터 추가
  - 작은 색상 원: `backgroundColor: task.taskStatus.color`
  - 상태명 텍스트: `task.taskStatus.name` (선택적 표시)
- [ ] `task.status` 참조 → `task.taskStatus.category` 또는 `task.statusId` 로 변경

### 2.4 TaskItem 상태 배지 (TaskItem.tsx)

- [ ] Priority 배지 옆에 상태 배지 추가
  ```tsx
  <span style={{ backgroundColor: task.taskStatus.color + '20', color: task.taskStatus.color }}>
    {task.taskStatus.name}
  </span>
  ```
- [ ] `task.status` 직접 비교 구문 제거 (완료 여부: `task.taskStatus.category === 'COMPLETED'`)
- [ ] `TASK_STATUS_LABEL[task.status]` 참조 제거

### 2.5 TaskFilterBar 동적 상태 탭 (TaskFilterBar.tsx)

- [ ] 하드코딩된 `STATUS_OPTIONS` 배열 제거
- [ ] `useTaskStatuses(teamId)` 훅 호출
- [ ] 탭 목록: `[{ id: 'all', label: '전체' }, ...statuses.map(s => ({ id: s.id, label: s.name, color: s.color }))]`
- [ ] 선택된 탭 → `onFilterChange({ statusId: selectedId })` 전달 (전체 탭: `statusId: undefined`)
- [ ] 탭 활성 색상: `taskStatusDef.color` 사용

### 2.6 TaskDetailPanel 동적 상태 드롭다운 (TaskDetailPanel.tsx)

- [ ] 상태 필드에서 고정 `<select>` (TaskStatus enum 옵션) 제거
- [ ] `useTaskStatuses(teamId)` 훅 호출
- [ ] 동적 `<select>`: `statuses` 목록을 옵션으로 렌더링
  - value: `status.id`, label: `status.name`
  - 선택 변경 시: `onUpdate({ statusId: selectedId })`
- [ ] 현재 선택 상태 표시: `task.taskStatus.id`로 selected value 설정

### 2.7 labels.ts 정리

- [ ] `TASK_STATUS_LABEL` 상수에 deprecated 주석 추가
  ```ts
  /** @deprecated TaskStatusDef.name을 사용하세요 (WORK-24) */
  export const TASK_STATUS_LABEL = { ... };
  ```
- [ ] `TASK_STATUS_VARIANT` 상수에 deprecated 주석 추가
- [ ] 실제 상수 값은 유지 (하위 호환, 점진적 제거)

### 2.8 단위 테스트 수정

- [ ] `TaskKanban.test.tsx` 존재 시: 동적 컬럼 로직 테스트 업데이트
- [ ] `TaskFilterBar.test.tsx` 존재 시: 동적 탭 테스트 업데이트
- [ ] `TaskItem.test.tsx` 존재 시: 상태 배지 렌더링 테스트 추가

### 2.9 빌드/린트/테스트 확인

- [ ] `cd packages/frontend && bun run build` 오류 0건
- [ ] `bun run lint` 오류 0건
- [ ] `bun run test` 통과

---

## Step 3 — 완료 검증

```bash
# 1. 프론트엔드 빌드
cd /c/rnd/uc-teamspace/packages/frontend
bun run build

# 2. 린트
bun run lint

# 3. 단위 테스트
bun run test

# 4. 전체 모노레포 빌드
cd /c/rnd/uc-teamspace
bun run build

# 5. 수동 확인 항목 (브라우저에서 확인 필요)
# - 개인 작업 칸반보드: 팀 상태 정의 수에 따라 동적 컬럼 렌더링 확인
# - 칸반 카드 DnD: 컬럼 이동 시 statusId로 PATCH 요청 발생 확인 (개발자 도구 Network 탭)
# - 칸반 카드: 컬럼 헤더 색상이 TaskStatusDef.color 반영 확인
# - 목록뷰 TaskItem: 상태명 + 색상 배지 표시 확인
# - 필터바: 팀 상태 정의 목록으로 동적 탭 생성 확인
# - 상태 관리 화면에서 상태 추가 후 칸반보드 컬럼 즉시 반영 확인
# - 상세 패널: 상태 드롭다운에서 팀 상태 목록 표시 및 변경 확인
```
