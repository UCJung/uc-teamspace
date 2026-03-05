# WORK-24: 팀별 작업 상태 커스텀 관리

> Created: 2026-03-05
> Project: UC TeamSpace
> Tech Stack: NestJS 11 / Prisma 6 / React 18 / TypeScript 5
> Status: PLANNED

## 요청사항

팀 설정에서 작업상태를 관리하는 기능:
1. 현재 할일/진행중/완료 3단계 고정 → 팀별로 상태를 커스텀 관리
2. 상태 추가, 순서 변경, 상태 속성 정의 (진행전/진행중/완료 3개 카테고리로 상태 특성 분류)
3. 목록에서 작업 상태를 시각적으로 표시 (전체보기에서 상태 구분 가능)

---

## 1. 요구사항 분석

### 1.1 현재 구조 (AS-IS)
- PersonalTask.status: TaskStatus enum (TODO | IN_PROGRESS | DONE) 전역 고정값
- 칸반보드(TaskKanban.tsx): 하드코딩된 3컬럼 (COLUMNS 배열, TODO/IN_PROGRESS/DONE)
- 목록뷰(TaskItem.tsx): 상태 표시 없음 (완료 여부만 체크박스로 표현)
- 필터바(TaskFilterBar.tsx): 하드코딩된 STATUS_OPTIONS 배열 (전체/할일/진행중/완료)
- 라벨 상수(labels.ts): TASK_STATUS_LABEL, TASK_STATUS_VARIANT 고정 딕셔너리

### 1.2 변경 목표 (TO-BE)
- TaskStatusDef 모델: 팀별 작업 상태 정의 테이블 (DB)
- PersonalTask: status enum 필드를 statusId FK로 교체 (마이그레이션 포함)
- 팀 관리 화면: 작업 상태 관리 탭/섹션 추가 (상태 추가/수정/삭제/정렬)
- 칸반보드: 동적 컬럼 (팀의 TaskStatusDef 목록 기반)
- 목록뷰: 상태 배지 표시 (상태명 + 색상)
- 필터바: 동적 상태 필터 탭

### 1.3 카테고리 체계

| 카테고리 enum | 한글 의미 | 기본 상태 예시 |
|---|---|---|
| BEFORE_START | 진행전 | 할일 |
| IN_PROGRESS | 진행중 | 진행중 |
| COMPLETED | 완료 | 완료 |

비즈니스 로직:
- COMPLETED 카테고리: completedAt 자동 설정, elapsedMinutes 계산
- IN_PROGRESS 카테고리: startedAt 자동 설정
- toggleDone 로직: COMPLETED이면 기본 BEFORE_START 상태로 되돌림

---

## 2. 현행 아키텍처 영향도 분석

### 2.1 백엔드 영향

| 파일 | 영향도 | 변경 내용 |
|---|---|---|
| prisma/schema.prisma | 높음 | TaskStatusDef 모델 추가, PersonalTask.status enum → statusId FK 변경 |
| prisma/seed.ts | 중간 | 기존 팀에 기본 3상태 자동 생성, PersonalTask 기존 데이터 마이그레이션 |
| personal-task/personal-task.service.ts | 높음 | TaskStatus enum 참조 전체 교체 → statusId + category 기반 로직 |
| personal-task/dto/ | 중간 | status 필드 → statusId 필드로 교체 |
| team/team.controller.ts | 중간 | 작업 상태 CRUD 엔드포인트 5개 추가 |
| team/team.module.ts | 중간 | TaskStatusService 등록 |

### 2.2 프론트엔드 영향

| 파일 | 영향도 | 변경 내용 |
|---|---|---|
| api/personal-task.api.ts | 높음 | TaskStatus 타입 교체, statusId 필드 추가 |
| components/personal-task/TaskKanban.tsx | 높음 | 고정 COLUMNS → 동적 컬럼 |
| components/personal-task/TaskItem.tsx | 중간 | 상태 배지 추가 |
| components/personal-task/TaskFilterBar.tsx | 중간 | 동적 상태 탭 |
| components/personal-task/TaskKanbanCard.tsx | 중간 | 상태 배지 표시 |
| pages/TeamMgmt.tsx | 중간 | 작업 상태 관리 탭 추가 |
| constants/labels.ts | 낮음 | TASK_STATUS_LABEL deprecated |
| hooks/useTaskStatuses.ts | 신규 | useTaskStatuses 커스텀 훅 |

---

## 3. DB 스키마 설계

### 3.1 신규 enum: TaskStatusCategory

BEFORE_START (진행전), IN_PROGRESS (진행중), COMPLETED (완료)

### 3.2 신규 모델: TaskStatusDef

필드:
- id: String cuid (PK)
- teamId: String (FK → Team)
- name: String (상태명, 최대 20자)
- category: TaskStatusCategory
- color: String default "#6B5CE7"
- sortOrder: Int default 0
- isDefault: Boolean default false (카테고리별 대표 상태)
- isDeleted: Boolean default false (소프트 삭제)
- createdAt, updatedAt

인덱스: @@index([teamId, sortOrder]), @@index([teamId, category])
테이블명: task_status_defs

### 3.3 PersonalTask 변경

- status TaskStatus 필드 제거
- statusId String 추가 (FK → TaskStatusDef)
- taskStatus TaskStatusDef 관계 추가
- @@index([memberId, teamId, status]) → @@index([memberId, teamId, statusId])

### 3.4 Team 모델 관계 추가

- taskStatusDefs TaskStatusDef[] 추가

### 3.5 마이그레이션 전략 (3단계)

Phase 1 — 스키마 추가:
- TaskStatusDef 테이블 생성
- PersonalTask.statusId nullable 추가
- PersonalTask.status 컬럼 유지

Phase 2 — 데이터 마이그레이션 (커스텀 SQL):
- 각 팀별 기본 3상태 INSERT
- PersonalTask.status → statusId 매핑
  - TODO → BEFORE_START isDefault 상태
  - IN_PROGRESS → IN_PROGRESS isDefault 상태
  - DONE → COMPLETED isDefault 상태

Phase 3 — 컬럼 정리:
- PersonalTask.statusId NOT NULL 설정
- PersonalTask.status 컬럼 삭제
- TaskStatus enum 삭제

---

## 4. API 설계

### 4.1 팀 작업 상태 관리 API (신규)

| Method | Endpoint | 설명 | 권한 |
|---|---|---|---|
| GET | /api/v1/teams/:teamId/task-statuses | 팀 상태 목록 조회 | 팀원 이상 |
| POST | /api/v1/teams/:teamId/task-statuses | 상태 추가 | 팀장 |
| PATCH | /api/v1/teams/:teamId/task-statuses/reorder | 순서 변경 | 팀장 |
| PATCH | /api/v1/teams/:teamId/task-statuses/:id | 상태 수정 | 팀장 |
| DELETE | /api/v1/teams/:teamId/task-statuses/:id | 상태 소프트 삭제 | 팀장 |

삭제 제약:
- 카테고리당 최소 1개 유지 (위반 시 400 BusinessException)
- 삭제된 상태에 속한 PersonalTask는 해당 카테고리의 isDefault 상태로 자동 이전

### 4.2 PersonalTask API 변경

- GET /personal-tasks 응답: status 제거, statusId + taskStatus 객체 포함
- POST /personal-tasks: status 제거, statusId 추가 (미입력 시 팀 기본 BEFORE_START)
- PATCH /personal-tasks/:id: status 제거, statusId 추가

---

## 5. 화면 설계

### 5.1 팀 관리 화면 — 작업 상태 관리 탭

위치: TeamMgmt.tsx에 새 탭 (작업 상태 탭)
구성:
- 카테고리별 그룹 (진행전 / 진행중 / 완료)
- 각 상태 행: 색상 원 + 상태명 + 기본상태 뱃지 + 수정/삭제 버튼 + DnD 핸들
- 각 카테고리 하단에 상태 추가 버튼

상태 추가/수정 폼:
- 상태명 (필수, 최대 20자)
- 카테고리 선택 (진행전 / 진행중 / 완료)
- 색상 선택 (6색 팔레트: #6C7A89, #6B5CE7, #27AE60, #F5A623, #E74C3C, #3498DB)

### 5.2 칸반보드 — 동적 컬럼

변경: useTaskStatuses(teamId) 훅 → sortOrder 순으로 동적 컬럼 렌더링
- 컬럼 헤더 색상: TaskStatusDef.color 기반
- DnD 드롭: column-{statusId} 패턴으로 droppable ID 관리
- 컬럼 간 이동 시 statusId로 PATCH /personal-tasks/:id 호출

### 5.3 목록뷰 — 상태 배지

변경: TaskItem.tsx에 상태명 + 색상 배지 추가 (Priority 배지 옆)

### 5.4 필터바 — 동적 상태 탭

변경: useTaskStatuses(teamId) 결과로 탭 생성 (전체 탭 고정 + 팀 상태 탭)

---

## 6. Task Dependency Graph

TASK-01 (DB 스키마 + 마이그레이션)
    |
    v
TASK-02 (백엔드 TaskStatusDef CRUD API)
    |
    +----------------+
    v                v
TASK-03          TASK-04
(백엔드 서비스)   (프론트 관리 화면)
    |                |
    +----------------+
           |
           v
       TASK-05
  (프론트 칸반/목록/필터)
           |
           v
       TASK-06
  (통합 검증 + seed)

## Tasks

### WORK-24-TASK-01: DB 스키마 + 마이그레이션
- **Depends on**: (없음)
- **Scope**: TaskStatusDef 모델 추가, PersonalTask.status enum → statusId FK 변경, 3단계 마이그레이션 실행
- **Files**:
  - packages/backend/prisma/schema.prisma — TaskStatusDef 모델 추가, PersonalTask 변경
  - packages/backend/prisma/migrations/ — 마이그레이션 파일 3개
- **Acceptance Criteria**:
  - [ ] TaskStatusDef 테이블 생성 완료
  - [ ] PersonalTask.statusId FK 추가 + 기존 데이터 statusId 매핑 완료
  - [ ] PersonalTask.status 컬럼 삭제, TaskStatus enum 제거
- **Verify**: bunx prisma migrate status

### WORK-24-TASK-02: 백엔드 — TaskStatusDef CRUD API
- **Depends on**: WORK-24-TASK-01
- **Scope**: TaskStatusDef 5개 엔드포인트 구현, team 모듈에 TaskStatusService 등록
- **Files**:
  - packages/backend/src/team/task-status.service.ts — 신규
  - packages/backend/src/team/dto/create-task-status.dto.ts — 신규
  - packages/backend/src/team/dto/update-task-status.dto.ts — 신규
  - packages/backend/src/team/dto/reorder-task-statuses.dto.ts — 신규
  - packages/backend/src/team/team.controller.ts — 엔드포인트 5개 추가
  - packages/backend/src/team/team.module.ts — TaskStatusService 등록
- **Acceptance Criteria**:
  - [ ] 5개 엔드포인트 정상 동작
  - [ ] 삭제 시 카테고리 최소 1개 유지 제약
  - [ ] 삭제 시 하위 작업 isDefault 상태로 자동 이전
- **Verify**: bun run test && bun run build

### WORK-24-TASK-03: 백엔드 — PersonalTask 서비스 statusId 연동
- **Depends on**: WORK-24-TASK-02
- **Scope**: personal-task.service.ts의 TaskStatus enum 참조를 statusId + category 기반으로 전환
- **Files**:
  - packages/backend/src/personal-task/personal-task.service.ts — enum 참조 → category 기반
  - packages/backend/src/personal-task/dto/create-personal-task.dto.ts — status → statusId
  - packages/backend/src/personal-task/dto/update-personal-task.dto.ts — status → statusId
  - packages/backend/src/personal-task/dto/list-personal-tasks-query.dto.ts — 필터 변경
- **Acceptance Criteria**:
  - [ ] create: statusId 미입력 시 팀 기본 BEFORE_START 상태 자동 배정
  - [ ] update: category 기반 startedAt/completedAt 자동 처리
  - [ ] toggleDone: COMPLETED ↔ 기본 BEFORE_START 전환
  - [ ] getPartOverview/getTeamOverview: category 기반 집계
- **Verify**: bun run test && bun run build

### WORK-24-TASK-04: 프론트엔드 — 팀 작업 상태 관리 화면
- **Depends on**: WORK-24-TASK-02
- **Scope**: 팀 관리 화면에 작업 상태 관리 탭 추가, CRUD + DnD 정렬 UI 구현
- **Files**:
  - packages/frontend/src/api/team.api.ts — TaskStatusDef 타입 + API 함수 추가
  - packages/frontend/src/hooks/useTaskStatuses.ts — 신규
  - packages/frontend/src/components/team/TaskStatusManager.tsx — 신규
  - packages/frontend/src/pages/TeamMgmt.tsx — TaskStatusManager 통합
- **Acceptance Criteria**:
  - [ ] 현재 팀 작업 상태 목록 표시 (카테고리별 그룹)
  - [ ] 상태 추가/수정/삭제 정상 동작
  - [ ] DnD 정렬 정상 동작
  - [ ] 빌드/린트 오류 0건
- **Verify**: bun run build && bun run lint

### WORK-24-TASK-05: 프론트엔드 — 칸반/목록/필터 동적 상태 적용
- **Depends on**: WORK-24-TASK-03, WORK-24-TASK-04
- **Scope**: 칸반보드 동적 컬럼, 목록뷰 상태 배지, 필터바 동적 탭으로 전환
- **Files**:
  - packages/frontend/src/api/personal-task.api.ts — statusId 필드 추가, taskStatus 타입
  - packages/frontend/src/components/personal-task/TaskKanban.tsx — 동적 컬럼
  - packages/frontend/src/components/personal-task/TaskItem.tsx — 상태 배지 추가
  - packages/frontend/src/components/personal-task/TaskKanbanCard.tsx — 상태 배지 추가
  - packages/frontend/src/components/personal-task/TaskFilterBar.tsx — 동적 상태 탭
  - packages/frontend/src/constants/labels.ts — TASK_STATUS_LABEL deprecated
- **Acceptance Criteria**:
  - [ ] 칸반보드: 팀 상태 정의 기반 동적 컬럼 렌더링
  - [ ] 칸반보드: DnD 이동 시 statusId로 PATCH 호출
  - [ ] 목록뷰: 상태명 + 색상 배지 표시
  - [ ] 필터바: 동적 상태 탭
  - [ ] 빌드/린트/테스트 오류 0건
- **Verify**: bun run build && bun run lint && bun run test

### WORK-24-TASK-06: 통합 검증 + seed 정리
- **Depends on**: WORK-24-TASK-05
- **Scope**: seed.ts 기본 팀 상태 생성 로직 추가, 팀 승인 시 자동 상태 생성, 전체 빌드/테스트 검증
- **Files**:
  - packages/backend/prisma/seed.ts — 선행연구개발팀 기본 3상태 시드 추가
  - packages/backend/src/team/team-join.service.ts — 팀 승인 시 기본 상태 자동 생성
  - packages/backend/src/team/task-status.service.ts — createDefaultStatuses 메서드
- **Acceptance Criteria**:
  - [ ] seed 실행 후 기존 팀에 기본 3상태 생성 확인
  - [ ] 신규 팀 승인 시 기본 3상태 자동 생성 확인
  - [ ] 전체 빌드/테스트/린트 통과
- **Verify**: bun run build && bun run lint && bun run test

---

## 7. 리스크 및 주의사항

### 7.1 데이터 마이그레이션 위험
- 위험: 기존 PersonalTask.status 데이터 손실 또는 잘못 매핑 가능
- 대응: 마이그레이션 SQL을 Prisma 커스텀 마이그레이션으로 작성, 트랜잭션 내 실행
- 롤백: statusId nullable로 시작, status 컬럼 Phase3까지 유지

### 7.2 toggleDone / startedAt 로직 변경
- 위험: TaskStatus.DONE, TaskStatus.IN_PROGRESS 직접 비교 로직 다수 존재
- 대응: TaskStatusDef.category include 후 category 기반 판단
  - AS-IS: if (dto.status === TaskStatus.DONE)
  - TO-BE: if (statusDef.category === COMPLETED)

### 7.3 칸반 DnD droppable ID 변경
- 위험: column-TODO 등 하드코딩 패턴 사용 중
- 대응: column-{statusId} 패턴으로 변경, getOverStatus 함수 재작성

### 7.4 part-overview / team-overview 집계 변경
- 위험: todoCount, inProgressCount, doneCount를 status enum 직접 비교로 집계
- 대응: category 기반 집계, 응답 필드명은 동일하게 유지 (하위 호환)

### 7.5 색상 시스템 원칙
- HEX 저장 (DB), 기본 팔레트: 프로젝트 디자인 시스템 CSS 변수 대응 HEX 값
- 팔레트: #6C7A89 (진행전), #6B5CE7 (진행중), #27AE60 (완료), #F5A623, #E74C3C, #3498DB

### 7.6 seed.ts 업데이트
- 팀 생성 시 기본 3상태 자동 생성 로직을 seed.ts와 team-join.service.ts 양쪽에 반영
- 기존 팀(선행연구개발팀)에 대해서도 마이그레이션 또는 seed 재실행으로 기본 상태 생성
