# WORK-26-TASK-03: 프론트엔드 API 타입 + 상세 패널 시간 입력 UI

> **Phase:** 2
> **선행 TASK:** WORK-26-TASK-01
> **목표:** PersonalTask API 타입의 dueDate/scheduledDate를 datetime 문자열로 명시하고, TaskDetailPanel에 날짜+시간 분리 입력 UI를 추가한다.

---

## Step 1 — 계획서

### 1.1 작업 범위

현재 `TaskDetailPanel`의 마감일/예정일은 `<input type="date">`로만 처리된다.
이를 날짜(`<input type="date">`) + 시간(`<input type="time">`) 두 필드로 분리한다.
시간 미입력 시에는 날짜만 ISO date 형식으로 전달 (기존 동작 유지).
시간 입력 시 `YYYY-MM-DDTHH:MM:00.000Z` 형식으로 조합하여 API 전달.
카드(WeeklyGridCard, TaskKanbanCard)에서 시간 있는 경우 시간 표시를 추가한다.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| 수정 | `packages/frontend/src/api/personal-task.api.ts` — 타입 주석/JSDoc 업데이트 |
| 수정 | `packages/frontend/src/components/personal-task/TaskDetailPanel.tsx` — 날짜+시간 입력 UI |
| 수정 | `packages/frontend/src/components/personal-task/TaskKanbanCard.tsx` — 시간 표시 추가 |

### 1.3 날짜+시간 입력 UI 설계

```
마감일
  [ 날짜 input type="date" ]  [ 시간 input type="time" ]  [X 시간 지우기]
  시간 없음 → 날짜만 저장 → API: "2026-03-05"
  시간 있음 → 조합하여 저장 → API: "2026-03-05T14:00:00.000Z" (로컬 시간 기준)
```

---

## Step 2 — 체크리스트

### 2.1 API 타입 업데이트
- [ ] `personal-task.api.ts`: `PersonalTask.dueDate`, `scheduledDate` 필드 타입을 string (ISO datetime) 으로 명시 (JSDoc 주석)
- [ ] `UpdatePersonalTaskDto.dueDate`, `scheduledDate` — datetime 문자열 가능 명시

### 2.2 TaskDetailPanel 날짜+시간 입력
- [ ] 마감일 섹션: `<input type="date">` + `<input type="time">` 분리
- [ ] 예정일 섹션: 동일 패턴
- [ ] 날짜 변경 시 기존 시간 유지 (시간 있는 경우)
- [ ] 시간 지우기 버튼(X) → 날짜만 남기기
- [ ] 날짜 지우기 → dueDate/scheduledDate null 전달
- [ ] 날짜+시간 조합 → UTC 변환 후 API 전달
  ```
  const dt = `${dateStr}T${timeStr}:00` (로컬 시간)
  → new Date(dt).toISOString() → API 전달
  ```
- [ ] 기존 dueDate 값에서 날짜/시간 분리 파싱

### 2.3 TaskKanbanCard 시간 표시
- [ ] dueDate에 시간 있는 경우: "마감: MM/DD HH:MM" 형식 표시
- [ ] scheduledDate에 시간 있는 경우: "예정: HH:MM" compact 표시

### 2.4 테스트
- [ ] 빌드 오류 없음
- [ ] 린트 오류 없음
- [ ] 수동 확인: 패널에서 시간 입력 후 저장 → 주간뷰 해당 시간 행에 배치 확인

---

## Step 3 — 완료 검증

```bash
cd packages/frontend

# 1. 빌드 확인
bun run build

# 2. 린트 확인
bun run lint

# 3. 수동 확인 항목 (브라우저)
# - TaskDetailPanel 마감일/예정일 날짜+시간 입력 UI 표시
# - 시간 입력 후 저장 → DB에 datetime 저장 확인
# - 시간 없이 날짜만 저장 → 기존 동작 유지
# - TaskKanbanCard에서 시간 표시 확인
```
