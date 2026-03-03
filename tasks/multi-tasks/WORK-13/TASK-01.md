# WORK-13-TASK-01: 백엔드 API (서비스 + 컨트롤러 + DTO)

> 의존: WORK-13-TASK-00
> 상태: PENDING

## 목표

취합보고 재설계에 필요한 백엔드 API를 구현한다. 개별 행 로딩, 수동 병합, 편집, 삭제 기능을 제공한다.

---

## Step 1 — 체크리스트

### 1.1 신규 DTO (3개)

- [ ] `dto/create-summary.dto.ts` 생성
  - `scope`: SummaryScope (PART / TEAM)
  - `partId?`: string (scope=PART 시 필수)
  - `teamId?`: string (scope=TEAM 시 필수)
  - `weekLabel`: string (예: "2026-W09")
- [ ] `dto/merge-rows.dto.ts` 생성
  - `summaryWorkItemIds`: string[] (병합 대상 ID 목록, 2개 이상)
- [ ] `dto/update-summary-work-item.dto.ts` 생성
  - `doneWork?`: string
  - `planWork?`: string
  - `remarks?`: string

### 1.2 서비스 메서드 (`part-summary.service.ts`)

- [ ] `createSummary(dto)` — scope 지원, TEAM 시 teamId 사용, title 자동 생성
- [ ] `findByScopeAndWeek(params)` — scope + partId/teamId + weekLabel로 조회 (summaryWorkItems 포함)
- [ ] `loadMemberRows(summaryId)` — 팀원 WorkItem → 개별 SummaryWorkItem 생성
  - 정렬: project.sortOrder → member.sortOrder
  - memberNames에 팀원 이름 설정
  - 기존 summaryWorkItems 삭제 후 재생성
- [ ] `mergeRows(summaryId, dto)` — 같은 프로젝트 검증 → 텍스트 병합 → memberNames 합산
  - 병합 대상이 다른 프로젝트면 에러
  - doneWork/planWork: 줄바꿈으로 병합
  - memberNames: 쉼표로 합산
  - 첫 번째 행에 병합 결과 저장, 나머지 삭제
- [ ] `updateWorkItem(id, dto)` — SummaryWorkItem만 수정 (원본 보고서 영향 없음)
- [ ] `deleteWorkItem(id)` — SummaryWorkItem 삭제

### 1.3 컨트롤러 엔드포인트 (`part-summary.controller.ts`)

- [ ] `GET /api/v1/summaries` — 취합보고 조회 (query: scope, partId, teamId, week)
- [ ] `POST /api/v1/summaries` — 취합보고 생성
- [ ] `POST /api/v1/summaries/:id/load-rows` — 팀원 업무 개별 행 로딩
- [ ] `POST /api/v1/summaries/:id/merge-rows` — 선택 행 병합
- [ ] `PATCH /api/v1/summaries/:id` — 상태 변경 (제출 등)
- [ ] `PATCH /api/v1/summary-work-items/:id` — 개별 행 수정
- [ ] `DELETE /api/v1/summary-work-items/:id` — 개별 행 삭제

### 1.4 기존 호환
- [ ] 기존 `part-summaries` 엔드포인트 유지 (하위 호환)

---

## Step 2 — 상세 설계

### 엔드포인트 상세

| Method | Endpoint | Body/Query | 역할 |
|--------|----------|------------|------|
| GET | `/api/v1/summaries` | `?scope=PART&partId=xxx&week=2026-W09` | 취합보고 조회 |
| POST | `/api/v1/summaries` | `{ scope, partId?, teamId?, weekLabel }` | 취합보고 생성 |
| POST | `/api/v1/summaries/:id/load-rows` | (없음) | 팀원 업무 → 개별 행 |
| POST | `/api/v1/summaries/:id/merge-rows` | `{ summaryWorkItemIds: [...] }` | 행 병합 |
| PATCH | `/api/v1/summaries/:id` | `{ status }` | 상태 변경 |
| PATCH | `/api/v1/summary-work-items/:id` | `{ doneWork?, planWork?, remarks? }` | 행 수정 |
| DELETE | `/api/v1/summary-work-items/:id` | (없음) | 행 삭제 |

### loadMemberRows 로직
```
1. summary 조회 (scope 확인)
2. scope=PART → 해당 파트 팀원의 WeeklyReport+WorkItem 조회
   scope=TEAM → 해당 팀 전체 팀원의 WeeklyReport+WorkItem 조회
3. 기존 summaryWorkItems 전체 삭제
4. 각 WorkItem을 SummaryWorkItem으로 생성:
   - projectId, doneWork, planWork, remarks 복사
   - memberNames = "팀원이름(파트명)"
   - sortOrder = project.sortOrder * 1000 + member.sortOrder
5. 생성된 summary + summaryWorkItems 반환
```

### mergeRows 로직
```
1. summaryWorkItemIds로 대상 조회 (최소 2개)
2. 모든 대상이 같은 projectId인지 검증 → 불일치 시 400
3. doneWork = 줄바꿈 병합 (빈 값 제외)
4. planWork = 줄바꿈 병합 (빈 값 제외)
5. remarks = 줄바꿈 병합 (빈 값 제외)
6. memberNames = 쉼표 합산
7. 첫 번째 ID에 병합 결과 업데이트
8. 나머지 ID 삭제
9. 병합된 SummaryWorkItem 반환
```

---

## Step 3 — 완료 검증

```bash
cd /c/rnd/weekly-report/packages/backend

# 1. 빌드 확인
bun run build
```

---

## 산출물

| Path | Action | Description |
|------|--------|-------------|
| `packages/backend/src/weekly-report/dto/create-summary.dto.ts` | CREATE | 취합보고 생성 DTO |
| `packages/backend/src/weekly-report/dto/merge-rows.dto.ts` | CREATE | 행 병합 DTO |
| `packages/backend/src/weekly-report/dto/update-summary-work-item.dto.ts` | CREATE | 행 수정 DTO |
| `packages/backend/src/weekly-report/part-summary.service.ts` | MODIFY | 신규 메서드 6개 추가 |
| `packages/backend/src/weekly-report/part-summary.controller.ts` | MODIFY | 신규 엔드포인트 7개 추가 |
