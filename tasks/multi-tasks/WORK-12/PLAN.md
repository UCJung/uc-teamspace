# WORK-12: 프로젝트/파트 정렬 / 복수 역할 / 팀업무현황 제거 / 주차표현 통일

> Created: 2026-03-02
> Project: 주간업무보고 시스템
> Tech Stack: NestJS 11 / Prisma 6 / React 18 / Tailwind CSS / TypeScript
> Status: PLANNED
> Tasks: 5

## 개요

팀 내부에서 요청된 5개 기능을 하나의 WORK로 구현한다.

1. 프로젝트 관리 페이지에서 Drag & Drop으로 정렬순서 변경 (DB sortOrder 영속)
2. 파트(Part) 모델에 sortOrder 추가 + 파트 관리 Drag & Drop 정렬 UI
3. 팀원 역할을 복수 선택 가능하게 변경 (DB: roles MemberRole[], RBAC 로직 수정)
4. 팀업무현황(TeamStatus) 메뉴/라우트/페이지 제거
5. 모든 페이지 주차 표현을 "2026년 10주차 (3/2 ~ 3/6)" 형식으로 통일

## 현재 상태 분석

### 기능 1 - 프로젝트 정렬
- Project 모델에 sortOrder Int @default(0) 이미 존재 (schema.prisma:71)
- project.service.ts findAll 정렬: sortOrder asc, category asc, name asc 순
- UpdateProjectDto에 sortOrder?: number 이미 존재
- **없는 것**: 일괄 순서 변경 전용 API + 프론트 DnD UI

### 기능 2 - 파트 정렬
- Part 모델에 sortOrder 필드 없음 -> Prisma 마이그레이션 필요
- 파트 자체 관리 UI 없음 (TeamMgmt는 현재 팀원 목록만 표시)
- **없는 것**: sortOrder 필드, reorder API, 파트 관리 DnD UI

### 기능 3 - 복수 역할
- 현재 MemberRole enum 단일값: LEADER | PART_LEADER | MEMBER
- Prisma enum 배열(MemberRole[])은 PostgreSQL에서 지원
- RolesGuard, auth/me, JWT payload, Sidebar 역할 표시 등 전반 수정 필요
- 프론트 user.role (단일 string) -> user.roles (string[]) 타입 변경 필요

### 기능 4 - 팀업무현황 제거
- App.tsx 78번째 줄: /team-status 라우트 존재
- Sidebar.tsx 62번째 줄: "팀 업무 현황" 메뉴 항목 존재
- packages/frontend/src/pages/TeamStatus.tsx 파일 존재 -> 삭제

### 기능 5 - 주차 표현 통일
- shared/constants/week-utils.ts에 formatWeekLabel() 이미 존재
  반환 형식: "2026년 10주차 (3/2 ~ 3/6)"
- PartStatus.tsx 301번째 줄: {currentWeek} raw 표시 중 (미적용)
- MyWeeklyReport.tsx: 로컬 formatWeekDisplay() 함수로 이미 올바르게 구현
- PartSummary, TeamSummary, Dashboard 등 확인 후 통일 필요

## 변경 사항 요약

| 영역 | 변경 내용 |
|------|-----------|
| DB (Prisma) | Part.sortOrder 추가, Member.role 단일 -> roles 배열 |
| 백엔드 | 프로젝트/파트 reorder API, Member roles 배열 처리, RolesGuard 수정 |
| 프론트엔드 | ProjectMgmt DnD, TeamMgmt 파트 탭+DnD, 복수 역할 체크박스, TeamStatus 제거, 주차 통일 |

## TASK 목록

| ID | 제목 | 의존 |
|----|------|------|
| WORK-12-TASK-00 | DB 스키마 변경 및 마이그레이션 | 없음 |
| WORK-12-TASK-01 | 백엔드: 프로젝트/파트 정렬순서 API | TASK-00 |
| WORK-12-TASK-02 | 백엔드: 팀원 복수 역할 처리 | TASK-00 |
| WORK-12-TASK-03 | 프론트: 팀업무현황 제거 + 주차 표현 통일 | 없음 |
| WORK-12-TASK-04 | 프론트: 프로젝트/파트 DnD 정렬 UI + 복수 역할 UI | TASK-01, TASK-02, TASK-03 |

## 의존성 DAG

```
WORK-12-TASK-00 (DB 마이그레이션)
    +---> WORK-12-TASK-01 (백엔드 정렬 API)   ---+
    |                                             |
    +---> WORK-12-TASK-02 (백엔드 복수 역할)  ---+--> WORK-12-TASK-04 (프론트 DnD+복수역할)
                                                  |
WORK-12-TASK-03 (TeamStatus 제거+주차 통일) -----+
```

병렬 실행 가능 그룹:
- 1단계: TASK-00 단독 실행
- 2단계: TASK-01, TASK-02, TASK-03 동시 실행 가능
  (TASK-01, TASK-02는 TASK-00 완료 후 / TASK-03은 독립적으로 바로 시작 가능)
- 3단계: TASK-04 (TASK-01, 02, 03 모두 완료 후 실행)
