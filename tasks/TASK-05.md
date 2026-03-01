# TASK-05: Back-end — 파트 취합·팀 조회·Excel 내보내기 API

> **Phase:** 5
> **선행 TASK:** TASK-04
> **목표:** 파트 업무 현황 조회, 파트 취합보고 CRUD, 팀 전체 조회, Excel 내보내기 구현

---

## Step 1 — 계획서

### 1.1 작업 범위

파트장용 파트 업무 현황 조회·취합보고 작성, 팀장용 팀 전체 업무 조회 API를 구현한다. 자동 취합(auto-merge) 기능으로 파트원 업무를 프로젝트별로 병합하고, ExcelJS를 사용한 Excel 내보내기(파트/팀 단위)를 완성한다.

### 1.2 API 엔드포인트

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | `/api/v1/parts/:partId/weekly-status?week=` | 파트원 업무 현황 | LEADER, PART_LEADER(소속) |
| GET | `/api/v1/parts/:partId/submission-status?week=` | 파트원 작성 현황 | LEADER, PART_LEADER(소속) |
| POST | `/api/v1/part-summaries` | 파트 취합보고 생성 | PART_LEADER(소속) |
| POST | `/api/v1/part-summaries/:id/auto-merge` | 자동 취합 (파트원 업무 병합) | PART_LEADER(소속) |
| PATCH | `/api/v1/part-summaries/:id` | 취합보고 수정·제출 | PART_LEADER(소속) |
| GET | `/api/v1/part-summaries?partId=&week=` | 파트 취합보고 조회 | LEADER |
| GET | `/api/v1/teams/:teamId/weekly-overview?week=` | 팀 전체 업무 현황 | LEADER |
| GET | `/api/v1/export/excel?type=part&partId=&week=` | 파트 Excel 다운로드 | LEADER, PART_LEADER |
| GET | `/api/v1/export/excel?type=team&week=` | 팀 전체 Excel 다운로드 | LEADER |

---

## Step 2 — 체크리스트

### 2.1 파트 현황 조회

- [ ] 파트원 업무 현황: 해당 주차 파트원들의 WeeklyReport + WorkItem 전체 조회
- [ ] 파트원 작성 현황: 각 파트원별 상태(미작성/DRAFT/SUBMITTED) 반환
- [ ] PART_LEADER는 소속 파트만, LEADER는 전체 파트 조회 가능
- [ ] 권한 검증: MEMBER 접근 시 403

### 2.2 파트 취합보고 (PartSummary)

- [ ] `weekly-report/part-summary.controller.ts`
- [ ] `weekly-report/part-summary.service.ts`
- [ ] 파트 취합보고 생성: partId + weekStart unique 검증
- [ ] SummaryWorkItem CRUD (추가/수정/삭제)
- [ ] 취합보고 상태 변경 (DRAFT → SUBMITTED)
- [ ] 소속 파트장만 작성·수정 가능

### 2.3 자동 취합 (auto-merge)

- [ ] `POST /api/v1/part-summaries/:id/auto-merge` 구현
- [ ] 해당 파트 팀원들의 WeeklyReport(해당 주차) 전체 조회
- [ ] WorkItem을 Project별로 그룹화
- [ ] 동일 프로젝트의 doneWork, planWork를 줄바꿈으로 병합
  - 병합 형식: `[팀원명] 내용` 으로 팀원 구분
- [ ] SummaryWorkItem으로 생성 (기존 항목 대체)
- [ ] 파트장이 이후 자유 편집 가능

### 2.4 팀 전체 조회

- [ ] 팀 전체 업무 현황: 모든 파트의 파트원 업무를 한번에 조회
- [ ] 파트별 필터, 팀원별 필터, 프로젝트별 필터 지원
- [ ] 각 파트의 취합보고 현황 포함
- [ ] LEADER 권한만 접근 가능

### 2.5 Excel 내보내기 (export/)

- [ ] `export/export.module.ts`
- [ ] `export/export.controller.ts` — 쿼리 파라미터로 type, partId, week 지정
- [ ] `export/excel.service.ts` — ExcelJS 기반 Excel 생성
- [ ] 파트 Excel: 현행 엑셀 양식과 동일한 컬럼 구조 (파트, 성명, 프로젝트명, 코드, 진행업무, 예정업무, 비고)
- [ ] 팀 전체 Excel: 전체 파트원 업무를 하나의 시트에 출력
- [ ] 구조화 서식 유지: `[항목]`, `*세부`, `ㄴ상세` 텍스트 그대로 출력
- [ ] 셀 병합: 동일 팀원 연속 행의 파트·성명 컬럼 병합
- [ ] 헤더 스타일: 배경색, 볼드, 테두리
- [ ] Content-Disposition 헤더로 파일명 지정 (예: `DX_2026-W09.xlsx`)

### 2.6 DTO

- [ ] `dto/part-weekly-status-query.dto.ts` — week 필수
- [ ] `dto/create-part-summary.dto.ts` — partId, weekLabel
- [ ] `dto/update-part-summary.dto.ts` — status, summaryWorkItems
- [ ] `dto/export-query.dto.ts` — type(part/team), partId?, week

### 2.7 테스트

- [ ] 단위 테스트: 파트 현황 조회 (권한별)
- [ ] 단위 테스트: auto-merge 병합 로직
- [ ] 단위 테스트: Excel 생성 (파일 내용 검증)
- [ ] E2E 테스트: 파트장 로그인 → 파트 현황 조회 → 자동 취합 → 제출
- [ ] E2E 테스트: 팀장 로그인 → 팀 전체 조회 → Excel 다운로드

---

## Step 3 — 완료 검증

```bash
# 1. 빌드
cd packages/backend && bun run build

# 2. 단위 테스트
cd packages/backend && bun run test

# 3. E2E 테스트
cd packages/backend && bun run test:e2e

# 4. 전체 린트
cd ../.. && bun run lint

# 5. API 시나리오 테스트 (서버 기동 후)
cd packages/backend && bun run start:dev &
sleep 3

# 파트 현황 조회 (파트장 토큰)
# curl -H "Authorization: Bearer <token>" "http://localhost:3000/api/v1/parts/<partId>/weekly-status?week=2026-W09"

# 작성 현황
# curl -H "Authorization: Bearer <token>" "http://localhost:3000/api/v1/parts/<partId>/submission-status?week=2026-W09"

# 자동 취합
# curl -X POST -H "Authorization: Bearer <token>" http://localhost:3000/api/v1/part-summaries/<id>/auto-merge

# Excel 다운로드
# curl -H "Authorization: Bearer <token>" -o test.xlsx "http://localhost:3000/api/v1/export/excel?type=part&partId=<partId>&week=2026-W09"

kill %1
```
