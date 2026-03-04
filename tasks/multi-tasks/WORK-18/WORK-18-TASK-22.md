# WORK-18-TASK-22: 프로젝트 투입현황 — 프로젝트 목록 테이블 + 행 선택 UX

> **선행 TASK:** WORK-18-TASK-21
> **목표:** 프로젝트 투입현황 페이지에서 드롭다운을 프로젝트 목록 테이블로 대체하고, 행 선택 시 하위 상세 갱신

## 요청사항
[기능개선] 프로젝트 투입현황에 프로젝트 선택 드록다운을 제거하고 아래 영역을 추가해서 프로젝트
  목록을 표시해줘 - 항목은 프로젝트명, 총 투입인원, 총투입시간, 평균투입시간
  동일한 기능이 있는 카드 영역을 제거
  목록에서 행을 선택하면 연한 녹색으로 선택된 행을 강조하고 인원별 투입현황 목록을 선택된 프로젝트  내용으로 갱신

---

## Step 1 — 계획서

### 1.1 작업 범위
1. 백엔드: 전체 관리 프로젝트의 월간 요약 데이터를 한 번에 반환하는 API 추가
2. 프론트: 툴바에서 프로젝트 select 드롭다운 제거
3. 프론트: 프로젝트 목록 테이블 추가 (프로젝트명, 총 투입인원, 총투입시간, 평균투입시간)
4. 프론트: MonthlyView 요약 카드 3개 제거 (프로젝트 목록에 동일 정보)
5. 프론트: 행 클릭 시 연한 녹색 강조 + 인원별 투입현황 갱신

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| 백엔드 | `timesheetStatsService.getProjectAllocationSummary()` 메서드 |
| 백엔드 | `GET /api/v1/timesheets/project-allocation/summary?yearMonth=` |
| 프론트 API | `timesheetApi.getProjectAllocationSummary()` |
| 프론트 Hook | `useProjectAllocationSummary()` |
| 프론트 UI | `ProjectAllocation.tsx` — 프로젝트 목록 테이블 + 행 선택 + MonthlyView 카드 제거 |

---

## Step 2 — 체크리스트

- [ ] 백엔드: `getProjectAllocationSummary` 서비스 메서드 추가
- [ ] 백엔드: Controller 엔드포인트 추가
- [ ] 프론트: API 함수 + Hook 추가
- [ ] 프론트: 툴바에서 프로젝트 select 드롭다운 제거
- [ ] 프론트: 프로젝트 목록 테이블 카드 추가 (4열)
- [ ] 프론트: 행 클릭 → selectedProjectId 설정 + 연한 녹색 배경
- [ ] 프론트: MonthlyView 요약 카드(grid-cols-3) 제거
- [ ] `bun run build` — 0 에러
- [ ] `bun run lint` — 0 에러

---

## Step 3 — 검증 명령

```bash
bun run build
bun run lint
```
