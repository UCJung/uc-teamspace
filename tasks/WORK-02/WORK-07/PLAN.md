# WORK-07: Tailwind v3 + shadcn/ui 마이그레이션 및 전체 UI 재개발

## 목적
Tailwind CSS v4를 v3.4로 다운그레이드하고 shadcn/ui를 도입한 뒤,
docs/weekly-report-ui-mockup.html 시안과 docs/STYLE_GUIDE_WEB.md 기준으로
로그인 화면을 포함한 프론트엔드 전체 UI를 재개발한다.

## 선행 WORK
WORK-01 ~ WORK-06

## TASK 목록

### TASK-00: Tailwind CSS v4 -> v3.4 마이그레이션 기반 설정
- **파일**: packages/frontend/package.json, vite.config.ts, tailwind.config.ts, postcss.config.js, src/styles/globals.css, src/lib/utils.ts
- **선행 TASK**: 없음
- **작업 내용**:
  1. package.json: tailwindcss ^3.4.0 / autoprefixer ^10.4.0 / postcss ^8.4.0 / clsx ^2.0.0 / tailwind-merge ^2.0.0 추가, tailwindcss ^4.0.0 / @tailwindcss/vite 제거
  2. vite.config.ts: @tailwindcss/vite 플러그인 제거, server.host: 127.0.0.1 추가
  3. tailwind.config.ts 신규: content [./index.html, ./src/**/*.{ts,tsx}], darkMode: class, theme.extend.colors/borderRadius/keyframes 설정
  4. postcss.config.js 신규: plugins { tailwindcss: {}, autoprefixer: {} }
  5. globals.css: @import tailwindcss 제거, @tailwind base; @tailwind components; @tailwind utilities; 추가, :root CSS 변수 유지
  6. src/lib/utils.ts 신규: clsx + tailwind-merge cn() 함수
  7. npm install 후 ./node_modules/.bin/tsc.exe --noEmit 확인, ./node_modules/.bin/vite.exe build 확인
- **완료 기준**: npm install 성공, tsc --noEmit 0건, vite build 성공, server.host=127.0.0.1 확인

### TASK-01: shadcn/ui 컴포넌트 설치 + 기존 UI 컴포넌트 교체
- **파일**: packages/frontend/src/components/ui/ (전체), packages/frontend/components.json
- **선행 TASK**: TASK-00
- **작업 내용**:
  1. npx shadcn@latest init: style=default, baseColor=slate, CSS variables=yes, tailwind.config.ts, @/components, @/lib/utils
  2. npx shadcn@latest add button badge card dialog table input select label separator dropdown-menu tooltip
  3. npx shadcn@latest add sonner
  4. Button.tsx 재작성: shadcn button 기반, variant primary/ghost/outline/danger, 기존 onClick/disabled/className/children 유지
  5. Badge.tsx 재작성: shadcn badge 기반, variant success/warn/danger/info/draft/submitted, label/variant 유지
  6. Modal.tsx 재작성: shadcn Dialog 기반, isOpen/onClose/title/children/footer 유지
  7. Toast.tsx 재작성: shadcn Sonner 기반, useToast 훉 success/error/warn 유지, App.tsx에 Toaster 추가
  8. SummaryCard.tsx 재작성: shadcn Card 기반, title/value/sub/icon/color 유지
  9. Button.test.tsx, Badge.test.tsx, Modal.test.tsx 업데이트
  10. ./node_modules/.bin/vitest.exe run 확인
- **완료 기준**: components.json 생성, shadcn 컴포넌트 설치, 기존 props 유지, vitest run 통과, vite build 성공

### TASK-02: CSS 색상 시스템 통합 + 로그인 화면 재개발
- **파일**: packages/frontend/src/styles/globals.css, packages/frontend/tailwind.config.ts, packages/frontend/src/pages/Login.tsx
- **선행 TASK**: TASK-01
- **작업 내용**:
  1. globals.css: @layer base { :root {} } 안에 shadcn/ui 필수 변수 추가
     --background, --foreground, --card, --primary (HSL 250 78% 63%), --muted, --destructive, --border, --input, --ring, --radius
     기존 프로젝트 변수 유지 (--primary: #6B5CE7 등), .dark 클래스 블록 추가
  2. tailwind.config.ts: theme.extend.colors shadcn 변수 참조 추가, theme.extend.borderRadius 추가
  3. Login.tsx 재작성: 2컴럼 flex h-screen 레이아웃
     좌측 50%: bg-[var(--primary)] (로고 + 주간업무보고 시스템 + 선행연구개발팀 + 기능 bullet 3개)
     우측 50%: 흰 배경 로그인 폼 (shadcn Input/Button/Label, useAuthStore/axios 로그인 로직 유지)
     flex-col md:flex-row 반응형
- **완료 기준**: shadcn primary 색상 #6B5CE7 렌더링, 2컴럼 로그인, Dashboard 이동 유지, vite build 성공
  수동 확인: 좌측 브랜드 패널 색상, 폼 레이아웃 렌더링

### TASK-03: Layout 재개발 (AppLayout + Sidebar + Header)
- **파일**: packages/frontend/src/components/layout/ (전체), src/App.tsx, src/pages/TeamSummary.tsx, package.json
- **선행 TASK**: TASK-02
- **작업 내용**:
  1. npm install lucide-react
  2. Sidebar.tsx 재작성 (시안 기준 메뉴 구조):
     [업무 관리]: 내 주간업무(/my-report), 내 업무 이력(/my-history)
     [파트 관리]: 파트 현황(/part-status), 파트 취합보고서(/part-summary), 취합보고서 조회(/team-summary)
     [팀 관리]: 팀 현황(/team-status)
     [설정]: 팀·파트 관리(/team-mgmt), 프로젝트 관리(/project-mgmt)
     lucide-react 아이콘, 로고 영역, 하단 LogOut 버튼
     활성: bg-[var(--sidebar-active)] + text-white + border-l-[3px] border-[var(--primary)]
     비활성: text-[var(--sidebar-text)] + hover:bg-[var(--sidebar-active)]/50
  3. Header.tsx 재작성: title + subtitle 2줄, 날짜+요일 (2026년 3월 2일 (월) 형식), pulse dot, 자동 저장 중
  4. AppLayout.tsx: flex h-screen, Sidebar w-[var(--sidebar-w)] flex-shrink-0, Content flex-1 overflow-y-auto p-[var(--content-pad)]
  5. App.tsx: /team-summary 라우트 추가 (placeholder TeamSummary)
- **완료 기준**: Sidebar 4개 그룹, /team-summary 라우팅, Header 요일, 로그아웃 하단, vite build 성공
  수동 확인: Sidebar 활성 하이라이트, hover, pulse dot 애니메이션

### TASK-04: Dashboard 페이지 재개발
- **파일**: packages/frontend/src/pages/Dashboard.tsx, Dashboard.test.tsx
- **선행 TASK**: TASK-03
- **작업 내용**:
  1. 페이지 헤더: 주차 Select + Excel 버튼
  2. 요약 카드 4개 (SummaryCard): 전체 팀원 / 제출 완료 / 작성 중 / 미작성
  3. 파트 필터 탭: DX파트 / AX파트 / 전체
  4. 팀원 테이블 (shadcn Table): 이름/파트/역할/파트장 이름/상태 Badge/업무항목 수/최종 수정/보기
  5. 제거: 인사말, 퀘링크, 최근 4주 패널
  6. Dashboard.test.tsx 업데이트: 새 컴럼 + 파트 탭 테스트
- **완료 기준**: 요약 카드 4개, 역할/파트장/업무항목/최종 수정 컴럼, 탭 필터, Excel 버튼, vitest 통과

### TASK-05: MyWeeklyReport + Grid 컴포넌트 재개발
- **파일**: packages/frontend/src/pages/MyWeeklyReport.tsx, packages/frontend/src/components/grid/
- **선행 TASK**: TASK-03
- **작업 내용**:
  1. MyWeeklyReport.tsx: prev/next 주차 툴바, 전주 할일 불러오기, 제출 버튼 (SUBMITTED시 disabled), Dialog 제출 확인
  2. EditableGrid.tsx: 컴럼 헤더 수정 (프로젝트/진행업무/예정업무/비고/액션)
     DropdownMenu 케밥 메뉴 (확대 편집/위로/아래로/삭제), dashed 행 추가, 빈 상태 안내
     짝수/홀수 번갈 배경 (var(--row-alt)/white), 헤더 var(--tbl-header)
  3. GridCell.tsx: 편집 중 테두리 var(--primary) 2px, hover 시 확대 아이콘
  4. ExpandedEditor.tsx: 헤더 컴럼명, 14px, 힌트, shadcn Button ghost/primary
  5. ProjectDropdown.tsx: shadcn Select 기반 재작성, COMMON/EXECUTION 그룹
  6. GridCell.test.tsx 케밥 테스트 추가
- **완료 기준**: 컴럼 헤더 일치, 케밥 메뉴, dashed 행, ExpandedEditor 컴럼명, vitest 통과
  수동 확인: 셀 편집, 확대 편집, 케밥 메뉴 동작

### TASK-06: PartStatus + ProjectMgmt + 나머지 페이지 스타일 정리
- **파일**: packages/frontend/src/pages/ (다수 페이지)
- **선행 TASK**: TASK-03
- **작업 내용**:
  1. PartStatus.tsx: 상단 필터 바 (주차 Select, 팀원/프로젝트/상태 드롭다운), 필터 적용/초기화 버튼, 클라이언트사이드 필터링
  2. ProjectMgmt.tsx: 요약 카드 3개, 참여인원 컴럼 추가, 삭제 destructive, Badge ACTIVE/HOLD/COMPLETED
  3. PartSummary.tsx: shadcn Dialog/Button (자동병합 outline, 제출 primary)
  4. TeamStatus.tsx: 테이블 스타일 통일, 진행 바 추가
  5. TeamMgmt.tsx: shadcn Table/Dialog/Input/Select/Label
  6. MyHistory.tsx: shadcn Table, 상태 Badge
  7. PartStatus.test.tsx, ProjectMgmt.test.tsx, TeamMgmt.test.tsx 업데이트
- **완료 기준**: PartStatus 필터 3개, ProjectMgmt 참여인원, destructive 삭제, vitest 통과

### TASK-07: 취합보고서 조회 신규 페이지 + 최종 통합 검증
- **파일**: packages/frontend/src/pages/TeamSummary.tsx
- **선행 TASK**: TASK-06
- **작업 내용**:
  1. TeamSummary.tsx 신규 구현: 주차 Select, 파트 필터 탭, 팀원별 요약 카드
     파트별 취합보고 업무묽(프로젝트/한일/할일/비고 컬럼) shadcn Table 기반
     엑셀 다운로드 버튼 (shadcn Button primary)
  2. 최종 통합 검증:
     - ./node_modules/.bin/tsc.exe --noEmit 0건
     - ./node_modules/.bin/vite.exe build 성공
     - ./node_modules/.bin/vitest.exe run 전체 통과
     - 모든 페이지 라우팅 확인 (/dashboard, /my-report, /part-status, /part-summary, /team-summary, /team-status, /team-mgmt, /project-mgmt)
- **완료 기준**: TeamSummary 페이지 렌더링, /team-summary 라우팅, 엑셀 버튼, vitest 전체 통과, vite build 성공

---

## 공통 주의사항

### 빌드 / 테스트 명령어
- 빌드: cd packages/frontend && ./node_modules/.bin/vite.exe build
- 타입 체크: cd packages/frontend && ./node_modules/.bin/tsc.exe --noEmit
- 테스트: cd packages/frontend && ./node_modules/.bin/vitest.exe run
- 패키지 설치: cd packages/frontend && npm install
- shadcn 초기화: cd packages/frontend && npx shadcn@latest init
- shadcn 컴포넌트 추가: cd packages/frontend && npx shadcn@latest add {component}

### 패키지 매니저
- 모든 패키지 설치/추가는 **npm** 사용 (bun 사용 금지)
- shadcn CLI는 **npx** 사용

### 서버 실행
- vite.config.ts: server.host 127.0.0.1 설정 필수 (Windows IPv6 문제 방지)
- 빌드/테스트 실행 시 ./node_modules/.bin/vite.exe, ./node_modules/.bin/tsc.exe, ./node_modules/.bin/vitest.exe 사용

### 스타일 규칙
- 색상은 CSS 변수 var(--primary) 사용 — HEX 하드코딩 절대 금지
- shadcn/ui 스타일 변수와 기존 프로젝트 변수 공존 (선언 되어 있음)
- Tailwind 클래스에서 CSS 변수 참조: bg-[var(--primary)], text-[var(--text-sub)]

### 컴포넌트 props 호환성
- 기존 컴포넌트(Button, Badge, Modal, Toast, SummaryCard) 재작성 시 기존 props 시그니처 유지 필수
- 페이지 컴포넌트에서 해당 컴포넌트 호출 방식 변경 무