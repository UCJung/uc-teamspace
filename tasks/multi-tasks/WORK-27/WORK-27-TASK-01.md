# WORK-27-TASK-01: 주간뷰 DnD 날짜 오프바이원 + 리사이즈 핸들 + 예정업무→일정미지정 수정

> **Phase:** 0
> **선행 TASK:** 없음
> **목표:** 주간뷰 시간 그리드의 세 가지 버그를 수정한다.

## 요청사항

- DnD로 날짜/시간 이동 시 다음일에 적용되는 오프바이원 버그 수정
- 리사이즈 핸들이 시간 설정된 모든 카드에 표시되도록 수정
- 예정업무 열을 일정미지정작업으로 변경하고 scheduledDate가 없는 작업만 표시

---

## Step 1 — 계획서

### 1.1 작업 범위

WeeklyTimeGrid.tsx에서 세 가지 버그를 수정한다:
1. handleDragEnd의 dayIndex 계산 오류 (col - 1 → col - 2)
2. showResizeHandles 조건을 시간 설정 카드 전체로 확대
3. taskToCell의 예정업무 열 배치 기준 변경 + 라벨 변경

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| 수정 | `packages/frontend/src/components/personal-task/WeeklyTimeGrid.tsx` |

---

## Step 2 — 체크리스트

### 2.1 DnD 날짜 오프바이원 수정
- [ ] `handleDragEnd` 카드이동: `dayIndex = col - 1` → `dayIndex = col - 2`

### 2.2 리사이즈 핸들 표시 조건 변경
- [ ] `showResizeHandles` 조건: `span > 1` → 시간이 설정된 카드이면 표시 (hasTime 기준)

### 2.3 예정업무 → 일정미지정작업
- [ ] taskToCell: scheduledDate가 이번 주 밖인 경우 → 해당 주 밖에 있으면 표시하지 않음 (col 8 배정 대신 제외)
- [ ] taskToCell: scheduledDate가 없는 경우만 col 8 (일정미지정) 배정
- [ ] 헤더 라벨: "예정업무" → "일정미지정"
- [ ] 빈 상태 텍스트: "예정 없음" → "미지정 없음"

### 2.4 테스트
- [ ] 빌드 오류 없음
- [ ] 린트 오류 없음
- [ ] 기존 단위 테스트 통과 (WeeklyTimeGrid.test.tsx 수정 필요할 수 있음)

---

## Step 3 — 완료 검증

```bash
cd packages/frontend
bun run build
bun run lint
bun run test
```
