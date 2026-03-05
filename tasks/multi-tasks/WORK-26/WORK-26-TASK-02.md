# WORK-26-TASK-02: 주간뷰 시간 그리드 기반 레이아웃 구현

> **Phase:** 1 (TASK-01과 병렬)
> **선행 TASK:** WORK-26-TASK-00
> **목표:** TaskWeeklyView를 시간 단위 그리드(CSS Grid)로 전면 재설계한다. Y축 14개 행(종일/오전/08~18시/야간), X축 8열(일~토+예정업무). 카드는 해당 시간 셀에 배치되며 dueDate 시간이 있으면 rowspan 처리한다.

---

## Step 1 — 계획서

### 1.1 작업 범위

현재 TaskWeeklyView는 flex 기반으로 열별 카드를 쌓는 구조다.
이를 CSS Grid 기반 시간 그리드로 전환한다.
그리드 구조는 `WeeklyTimeGrid.tsx` 신규 컴포넌트로 분리하고,
기존 `TaskWeeklyView.tsx`는 주간 네비게이션 + 그리드 조합 래퍼로 유지한다.
그리드 전용 카드는 `WeeklyGridCard.tsx`로 분리한다 (DnD 핸들 추가를 위한 준비).

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| 수정 | `packages/frontend/src/components/personal-task/TaskWeeklyView.tsx` — WeeklyTimeGrid 사용 래퍼로 변경 |
| 생성 | `packages/frontend/src/components/personal-task/WeeklyTimeGrid.tsx` — 시간 그리드 메인 컴포넌트 |
| 생성 | `packages/frontend/src/components/personal-task/WeeklyGridCard.tsx` — 그리드 전용 카드 |

### 1.3 그리드 행 정의

| Row Index | 레이블 | 조건 |
|-----------|--------|------|
| 0 | 종일 | scheduledDate 없거나 시간 없음(00:00) |
| 1 | ~07:59 | scheduledDate 시간 < 08:00 |
| 2 | 08:00 | 08:00 ≤ 시간 < 09:00 |
| 3 | 09:00 | 09:00 ≤ 시간 < 10:00 |
| ... | ... | ... |
| 12 | 17:00 | 17:00 ≤ 시간 < 18:00 |
| 13 | 18:00 | 18:00 ≤ 시간 < 19:00 |
| 14 | 19:00~ | 시간 ≥ 19:00 |

### 1.4 그리드 열 정의

| Col Index | 내용 |
|-----------|------|
| 0 | 시간 레이블 열 (고정 60px) |
| 1~7 | 일~토 |
| 8 | 예정업무 (scheduledDate가 이번 주 범위 밖이거나 없는 작업) |

### 1.5 rowspan 계산

```
scheduledHour = scheduledDate의 시간 (없으면 rowspan 없음)
dueHour = dueDate의 시간 (없으면 rowspan 1)
rowStart = hourToRowIndex(scheduledHour)
rowEnd = hourToRowIndex(dueHour) + 1  // exclusive
span = rowEnd - rowStart (최소 1, 최대 13)
```

---

## Step 2 — 체크리스트

### 2.1 WeeklyTimeGrid 컴포넌트
- [ ] CSS Grid로 시간×날짜 그리드 구성 (14행 × 9열)
- [ ] 행 레이블 열(60px 고정) + 날짜 헤더 행 렌더링
- [ ] 열 헤더: 날짜 + 요일, 오늘 열 강조 (var(--primary) 테두리)
- [ ] 행 헤더: 시간 레이블 (종일/~07:59/08:00~18:00/19:00~)
- [ ] 각 셀 클릭 → onClickEmptyDate(date, hour) 콜백 (빈 셀)
- [ ] 작업 배치: `taskToCell()` 함수로 row/col/span 계산
- [ ] rowspan 카드: `grid-row: span N` 스타일 적용
- [ ] 예정업무 열: 종일/오전/야간 3행만 표시, 중간 시간 행은 합쳐서 표시 또는 빈 셀

### 2.2 WeeklyGridCard 컴포넌트
- [ ] 그리드 내 카드 — 작은 폰트(10px), 제목 1줄 clamp
- [ ] 우선순위 색상 좌측 테두리 (var(--danger)/var(--accent)/var(--text-sub))
- [ ] 완료 작업: 취소선 + 흐린 색상
- [ ] 시간 표시: scheduledDate 시간 있으면 "HH:MM" 표시
- [ ] 카드 클릭 → onSelect(task)
- [ ] DnD 핸들 영역 (TASK-04에서 연결 예정) — data-dnd-card 속성

### 2.3 TaskWeeklyView 업데이트
- [ ] WeeklyTimeGrid 임포트 및 사용
- [ ] 주간 네비게이션 유지 (이전/다음/이번 주)
- [ ] isLoading 스피너 유지
- [ ] onClickEmptyDate 콜백 전달 (날짜+시간 정보 포함)

### 2.4 테스트
- [ ] 빌드 오류 없음
- [ ] 린트 오류 없음

---

## Step 3 — 완료 검증

```bash
cd packages/frontend

# 1. 빌드 확인
bun run build

# 2. 린트 확인
bun run lint

# 3. 수동 확인 (브라우저)
# - MyTasks 페이지 주간뷰 전환
# - 시간 그리드 14행 × 9열 렌더링 확인
# - 시간 있는 작업 → 해당 시간 행 배치 확인
# - 시간 없는 작업 → 종일 행 배치 확인
# - 오늘 열 강조 확인
```
