# WORK-18-TASK-20: 시간표 셀 UX 개선 (열 너비 + 입력 동작)

> 의존: WORK-18-TASK-19
> 상태: **대기**

---

## 1. 수정 항목

1. **요일 열 너비 통일**: `COL_W.day`를 `COL_W.date`와 동일한 46px로 변경
2. **셀 포커스 시 전체 선택**: input에 `onFocus={(e) => e.target.select()}` 추가 → 마우스 클릭 시 기존 값이 블록 선택되어 바로 덮어쓰기 가능
3. **0값 입력 시 "01" 방지**: value를 `0`이면 빈 문자열(`""`)로 표시하여, 새 숫자 입력 시 깔끔하게 입력됨

---

## 2. 체크리스트

- [ ] `COL_W.day: 36 → 46` 변경
- [ ] 시간 입력 input에 `onFocus={(e) => e.target.select()}` 추가
- [ ] value를 `(wl?.hours ?? 0) || ''` 형태로 변경 (0일 때 빈 문자열)
- [ ] `bun run build` — 0 에러
- [ ] `bun run lint` — 0 에러
