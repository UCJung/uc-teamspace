# WORK-18-TASK-03: 백엔드 — 근무시간표 CRUD + 제출 검증

> **Phase:** 3
> **선행 TASK:** TASK-01, TASK-02
> **목표:** NestJS timesheet 모듈을 생성하여 시간표 CRUD, 엔트리/워크로그 저장, 제출 검증을 구현한다

---

## Step 1 — 계획서

### 1.1 작업 범위

근무시간표의 핵심 CRUD를 담당하는 timesheet 모듈을 생성한다. 시간표 생성 시 해당 월 전체 엔트리를 자동 생성(주말=HOLIDAY)하고, 일별 근태·워크로그 저장, 제출 시 투입시간 합계 검증, 제출 후 수정 불가 가드를 구현한다.

### 1.2 API 엔드포인트

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| POST | `/api/v1/timesheets` | 월별 근무시간표 생성 | 인증 필요 |
| GET | `/api/v1/timesheets/me?yearMonth=&teamId=` | 내 시간표 조회 | 인증 필요 |
| GET | `/api/v1/timesheets/:id` | 시간표 상세 (entries + workLogs) | 인증 필요 |
| PATCH | `/api/v1/timesheets/:id/submit` | 제출 (검증 포함) | 본인 |
| PUT | `/api/v1/timesheet-entries/:id` | 일별 엔트리 저장 | 본인 |
| POST | `/api/v1/timesheet-entries/batch` | 배치 저장 (자동저장) | 본인 |

---

## Step 2 — 체크리스트

### 2.1 모듈 구조

- [ ] `src/timesheet/timesheet.module.ts` — PrismaModule import, 서비스·컨트롤러 등록
- [ ] `src/timesheet/timesheet.controller.ts` — 시간표 CRUD 엔드포인트
- [ ] `src/timesheet/timesheet.service.ts` — 시간표 생성·조회·제출 로직
- [ ] `src/timesheet/timesheet-entry.service.ts` — 엔트리·워크로그 저장 로직
- [ ] `app.module.ts`에 TimesheetModule import 등록

### 2.2 DTO

- [ ] `dto/create-timesheet.dto.ts` — yearMonth(string), teamId(string) 검증
- [ ] `dto/save-entry.dto.ts` — attendance(AttendanceType), workLogs[](projectId, hours, workType) 검증
- [ ] `dto/batch-save-entries.dto.ts` — entries[](entryId, attendance, workLogs[]) 배치
- [ ] `dto/submit-timesheet.dto.ts` — (빈 DTO, 검증은 서비스에서)

### 2.3 시간표 생성 로직

- [ ] 시간표 생성 시 해당 월 1일~말일 TimesheetEntry 자동 생성
- [ ] 토요일/일요일 엔트리는 attendance=HOLIDAY로 설정
- [ ] `@@unique([memberId, teamId, yearMonth])` 중복 검증
- [ ] 이미 존재하면 기존 시간표 반환 (upsert 패턴)

### 2.4 엔트리 저장 로직

- [ ] PUT `/timesheet-entries/:id` — 근태 변경 + 기존 워크로그 삭제 후 재생성
- [ ] POST `/timesheet-entries/batch` — 여러 엔트리 일괄 저장 (트랜잭션)
- [ ] SUBMITTED/APPROVED 상태 시간표의 엔트리 수정 차단 (403)
- [ ] 본인 소유 시간표 확인 (memberId == currentUser.id)

### 2.5 제출 검증

- [ ] 해당 월 모든 근무일(HOLIDAY 제외) 엔트리 입력 완료 확인
- [ ] WORK, HOLIDAY_WORK 근태: 일별 투입시간 합계 = 8h
- [ ] HALF_DAY_LEAVE 근태: 일별 투입시간 합계 = 4h
- [ ] ANNUAL_LEAVE 근태: 워크로그 0건 확인
- [ ] 검증 실패 시 상세 에러 메시지 반환 (어떤 날짜가 문제인지)
- [ ] 검증 통과 시 status=SUBMITTED, submittedAt=now() 설정

---

## Step 3 — 완료 검증

```bash
# 1. 빌드
cd packages/backend && bun run build

# 2. 전체 린트
cd ../.. && bun run lint

# 3. 서버 기동 후 API 테스트
cd packages/backend && bun run start:dev &
sleep 3

# 시간표 생성
curl -X POST http://localhost:3000/api/v1/timesheets \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"yearMonth":"2026-03","teamId":"<teamId>"}'

# 내 시간표 조회
curl "http://localhost:3000/api/v1/timesheets/me?yearMonth=2026-03&teamId=<teamId>" \
  -H "Authorization: Bearer <token>"

# 엔트리 저장
curl -X PUT "http://localhost:3000/api/v1/timesheet-entries/<entryId>" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"attendance":"WORK","workLogs":[{"projectId":"<pid>","hours":8,"workType":"OFFICE"}]}'

kill %1
```
