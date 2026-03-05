# WORK-26: 주간뷰 시간 그리드 + DnD 리사이즈 (예정일/마감일 시간 지원)

> Created: 2026-03-05
> Project: UC TeamSpace
> Tech Stack: NestJS / Prisma / React / @dnd-kit / TanStack Query
> Status: PLANNED

## 요청사항

[기능개선] 예정일과 마감일을 시간까지 작성 가능함 (미작성 시 해당일 전일 업무)
- 주간보기 시간단위 행 표시 예정일에 시간있는 업무는 - 해당 시간에 표시 시간이 없을 경우 열의 상단에 표시, 8시 이전와 19시 이후 인 경우 각각 하나의 셀에 표시
- 카드 드래그앤드롭으로 시간대 변경
- 마감일시가 있을 경우 해당 시간대에 row span으로 카드배치
- 카드의 상단 하단 경계선을 드래그앤 드롭해서 시간 변경 가능

---

## Goal

PersonalTask의 `scheduledDate`와 `dueDate` 필드를 날짜+시간(`@db.Timestamp`) 타입으로 확장하고,
주간뷰를 시간 단위 그리드(08:00~18:00 + 종일/오전/야간 행)로 전환하여
카드 DnD 시간대 이동 및 상단/하단 경계 리사이즈를 지원한다.

---

## 핵심 설계 결정사항

### DB 타입 변경 전략
- `scheduledDate @db.Date` → `scheduledDateTime DateTime? @db.Timestamp(3)` (새 컬럼)
- `dueDate @db.Date` → `dueDatetime DateTime? @db.Timestamp(3)` (새 컬럼)
- 기존 컬럼은 migration에서 데이터 복사 후 삭제 (컬럼명 변경 방식)
- 프론트엔드 API 타입 필드명: `scheduledDate`, `dueDate` (기존 유지, 값은 ISO 8601 datetime)

### 주간뷰 시간 그리드 구조
```
행(Row)        의미
─────────────────────────────────────
종일/미지정    scheduledDate에 시간 없는 작업
오전(~07:59)  scheduledDate 시간 < 08:00
08:00          scheduledDate 시간 = 08:xx
09:00          scheduledDate 시간 = 09:xx
...
18:00          scheduledDate 시간 = 18:xx
야간(19:00~)   scheduledDate 시간 >= 19:00
```

### rowspan 로직 (마감일시 있는 경우)
- scheduledDate에 시간이 있고 dueDate에 시간이 있으면
  두 시간 사이 행을 rowspan으로 차지
- 최소 1행, 최대 범위까지 (오전/야간 경계 클리핑)

### DnD 전략
- 열(날짜) 이동: `@dnd-kit/core` DndContext, 드래그 오버 감지로 scheduledDate 날짜 변경
- 행(시간) 이동: 카드를 드래그하여 시간 행 변경 → scheduledDate 시간 변경
- 상단/하단 리사이즈: 카드 상단 핸들 드래그 → scheduledDate 시간, 하단 핸들 → dueDate 시간 변경
- 리사이즈는 @dnd-kit/core의 useDraggable + 커스텀 delta 계산

---

## Task Dependency Graph

```
TASK-00 (DB 스키마 마이그레이션)
    │
    ├── TASK-01 (백엔드 DTO/Service/API 업데이트)
    │       │
    │       └── TASK-03 (프론트엔드 API 타입 + TaskDetailPanel 시간 입력)
    │                   │
    └── TASK-02 (주간뷰 시간 그리드 기반 컴포넌트)
                        │
                        └── TASK-04 (DnD 카드 이동 + 리사이즈)
                                    │
                                    └── TASK-05 (통합 검증 + 테스트)
```

```
TASK-00 ──► TASK-01 ──► TASK-03 ──┐
     └────► TASK-02 ───────────────► TASK-04 ──► TASK-05
```

---

## Tasks

### WORK-26-TASK-00: DB 스키마 마이그레이션 — 시간 포함 DateTime으로 전환

- **Depends on**: (없음)
- **Scope**: PersonalTask.scheduledDate(@db.Date) → scheduledDate(@db.Timestamp), dueDate(@db.Date) → dueDate(@db.Timestamp)로 변경. 기존 데이터 보존 마이그레이션 포함.
- **Files**:
  - `packages/backend/prisma/schema.prisma` — scheduledDate, dueDate 타입 변경
  - `packages/backend/prisma/migrations/WORK26_datetime_upgrade/` — 마이그레이션 SQL
- **Acceptance Criteria**:
  - [ ] scheduledDate, dueDate 컬럼이 Timestamp(3)로 변경됨
  - [ ] 기존 date-only 값이 해당일 00:00:00 UTC로 보존됨
  - [ ] prisma generate 통과
  - [ ] DB 인덱스 유지
- **Verify**:
  ```bash
  cd packages/backend && bunx prisma migrate dev --name work26_datetime_upgrade
  bunx prisma generate
  ```

### WORK-26-TASK-01: 백엔드 DTO/Service API — 시간 포함 날짜 처리

- **Depends on**: WORK-26-TASK-00
- **Scope**: DTO의 dueDate/scheduledDate를 ISO datetime 문자열로 수용, Service에서 시간 있는 경우와 날짜만 있는 경우를 구분 처리. 기존 period 필터 등 날짜 비교 로직도 @db.Date → @db.Timestamp 기준으로 수정.
- **Files**:
  - `packages/backend/src/personal-task/dto/create-personal-task.dto.ts`
  - `packages/backend/src/personal-task/dto/update-personal-task.dto.ts`
  - `packages/backend/src/personal-task/personal-task.service.ts`
  - `packages/backend/src/personal-task/personal-task.service.spec.ts`
- **Acceptance Criteria**:
  - [ ] dueDate/scheduledDate에 ISO datetime 문자열("2026-03-05T14:00:00") 저장 가능
  - [ ] 날짜만("2026-03-05") 전달 시 00:00:00으로 처리
  - [ ] period 필터 (today/this-week) 날짜 비교 정상 동작
  - [ ] 기존 테스트 통과
- **Verify**:
  ```bash
  cd packages/backend && bun run test
  bun run build
  ```

### WORK-26-TASK-02: 주간뷰 시간 그리드 기반 레이아웃 구현

- **Depends on**: WORK-26-TASK-00
- **Scope**: TaskWeeklyView를 시간 단위 그리드로 완전 재설계. Y축: 종일행 + 오전행 + 08~18시 11개 행 + 야간행 (총 14행). X축: 일~토 7열 + 예정업무 열. 카드는 시간 그리드 셀에 배치. rowspan 지원(CSS grid row-span).
- **Files**:
  - `packages/frontend/src/components/personal-task/TaskWeeklyView.tsx` — 전면 재작성
  - `packages/frontend/src/components/personal-task/WeeklyTimeGrid.tsx` — 새 컴포넌트 (그리드 구조)
  - `packages/frontend/src/components/personal-task/WeeklyGridCard.tsx` — 그리드 전용 카드 컴포넌트
- **Acceptance Criteria**:
  - [ ] 14개 시간 행 + 8개 열 그리드 렌더링
  - [ ] 시간 있는 작업 → 해당 행에 배치
  - [ ] 시간 없는 작업 → 종일 행에 배치
  - [ ] 8시 이전 → 오전 행, 19시 이후 → 야간 행
  - [ ] dueDate 시간 있는 경우 rowspan 렌더링
  - [ ] 예정업무 열은 종일/오전/야간 3행만 표시 (시간 열 없음)
  - [ ] CSS variables 사용 (HEX 하드코딩 없음)
- **Verify**:
  ```bash
  cd packages/frontend && bun run build
  bun run lint
  ```

### WORK-26-TASK-03: 프론트엔드 API 타입 + 상세 패널 시간 입력 UI

- **Depends on**: WORK-26-TASK-01
- **Scope**: PersonalTask 타입의 dueDate/scheduledDate를 datetime 문자열로 업데이트. TaskDetailPanel에 시간 입력 UI 추가 (날짜 + 시간 선택). MyTasks 페이지에서 시간 포함 예정일 생성 지원.
- **Files**:
  - `packages/frontend/src/api/personal-task.api.ts` — 타입 주석 업데이트
  - `packages/frontend/src/components/personal-task/TaskDetailPanel.tsx` — 날짜+시간 입력 추가
  - `packages/frontend/src/components/personal-task/TaskKanbanCard.tsx` — 시간 표시 업데이트
- **Acceptance Criteria**:
  - [ ] 마감일/예정일 입력 필드가 날짜 + 시간(HH:MM) 두 필드로 분리됨
  - [ ] 시간 미입력 시 날짜만 저장 (기존 동작 유지)
  - [ ] 카드에서 시간 있는 경우 시간 표시 (예: "14:00")
  - [ ] 빌드/린트 통과
- **Verify**:
  ```bash
  cd packages/frontend && bun run build
  bun run lint
  ```

### WORK-26-TASK-04: DnD 카드 이동 + 상단/하단 리사이즈

- **Depends on**: WORK-26-TASK-02, WORK-26-TASK-03
- **Scope**: @dnd-kit/core를 사용하여 주간뷰 그리드에서 카드 드래그로 날짜/시간 변경. 카드 상단 핸들 드래그 → scheduledDate 시간 변경, 하단 핸들 드래그 → dueDate 시간 변경.
- **Files**:
  - `packages/frontend/src/components/personal-task/WeeklyTimeGrid.tsx` — DnD Context 통합
  - `packages/frontend/src/components/personal-task/WeeklyGridCard.tsx` — 리사이즈 핸들 추가
  - `packages/frontend/src/hooks/usePersonalTasks.ts` — 낙관적 업데이트 뮤테이션 확인/보완
- **Acceptance Criteria**:
  - [ ] 카드를 다른 날짜 열로 드래그 → scheduledDate 날짜 변경
  - [ ] 카드를 다른 시간 행으로 드래그 → scheduledDate 시간 변경
  - [ ] 하단 핸들 드래그 → dueDate 시간 변경 (rowspan 변경)
  - [ ] 상단 핸들 드래그 → scheduledDate 시간 변경 (rowspan 상단 조정)
  - [ ] 드래그 중 시각적 피드백 (반투명 미리보기)
  - [ ] 낙관적 업데이트 적용 (즉각 UI 반영 후 API 호출)
- **Verify**:
  ```bash
  cd packages/frontend && bun run build
  bun run lint
  ```

### WORK-26-TASK-05: 통합 검증 + 테스트

- **Depends on**: WORK-26-TASK-04
- **Scope**: 전체 빌드/린트/테스트 수행. 백엔드 service spec 보완. 프론트엔드 단위 테스트(WeeklyTimeGrid 그리드 배치 로직). 기존 기능(칸반뷰/리스트뷰) 회귀 확인.
- **Files**:
  - `packages/backend/src/personal-task/personal-task.service.spec.ts`
  - `packages/frontend/src/components/personal-task/WeeklyTimeGrid.test.tsx` — 새 테스트
- **Acceptance Criteria**:
  - [ ] `bun run build` 전체 성공
  - [ ] `bun run lint` 전체 통과
  - [ ] `bun run test` 전체 통과
  - [ ] 기존 칸반/리스트뷰 기능 회귀 없음
- **Verify**:
  ```bash
  bun run build
  bun run lint
  bun run test
  ```
