# WORK-18-TASK-05: 백엔드 — 취합/승인/통계/엑셀

> **Phase:** 4
> **선행 TASK:** TASK-03, TASK-04
> **목표:** 팀장 취합/승인, PM 투입현황/승인, 관리자 현황/최종승인/엑셀 API를 구현한다

---

## Step 1 — 계획서

### 1.1 작업 범위

timesheet 모듈에 팀장용(취합 매트릭스, 제출현황, 승인/반려), PM용(월간/연간 투입현황, 승인), 관리자용(전체 현황, 최종 승인, 엑셀) API를 추가한다.

### 1.2 API 엔드포인트

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | `/api/v1/timesheets/team-summary` | 팀원×프로젝트 투입 매트릭스 | LEADER |
| GET | `/api/v1/timesheets/team-members-status` | 팀원 제출현황 | LEADER |
| POST | `/api/v1/timesheets/:id/approve` | 승인 | LEADER |
| POST | `/api/v1/timesheets/:id/reject` | 반려 | LEADER |
| GET | `/api/v1/timesheets/project-allocation/monthly` | 월간 투입현황 | PM |
| GET | `/api/v1/timesheets/project-allocation/yearly` | 연간 투입현황 | PM |
| POST | `/api/v1/timesheets/project-approve` | PM 월간 승인 | PM |
| GET | `/api/v1/timesheets/admin-overview` | 전체 현황 | ADMIN |
| POST | `/api/v1/timesheets/admin-approve` | 최종 승인 | ADMIN |
| GET | `/api/v1/timesheets/admin-export` | 엑셀 다운로드 | ADMIN |

---

## Step 2 — 체크리스트

### 2.1 팀장 API

- [ ] `GET /team-summary?teamId=&yearMonth=` — 팀원별 프로젝트별 투입시간/비율 매트릭스 반환
- [ ] `GET /team-members-status?teamId=&yearMonth=` — 팀원별 제출상태, 총근무시간, 근무일수
- [ ] `POST /:id/approve` — TimesheetApproval(LEADER, APPROVED) 생성, SUBMITTED 상태 확인
- [ ] `POST /:id/reject` — TimesheetApproval(LEADER, REJECTED) + comment, status→REJECTED

### 2.2 PM API

- [ ] `GET /project-allocation/monthly?projectId=&yearMonth=` — 해당 프로젝트 월간 투입인원/시간/비율
- [ ] `GET /project-allocation/yearly?projectId=&year=` — 1~12월 투입 매트릭스
- [ ] `POST /project-approve?projectId=&yearMonth=` — TimesheetApproval(PROJECT_MANAGER, APPROVED)
- [ ] M+5 자동승인: 조회 시 현재 날짜 체크 → 미승인이면 autoApproved=true 처리

### 2.3 관리자 API

- [ ] `GET /admin-overview?yearMonth=` — 팀별 제출/승인 현황 요약
- [ ] `POST /admin-approve?yearMonth=` — 모든 팀+PM 승인 확인 후 최종 승인
- [ ] `GET /admin-export?yearMonth=` — ExcelJS로 월간 투입 현황 엑셀 생성/다운로드

### 2.4 투입비율 계산

- [ ] `투입비율 = (프로젝트 월간 투입시간 / 멤버 월간 총 근무시간) × 100`
- [ ] 소수점 1자리 반올림

---

## Step 3 — 완료 검증

```bash
# 1. 빌드
cd packages/backend && bun run build

# 2. 전체 린트
cd ../.. && bun run lint

# 3. API 테스트
cd packages/backend && bun run start:dev &
sleep 3

# 팀원 제출현황 (LEADER 토큰)
curl "http://localhost:3000/api/v1/timesheets/team-members-status?teamId=<tid>&yearMonth=2026-03" \
  -H "Authorization: Bearer <leader-token>"

# 투입 매트릭스 (LEADER 토큰)
curl "http://localhost:3000/api/v1/timesheets/team-summary?teamId=<tid>&yearMonth=2026-03" \
  -H "Authorization: Bearer <leader-token>"

# 승인
curl -X POST "http://localhost:3000/api/v1/timesheets/<id>/approve" \
  -H "Authorization: Bearer <leader-token>"

kill %1
```
