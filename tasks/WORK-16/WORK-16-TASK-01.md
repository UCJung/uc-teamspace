# WORK-16-TASK-01: DB 스키마 변경 및 마이그레이션

> WORK: WORK-16 프로젝트 관리 프로세스 구조 변경
> 의존: 없음

---

## 목표

Project 모델을 팀 종속에서 전역 모델로 변경하고, TeamProject 연결 테이블을 신설한다.
ProjectStatus enum을 ACTIVE / INACTIVE 2가지로 변경한다.

---

## 체크리스트

### 1. Prisma 스키마 변경
- [ ] Project 모델에서 `teamId` 필드 제거
- [ ] Project 모델의 `code` 필드를 `@unique` (전역 유니크)로 변경
- [ ] Project 모델의 `@@unique([teamId, code])` 제거
- [ ] Team 모델에서 `projects Project[]` 관계 제거
- [ ] Project 모델에 `teamProjects TeamProject[]` 관계 추가
- [ ] TeamProject 모델 신설 (id, teamId, projectId, sortOrder, createdAt)
- [ ] Team 모델에 `teamProjects TeamProject[]` 관계 추가
- [ ] ProjectStatus enum: HOLD, COMPLETED 제거 → ACTIVE / INACTIVE 로 변경

### 2. Prisma 마이그레이션
- [ ] `bunx prisma migrate dev --name work16_project_global` 실행
- [ ] 마이그레이션 파일 생성 확인
- [ ] 기존 Project 데이터의 teamId → TeamProject 테이블로 이전하는 마이그레이션 SQL 작성
- [ ] HOLD/COMPLETED 상태 데이터 → INACTIVE로 변환 처리

### 3. 시드 데이터 업데이트
- [ ] `seed.ts`에서 Project 생성 시 teamId 제거
- [ ] `seed.ts`에서 생성된 프로젝트를 TeamProject로 연결하는 로직 추가
- [ ] `bunx prisma db seed` 실행 확인

### 4. Prisma Client 재생성
- [ ] `bunx prisma generate` 실행

---

## 완료 기준

- [ ] 마이그레이션 성공적으로 실행
- [ ] Project 테이블에 teamId 컬럼 없음
- [ ] team_projects 테이블 존재 및 기존 데이터 이전 완료
- [ ] ProjectStatus enum: ACTIVE / INACTIVE 만 존재
- [ ] `bunx prisma generate` 성공

---

## 완료 검증 명령어

```bash
# 1. 마이그레이션 상태 확인
cd C:/rnd/weekly-report && bunx prisma migrate status

# 2. 스키마 검증
cd C:/rnd/weekly-report && bunx prisma validate

# 3. DB 테이블 확인
cd C:/rnd/weekly-report && bunx prisma db execute --stdin <<< "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('projects','team_projects');"

# 4. 백엔드 빌드 확인
cd C:/rnd/weekly-report/packages/backend && bun run build
```
