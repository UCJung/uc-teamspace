# WORK-25-TASK-02: 프론트엔드 API 타입 + TaskDetailPanel 예정일 UI

> **Phase:** 2
> **선행 TASK:** WORK-25-TASK-01
> **목표:** 프론트엔드 API 타입에 scheduledDate를 추가하고, TaskDetailPanel에 예정일 입력 필드를 제공한다.

---

## Step 1 — 계획서

### 1.1 작업 범위
`personal-task.api.ts`의 `PersonalTask`, `CreatePersonalTaskDto`, `UpdatePersonalTaskDto` 인터페이스에 `scheduledDate?: string` 필드를 추가한다. `TaskDetailPanel.tsx`에 마감일(dueDate) 필드 아래 예정일(scheduledDate) 입력 필드를 추가하고, 변경 시 `updateMutation`을 호출한다.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| 수정 | `packages/frontend/src/api/personal-task.api.ts` — PersonalTask/DTO에 scheduledDate 추가 |
| 수정 | `packages/frontend/src/components/personal-task/TaskDetailPanel.tsx` — 예정일 입력 필드 추가 |

---

## Step 2 — 체크리스트

### 2.1 API 타입 수정 (personal-task.api.ts)
- [ ] `PersonalTask` 인터페이스에 `scheduledDate?: string` 추가
- [ ] `CreatePersonalTaskDto`에 `scheduledDate?: string` 추가
- [ ] `UpdatePersonalTaskDto`에 `scheduledDate?: string | null` 추가

### 2.2 TaskDetailPanel — 예정일 필드 추가
- [ ] 마감일(dueDate) 필드 아래에 예정일(scheduledDate) 입력 섹션 추가
- [ ] `type="date"` input 사용, 레이블: "예정일" (Calendar 아이콘 포함)
- [ ] 값 변경 시 `updateMutation.mutate({ id: task.id, dto: { scheduledDate: value || null } })` 호출
- [ ] `useEffect` task 동기화 블록에 `scheduledDate` 반영 (필요 시)
- [ ] dueDate와 동일한 스타일(`selectStyle`) 적용

### 2.3 빌드 및 린트
- [ ] `bun run build` 성공
- [ ] `bun run lint` 오류 없음

---

## Step 3 — 완료 검증

```bash
cd packages/frontend

# 1. 타입 검사 포함 빌드
bun run build

# 2. 린트
bun run lint

# 3. 테스트
bun run test
```

수동 확인:
- TaskDetailPanel을 열어 마감일 아래 "예정일" 필드 표시 확인
- 예정일 선택 후 저장 → GET 재조회 시 scheduledDate 포함 확인
