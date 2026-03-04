# UC TeamSpace — 데이터 모델 구조 문서

> 최종 갱신: 2026-03-04
> 소스: `packages/backend/prisma/schema.prisma`

---

## 1. 전체 ER 관계도 (텍스트)

```
                          ┌─────────────────┐
                          │      Team       │
                          │─────────────────│
                          │ id (PK)         │
                          │ name (UNIQUE)   │
                          │ teamStatus      │
                          │ requestedById → │──┐
                          └────────┬────────┘  │
                  ┌────────┬──────┤────────┐   │
                  ▼        ▼      ▼        ▼   │
            ┌──────────┐ ┌──────────┐ ┌────────────────┐
            │   Part   │ │TeamProject│ │ PartSummary    │
            │──────────│ │──────────│ │────────────────│
            │ id (PK)  │ │ teamId → │ │ partId → │teamId│
            │ teamId → │ │projectId→│ │ scope          │
            │ name     │ └────┬─────┘ └───────┬────────┘
            └────┬─────┘      │               │
                 │            ▼               ▼
                 │     ┌──────────┐    ┌──────────────────┐
                 │     │ Project  │    │ SummaryWorkItem   │
                 │     │──────────│    │──────────────────│
                 │     │ id (PK)  │    │ partSummaryId →  │
                 │     │ code (UQ)│    │ projectId →      │
                 │     │ category │    └──────────────────┘
                 │     │managerId→│──┐
                 │     └──────────┘  │
                 │                   │
            ┌────┴──────────────┐    │
            │   Member          │◄───┘
            │───────────────────│
            │ id (PK)           │
            │ email (UNIQUE)    │
            │ roles[]           │
            │ accountStatus     │
            │ position          │
            │ jobTitle          │
            └───────┬───────────┘
        ┌───────┬───┤───────┬──────────────┐
        ▼       ▼   ▼       ▼              ▼
  ┌───────────┐ ┌──────────────┐  ┌──────────────────┐
  │TeamMember-│ │TeamJoinReq-  │  │  WeeklyReport    │
  │  ship     │ │  uest        │  │──────────────────│
  │───────────│ │──────────────│  │ memberId →       │
  │memberId → │ │ memberId →   │  │ weekStart        │
  │ teamId →  │ │ teamId →     │  │ weekLabel        │
  │ partId →  │ │ status       │  │ status           │
  │ roles[]   │ └──────────────┘  └────────┬─────────┘
  └───────────┘                            │
                                           ▼
                                    ┌──────────────┐
                                    │   WorkItem   │
                                    │──────────────│
                                    │weeklyReportId│
                                    │ projectId →  │
                                    │ doneWork     │
                                    │ planWork     │
                                    └──────────────┘

  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
  │MonthlyTimesheet  │───▶│ TimesheetEntry   │───▶│TimesheetWorkLog  │
  │──────────────────│    │──────────────────│    │──────────────────│
  │ memberId →       │    │ timesheetId →    │    │ entryId →        │
  │ teamId →         │    │ date             │    │ projectId →      │
  │ yearMonth        │    │ attendance       │    │ hours            │
  │ status           │    └──────────────────┘    │ workType         │
  └────────┬─────────┘                            └──────────────────┘
           │
           ▼
  ┌──────────────────────┐
  │ TimesheetApproval    │
  │──────────────────────│
  │ timesheetId →        │
  │ approverId →         │
  │ approvalType         │
  │ status               │
  └──────────────────────┘
```

---

## 2. 모델 상세

### 2.1 조직 도메인

#### Team (팀)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | String | PK, cuid() | 팀 고유 ID |
| name | String | UNIQUE | 팀 이름 |
| description | String? | — | 팀 설명 |
| teamStatus | TeamStatus | default(PENDING) | 팀 상태 |
| requestedById | String? | FK → Member | 팀 생성 신청자 |
| createdAt | DateTime | default(now()) | 생성일시 |
| updatedAt | DateTime | @updatedAt | 수정일시 |

**관계**: parts(1:N), teamProjects(1:N), partSummaries(1:N), teamMemberships(1:N), teamJoinRequests(1:N), timesheets(1:N)

**DB 테이블명**: `teams`

---

#### Part (파트)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | String | PK, cuid() | 파트 고유 ID |
| name | String | @@unique([teamId, name]) | 파트 이름 (팀 내 고유) |
| teamId | String | FK → Team | 소속 팀 |
| sortOrder | Int | default(0) | 정렬 순서 |

**관계**: team(N:1), members(1:N), partSummaries(1:N), teamMemberships(1:N)

**DB 테이블명**: `parts`

---

#### Member (회원)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | String | PK, cuid() | 회원 고유 ID |
| name | String | — | 이름 |
| email | String | UNIQUE | 이메일 (로그인 ID) |
| password | String | — | 암호화된 비밀번호 |
| roles | MemberRole[] | default([MEMBER]) | 전역 역할 (복수) |
| partId | String? | FK → Part | 레거시 파트 ID (TeamMembership 사용 권장) |
| isActive | Boolean | default(true) | 활성 여부 |
| sortOrder | Int | default(0) | 정렬 순서 |
| accountStatus | AccountStatus | default(PENDING) | 계정 상태 |
| mustChangePassword | Boolean | default(true) | 비밀번호 변경 필수 여부 |
| position | Position? | — | 직위 (Enum) |
| jobTitle | String? | — | 직책 (자유 입력) |
| createdAt | DateTime | default(now()) | 생성일시 |
| updatedAt | DateTime | @updatedAt | 수정일시 |

**관계**: weeklyReports(1:N), teamMemberships(1:N), teamJoinRequests(1:N), requestedTeams(1:N), timesheets(1:N), managedProjects(1:N), timesheetApprovals(1:N)

**소프트 삭제**: `accountStatus = INACTIVE` (DELETE 사용 금지)

**DB 테이블명**: `members`

---

### 2.2 팀 멤버십 도메인

#### TeamMembership (팀 멤버십 — 다중 팀 소속)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | String | PK, cuid() | 멤버십 고유 ID |
| memberId | String | FK → Member, @@unique([memberId, teamId]) | 회원 ID |
| teamId | String | FK → Team | 소속 팀 |
| partId | String? | FK → Part | 팀 내 소속 파트 |
| roles | MemberRole[] | default([MEMBER]) | 팀별 역할 (복수) |
| sortOrder | Int | default(0) | 정렬 순서 |
| createdAt | DateTime | default(now()) | 생성일시 |
| updatedAt | DateTime | @updatedAt | 수정일시 |

**인덱스**: `@@index([memberId])`, `@@index([teamId])`

**핵심 규칙**: 한 회원이 여러 팀에 소속 가능. 팀별로 서로 다른 역할을 가질 수 있음.

**DB 테이블명**: `team_memberships`

---

#### TeamJoinRequest (팀 가입 신청)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | String | PK, cuid() | 신청 고유 ID |
| memberId | String | FK → Member | 신청자 |
| teamId | String | FK → Team | 대상 팀 |
| status | JoinRequestStatus | default(PENDING) | 신청 상태 |
| createdAt | DateTime | default(now()) | 생성일시 |
| updatedAt | DateTime | @updatedAt | 수정일시 |

**인덱스**: `@@index([memberId])`, `@@index([teamId])`

**DB 테이블명**: `team_join_requests`

---

### 2.3 프로젝트 도메인

#### Project (프로젝트)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | String | PK, cuid() | 프로젝트 고유 ID |
| name | String | — | 프로젝트명 |
| code | String | UNIQUE | 프로젝트 코드 (전역 고유) |
| category | ProjectCategory | — | 분류 (COMMON / EXECUTION) |
| status | ProjectStatus | default(ACTIVE) | 상태 |
| sortOrder | Int | default(0) | 정렬 순서 |
| managerId | String? | FK → Member | 담당자 (PM) |
| department | String? | — | 담당 부서 |
| description | String? | — | 설명 |

**관계**: teamProjects(1:N), workItems(1:N), summaryWorkItems(1:N), timesheetWorkLogs(1:N)

**소프트 삭제**: `status = INACTIVE` (DELETE 사용 금지)

**DB 테이블명**: `projects`

---

#### TeamProject (팀-프로젝트 매핑)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | String | PK, cuid() | 매핑 고유 ID |
| teamId | String | FK → Team, @@unique([teamId, projectId]) | 팀 ID |
| projectId | String | FK → Project | 프로젝트 ID |
| sortOrder | Int | default(0) | 팀 내 프로젝트 정렬 순서 |
| createdAt | DateTime | default(now()) | 생성일시 |

**핵심 규칙**: 팀별로 사용할 프로젝트를 선택하는 M:N 관계.

**DB 테이블명**: `team_projects`

---

### 2.4 주간업무 도메인

#### WeeklyReport (주간업무 보고서)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | String | PK, cuid() | 보고서 고유 ID |
| memberId | String | FK → Member, @@unique([memberId, weekStart]) | 작성자 |
| weekStart | DateTime | — | 해당 주 월요일 00:00:00 UTC |
| weekLabel | String | — | 주차 라벨 (예: "2026-W09") |
| status | ReportStatus | default(DRAFT) | 작성 상태 |
| createdAt | DateTime | default(now()) | 생성일시 |
| updatedAt | DateTime | @updatedAt | 수정일시 |

**인덱스**: `@@index([weekStart])`

**핵심 규칙**: 팀원당 주차당 1건만 존재.

**DB 테이블명**: `weekly_reports`

---

#### WorkItem (업무 항목)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | String | PK, cuid() | 항목 고유 ID |
| weeklyReportId | String | FK → WeeklyReport (Cascade) | 소속 보고서 |
| projectId | String? | FK → Project | 연결 프로젝트 |
| doneWork | String | @db.Text | 진행업무 (한일) |
| planWork | String | @db.Text | 예정업무 (할일) |
| remarks | String? | @db.Text | 비고 |
| sortOrder | Int | default(0) | 정렬 순서 |
| createdAt | DateTime | default(now()) | 생성일시 |
| updatedAt | DateTime | @updatedAt | 수정일시 |

**인덱스**: `@@index([weeklyReportId])`, `@@index([projectId])`

**Cascade 삭제**: Report 삭제 시 하위 WorkItem 자동 삭제

**DB 테이블명**: `work_items`

---

### 2.5 취합보고 도메인

#### PartSummary (파트/팀 취합보고)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | String | PK, cuid() | 취합보고 고유 ID |
| partId | String? | FK → Part, @@unique([partId, weekStart]) | 파트 ID |
| teamId | String? | FK → Team | 팀 ID |
| scope | SummaryScope | default(PART) | 취합 범위 (PART / TEAM) |
| weekStart | DateTime | — | 해당 주 월요일 |
| weekLabel | String | — | 주차 라벨 |
| title | String? | — | 보고서 제목 |
| status | ReportStatus | default(DRAFT) | 작성 상태 |
| createdAt | DateTime | default(now()) | 생성일시 |
| updatedAt | DateTime | @updatedAt | 수정일시 |

**인덱스**: `@@index([weekStart])`

**DB 테이블명**: `part_summaries`

---

#### SummaryWorkItem (취합 업무 항목)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | String | PK, cuid() | 항목 고유 ID |
| partSummaryId | String | FK → PartSummary (Cascade) | 소속 취합보고 |
| projectId | String | FK → Project | 프로젝트 |
| doneWork | String | @db.Text | 진행업무 (병합) |
| planWork | String | @db.Text | 예정업무 (병합) |
| remarks | String? | @db.Text | 비고 |
| memberNames | String? | @db.Text | 작성자 이름 목록 |
| sortOrder | Int | default(0) | 정렬 순서 |

**인덱스**: `@@index([partSummaryId])`

**DB 테이블명**: `summary_work_items`

---

### 2.6 근무시간표 도메인

#### MonthlyTimesheet (월간 근무시간표)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | String | PK, cuid() | 시간표 고유 ID |
| memberId | String | FK → Member | 작성자 |
| teamId | String | FK → Team | 소속 팀 |
| yearMonth | String | @@unique([memberId, teamId, yearMonth]) | 년월 (예: "2026-03") |
| status | TimesheetStatus | default(DRAFT) | 상태 |
| submittedAt | DateTime? | — | 제출일시 |
| createdAt | DateTime | default(now()) | 생성일시 |
| updatedAt | DateTime | @updatedAt | 수정일시 |

**인덱스**: `@@index([yearMonth])`, `@@index([teamId])`, `@@index([memberId])`

**DB 테이블명**: `monthly_timesheets`

---

#### TimesheetEntry (시간표 일별 항목)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | String | PK, cuid() | 항목 고유 ID |
| timesheetId | String | FK → MonthlyTimesheet (Cascade) | 소속 시간표 |
| date | DateTime | @db.Date, @@unique([timesheetId, date]) | 날짜 |
| attendance | AttendanceType | default(WORK) | 근태 유형 |
| createdAt | DateTime | default(now()) | 생성일시 |
| updatedAt | DateTime | @updatedAt | 수정일시 |

**인덱스**: `@@index([timesheetId])`

**Cascade 삭제**: 시간표 삭제 시 하위 Entry 자동 삭제

**DB 테이블명**: `timesheet_entries`

---

#### TimesheetWorkLog (시간표 프로젝트별 근무 기록)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | String | PK, cuid() | 기록 고유 ID |
| entryId | String | FK → TimesheetEntry (Cascade) | 소속 일별 항목 |
| projectId | String | FK → Project | 프로젝트 |
| hours | Float | — | 근무시간 (시간 단위) |
| workType | WorkType | — | 근무 형태 |
| createdAt | DateTime | default(now()) | 생성일시 |
| updatedAt | DateTime | @updatedAt | 수정일시 |

**인덱스**: `@@index([entryId])`, `@@index([projectId])`

**Cascade 삭제**: Entry 삭제 시 하위 WorkLog 자동 삭제

**DB 테이블명**: `timesheet_work_logs`

---

#### TimesheetApproval (시간표 승인)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | String | PK, cuid() | 승인 고유 ID |
| timesheetId | String | FK → MonthlyTimesheet (Cascade) | 대상 시간표 |
| approverId | String | FK → Member | 승인자 |
| approvalType | ApprovalType | @@unique([timesheetId, approvalType]) | 승인 유형 |
| status | TimesheetStatus | default(DRAFT) | 승인 상태 |
| comment | String? | — | 반려 사유 등 코멘트 |
| approvedAt | DateTime? | — | 승인일시 |
| autoApproved | Boolean | default(false) | 자동 승인 여부 |
| createdAt | DateTime | default(now()) | 생성일시 |
| updatedAt | DateTime | @updatedAt | 수정일시 |

**핵심 규칙**: 시간표당 승인 유형별 1건만 존재. LEADER → PROJECT_MANAGER → ADMIN 순서로 승인.

**DB 테이블명**: `timesheet_approvals`

---

## 3. Enum 정의

### 3.1 역할 및 계정

| Enum | 값 | 설명 |
|------|----|------|
| **MemberRole** | `ADMIN` | 시스템 관리자 |
| | `LEADER` | 팀장 |
| | `PART_LEADER` | 파트장 |
| | `MEMBER` | 일반 팀원 |
| **AccountStatus** | `PENDING` | 가입 신청 (승인 대기) |
| | `APPROVED` | 승인됨 (첫 로그인 대기) |
| | `ACTIVE` | 활성 (정상 사용) |
| | `INACTIVE` | 비활성 (소프트 삭제) |
| **Position** | `DIRECTOR` | 이사 |
| | `GENERAL_MANAGER` | 부장 |
| | `DEPUTY_MANAGER` | 차장 |
| | `ASSISTANT_MANAGER` | 대리 |
| | `STAFF` | 사원 |
| | `PRINCIPAL_RESEARCHER` | 수석연구원 |
| | `SENIOR_RESEARCHER` | 선임연구원 |
| | `RESEARCHER` | 연구원 |
| | `ASSOCIATE_RESEARCHER` | 연구보조원 |

### 3.2 팀

| Enum | 값 | 설명 |
|------|----|------|
| **TeamStatus** | `PENDING` | 팀 생성 신청 (승인 대기) |
| | `APPROVED` | 승인됨 |
| | `ACTIVE` | 활성 (정상 운영) |
| | `INACTIVE` | 비활성 |
| **JoinRequestStatus** | `PENDING` | 가입 신청 대기 |
| | `APPROVED` | 승인 |
| | `REJECTED` | 거절 |

### 3.3 프로젝트

| Enum | 값 | 설명 |
|------|----|------|
| **ProjectCategory** | `COMMON` | 공통 프로젝트 |
| | `EXECUTION` | 수행 프로젝트 |
| **ProjectStatus** | `PENDING` | 신규 등록 (승인 대기) |
| | `ACTIVE` | 활성 |
| | `INACTIVE` | 비활성 (소프트 삭제) |

### 3.4 주간업무 / 취합보고

| Enum | 값 | 설명 |
|------|----|------|
| **ReportStatus** | `DRAFT` | 작성 중 |
| | `SUBMITTED` | 제출 완료 |
| **SummaryScope** | `PART` | 파트 단위 취합 |
| | `TEAM` | 팀 단위 취합 |

### 3.5 근무시간표

| Enum | 값 | 설명 |
|------|----|------|
| **AttendanceType** | `WORK` | 정상 근무 |
| | `HOLIDAY_WORK` | 휴일 근무 |
| | `ANNUAL_LEAVE` | 연차 |
| | `HALF_DAY_LEAVE` | 반차 |
| | `HOLIDAY` | 공휴일 |
| **WorkType** | `OFFICE` | 사무실 근무 |
| | `FIELD` | 현장 근무 |
| | `REMOTE` | 원격 근무 |
| | `BUSINESS_TRIP` | 출장 |
| **TimesheetStatus** | `DRAFT` | 작성 중 |
| | `SUBMITTED` | 제출됨 |
| | `APPROVED` | 승인됨 |
| | `REJECTED` | 반려됨 |
| **ApprovalType** | `LEADER` | 팀장 승인 |
| | `PROJECT_MANAGER` | PM 승인 |
| | `ADMIN` | 관리자 승인 |

---

## 4. 주요 관계 및 비즈니스 규칙

### 4.1 다중 팀 소속 구조

```
Member (1) ←──── TeamMembership (N) ────→ Team (1)
                       │
                       └──→ Part (0..1)    팀 내 소속 파트
                       └──→ roles[]         팀별 역할 (LEADER/PART_LEADER/MEMBER)
```

- 한 회원이 여러 팀에 소속 가능 (TeamMembership M:N)
- 팀별로 서로 다른 역할을 가질 수 있음
- `Member.roles`는 전역 역할, `TeamMembership.roles`는 팀별 역할
- `Member.partId`는 레거시 필드 (TeamMembership.partId 사용 권장)

### 4.2 프로젝트 → 팀 매핑

```
Project (1) ←──── TeamProject (N) ────→ Team (1)
```

- 전역 프로젝트를 팀별로 선택하여 사용
- Admin이 전역 프로젝트를 관리, 팀장이 팀 프로젝트를 선택

### 4.3 주간업무 작성 구조

```
Member (1) ──→ WeeklyReport (N, 주차당 1건)
                    │
                    └──→ WorkItem (N)
                              │
                              └──→ Project (0..1)
```

- 팀원당 주차당 WeeklyReport 1건 (`@@unique([memberId, weekStart])`)
- WorkItem은 프로젝트별 진행업무/예정업무/비고를 포함
- Report 삭제 시 WorkItem Cascade 삭제

### 4.4 근무시간표 계층 구조

```
MonthlyTimesheet (월간)
    │
    └──→ TimesheetEntry (일별, Cascade)
              │
              └──→ TimesheetWorkLog (프로젝트별 시간, Cascade)
    │
    └──→ TimesheetApproval (승인 유형별 1건, Cascade)
```

- 회원-팀-년월 조합으로 고유 (`@@unique([memberId, teamId, yearMonth])`)
- 승인 순서: LEADER → PROJECT_MANAGER → ADMIN
- 시간표당 승인 유형별 1건만 존재 (`@@unique([timesheetId, approvalType])`)

### 4.5 소프트 삭제 원칙

| 모델 | 삭제 방식 |
|------|-----------|
| Member | `accountStatus = INACTIVE` |
| Project | `status = INACTIVE` |
| Team | `teamStatus = INACTIVE` |
| WeeklyReport / WorkItem | `onDelete: Cascade` (Report 삭제 시 WorkItem 자동) |
| MonthlyTimesheet / Entry / WorkLog / Approval | `onDelete: Cascade` (상위 삭제 시 하위 자동) |

**규칙**: `DELETE` SQL / Prisma `delete` 직접 사용 금지 (Cascade 제외)

---

## 5. 인덱스 현황

| 모델 | 인덱스 | 유형 |
|------|--------|------|
| Team | name | UNIQUE |
| Part | [teamId, name] | UNIQUE (복합) |
| Member | email | UNIQUE |
| TeamMembership | [memberId, teamId] | UNIQUE (복합) |
| TeamMembership | [memberId] | INDEX |
| TeamMembership | [teamId] | INDEX |
| TeamJoinRequest | [memberId] | INDEX |
| TeamJoinRequest | [teamId] | INDEX |
| Project | code | UNIQUE |
| TeamProject | [teamId, projectId] | UNIQUE (복합) |
| WeeklyReport | [memberId, weekStart] | UNIQUE (복합) |
| WeeklyReport | [weekStart] | INDEX |
| WorkItem | [weeklyReportId] | INDEX |
| WorkItem | [projectId] | INDEX |
| PartSummary | [partId, weekStart] | UNIQUE (복합) |
| PartSummary | [weekStart] | INDEX |
| SummaryWorkItem | [partSummaryId] | INDEX |
| MonthlyTimesheet | [memberId, teamId, yearMonth] | UNIQUE (복합) |
| MonthlyTimesheet | [yearMonth] | INDEX |
| MonthlyTimesheet | [teamId] | INDEX |
| MonthlyTimesheet | [memberId] | INDEX |
| TimesheetEntry | [timesheetId, date] | UNIQUE (복합) |
| TimesheetEntry | [timesheetId] | INDEX |
| TimesheetWorkLog | [entryId] | INDEX |
| TimesheetWorkLog | [projectId] | INDEX |
| TimesheetApproval | [timesheetId, approvalType] | UNIQUE (복합) |
