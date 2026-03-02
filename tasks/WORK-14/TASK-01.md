# WORK-14-TASK-01: 프론트 — GridCell 높이 + FormattedText 기호 + ExpandedEditor 오버레이

> 요구사항: R1 (입력박스 높이), R2 (세부기호 변경), R3 (확대편집창 오버레이)
> 의존: 없음
> 상태: PENDING

## 목표

1. GridCell: 편집 진입 시 내용 양에 맞게 textarea 높이 동적 조정
2. FormattedText: 세부내용 기호 `ㄴ` → `-` 로 변경 (파싱은 둘 다 인식)
3. ExpandedEditor: 화면 하단 고정(fixed) 오버레이로 변경

---

## Step 1 — 체크리스트

### 1.1 GridCell 입력박스 높이 (R1)

현재: textarea에 `autoResize()` 함수가 있으나 `onInput` 이벤트에서만 호출
문제: 최초 편집 진입 시 autoResize 미호출 → 내용이 길면 잘림

- [ ] `useEffect` 또는 `ref callback`으로 편집 모드 진입 시 즉시 autoResize 호출
- [ ] autoResize 최소 높이를 내용 양에 맞게 조정 (scrollHeight 기반)
- [ ] 빈 내용일 때는 기존 min-h 유지

### 1.2 FormattedText 세부기호 변경 (R2)

현재: `ㄴ`으로 시작하는 줄 → `type: 'detail'` → 렌더링 시 `ㄴ {content}`

- [ ] `parseLine()`: `ㄴ`과 `-` 둘 다 `detail` 타입으로 인식
- [ ] 렌더링: `ㄴ {content}` → `- {content}` 로 변경

### 1.3 ExpandedEditor 하단 고정 오버레이 (R3)

현재: 인라인 렌더링 (행 아래 `mt-3`에 삽입)
문제: 목록이 길면 확대편집창이 화면 밖으로 밀려남

- [ ] `position: fixed`, `bottom: 0`, `left: sidebar-width`, `right: 0` 적용
- [ ] `z-index` 높게 설정 (목록 위에 표시)
- [ ] 배경 오버레이(backdrop) 추가로 편집 중 포커스 유도
- [ ] 기존 인라인 위치 렌더링 로직 제거

---

## Step 2 — 완료 검증

```bash
cd /c/rnd/weekly-report/packages/frontend
bun run build
```

### 수동 확인 필요
- [ ] 긴 내용의 셀 클릭 시 textarea 높이가 내용에 맞게 조정되는지
- [ ] `-`로 시작하는 줄이 detail 서식으로 렌더링되는지
- [ ] 확대편집창이 화면 하단에 고정되어 목록 위에 표시되는지

---

## 산출물

| Path | Action | Description |
|------|--------|-------------|
| `packages/frontend/src/components/grid/GridCell.tsx` | MODIFY | 편집 진입 시 autoResize 즉시 호출 |
| `packages/frontend/src/components/grid/FormattedText.tsx` | MODIFY | ㄴ/-를 detail로 파싱, - 로 렌더링 |
| `packages/frontend/src/components/grid/ExpandedEditor.tsx` | MODIFY | fixed bottom 오버레이 |
