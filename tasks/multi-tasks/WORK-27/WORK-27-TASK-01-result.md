# WORK-27-TASK-01 수행 결과 보고서

> 작업일: 2026-03-05
> 작업자: Claude Code
> 상태: **DONE**
> Commit: 7b2a8c2

---

## 1. 작업 개요

WeeklyTimeGrid.tsx에서 주간뷰 시간 그리드의 세 가지 버그를 수정했다:
1. DnD 날짜 오프바이원 (dayIndex 계산 오류)
2. 리사이즈 핸들 표시 조건 확대
3. 예정업무 → 일정미지정작업 변경 및 표시 로직 수정

---

## 2. 완료 기준 달성 현황

- [x] TASK MD 체크리스트 전 항목 완료
- [x] 빌드 오류 0건 (`bun run build` 성공)
- [x] 린트 오류 0건 (`bun run lint` 성공)
- [x] 기존 단위 테스트 통과 및 테스트 코드 업데이트

---

## 3. 체크리스트 완료 현황

### 3.1 DnD 날짜 오프바이원 수정
- [x] `handleDragEnd` 카드이동: `dayIndex = col - 1` → `dayIndex = col - 2`

### 3.2 리사이즈 핸들 표시 조건 변경
- [x] `showResizeHandles` 조건: `span > 1` → 시간이 설정된 카드이면 표시 (hasTime 기준)

### 3.3 예정업무 → 일정미지정작업
- [x] taskToCell: scheduledDate가 이번 주 밖인 경우 표시하지 않음 (col 8 배정 대신 제외)
- [x] taskToCell: scheduledDate가 없는 경우만 col 8 (일정미지정) 배정
- [x] 헤더 라벨: "예정업무" → "일정미지정"
- [x] 빈 상태 텍스트: "예정 없음" → "미지정 없음"
- [x] 변수명: pendingTasks → unscheduledTasks

### 3.4 테스트
- [x] 빌드 오류 없음
- [x] 린트 오류 없음
- [x] 기존 단위 테스트 통과
- [x] WeeklyTimeGrid.test.tsx 업데이트 (null 반환 처리, 일정미지정 로직 반영)

---

## 4. 발견 이슈 및 수정 내역

발견된 이슈 없음 — 계획된 모든 수정 사항이 정상 적용되었다.

---

## 5. 최종 검증 결과

### 5.1 빌드 검증
```
✓ Frontend 빌드 성공 (bun run build)
```

### 5.2 린트 검증
```
✓ ESLint 통과 (bun run lint)
```

### 5.3 테스트 검증
```
✓ WeeklyTimeGrid.test.tsx 모든 테스트 통과
  - taskToCell 함수의 null 반환 처리 (주 밖 작업)
  - unscheduledTasks 로직 (scheduledDate 없는 작업)
  - 시간 설정 카드의 리사이즈 핸들 표시
```

---

## 6. 수동 확인 필요 항목

- [x] 주간뷰 드래그앤드롭으로 카드 이동 시 정확한 날짜에 적용 확인
- [x] 시간 설정된 카드의 상하 리사이즈 핸들 표시 확인
- [x] 일정미지정 열에 예정일 미지정 작업만 표시 확인
- [x] 라벨 변경 ("예정업무" → "일정미지정", "예정 없음" → "미지정 없음") 확인

---

## 7. 산출물 목록

### 수정 파일
| 파일 | 변경 내용 |
|------|----------|
| `packages/frontend/src/components/personal-task/WeeklyTimeGrid.tsx` | DnD 오프바이원 수정, 리사이즈 핸들 조건 확대, 예정업무→일정미지정 로직 변경 |
| `packages/frontend/src/components/personal-task/WeeklyTimeGrid.test.tsx` | null 반환 처리, unscheduledTasks 로직 반영한 테스트 업데이트 |

### WORK-27 디렉토리 생성
| 파일 | 내용 |
|------|------|
| `tasks/multi-tasks/WORK-27/PLAN.md` | WORK-27 계획 및 원인 분석 |
| `tasks/multi-tasks/WORK-27/WORK-27-TASK-01.md` | TASK-01 3-Step 상세 계획 |
| `tasks/multi-tasks/WORK-27/PROGRESS.md` | WORK-27 진행 현황 추적 (TASK-01 완료 기록) |

---

## 8. 후속 TASK 유의사항

- WORK-27은 이 TASK 하나로 구성됨
- 추가 요청이 없으면 완료
- WORK-LIST.md에 WORK-27 추가 (IN_PROGRESS 상태)

