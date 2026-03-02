# WORK-14-TASK-00: 백엔드 — 전주불러오기 + 정렬 수정

> 요구사항: R4 (전주불러오기), R5 (목록 정렬)
> 의존: 없음
> 상태: PENDING

## 목표

1. 전주불러오기(carry-forward): doneWork·planWork·remarks 전부 원본 그대로 복사
2. 주간업무 WorkItem 정렬: project.sortOrder 기준

---

## Step 1 — 체크리스트

### 1.1 전주불러오기 변경 (`carry-forward.service.ts`)

현재 동작:
```
prevItem.planWork → newItem.doneWork
newItem.planWork = ''
newItem.remarks = ''
```

변경 후:
```
prevItem.doneWork → newItem.doneWork  (그대로)
prevItem.planWork → newItem.planWork  (그대로)
prevItem.remarks → newItem.remarks    (그대로)
```

- [ ] `carryForward()` 메서드에서 매핑 로직 변경
- [ ] planWork뿐 아니라 doneWork가 있는 항목도 불러오기 대상에 포함
- [ ] 기존 필터 `planWork이 비어있지 않은 항목만` → `doneWork 또는 planWork이 있는 항목` 으로 변경

### 1.2 목록 정렬 (`report.service.ts` 또는 쿼리)

- [ ] WeeklyReport의 workItems 조회 시 project.sortOrder 기준 정렬 적용
- [ ] 기존 workItem.sortOrder 대신 project.sortOrder 우선 정렬

---

## Step 2 — 완료 검증

```bash
cd /c/rnd/weekly-report/packages/backend
bun run build
```

---

## 산출물

| Path | Action | Description |
|------|--------|-------------|
| `packages/backend/src/weekly-report/carry-forward.service.ts` | MODIFY | 전주 내용 그대로 복사 |
| `packages/backend/src/weekly-report/report.service.ts` | MODIFY | workItems 정렬 변경 (필요 시) |
