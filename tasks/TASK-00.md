# TASK-00: 환경 설정 및 프로젝트 초기화

> **Phase:** 0
> **선행 TASK:** 없음
> **목표:** 모노레포 구조 생성, Docker 인프라 구성, 개발 환경 전체 설정

---

## Step 1 — 계획서

### 1.1 작업 범위

모노레포(Turborepo) 기반 프로젝트를 초기화하고, Docker Compose로 PostgreSQL 16 + Redis 7 개발 인프라를 구성한다. Backend(NestJS 11), Frontend(React 18 + Vite 6), Shared 패키지를 생성하고 기본 빌드·린트·테스트 파이프라인이 동작하는 상태까지 완성한다.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| 루트 | `package.json`, `turbo.json`, `.gitignore`, `.env.example` |
| Docker | `docker-compose.yml`, `docker-compose.dev.yml`, `docker/Dockerfile.backend`, `docker/Dockerfile.frontend`, `docker/nginx.conf` |
| Backend | `packages/backend/` — NestJS 11 프로젝트 (빈 모듈 구조) |
| Frontend | `packages/frontend/` — React 18 + Vite 6 + Tailwind CSS 4 프로젝트 |
| Shared | `packages/shared/` — 공유 타입·유틸 패키지 |

### 1.3 기술 스택 버전

| 기술 | 버전 |
|------|------|
| Node.js | 22 LTS |
| Bun | 1.2+ |
| NestJS | 11.x |
| React | 18.x |
| Vite | 6.x |
| Tailwind CSS | 4.x |
| Turborepo | 2.x |
| TypeScript | 5.x |
| PostgreSQL | 16 |
| Redis | 7 |

---

## Step 2 — 체크리스트

### 2.1 모노레포 루트 설정

- [ ] `package.json` — 워크스페이스 정의 (`packages/*`)
- [ ] `turbo.json` — 빌드 파이프라인 (build, dev, test, lint)
- [ ] `.gitignore` — node_modules, dist, .env, prisma 생성물 등
- [ ] `.env.example` — 환경변수 템플릿
- [ ] `bun install` 정상 실행 확인

### 2.2 Docker 인프라

- [ ] `docker-compose.yml` — PostgreSQL 16 + Redis 7 (운영용)
- [ ] `docker-compose.dev.yml` — 개발용 (포트 노출, 볼륨 마운트)
- [ ] `docker/Dockerfile.backend` — 멀티스테이지 빌드 (development / production)
- [ ] `docker/Dockerfile.frontend` — 멀티스테이지 빌드 (development / production)
- [ ] `docker/nginx.conf` — 리버스 프록시 설정 (`/api/*` → backend, `/*` → frontend static)
- [ ] `docker compose up -d` 로 PostgreSQL, Redis 정상 기동 확인

### 2.3 Backend 패키지 (NestJS)

- [ ] `packages/backend/package.json` — NestJS 11 + 의존성
- [ ] `packages/backend/tsconfig.json`
- [ ] `packages/backend/nest-cli.json`
- [ ] `packages/backend/src/main.ts` — 부트스트랩 (포트 3000, 글로벌 파이프·필터 설정)
- [ ] `packages/backend/src/app.module.ts` — 루트 모듈
- [ ] `packages/backend/prisma/schema.prisma` — 기본 datasource 설정 (엔티티는 TASK-01)
- [ ] `.env` 파일에 `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET` 설정
- [ ] `bun run start:dev` 로 NestJS 개발 서버 기동 확인 (localhost:3000)

### 2.4 Frontend 패키지 (React + Vite)

- [ ] `packages/frontend/package.json` — React 18, Vite 6, Tailwind CSS 4
- [ ] `packages/frontend/tsconfig.json`
- [ ] `packages/frontend/vite.config.ts` — 프록시 설정 (`/api` → localhost:3000)
- [ ] `packages/frontend/tailwind.config.ts` — 커스텀 색상 시스템 (STYLE_GUIDE 기반)
- [ ] `packages/frontend/src/main.tsx` — 엔트리 포인트
- [ ] `packages/frontend/src/App.tsx` — 기본 라우터 껍데기
- [ ] `packages/frontend/src/styles/globals.css` — CSS 변수 전체 선언 (섹션 11 색상 시스템)
- [ ] `packages/frontend/index.html` — Noto Sans KR 폰트 로드
- [ ] `bun run dev` 로 Vite 개발 서버 기동 확인 (localhost:5173)

### 2.5 Shared 패키지

- [ ] `packages/shared/package.json`
- [ ] `packages/shared/tsconfig.json`
- [ ] `packages/shared/types/index.ts` — 기본 타입 export 껍데기
- [ ] `packages/shared/constants/week-utils.ts` — 주차 계산 함수 (ISO 8601 기준)
  - `getWeekLabel(date: Date): string` — `"2026-W09"` 형식 반환
  - `getWeekStart(date: Date): Date` — 해당 주 월요일 00:00:00 UTC
  - `getWeekRange(weekLabel: string): { start: Date, end: Date }` — 주차 범위
  - `getPreviousWeekLabel(weekLabel: string): string` — 전주 라벨
- [ ] Backend, Frontend 에서 shared 패키지 import 가능 확인

### 2.6 통합 확인

- [ ] `bun run dev` — Turborepo로 backend + frontend 동시 실행
- [ ] `bun run build` — 전체 빌드 성공
- [ ] `bun run lint` — 린트 오류 0건
- [ ] `bun run test` — 테스트 프레임워크 동작 확인 (샘플 테스트 1건 이상)

---

## Step 3 — 완료 검증

```bash
# 1. Docker 인프라 확인
docker compose up -d
docker compose ps                          # postgres, redis 상태 Up 확인
docker compose exec postgres pg_isready    # PostgreSQL 접속 확인
docker compose exec redis redis-cli ping   # Redis PONG 확인

# 2. 의존성 설치
bun install

# 3. 전체 빌드
bun run build

# 4. 전체 린트
bun run lint

# 5. 전체 테스트
bun run test

# 6. 주차 유틸 테스트 (shared)
cd packages/shared && bun test

# 7. Backend 기동 테스트
cd packages/backend && bun run start:dev &
sleep 3
curl http://localhost:3000/api/health      # 200 OK 확인
kill %1

# 8. Frontend 빌드 결과 확인
ls packages/frontend/dist/index.html       # 파일 존재 확인
```
