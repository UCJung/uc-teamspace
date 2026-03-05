# WORK-26-TASK-04: DnD 카드 이동 + 상단/하단 리사이즈

> **Phase:** 3
> **선행 TASK:** WORK-26-TASK-02, WORK-26-TASK-03
> **목표:** @dnd-kit/core를 사용하여 주간뷰 시간 그리드에서 카드 드래그로 날짜/시간대 이동을 구현하고, 카드 상단/하단 경계 드래그로 scheduledDate(시작)/dueDate(종료) 시간을 변경한다.

---

## Step 1 — 계획서

### 1.1 작업 범위

WeeklyTimeGrid에 @dnd-kit/core `DndContext`를 통합한다.
카드 전체 드래그: `useDraggable` → 목표 셀(날짜×시간)로 `useDroppable` drop 감지 → scheduledDate 업데이트.
리사이즈 핸들(상단/하단): 별도 `useDraggable` 핸들로 포인터 delta Y 계산 → 1행 = 1시간으로 환산 → API 업데이트.
낙관적 업데이트를 통해 드래그 완료 즉시 UI 반영 후 API 호출.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| 수정 | `packages/frontend/src/components/personal-task/WeeklyTimeGrid.tsx` — DnD Context + drop zone |
| 수정 | `packages/frontend/src/components/personal-task/WeeklyGridCard.tsx` — draggable + resize 핸들 |
| 확인/보완 | `packages/frontend/src/hooks/usePersonalTasks.ts` — 낙관적 업데이트 뮤테이션 |

### 1.3 DnD 구현 전략

```
카드 이동 (날짜+시간대 변경):
  DndContext.onDragEnd → active.id (taskId), over.id (cellId = "col-{dayIndex}-row-{rowIndex}")
  → scheduledDate = cellToDatetime(dayIndex, rowIndex, currentWeekSunday)
  → updatePersonalTask 호출 (낙관적 업데이트)

리사이즈 (상단 핸들 — scheduledDate 변경):
  useDraggable({id: `resize-top-{taskId}`})
  onDragEnd → delta.y / ROW_HEIGHT_PX → 시간 delta 계산
  → scheduledDate 시간 += delta 시간
  → updatePersonalTask 호출

리사이즈 (하단 핸들 — dueDate 변경):
  useDraggable({id: `resize-bottom-{taskId}`})
  onDragEnd → delta.y / ROW_HEIGHT_PX → 시간 delta 계산
  → dueDate 시간 += delta 시간 (최소: scheduledDate + 1시간)
  → updatePersonalTask 호출

ROW_HEIGHT_PX = 56px (각 시간 행 높이 — CSS와 일치시킴)
```

### 1.4 드래그 시각적 피드백

- 드래그 중: 원본 카드 반투명(opacity 0.4), DragOverlay로 복제 카드 표시
- drop zone hover: 셀 배경색 변경 (`var(--primary-bg)`)
- 리사이즈 중: 카드 높이 실시간 변경 (pointerDelta 기반)

---

## Step 2 — 체크리스트

### 2.1 WeeklyTimeGrid DnD Context
- [ ] `DndContext` 래퍼 추가 (WeeklyTimeGrid 루트)
- [ ] `DragOverlay` 컴포넌트 추가 (드래그 중 카드 미리보기)
- [ ] 각 셀을 `useDroppable({ id: cellId })` 로 등록
- [ ] `onDragEnd` 핸들러 — 카드 이동 처리
- [ ] `onDragOver` 핸들러 — hover 셀 강조
- [ ] 예정업무 열 — drop zone 없음 (수동 스크롤만 지원)

### 2.2 WeeklyGridCard — 카드 드래그
- [ ] `useDraggable({ id: task.id })` 적용
- [ ] `attributes`, `listeners` → 카드 드래그 영역 (제목 영역)
- [ ] 드래그 중 `opacity: 0.4` 스타일
- [ ] 시간 행으로 이동 시 `scheduledDate`의 시간만 변경 (날짜 유지 아니면 셀 기준으로 날짜+시간 모두 변경)

### 2.3 WeeklyGridCard — 상단 핸들 리사이즈
- [ ] 상단 핸들 div (높이 6px, cursor: n-resize)
- [ ] `useDraggable({ id: \`resize-top-${task.id}\` })` 적용
- [ ] `onDragEnd`: delta.y → 시간 delta → scheduledDate 업데이트
- [ ] 최소 제약: scheduledDate >= 00:00 (행 범위 내)

### 2.4 WeeklyGridCard — 하단 핸들 리사이즈
- [ ] 하단 핸들 div (높이 6px, cursor: s-resize)
- [ ] `useDraggable({ id: \`resize-bottom-${task.id}\` })` 적용
- [ ] `onDragEnd`: delta.y → 시간 delta → dueDate 업데이트
- [ ] 최소 제약: dueDate >= scheduledDate + 1시간

### 2.5 낙관적 업데이트
- [ ] `useUpdatePersonalTask` 뮤테이션 — 낙관적 업데이트 확인 (기존 훅 활용)
- [ ] 드래그 완료 즉시 TanStack Query 캐시 업데이트
- [ ] API 실패 시 롤백 + 토스트 알림

### 2.6 테스트
- [ ] 빌드 오류 없음
- [ ] 린트 오류 없음
- [ ] 수동 확인: 카드 DnD 이동, 리사이즈 핸들 동작

---

## Step 3 — 완료 검증

```bash
cd packages/frontend

# 1. 빌드 확인
bun run build

# 2. 린트 확인
bun run lint

# 3. 수동 확인 항목 (브라우저)
# - 주간뷰에서 카드를 다른 날짜 열로 드래그 → scheduledDate 날짜 변경 확인
# - 카드를 다른 시간 행으로 드래그 → scheduledDate 시간 변경 확인
# - 하단 핸들 드래그 → dueDate 시간 변경, rowspan 변경 확인
# - 상단 핸들 드래그 → scheduledDate 시간 변경 확인
# - 드래그 중 DragOverlay 카드 표시 확인
# - hover 셀 강조 확인
# - API 실패 시 롤백 동작 확인
```
