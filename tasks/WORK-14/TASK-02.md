# WORK-14-TASK-02: 프론트 — 대시보드 주차선택 + 취합현황 변경 + 엑셀다운로드

> 요구사항: R6 (보고서취합 엑셀), R7 (대시보드 주차선택), R8 (취합현황 변경)
> 의존: 없음
> 상태: PENDING

## 목표

1. 대시보드: 주차 선택 ◀ ▶ 네비게이션 추가
2. 대시보드: "파트 취합 현황" → "보고서 취합 현황"으로 라벨 변경, 제출된 보고서 클릭 시 /report-consolidation 이동
3. 보고서취합 페이지: 제출 상태일 때 Excel 다운로드 버튼 추가

---

## Step 1 — 체크리스트

### 1.1 대시보드 주차 선택 (R7)

현재: `const currentWeek = getWeekLabel(new Date())` 고정
변경: `useState`로 변경 + ◀ ▶ 버튼 추가

- [ ] `currentWeek`를 `useState`로 변경
- [ ] 기존 PartStatus, MyWeeklyReport와 동일한 ◀ ▶ 주차 네비게이션 UI 추가
- [ ] 주차 변경 시 모든 쿼리가 해당 주차 데이터로 갱신

### 1.2 취합현황 라벨 변경 + 이동 (R8)

현재: "파트 취합 현황" 텍스트, 클릭 동작 없음

- [ ] 섹션 제목 "파트 취합 현황" → "보고서 취합 현황" 변경
- [ ] 제출(SUBMITTED) 상태인 파트 행 클릭 시 `/report-consolidation` 페이지로 이동
- [ ] 이동 시 해당 주차 + 파트 정보를 query param 또는 state로 전달

### 1.3 보고서취합 엑셀 다운로드 (R6)

현재: ReportConsolidation.tsx에 엑셀 버튼 없음

- [ ] 제출(SUBMITTED) 상태일 때 "Excel 다운로드" 버튼 표시
- [ ] `exportApi.downloadExcel()` 호출 (scope에 따라 type=team/part)
- [ ] 다운로드 중 로딩 표시

---

## Step 2 — 완료 검증

```bash
cd /c/rnd/weekly-report/packages/frontend
bun run build
```

### 수동 확인 필요
- [ ] 대시보드에서 ◀ ▶로 주차 변경 시 데이터 갱신 확인
- [ ] 취합현황에서 제출된 행 클릭 시 보고서취합 페이지 이동 확인
- [ ] 보고서취합 제출 상태에서 Excel 다운로드 버튼 표시 및 동작 확인

---

## 산출물

| Path | Action | Description |
|------|--------|-------------|
| `packages/frontend/src/pages/Dashboard.tsx` | MODIFY | 주차 네비게이션, 취합현황 라벨/이동 |
| `packages/frontend/src/pages/ReportConsolidation.tsx` | MODIFY | 엑셀 다운로드 버튼 (제출 시) |
