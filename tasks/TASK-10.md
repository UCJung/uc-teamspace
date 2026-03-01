# TASK-10: 통합 테스트 및 배포

> **Phase:** 10
> **선행 TASK:** TASK-09
> **목표:** 전체 시스템 통합 검증, E2E 테스트, Docker 운영 빌드, CI/CD 파이프라인 구성

---

## Step 1 — 계획서

### 1.1 작업 범위

TASK-00~09에서 구현한 전체 시스템을 통합 검증한다. Playwright E2E 테스트로 핵심 시나리오 5개를 자동화하고, Docker 운영 빌드를 구성한다. GitHub Actions CI/CD 파이프라인을 작성하여 push 시 자동 빌드·테스트·배포를 수행한다. 최종적으로 전체 기능이 설계서 요구사항을 100% 충족하는지 검증한다.

### 1.2 핵심 E2E 시나리오

| # | 시나리오 | 역할 |
|---|---------|------|
| 1 | 주간업무 생성 → 업무항목 추가 → 자동저장 → 제출 | MEMBER |
| 2 | 전주 할일 불러오기 → 선택적 반영 → 편집 → 제출 | MEMBER |
| 3 | 파트장 자동 취합 → 편집 → 취합보고 제출 | PART_LEADER |
| 4 | 팀장 전체 조회 → 파트 필터링 → Excel 내보내기 | LEADER |
| 5 | 역할별 접근 제어 (MEMBER가 팀 관리 접근 시 차단) | ALL |

---

## Step 2 — 체크리스트

### 2.1 통합 테스트 (Backend E2E)

- [ ] 전체 API 시나리오 테스트 (Supertest)
  - 로그인 → 토큰 발급 → API 호출 → 응답 검증
- [ ] 역할별 접근 제어 통합 테스트
  - MEMBER: 본인 업무 CRUD ✅, 팀 관리 ❌
  - PART_LEADER: 파트 조회 ✅, 팀 전체 ❌
  - LEADER: 전체 ✅
- [ ] carry-forward 전체 흐름 테스트
- [ ] auto-merge 전체 흐름 테스트
- [ ] Excel 내보내기 파일 검증

### 2.2 E2E 테스트 (Playwright)

- [ ] Playwright 설정 (`packages/frontend/playwright.config.ts`)
- [ ] 테스트용 seed 데이터 준비 스크립트
- [ ] **시나리오 1**: 주간업무 작성 흐름
  - 로그인 → /my-weekly → 주간업무 생성 → 프로젝트 선택 → 한일/할일 입력 → 자동저장 확인 → 제출
- [ ] **시나리오 2**: 전주 불러오기
  - 전주 업무 작성·제출 → 이번주 생성 → 불러오기 모달 → 항목 선택 → 반영 확인
- [ ] **시나리오 3**: 파트 취합
  - 파트장 로그인 → /part-summary → 자동 취합 → 내용 확인 → 편집 → 제출
- [ ] **시나리오 4**: 팀장 조회 + Excel
  - 팀장 로그인 → /team-status → 파트 필터 → Excel 다운로드 → 파일 확인
- [ ] **시나리오 5**: 접근 제어
  - MEMBER 로그인 → /team-mgmt 접근 → 리다이렉트 확인
  - MEMBER 로그인 → /part-summary 접근 → 리다이렉트 확인

### 2.3 성능·품질 점검

- [ ] 전체 빌드 오류 0건 (`bun run build`)
- [ ] 전체 린트 오류 0건 (`bun run lint`)
- [ ] Frontend 빌드 산출물 크기 확인 (적정 범위 내)
- [ ] API 응답 시간 확인 (주요 엔드포인트 < 200ms)
- [ ] CSS 변수 사용 확인 (HEX 하드코딩 없음)

### 2.4 Docker 운영 빌드

- [ ] `docker-compose.yml` 운영 설정 (포트 최소 노출)
- [ ] Backend Dockerfile — production 스테이지 빌드 확인
- [ ] Frontend Dockerfile — production 빌드 + Nginx 서빙
- [ ] `docker/nginx.conf` — 리버스 프록시 동작 확인
- [ ] `docker compose build` 성공
- [ ] `docker compose up -d` → 전체 시스템 기동 확인

### 2.5 CI/CD 파이프라인

- [ ] `.github/workflows/ci.yml` — PR/push 시 자동 실행
  - bun install → lint → test → build
- [ ] `.github/workflows/deploy.yml` — main 브랜치 push 시 배포
  - test → docker build → docker save → 서버 배포
- [ ] PR 체크 통과 조건 설정

### 2.6 요구사항 검증 매트릭스

| 요구사항 ID | 내용 | 구현 확인 |
|------------|------|----------|
| TM-001~002 | 팀 관리 | - [ ] |
| PT-001~003 | 파트 관리 | - [ ] |
| MB-001~004 | 팀원 관리 | - [ ] |
| PJ-001~006 | 프로젝트 관리 | - [ ] |
| WK-001~012 | 개인 주간업무 | - [ ] |
| PL-001~006 | 파트장 업무 관리 | - [ ] |
| TL-001~007 | 팀장 업무 관리 | - [ ] |
| UI-001~017 | 그리드 UI | - [ ] |

### 2.7 문서 정리

- [ ] README.md 작성 (프로젝트 소개, 실행 방법, 기술 스택)
- [ ] API 문서 확인 (`/api/docs` Swagger UI 접근)
- [ ] 환경변수 목록 정리 (`.env.example` 최신화)

---

## Step 3 — 완료 검증

```bash
# 1. Docker 인프라 기동
docker compose up -d postgres redis

# 2. DB 마이그레이션 + 시드
cd packages/backend && bunx prisma migrate deploy && bunx prisma db seed

# 3. 전체 빌드
cd ../.. && bun run build

# 4. 전체 린트
bun run lint

# 5. Backend 단위 테스트
cd packages/backend && bun run test

# 6. Backend E2E 테스트
cd packages/backend && bun run test:e2e

# 7. Frontend 단위 테스트
cd ../frontend && bun run test

# 8. Playwright E2E 테스트
cd ../frontend && bunx playwright test

# 9. Docker 운영 빌드
cd ../.. && docker compose build

# 10. Docker 전체 기동 확인
docker compose up -d
sleep 5
curl http://localhost/api/v1/auth/me     # Nginx → Backend 프록시 확인
curl http://localhost                      # Nginx → Frontend 정적 파일 확인
docker compose down

# 11. 수동 확인 필요 항목:
# - 전체 시나리오 브라우저 수동 테스트
# - 구조화 서식 렌더링 육안 확인
# - 그리드 셀 편집 인터랙션 확인
# - 색상 스타일 가이드 준수 확인
# - Excel 다운로드 파일 내용 확인
```
