# WORK-13-TASK-02: 프론트엔드 페이지 + API + 라우터/사이드바

> 의존: WORK-13-TASK-01
> 상태: PENDING

## 목표

PartSummary.tsx와 TeamSummary.tsx를 통합한 **ReportConsolidation.tsx** 페이지를 생성하고, 라우터/사이드바를 변경한다.

---

## Step 1 — 체크리스트

### 1.1 API 클라이언트 변경 (`part.api.ts`)

- [ ] `SummaryWorkItem` 인터페이스에 `memberNames?: string` 추가
- [ ] `PartSummary` 인터페이스에 `scope?, teamId?, title?` 추가
- [ ] `getSummary(params)` → GET /summaries
- [ ] `createSummary(data)` → POST /summaries
- [ ] `loadRows(summaryId)` → POST /summaries/:id/load-rows
- [ ] `mergeRows(summaryId, ids)` → POST /summaries/:id/merge-rows
- [ ] `updateSummaryWorkItem(id, data)` → PATCH /summary-work-items/:id
- [ ] `deleteSummaryWorkItem(id)` → DELETE /summary-work-items/:id

### 1.2 ReportConsolidation.tsx (신규 페이지)

- [ ] 주차 네비게이션 (◀ 2026년 10주차 ▶)
- [ ] 범위 선택 (전체 / 파트 드롭다운)
  - LEADER: 전체/파트 선택 가능
  - PART_LEADER: 자기 파트 고정
- [ ] Badge (DRAFT / SUBMITTED 상태 표시)
- [ ] 버튼 그룹: [불러오기] [저장] [제출]
- [ ] 선택 N개 + [병합] 바 (같은 프로젝트 2+ 선택 시 활성)
- [ ] 테이블 컬럼: □(체크박스) | 프로젝트 | 팀원(파트) | 진행업무 | 예정업무 | 비고 | ✕(삭제)
- [ ] 데이터 불러오기 → 개별 행 표시
- [ ] 체크박스 선택 → 병합 (같은 프로젝트 검증)
- [ ] 인라인 편집 → PATCH /summary-work-items/:id
- [ ] 행 삭제 → DELETE /summary-work-items/:id (확인 모달)
- [ ] 제출 → SUBMITTED (읽기전용 전환)

### 1.3 기존 페이지 삭제

- [ ] `PartSummary.tsx` 삭제
- [ ] `TeamSummary.tsx` 삭제
- [ ] `TeamSummary.test.tsx` 삭제

### 1.4 라우터/사이드바 변경

- [ ] `App.tsx`: `/part-summary`, `/team-summary` 라우트 삭제 → `/report-consolidation` 추가
- [ ] `Sidebar.tsx`: "파트 취합보고서" → "보고서 취합" (path 변경), "취합보고서 조회" 삭제
- [ ] `Header.tsx`: 매핑 교체

---

## Step 2 — UI 설계

### 페이지 레이아웃
```
┌──────────────────────────────────────────────────────────────────┐
│ ◀ 2026년 10주차 (3/2~3/6) ▶ │ ◎전체 ○파트[▼] │ Badge │ [불러오기] [저장] [제출] │
└──────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────┐
│ 선택 N개 [병합] (같은 프로젝트 2+ 선택 시 활성)                      │
├────┬────────┬──────────┬──────────┬──────────┬───────┬───────────┤
│ □  │프로젝트  │팀원(파트)  │ 진행업무   │ 예정업무   │ 비고   │ ✕         │
├────┼────────┼──────────┼──────────┼──────────┼───────┼───────────┤
│ □  │AI 플랫폼│김민수(AX)  │[업무1]...  │[계획1]... │       │ ✕         │
│ □  │AI 플랫폼│박지혜(AX)  │[업무2]...  │[계획2]... │       │ ✕         │
│ □  │DX 인프라│이철수(DX)  │[업무3]...  │[계획3]... │       │ ✕         │
└────┴────────┴──────────┴──────────┴──────────┴───────┴───────────┘
```

### 상태별 UI
| 상태 | 불러오기 | 편집 | 병합 | 삭제 | 제출 |
|------|---------|------|------|------|------|
| 데이터 없음 | ✅ | ❌ | ❌ | ❌ | ❌ |
| DRAFT | ✅ | ✅ | ✅ | ✅ | ✅ |
| SUBMITTED | ❌ | ❌ | ❌ | ❌ | ❌ |

### 병합 흐름
1. 사용자가 2개 이상 체크박스 선택
2. 선택된 행이 모두 같은 프로젝트인지 확인
3. 같은 프로젝트면 [병합] 버튼 활성
4. 클릭 → POST /summaries/:id/merge-rows
5. 병합 결과로 행 갱신

---

## Step 3 — 완료 검증

```bash
cd /c/rnd/weekly-report/packages/frontend

# 1. 빌드 확인
bun run build

# 2. 린트 확인
bun run lint
```

---

## 산출물

| Path | Action | Description |
|------|--------|-------------|
| `packages/frontend/src/api/part.api.ts` | MODIFY | 인터페이스 확장 + 신규 API 함수 |
| `packages/frontend/src/pages/ReportConsolidation.tsx` | CREATE | 통합 취합 페이지 |
| `packages/frontend/src/pages/PartSummary.tsx` | DELETE | ReportConsolidation으로 대체 |
| `packages/frontend/src/pages/TeamSummary.tsx` | DELETE | ReportConsolidation으로 대체 |
| `packages/frontend/src/pages/TeamSummary.test.tsx` | DELETE | 페이지 삭제에 따라 |
| `packages/frontend/src/App.tsx` | MODIFY | 라우트 변경 |
| `packages/frontend/src/components/layout/Sidebar.tsx` | MODIFY | 메뉴 변경 |
| `packages/frontend/src/components/layout/Header.tsx` | MODIFY | 매핑 변경 |
