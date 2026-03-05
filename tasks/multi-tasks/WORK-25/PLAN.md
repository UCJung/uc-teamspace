# WORK-25: 주간뷰 예정일 기반 작업 배치 + UX 개선

> Created: 2026-03-05
> Project: UC TeamSpace
> Tech Stack: NestJS 11 / Prisma 6 / React 18 / TypeScript 5
> Status: PLANNED

---

## 요청사항

[추가기능] 작업 항목 추가 - 예정일 항목을 추가
- 주간보기 : 예정일이 있는 작업을 해당 날짜에 열에 표시
- 주간보기 : 화면에 꽉차게 수정
- 주간보기 : 열컬럼의 빈 영역을 클릭하면 새로운 작업 등록

---

## Goal

PersonalTask 모델에 `scheduledDate`(예정일) 필드를 추가하고, 주간뷰(TaskWeeklyView)에서 예정일 기준으로 작업을 날짜 열에 배치한다. 아울러 주간뷰가 화면을 꽉 채우도록 레이아웃을 개선하고, 날짜 열의 빈 영역 클릭 시 해당 날짜를 예정일로 미리 채워 새 작업을 빠르게 등록할 수 있게 한다.

---

## 요구사항 분석

### 1. scheduledDate 필드 추가 (백엔드 + DB)
- `PersonalTask` 모델에 `scheduledDate DateTime? @db.Date` 추가
- Prisma 마이그레이션 실행
- `CreatePersonalTaskDto` / `UpdatePersonalTaskDto`에 `scheduledDate` 추가
- `personal-task.service.ts`의 create/update 로직에 반영
- 응답 타입에 `scheduledDate` 포함

### 2. 주간뷰 배치 로직 변경
현재 배치 로직:
- COMPLETED + completedAt → 완료일 기준 날짜 열
- IN_PROGRESS + startedAt → 시작일 기준 날짜 열
- 나머지(BEFORE_START 등) → 예정업무 열(col[7])

변경 후 배치 로직 (우선순위 순):
1. `scheduledDate`가 있으면 → 해당 날짜 열에 배치 (주간 범위 내면 날짜 열, 범위 밖이면 예정업무 열)
2. `scheduledDate`가 없고 COMPLETED + completedAt → 완료일 기준 날짜 열
3. `scheduledDate`가 없고 IN_PROGRESS + startedAt → 시작일 기준 날짜 열
4. 나머지 → 예정업무 열

### 3. 주간뷰 레이아웃 — 화면 꽉 채우기
- 현재: 각 열 `width: 160px` 고정, `flex-shrink-0` + `overflow-x-auto`
- 변경: 각 열이 사용 가능한 너비를 균등 분배 (`flex: 1 1 0`, `min-width` 설정)
- 컨테이너: `overflow-x: auto` 유지 (좁은 화면에서 스크롤)

### 4. 날짜 열 빈 영역 클릭 → 새 작업 등록
- 날짜 열의 빈 영역(카드가 없는 곳) 클릭 시 `onClickEmptyArea(date)` 콜백 발생
- `MyTasks.tsx`에서 해당 날짜를 `scheduledDate` 초기값으로 하여 `TaskQuickInput` 또는 인라인 폼 활성화

### 5. 프론트엔드 타입 + API 업데이트
- `PersonalTask` 인터페이스에 `scheduledDate?: string` 추가
- `CreatePersonalTaskDto` / `UpdatePersonalTaskDto`에 `scheduledDate` 추가
- `TaskDetailPanel`에 예정일 입력 필드 추가 (마감일 아래)

---

## Task Dependency Graph

```
WORK-25-TASK-01
  DB 스키마 + 백엔드 API
        │
        ▼
WORK-25-TASK-02
  프론트엔드 타입 + 상세 패널 예정일 UI
        │
        ▼
WORK-25-TASK-03
  주간뷰 배치 로직 + 레이아웃 + 빈 영역 클릭
```

---

## Tasks

### WORK-25-TASK-01: DB 스키마 + 백엔드 API — scheduledDate 필드 추가
- **Depends on**: (none)
- **Scope**:
  - `schema.prisma` PersonalTask 모델에 `scheduledDate DateTime? @db.Date` 추가
  - Prisma 마이그레이션 생성 및 실행
  - `CreatePersonalTaskDto` / `UpdatePersonalTaskDto`에 `scheduledDate` 추가
  - `personal-task.service.ts` create/update 로직에 `scheduledDate` 반영
  - `personal-task.service.ts` 목록/단건 응답에 `scheduledDate` 포함 확인
- **Files**:
  - `packages/backend/prisma/schema.prisma` — scheduledDate 필드 추가
  - `packages/backend/prisma/migrations/` — 마이그레이션 파일 생성
  - `packages/backend/src/personal-task/dto/create-personal-task.dto.ts` — scheduledDate 추가
  - `packages/backend/src/personal-task/dto/update-personal-task.dto.ts` — scheduledDate 추가
  - `packages/backend/src/personal-task/personal-task.service.ts` — create/update 반영
- **Acceptance Criteria**:
  - [ ] `personal_tasks` 테이블에 `scheduled_date` 컬럼 존재
  - [ ] PATCH `/api/v1/personal-tasks/:id` 요청 시 scheduledDate 저장 가능
  - [ ] GET `/api/v1/personal-tasks` 응답에 scheduledDate 포함
- **Verify**:
  ```bash
  cd packages/backend && bun run build
  bunx prisma migrate dev --name add_scheduled_date_to_personal_task
  ```

### WORK-25-TASK-02: 프론트엔드 API 타입 + TaskDetailPanel 예정일 UI
- **Depends on**: WORK-25-TASK-01
- **Scope**:
  - `personal-task.api.ts`의 `PersonalTask`, `CreatePersonalTaskDto`, `UpdatePersonalTaskDto`에 `scheduledDate` 추가
  - `TaskDetailPanel.tsx`에 예정일(`scheduledDate`) 입력 필드 추가 (마감일 아래 위치)
  - 예정일 변경 시 `updateMutation` 호출 (dueDate와 동일한 방식)
  - `useEffect`에 `task.scheduledDate` 동기화 추가
- **Files**:
  - `packages/frontend/src/api/personal-task.api.ts` — scheduledDate 타입 추가
  - `packages/frontend/src/components/personal-task/TaskDetailPanel.tsx` — 예정일 필드 추가
- **Acceptance Criteria**:
  - [ ] TaskDetailPanel에서 예정일 입력 및 저장 가능
  - [ ] 예정일 저장 후 주간뷰에 즉시 반영 (쿼리 무효화)
  - [ ] 빌드 오류 없음
- **Verify**:
  ```bash
  cd packages/frontend && bun run build && bun run lint
  ```

### WORK-25-TASK-03: 주간뷰 배치 로직 + 레이아웃 + 빈 영역 클릭 등록
- **Depends on**: WORK-25-TASK-02
- **Scope**:
  - `TaskWeeklyView.tsx` 배치 로직: scheduledDate 우선 → completedAt → startedAt → 예정업무 열
  - `TaskWeeklyView.tsx` 레이아웃: 각 열 flex: 1 1 0 (균등 분배), overflow-x: auto 유지
  - `TaskWeeklyView.tsx` 날짜 열 빈 영역에 `onClick` 핸들러 추가 → `onClickEmptyDate?(date: Date)` prop으로 전달
  - `MyTasks.tsx`에서 `onClickEmptyDate` 수신 → `scheduledDate` 초기값 지정하여 인라인 폼 또는 모달 등록
  - `TaskQuickInput` 또는 별도 인라인 입력 폼에 `scheduledDate` 초기값 지원
- **Files**:
  - `packages/frontend/src/components/personal-task/TaskWeeklyView.tsx` — 배치 로직 + 레이아웃 + 빈 영역 클릭
  - `packages/frontend/src/pages/MyTasks.tsx` — onClickEmptyDate 핸들러 연결
  - `packages/frontend/src/components/personal-task/TaskQuickInput.tsx` — scheduledDate 초기값 prop 추가
- **Acceptance Criteria**:
  - [ ] scheduledDate가 있는 작업이 해당 날짜 열에 표시됨
  - [ ] 주간뷰가 화면 너비를 꽉 채워 표시됨
  - [ ] 날짜 열 빈 영역 클릭 시 해당 날짜를 예정일로 하는 작업 등록 UI 활성화
  - [ ] 빌드 + 린트 오류 없음
- **Verify**:
  ```bash
  cd packages/frontend && bun run build && bun run lint
  bun run test
  ```
