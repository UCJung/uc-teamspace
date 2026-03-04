# WORK-21-TASK-01: Prisma 스키마 인덱스 추가 + 마이그레이션

> **Phase:** 1
> **선행 TASK:** 없음
> **목표:** schema.prisma에 5개 성능 인덱스를 추가하고 DB 마이그레이션을 적용한다.

---

## Step 1 - 계획서

### 1.1 작업 범위

schema.prisma의 5개 모델(PartSummary, TeamJoinRequest, Project, Part, TimesheetApproval)에
누락된 인덱스를 추가한다. 이 인덱스들은 TASK-02~04에서 수행할 쿼리 최적화의 DB 레벨 기반이 된다.
Prisma migrate dev로 마이그레이션 파일을 생성하고 DB에 적용한다.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| 수정 | packages/backend/prisma/schema.prisma |
| 생성 | packages/backend/prisma/migrations/[날짜]_add_perf_indexes/migration.sql |

### 1.3 인덱스 변경 상세

| 모델 | 추가 인덱스 | 대응 ISSUE | 적용 사유 |
|------|------------|------------|----------|
| PartSummary | @@index([teamId, weekStart]) | ISSUE-04 | TEAM scope findFirst 시 teamId 필터 풀 스캔 제거 |
| TeamJoinRequest | @@index([memberId, teamId, status]) | ISSUE-12 | 복합 조건 가입 신청 조회 최적화 |
| Project | @@index([status]) | ISSUE-14 | managerId + status 필터 조회 최적화 |
| Part | @@index([teamId, sortOrder]) | ISSUE-15 | 팀별 파트 정렬 조회 최적화 |
| TimesheetApproval | @@index([approverId, approvalType]) | ISSUE-16 | PM 승인 조회 최적화 |

---

## Step 2 - 체크리스트

### 2.1 스키마 수정

- [ ] PartSummary 모델에 @@index([teamId, weekStart]) 추가
- [ ] TeamJoinRequest 모델에 @@index([memberId, teamId, status]) 추가
- [ ] Project 모델에 @@index([status]) 추가
- [ ] Part 모델에 @@index([teamId, sortOrder]) 추가
- [ ] TimesheetApproval 모델에 @@index([approverId, approvalType]) 추가

### 2.2 마이그레이션

- [ ] bunx prisma migrate dev --name add_perf_indexes 실행
- [ ] 생성된 migration.sql 검토 (CREATE INDEX 5개 포함 확인)
- [ ] bunx prisma generate 실행 (Prisma Client 재생성)

### 2.3 빌드 검증

- [ ] bun run build 성공 (백엔드)
- [ ] TypeScript 컴파일 오류 없음

---

## Step 3 - 완료 검증

```bash
cd packages/backend
bunx prisma migrate dev --name add_perf_indexes
bunx prisma generate
bun run build
```
