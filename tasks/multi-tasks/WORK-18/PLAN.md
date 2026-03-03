# WORK-18: 월별 근무시간표 기능 전체 구현

> 작성일: 2026-03-04
> 요구사항: tasks/Require/Require-06.md
> 상태: **계획 수립 완료**

---

## 1. 개요

모든 구성원의 월간 일별 프로젝트별 근무시간표를 작성하여 프로젝트별 투입인원의 투입비율에 따른 인건비 원가를 산출하기 위한 기능을 **MVP로 구현**한다.

### 핵심 기능:
- **팀원**: 월별 일단위 근무시간표 작성 (근태 + 프로젝트별 투입시간/업무방식)
- **팀장**: 팀원 근무시간표 취합 조회 + 승인/반려
- **프로젝트 책임자**: 프로젝트 투입현황 (연간/월간) 조회 + 월간 승인
- **관리자**: 전체 현황 조회 + 최종 승인 + 엑셀 다운로드
- **데이터 구조 변경**: Member(직위/직책), Project(책임자/책임부서/상세), 프로젝트 생성 요청→승인

---

## 2. DB 스키마 변경 설계

### 2.1 새 Enum (5개)

| Enum | 값 |
|------|-----|
| Position | DIRECTOR(이사), GENERAL_MANAGER(부장), DEPUTY_MANAGER(차장), ASSISTANT_MANAGER(대리), STAFF(사원), PRINCIPAL_RESEARCHER(수석연구원), SENIOR_RESEARCHER(책임연구원), RESEARCHER(선임연구원), ASSOCIATE_RESEARCHER(전임연구원) |
| AttendanceType | WORK(근무), HOLIDAY_WORK(휴일근무), ANNUAL_LEAVE(연차), HALF_DAY_LEAVE(반차), HOLIDAY(공휴일/주말) |
| WorkType | OFFICE(내근), FIELD(외근), REMOTE(재택), BUSINESS_TRIP(출장) |
| TimesheetStatus | DRAFT(작성중), SUBMITTED(제출), APPROVED(승인), REJECTED(반려) |
| ApprovalType | LEADER(팀장), PROJECT_MANAGER(프로젝트책임자), ADMIN(관리자) |

### 2.2 기존 모델 변경

| 모델 | 변경 내용 |
|------|-----------|
| Member | + position(Position?), + jobTitle(String?) |
| Project | + managerId(String? FK→Member), + department(String?), + description(String?) |
| ProjectStatus | + PENDING (기존 ACTIVE, INACTIVE 유지) |

### 2.3 새 모델 (4개)

```
MonthlyTimesheet
├── id, memberId(FK), teamId(FK), yearMonth("2026-01"), status(TimesheetStatus)
├── submittedAt(DateTime?)
├── @@unique([memberId, teamId, yearMonth])
├── entries → TimesheetEntry[]
└── approvals → TimesheetApproval[]

TimesheetEntry
├── id, timesheetId(FK), date(@db.Date), attendance(AttendanceType)
├── @@unique([timesheetId, date])
└── workLogs → TimesheetWorkLog[]

TimesheetWorkLog
├── id, entryId(FK), projectId(FK), hours(Float), workType(WorkType)
└── @@index([entryId]), @@index([projectId])

TimesheetApproval
├── id, timesheetId(FK), approverId(FK→Member), approvalType(ApprovalType)
├── status(TimesheetStatus), comment(String?), approvedAt(DateTime?), autoApproved(Boolean)
└── @@unique([timesheetId, approvalType])
```

---

## 3. API 설계

### 3.1 근무시간표 API

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| POST | /api/v1/timesheets | 월별 근무시간표 생성 | ALL |
| GET | /api/v1/timesheets/me?yearMonth= | 내 시간표 조회 | ALL |
| GET | /api/v1/timesheets/:id | 시간표 상세 | ALL |
| PATCH | /api/v1/timesheets/:id/submit | 제출 (검증) | 본인 |
| PUT | /api/v1/timesheet-entries/:id | 일별 엔트리 저장 | 본인 |
| POST | /api/v1/timesheet-entries/batch | 배치 저장 | 본인 |

### 3.2 팀장 취합/승인 API

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | /api/v1/timesheets/team-summary?teamId=&yearMonth= | 투입 매트릭스 | LEADER |
| GET | /api/v1/timesheets/team-members-status?teamId=&yearMonth= | 제출현황 | LEADER |
| POST | /api/v1/timesheets/:id/approve | 승인 | LEADER |
| POST | /api/v1/timesheets/:id/reject | 반려 | LEADER |

### 3.3 프로젝트 책임자 API

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | /api/v1/timesheets/project-allocation/monthly?projectId=&yearMonth= | 월간 투입현황 | PM |
| GET | /api/v1/timesheets/project-allocation/yearly?projectId=&year= | 연간 투입현황 | PM |
| POST | /api/v1/timesheets/project-approve?projectId=&yearMonth= | 월간 투입 승인 | PM |

### 3.4 관리자 API

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| GET | /api/v1/timesheets/admin-overview?yearMonth= | 전체 현황 | ADMIN |
| POST | /api/v1/timesheets/admin-approve?yearMonth= | 최종 승인 | ADMIN |
| GET | /api/v1/timesheets/admin-export?yearMonth= | 엑셀 다운로드 | ADMIN |

### 3.5 프로젝트 변경 API

| Method | Endpoint | 설명 | 권한 |
|--------|----------|------|------|
| POST | /api/v1/projects/request | 프로젝트 생성 요청 | LEADER, PART_LEADER |
| PATCH | /api/v1/admin/projects/:id/approve | 프로젝트 승인 | ADMIN |
| GET | /api/v1/projects/managed | 내 책임 프로젝트 | ALL |

---

## 4. TASK 분해

### TASK-01: DB 스키마 변경 + 마이그레이션
- **의존: 없음**

### TASK-02: 공유 타입 + 유틸리티 + 상수
- **의존: TASK-01**

### TASK-03: 백엔드 — 근무시간표 CRUD + 제출 검증
- **의존: TASK-01, TASK-02**

### TASK-04: 백엔드 — 프로젝트 변경 + 생성 요청/승인
- **의존: TASK-01, TASK-02**

### TASK-05: 백엔드 — 취합/승인/통계/엑셀
- **의존: TASK-03, TASK-04**

### TASK-06: 프론트엔드 — 근무시간표 작성 페이지
- **의존: TASK-03**

### TASK-07: 프론트엔드 — 팀장/PM/관리자 페이지
- **의존: TASK-05, TASK-06**

### TASK-08: 기존 코드 수정 + 통합 빌드 검증
- **의존: TASK-06, TASK-07**

---

## 5. 의존성 DAG

```
TASK-01 ──▶ TASK-02 ──┬──▶ TASK-03 ──┬──▶ TASK-05 ──▶ TASK-07 ──┐
                       │              │                            ├──▶ TASK-08
                       └──▶ TASK-04 ──┘         TASK-06 ──────────┘
                                                (TASK-03 의존)
```

---

## 6. 실행 Phase

| Phase | TASK | 병렬 | 비고 |
|-------|------|------|------|
| 1 | TASK-01 | 1 | 스키마 변경 (직렬) |
| 2 | TASK-02 | 1 | 타입+유틸 |
| 3 | TASK-03 + TASK-04 | 2 | 독립 백엔드 모듈 병렬 |
| 4 | TASK-05 + TASK-06 | 2 | 취합 백엔드 + 프론트 작성 병렬 |
| 5 | TASK-07 | 1 | 프론트 관리 페이지 |
| 6 | TASK-08 | 1 | 통합 + 빌드 검증 |

---

## 7. 주요 비즈니스 로직

### 7.1 제출 검증
```
1. 해당 월 모든 근무일(주말/공휴일 제외) 확인
2. 각 근무일의 투입시간 합계 검증:
   - WORK, HOLIDAY_WORK → 합계 = 8
   - HALF_DAY_LEAVE → 합계 = 4
   - ANNUAL_LEAVE → 워크로그 없어야 함
3. 모든 검증 통과 → status = SUBMITTED, submittedAt 기록
4. 제출 후 수정 불가
```

### 7.2 3단계 승인 워크플로우
```
팀원 제출 (SUBMITTED)
  → 팀장 승인 (LEADER/APPROVED)
  → PM 승인 (PROJECT_MANAGER/APPROVED, M+5일 자동승인)
  → 관리자 최종 승인
```

### 7.3 투입비율 계산
```
투입비율 = (해당 프로젝트 월간 투입시간 / 해당 멤버 월간 총 근무시간) × 100
```
