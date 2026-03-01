# TASK-06: Front-end — 초기화 + 공통 컴포넌트 + 레이아웃

> **Phase:** 6
> **선행 TASK:** TASK-00
> **목표:** 프론트엔드 기본 구조 완성 — 라우팅, 레이아웃, 공통 UI 컴포넌트, API 클라이언트, 인증 상태 관리

---

## Step 1 — 계획서

### 1.1 작업 범위

React 18 + Vite 6 프로젝트의 핵심 뼈대를 구성한다. 사이드바·헤더 레이아웃, React Router v7 라우팅, Axios JWT 인터셉터, Zustand 인증 스토어, 공통 UI 컴포넌트(Button, Badge, Modal, Toast, SummaryCard)를 구현한다. STYLE_GUIDE_WEB.md의 디자인 시스템을 CSS 변수와 Tailwind 커스텀으로 반영한다.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| 레이아웃 | `Sidebar.tsx`, `Header.tsx`, `AppLayout.tsx` |
| 라우팅 | `App.tsx` — 전체 라우트 정의 |
| API | `api/client.ts` — Axios 인스턴스 + JWT 인터셉터 |
| Store | `stores/authStore.ts`, `stores/uiStore.ts` |
| UI 컴포넌트 | `Button`, `Badge`, `Modal`, `Toast`, `SummaryCard` |
| 페이지 | 각 페이지 빈 껍데기 (라우트 연결용) |

---

## Step 2 — 체크리스트

### 2.1 스타일 시스템

- [ ] `src/styles/globals.css` — CSS 변수 전체 선언 (CLAUDE.md 섹션 11 + STYLE_GUIDE 섹션 14)
- [ ] Tailwind 커스텀 컬러: CSS 변수 참조 (`primary`, `ok`, `warn`, `danger` 등)
- [ ] Noto Sans KR 폰트 로드 (`index.html`)
- [ ] 기본 리셋 스타일 적용

### 2.2 API 클라이언트

- [ ] `api/client.ts` — Axios 인스턴스 생성 (baseURL: `/api/v1`)
- [ ] Request 인터셉터: Authorization 헤더에 Access Token 자동 삽입
- [ ] Response 인터셉터: 401 응답 시 Refresh Token으로 자동 갱신 후 재요청
- [ ] Refresh 실패 시 로그아웃 처리 (authStore 초기화 + 로그인 페이지 이동)
- [ ] `api/auth.api.ts` — login, refresh, getMe

### 2.3 상태 관리

- [ ] `stores/authStore.ts` (Zustand)
  - accessToken, refreshToken, user 상태
  - login, logout, setTokens 액션
  - localStorage 연동 (토큰 persist)
- [ ] `stores/uiStore.ts` (Zustand)
  - sidebarCollapsed 상태
  - toasts 배열 (토스트 알림 관리)
  - addToast, removeToast 액션

### 2.4 레이아웃 컴포넌트

- [ ] `components/layout/Sidebar.tsx`
  - 210px 고정 너비, 어두운 배경 (#181D2E)
  - 로고 영역, 메뉴 그룹 (DASHBOARD, 내 업무, 파트 관리, 팀 관리, 시스템 관리)
  - 활성 메뉴 하이라이트 (좌측 보더 + 배경)
  - 역할별 메뉴 표시/숨김 (RBAC)
- [ ] `components/layout/Header.tsx`
  - 48px 높이, 흰색 배경
  - 현재 페이지 제목, 사용자 정보 (이름, 역할, 파트), 로그아웃 버튼
- [ ] `components/layout/AppLayout.tsx`
  - Sidebar + Header + Content 영역 조합
  - Content 영역: 회색 배경 (#F0F2F5), padding 18px 20px

### 2.5 공통 UI 컴포넌트

- [ ] `components/ui/Button.tsx`
  - variant: primary, outline, danger
  - size: default (30px), small (26px)
  - 아이콘 + 텍스트 조합 지원
- [ ] `components/ui/Badge.tsx`
  - variant: ok, warn, danger, blue, purple, gray
  - dot 표시 옵션
- [ ] `components/ui/Modal.tsx`
  - 오버레이 + 애니메이션
  - 일반 모달 (480px) / 확인 다이얼로그 (360px)
  - 헤더 (제목 + 닫기), 바디, 푸터 영역
- [ ] `components/ui/Toast.tsx`
  - 우상단 고정 (top: 60px, right: 20px)
  - 종류: success, warning, info, danger
  - 좌측 색상 줄 + 아이콘 + 메시지
  - 자동 소멸 (3초)
- [ ] `components/ui/SummaryCard.tsx`
  - 4-col 그리드 요약 카드
  - 아이콘 + 라벨 + 값 + 보조 텍스트

### 2.6 라우팅

- [ ] `App.tsx` — React Router v7 라우트 정의
  - `/login` — 로그인 페이지
  - `/` — 대시보드 (인증 필요)
  - `/my-weekly` — 내 주간업무 작성
  - `/my-history` — 내 업무 이력
  - `/part-status` — 파트 업무 현황 (PART_LEADER, LEADER)
  - `/part-summary` — 파트 취합보고 (PART_LEADER)
  - `/team-status` — 팀 업무 현황 (LEADER)
  - `/team-mgmt` — 팀 관리 (LEADER)
  - `/project-mgmt` — 프로젝트 관리 (LEADER)
- [ ] 인증 가드: 미로그인 시 `/login`으로 리다이렉트
- [ ] 역할 가드: 권한 없는 페이지 접근 시 대시보드로 리다이렉트
- [ ] 각 페이지 빈 껍데기 컴포넌트 생성 (실제 구현은 후속 TASK)

### 2.7 로그인 페이지

- [ ] `pages/Login.tsx` — 이메일 + 비밀번호 로그인 폼
- [ ] 로그인 성공 시 토큰 저장 + 대시보드 이동
- [ ] 로그인 실패 시 에러 메시지 표시
- [ ] 스타일: 중앙 정렬, Primary 색상 버튼

### 2.8 테스트

- [ ] 컴포넌트 테스트: Button 렌더링 + 클릭 이벤트
- [ ] 컴포넌트 테스트: Badge variant별 렌더링
- [ ] 컴포넌트 테스트: Modal 열기/닫기
- [ ] 빌드 성공 확인

---

## Step 3 — 완료 검증

```bash
# 1. Frontend 빌드
cd packages/frontend && bun run build

# 2. 린트
cd packages/frontend && bun run lint

# 3. 테스트
cd packages/frontend && bun run test

# 4. 전체 빌드 (모노레포)
cd ../.. && bun run build

# 5. 전체 린트
bun run lint

# 6. 개발 서버 기동 확인
cd packages/frontend && bun run dev &
sleep 3
curl -s http://localhost:5173 | head -5    # HTML 응답 확인
kill %1
```
