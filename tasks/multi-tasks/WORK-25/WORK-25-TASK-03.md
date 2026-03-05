# WORK-25-TASK-03: 주간뷰 배치 로직 + 레이아웃 + 빈 영역 클릭 등록

> **Phase:** 3
> **선행 TASK:** WORK-25-TASK-02
> **목표:** TaskWeeklyView의 배치 로직을 scheduledDate 우선으로 변경하고, 레이아웃을 화면 꽉 채우기로 개선하며, 날짜 열 빈 영역 클릭 시 해당 날짜를 예정일로 한 새 작업 등록을 지원한다.

---

## Step 1 — 계획서

### 1.1 작업 범위

**배치 로직 변경 (TaskWeeklyView.tsx)**
- 기존: COMPLETED→completedAt, IN_PROGRESS→startedAt, 나머지→예정업무 열
- 변경: scheduledDate 있으면 최우선 해당 날짜 열 배치 (주간 범위 밖이면 예정업무 열)
  - scheduledDate 없는 경우: 기존 로직(completedAt → startedAt → 예정업무) 그대로 유지

**레이아웃 변경 (TaskWeeklyView.tsx)**
- 기존: 각 열 `width: 160px` (날짜 열), `width: 180px` (예정업무 열), `flex-shrink-0`, 컨테이너 `overflow-x-auto`
- 변경: 컨테이너에 `min-width` 설정 후 `flex: 1 1 0`으로 균등 분배, 좁은 화면에서 `overflow-x: auto` 유지
- 각 열에 `min-width: 120px` 설정으로 너무 좁아지는 것 방지

**빈 영역 클릭 (TaskWeeklyView.tsx + MyTasks.tsx + TaskQuickInput.tsx)**
- `TaskWeeklyView`에 `onClickEmptyDate?: (date: Date) => void` prop 추가
- 날짜 열의 카드 영역(빈 공간) 클릭 시 해당 날짜를 `onClickEmptyDate(date)` 로 전달
- `MyTasks.tsx`에서 `onClickEmptyDate` 수신 → `scheduledDate` 초기값 지정, 인라인 입력 활성화
- `TaskQuickInput.tsx`에 `defaultScheduledDate?: string` prop 추가 → 입력 폼에 미리 세팅

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| 수정 | `packages/frontend/src/components/personal-task/TaskWeeklyView.tsx` — 배치 로직 + 레이아웃 + 빈 영역 클릭 |
| 수정 | `packages/frontend/src/pages/MyTasks.tsx` — onClickEmptyDate 핸들러 + 스크롤 영역 조정 |
| 수정 | `packages/frontend/src/components/personal-task/TaskQuickInput.tsx` — defaultScheduledDate prop 지원 |

---

## Step 2 — 체크리스트

### 2.1 TaskWeeklyView — 배치 로직
- [ ] `columns` useMemo 내 배치 로직 수정: `task.scheduledDate` 있으면 파싱 후 주간 범위 비교
- [ ] scheduledDate가 주간 범위 내: 해당 요일 인덱스(0-6) 열에 배치
- [ ] scheduledDate가 주간 범위 밖(미래/과거): 예정업무 열(cols[7])에 배치
- [ ] scheduledDate 없는 task: 기존 로직(completedAt / startedAt / 예정업무) 유지

### 2.2 TaskWeeklyView — 레이아웃 (화면 꽉 채우기)
- [ ] 컨테이너 div: `flex gap-2 flex-1 min-h-0 overflow-x-auto`
- [ ] 각 날짜 열: `flex-1 min-w-[120px]` (flex-shrink-0 제거, width 고정 제거)
- [ ] 예정업무 열: `flex-1 min-w-[140px]`
- [ ] 열 높이: 컨테이너 `h-full` 또는 `flex-1` 으로 수직 꽉 채우기

### 2.3 TaskWeeklyView — 빈 영역 클릭
- [ ] `onClickEmptyDate?: (date: Date) => void` prop 추가 (interface 수정)
- [ ] 날짜 열 카드 영역 div에 onClick 핸들러 추가 (카드 영역 전체 클릭 감지)
- [ ] 카드가 클릭될 때는 onSelectTask만 발생하도록 (이벤트 버블링 방지: card에 `stopPropagation`)
- [ ] 클릭 날짜 계산: `sunday.getDate() + dayIndex` → Date 객체 생성 후 콜백 전달

### 2.4 MyTasks.tsx — onClickEmptyDate 핸들러
- [ ] `clickedDate` state 추가 (`Date | null`)
- [ ] `handleClickEmptyDate(date: Date)` 함수 구현
- [ ] 주간뷰 `TaskWeeklyView`에 `onClickEmptyDate` prop 전달
- [ ] `clickedDate` 있을 때: `TaskQuickInput`을 활성화하거나 별도 인라인 입력 표시 (defaultScheduledDate 전달)
- [ ] 등록 완료 또는 취소 시 `clickedDate` 초기화

### 2.5 TaskQuickInput.tsx — defaultScheduledDate prop
- [ ] `defaultScheduledDate?: string` prop 추가 (ISO 날짜 문자열, e.g. "2026-03-10")
- [ ] prop이 있으면 등록 시 `scheduledDate` 필드에 포함
- [ ] prop 변경 시 내부 상태 동기화 (useEffect)

### 2.6 테스트
- [ ] `bun run build` 성공
- [ ] `bun run lint` 오류 없음
- [ ] `bun run test` 기존 테스트 통과

---

## Step 3 — 완료 검증

```bash
cd packages/frontend

# 1. 빌드
bun run build

# 2. 린트
bun run lint

# 3. 테스트
bun run test
```

수동 확인 (브라우저):
- 주간뷰 화면이 좌우 여백 없이 화면 너비를 꽉 채우는지 확인
- 예정일이 설정된 작업이 해당 요일 열에 표시되는지 확인
- 날짜 열의 빈 공간 클릭 시 해당 날짜를 예정일로 한 작업 등록 UI가 활성화되는지 확인
- 등록 완료 후 해당 열에 새 카드가 표시되는지 확인
