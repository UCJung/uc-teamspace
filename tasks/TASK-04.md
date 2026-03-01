# TASK-04: Back-end — 주간업무 CRUD + 자동저장 + 전주 불러오기 API

> **Phase:** 4
> **선행 TASK:** TASK-03
> **목표:** 주간업무 핵심 CRUD API, 업무항목 자동저장, 전주 할일→이번주 한일 carry-forward 구현

---

## Step 1 — 계획서

### 1.1 작업 범위

주간업무보고 시스템의 핵심인 개인 주간업무 CRUD API를 구현한다. WeeklyReport 생성/조회/상태변경(임시저장→제출), WorkItem CRUD(추가/수정/삭제/순서변경), 자동저장을 위한 단건 PATCH, 전주 예정업무를 이번주 진행업무로 불러오는 carry-forward 기능을 완성한다.

### 1.2 API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/v1/weekly-reports/me?week=2026-W09` | 내 주간업무 조회 |
| POST | `/api/v1/weekly-reports` | 주간업무 생성 |
| PATCH | `/api/v1/weekly-reports/:id` | 상태 변경 (DRAFT→SUBMITTED) |
| GET | `/api/v1/weekly-reports/:id/work-items` | 업무항목 목록 |
| POST | `/api/v1/weekly-reports/:id/work-items` | 업무항목 추가 |
| PATCH | `/api/v1/work-items/:id` | 업무항목 수정 (자동저장) |
| DELETE | `/api/v1/work-items/:id` | 업무항목 삭제 |
| PATCH | `/api/v1/work-items/reorder` | 업무항목 순서 변경 |
| POST | `/api/v1/weekly-reports/carry-forward` | 전주 할일 → 이번주 한일 |

---

## Step 2 — 체크리스트

### 2.1 주간업무 모듈 구조

- [ ] `weekly-report/weekly-report.module.ts`
- [ ] `weekly-report/report.controller.ts` — WeeklyReport 엔드포인트
- [ ] `weekly-report/report.service.ts` — WeeklyReport CRUD 로직
- [ ] `weekly-report/work-item.service.ts` — WorkItem CRUD 로직
- [ ] `weekly-report/carry-forward.service.ts` — 전주 불러오기 로직

### 2.2 WeeklyReport CRUD

- [ ] 내 주간업무 조회 (week 쿼리 파라미터로 주차 지정, WorkItem 포함)
- [ ] 주간업무 생성 — memberId + weekStart unique 검증
- [ ] 주간업무 생성 시 weekLabel 자동 계산 (shared/week-utils 사용)
- [ ] 상태 변경: DRAFT → SUBMITTED (제출 시 빈 행 자동 제거)
- [ ] SUBMITTED → DRAFT 되돌리기 (재편집 허용)
- [ ] 본인 주간업무만 접근 가능 (memberId == currentUser.id 검증)

### 2.3 WorkItem CRUD

- [ ] 업무항목 추가 — weeklyReportId, projectId, doneWork, planWork, remarks
- [ ] 업무항목 수정 (PATCH) — 개별 필드 부분 수정 (자동저장 지원)
- [ ] 업무항목 삭제 — 본인 소유 확인 후 삭제
- [ ] 업무항목 순서 변경 (reorder) — sortOrder 일괄 업데이트
- [ ] SUBMITTED 상태의 Report에 속한 WorkItem 수정 시 에러 반환

### 2.4 Carry-Forward (전주 할일 → 이번주 한일)

- [ ] `POST /api/v1/weekly-reports/carry-forward` 구현
- [ ] Request: `{ targetWeek: "2026-W09", sourceWorkItemIds?: string[] }`
- [ ] 전주 WeeklyReport에서 WorkItem 조회
- [ ] sourceWorkItemIds가 비어있으면 전체 선택
- [ ] 이번주 WeeklyReport 생성 (없으면 새로 생성)
- [ ] 각 WorkItem의 planWork → 새 WorkItem의 doneWork로 복사
- [ ] projectId 유지, planWork·remarks는 빈 값으로 생성
- [ ] 전주 업무가 없을 경우 빈 WeeklyReport 생성 + 알림 메시지 반환
- [ ] 생성된 WorkItem 목록 반환

### 2.5 DTO

- [ ] `dto/create-weekly-report.dto.ts` — weekLabel (또는 weekStart)
- [ ] `dto/update-weekly-report.dto.ts` — status
- [ ] `dto/create-work-item.dto.ts` — projectId, doneWork, planWork, remarks
- [ ] `dto/update-work-item.dto.ts` — PartialType (개별 필드 수정)
- [ ] `dto/reorder-work-items.dto.ts` — items: { id, sortOrder }[]
- [ ] `dto/carry-forward.dto.ts` — targetWeek, sourceWorkItemIds?

### 2.6 테스트

- [ ] 단위 테스트: WeeklyReport 생성, 중복 주차 방지
- [ ] 단위 테스트: WorkItem CRUD (추가/수정/삭제)
- [ ] 단위 테스트: carry-forward 로직 (전주 할일 → 이번주 한일)
- [ ] 단위 테스트: 제출 상태 변경 + 빈 행 제거
- [ ] E2E 테스트: 주간업무 생성 → 업무항목 추가 → 자동저장 → 제출

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

# 주간업무 생성
# curl -X POST http://localhost:3000/api/v1/weekly-reports \
#   -H "Authorization: Bearer <token>" \
#   -H "Content-Type: application/json" \
#   -d '{"weekLabel":"2026-W09"}'

# 업무항목 추가
# curl -X POST http://localhost:3000/api/v1/weekly-reports/<reportId>/work-items \
#   -H "Authorization: Bearer <token>" \
#   -H "Content-Type: application/json" \
#   -d '{"projectId":"<pid>","doneWork":"[테스트]\n*내용","planWork":"","remarks":""}'

# 자동저장 (PATCH)
# curl -X PATCH http://localhost:3000/api/v1/work-items/<itemId> \
#   -H "Authorization: Bearer <token>" \
#   -H "Content-Type: application/json" \
#   -d '{"doneWork":"수정된 내용"}'

# carry-forward
# curl -X POST http://localhost:3000/api/v1/weekly-reports/carry-forward \
#   -H "Authorization: Bearer <token>" \
#   -H "Content-Type: application/json" \
#   -d '{"targetWeek":"2026-W10"}'

kill %1
```
