# WORK-16-TASK-01 수행 결과 보고서

> 작업일: 2026-03-03
> 작업자: Claude Code
> 상태: **완료**

---

## 1. 작업 개요

Project 모델을 팀 종속에서 전역 모델로 변경하고, TeamProject 연결 테이블을 신설하였다.
ProjectStatus enum을 ACTIVE / INACTIVE 2가지로 변경하고, 기존 HOLD/COMPLETED 데이터를 INACTIVE로 마이그레이션하였다.

---

## 2. 완료 기준 달성 현황

| 항목 | 상태 |
|------|------|
| 마이그레이션 성공적으로 실행 | ✅ |
| Project 테이블에 teamId 컬럼 없음 | ✅ |
| team_projects 테이블 존재 및 기존 데이터 이전 완료 | ✅ |
| ProjectStatus enum: ACTIVE / INACTIVE 만 존재 | ✅ |
| `bunx prisma generate` 성공 | ✅ |
| `bun run build` 성공 | ✅ |
| 전체 단위 테스트 통과 (84개) | ✅ |

---

## 3. 체크리스트 완료 현황

| 항목 | 완료 |
|------|------|
| Project 모델에서 teamId 필드 제거 | ✅ |
| Project 모델의 code 필드를 @unique (전역 유니크)로 변경 | ✅ |
| Project 모델의 @@unique([teamId, code]) 제거 | ✅ |
| Team 모델에서 projects Project[] 관계 제거 | ✅ |
| Project 모델에 teamProjects TeamProject[] 관계 추가 | ✅ |
| TeamProject 모델 신설 | ✅ |
| Team 모델에 teamProjects TeamProject[] 관계 추가 | ✅ |
| ProjectStatus enum: ACTIVE / INACTIVE로 변경 | ✅ |
| 마이그레이션 파일 작성 및 실행 | ✅ |
| 기존 HOLD/COMPLETED 데이터 → INACTIVE 변환 | ✅ |
| 기존 teamId 데이터 → TeamProject로 이전 | ✅ |
| seed.ts 업데이트 (TeamProject 연결 로직 추가) | ✅ |
| bunx prisma db seed 실행 | ✅ |
| bunx prisma generate 실행 | ✅ |
| project.service.ts: teamId 참조 제거 | ✅ |
| project.controller.ts: create/delete 엔드포인트 정리 | ✅ |
| project.service.spec.ts: INACTIVE 상태로 테스트 수정 | ✅ |

---

## 4. 발견 이슈 및 수정 내역

### 이슈 #1 — PostgreSQL enum 값 추가 후 같은 트랜잭션에서 사용 불가

**증상**: `ALTER TYPE "ProjectStatus" ADD VALUE 'INACTIVE'` 후 같은 트랜잭션에서 해당 값을 UPDATE에 사용하면 `ERROR: unsafe use of new value "INACTIVE" of enum type "ProjectStatus"` 발생

**원인**: PostgreSQL에서 `ADD VALUE`로 추가된 enum 값은 해당 트랜잭션이 커밋된 이후에만 사용 가능

**수정**: `ADD VALUE` 방식 대신, 새로운 enum 타입을 직접 생성하고 (`CREATE TYPE "ProjectStatus_new" AS ENUM ('ACTIVE', 'INACTIVE')`), `ALTER COLUMN TYPE USING CASE` 구문으로 기존 데이터를 변환한 뒤 기존 타입을 교체하는 방식으로 마이그레이션 SQL을 재작성

### 이슈 #2 — 기존 Docker 볼륨 인증 오류

**증상**: 다른 docker-compose.dev.yml로 기동 후 기본 docker-compose.yml로 재시작 시 `role "dev" does not exist` 오류

**원인**: docker-compose.dev.yml의 postgres 포트(5432)와 기본 docker-compose.yml의 포트(15432)가 달라 볼륨이 충돌

**수정**: `docker compose down -v`로 볼륨 삭제 후 재시작

---

## 5. 최종 검증 결과

```
# Prisma 스키마 검증
✔ The schema at prisma/schema.prisma is valid

# Prisma 마이그레이션 배포
8 migrations found in prisma/migrations
All migrations have been successfully applied.

# 백엔드 빌드
$ nest build
(성공 - 오류 없음)

# 단위 테스트
 84 pass
 0 fail
 149 expect() calls
Ran 84 tests across 10 files. [13.87s]

# 시드 데이터
팀공통, DX공통, AX공통 (COMMON x3)
과제0013~0027 (EXECUTION x8)
= 총 11개 전역 프로젝트 생성 + TeamProject 연결 완료
주간보고 18건, 업무항목 47건 생성
```

---

## 6. 후속 TASK 유의사항

- TASK-02(Admin 프로젝트 API): `admin.service.ts`, `admin.controller.ts`에 프로젝트 CRUD 추가. `ProjectStatus.INACTIVE` 사용
- TASK-03(팀 프로젝트 API): `TeamProject` 모델을 통한 팀-프로젝트 연결/해제 API 구현
- 기존 `project.service.ts`의 `create()` 메서드는 제거됨 — Admin API로 이관
- `ProjectQueryDto`에서 `teamId` 필터 제거됨 (팀별 조회는 TeamProject를 통해 수행)

---

## 7. 산출물 목록

### 신규 생성 파일

| 파일 | 내용 |
|------|------|
| `packages/backend/prisma/migrations/20260303000000_work16_project_global/migration.sql` | WORK-16 DB 마이그레이션 |

### 수정 파일

| 파일 | 변경 내용 |
|------|----------|
| `packages/backend/prisma/schema.prisma` | Project 전역화, TeamProject 신설, ProjectStatus enum 변경 |
| `packages/backend/prisma/seed.ts` | teamId 제거, TeamProject 연결 로직 추가 |
| `packages/backend/src/project/project.service.ts` | teamId 참조 제거, create() 제거, INACTIVE 상태 적용 |
| `packages/backend/src/project/project.controller.ts` | create/delete/reorder 엔드포인트 정리 |
| `packages/backend/src/project/dto/create-project.dto.ts` | teamId 필드 제거 |
| `packages/backend/src/project/dto/project-query.dto.ts` | teamId 필터 제거 |
| `packages/backend/src/project/project.service.spec.ts` | INACTIVE 상태로 테스트 수정 |
