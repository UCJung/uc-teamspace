# TASK-01: DB 설계 및 초기화

> **Phase:** 1
> **선행 TASK:** TASK-00
> **목표:** Prisma 스키마 정의, 마이그레이션 실행, 마스터 데이터 시드 완성

---

## Step 1 — 계획서

### 1.1 작업 범위

아키텍처 설계서의 Prisma 스키마를 기반으로 6개 핵심 엔티티(Team, Part, Member, Project, WeeklyReport, WorkItem)와 2개 취합 엔티티(PartSummary, SummaryWorkItem)를 정의한다. 마이그레이션을 실행하고, 시드 스크립트로 초기 마스터 데이터(팀 1개, 파트 2개, 팀원 9명, 프로젝트 11개)를 생성한다.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| Prisma | `packages/backend/prisma/schema.prisma` — 전체 엔티티 정의 |
| Migration | `packages/backend/prisma/migrations/` — 초기 마이그레이션 |
| Seed | `packages/backend/prisma/seed.ts` — 마스터 데이터 시드 |
| Shared 타입 | `packages/shared/types/team.ts`, `project.ts`, `weekly-report.ts` |

---

## Step 2 — 체크리스트

### 2.1 Prisma 스키마 정의

- [ ] `Team` — id(cuid), name(unique), description, timestamps
- [ ] `Part` — id, name, teamId(FK), @@unique([teamId, name])
- [ ] `Member` — id, name, email(unique), password, role(enum), partId(FK), isActive(default true), timestamps
- [ ] `MemberRole` enum — LEADER, PART_LEADER, MEMBER
- [ ] `Project` — id, name, code, category(enum), status(enum), teamId(FK), @@unique([teamId, code])
- [ ] `ProjectCategory` enum — COMMON, EXECUTION
- [ ] `ProjectStatus` enum — ACTIVE, HOLD, COMPLETED
- [ ] `WeeklyReport` — id, memberId(FK), weekStart(DateTime), weekLabel(String), status(enum), timestamps, @@unique([memberId, weekStart])
- [ ] `ReportStatus` enum — DRAFT, SUBMITTED
- [ ] `WorkItem` — id, weeklyReportId(FK, onDelete: Cascade), projectId(FK), doneWork(Text), planWork(Text), remarks(Text?), sortOrder, timestamps
- [ ] `PartSummary` — id, partId(FK), weekStart, weekLabel, status(enum), timestamps, @@unique([partId, weekStart])
- [ ] `SummaryWorkItem` — id, partSummaryId(FK, onDelete: Cascade), projectId(FK), doneWork(Text), planWork(Text), remarks(Text?), sortOrder
- [ ] 모든 관계(relation) 정의 완료
- [ ] `prisma generate` 성공

### 2.2 마이그레이션

- [ ] `bunx prisma migrate dev --name init` 실행
- [ ] 마이그레이션 파일 생성 확인
- [ ] DB에 테이블 생성 확인 (psql 또는 prisma studio)

### 2.3 시드 데이터 (seed.ts)

- [ ] 팀: 선행연구개발팀 1개
- [ ] 파트: DX, AX 2개
- [ ] 팀원 9명:
  - DX 파트: 홍길동(LEADER), 김철수(MEMBER), 이영희(MEMBER), 박민수(MEMBER)
  - AX 파트: 최수진(PART_LEADER), 정하늘(MEMBER), 강서연(MEMBER), 윤도현(MEMBER), 한지우(MEMBER)
- [ ] 팀원별 초기 비밀번호 해싱 (bcrypt)
- [ ] 팀원별 이메일 생성 규칙 적용
- [ ] 프로젝트 11개:
  - 공통(COMMON): 팀공통(공통2500), DX공통(공통2500), AX공통(공통2500)
  - 수행(EXECUTION): 5G 1세부(과제0013), 5G 3세부(과제0014), 가상병원용인(과제0023), 비대면과제(과제0024), 스케일업팁스일산(과제0026), 질병관리청 AX(과제0027), 가상병원_한림(HAX-의료-25004), AI영상검사(과제0011)
- [ ] 시드 멱등성 — `upsert` 사용으로 중복 실행 안전
- [ ] `bunx prisma db seed` 실행 성공

### 2.4 Shared 타입 동기화

- [ ] `packages/shared/types/team.ts` — Team, Part, Member, MemberRole 타입
- [ ] `packages/shared/types/project.ts` — Project, ProjectCategory, ProjectStatus 타입
- [ ] `packages/shared/types/weekly-report.ts` — WeeklyReport, WorkItem, PartSummary, SummaryWorkItem, ReportStatus 타입
- [ ] Prisma 스키마와 Shared 타입 일치 확인

### 2.5 Prisma 서비스 모듈

- [ ] `packages/backend/src/prisma/prisma.module.ts` — Global 모듈
- [ ] `packages/backend/src/prisma/prisma.service.ts` — onModuleInit에서 $connect()

---

## Step 3 — 완료 검증

```bash
# 1. Docker DB 기동
docker compose up -d postgres redis

# 2. Prisma Client 생성
cd packages/backend && bunx prisma generate

# 3. 마이그레이션 실행
cd packages/backend && bunx prisma migrate dev

# 4. 시드 실행
cd packages/backend && bunx prisma db seed

# 5. DB 데이터 확인
docker compose exec postgres psql -U dev -d weekly_report -c "SELECT m.name, m.role, p.name AS part FROM members m JOIN parts p ON m.part_id = p.id ORDER BY p.name, m.name;"
docker compose exec postgres psql -U dev -d weekly_report -c "SELECT name, code, category, status FROM projects ORDER BY category, name;"

# 6. 빌드 확인
cd ../.. && bun run build

# 7. 테스트 실행
bun run test
```
