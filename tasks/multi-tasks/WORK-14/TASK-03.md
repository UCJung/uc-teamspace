# WORK-14-TASK-03: 프론트 — 내 주간보고 정렬 + 전주불러오기 UI 반영

> 요구사항: R4 (전주불러오기), R5 (목록 정렬)
> 의존: WORK-14-TASK-00
> 상태: PENDING

## 목표

1. 내 주간보고 작성 목록: 프로젝트 정렬순서로 표시
2. 전주불러오기: 변경된 백엔드(진행/예정/비고 그대로 복사)에 맞게 UI 반영

---

## Step 1 — 체크리스트

### 1.1 목록 정렬순서 변경 (R5)

현재: workItems를 sortOrder 기준으로 표시
변경: project.sortOrder 기준으로 정렬

- [ ] workItems 표시 시 `project.sortOrder` 기준 정렬 적용
- [ ] 프론트에서 정렬하거나, 백엔드 쿼리 변경으로 처리

### 1.2 전주불러오기 UI 반영 (R4)

현재 전주불러오기 모달:
- 전주 `planWork`만 보여주고 선택하게 함
- 불러오면 `planWork → doneWork`로 변환

변경 후:
- 전주의 전체 항목(doneWork + planWork + remarks)을 보여줌
- 불러오면 그대로 복사됨 (변환 없음)

- [ ] 전주불러오기 모달에서 보여주는 항목을 `planWork`만 → 전체 항목으로 변경
- [ ] 모달 내 프리뷰에 진행업무/예정업무 둘 다 표시
- [ ] "할일 → 한일 불러오기" 등 변환 관련 안내 문구 수정

---

## Step 2 — 완료 검증

```bash
cd /c/rnd/weekly-report/packages/frontend
bun run build
```

### 수동 확인 필요
- [ ] 내 주간보고에서 프로젝트 정렬순서대로 행이 표시되는지
- [ ] 전주불러오기 시 진행업무/예정업무/비고가 그대로 복사되는지

---

## 산출물

| Path | Action | Description |
|------|--------|-------------|
| `packages/frontend/src/pages/MyWeeklyReport.tsx` | MODIFY | 정렬 변경, 전주불러오기 모달 UI 수정 |
