# WORK-07: Tailwind v3 + shadcn/ui 마이그레이션 및 전체 UI 재개발

## 목적
Tailwind CSS v4를 v3.4로 다운그레이드하고 shadcn/ui를 도입하여,
docs/weekly-report-ui-mockup.html 시안과 docs/STYLE_GUIDE_WEB.md 기준으로
로그인 화면을 포함한 프론트엔드 전체 UI를 재개발한다.

## 선행 WORK
WORK-01 ~ WORK-06

## Task Dependency Graph

```
TASK-00 (Tailwind v3 마이그레이션)
   └→ TASK-01 (shadcn/ui 설치 + UI 컴포넌트 교체)
       └→ TASK-02 (CSS 색상 시스템 통합 + 로그인 화면)
           └→ TASK-03 (Layout: AppLayout + Sidebar + Header)
               ├→ TASK-04 (Dashboard)
               ├→ TASK-05 (MyWeeklyReport + Grid)
               └→ TASK-06 (PartStatus + ProjectMgmt + 나머지 페이지)
                    └→ TASK-07 (취합보고서 조회 + 최종 검증)
```

---

## TASK 목록

### TASK-00: Tailwind CSS v4 → v3.4 마이그레이션 기반 설정
- **파일**: packages/frontend/package.json, vite.config.ts, tailwind.config.ts(신규), postcss.config.js(신규), src/styles/globals.css, src/lib/utils.ts(신규)
- **선행 TASK**: 없음
- **작업 내용**:
  1. package.json 변경:
     - 제거: `tailwindcss` ^4.0.0, `@tailwindcss/vite` ^4.0.0
     - 추가: `tailwindcss` ^3.4.0, `autoprefixer` ^10.4.0, `postcss` ^8.4.0, `clsx` ^2.0.0, `tailwind-merge` ^2.0.0, `class-variance-authority` ^0.7.0
  2. vite.config.ts:
     - `import tailwindcss from '@tailwindcss/vite'` 제거
     - `plugins` 배열에서 `tailwindcss()` 제거
     - `server.host: '127.0.0.1'` 추가 (Windows IPv6 문제 방지)
  3. tailwind.config.ts 신규 생성:
     - `content: ['./index.html', './src/**/*.{ts,tsx}']`
     - `darkMode: 'class'`
     - `theme.extend.colors`: 기존 CSS 변수 참조 + shadcn 호환 색상
     - `theme.extend.keyframes`: pulse, toastIn, modalIn
     - `theme.extend.animation`: pulse, toastIn, modalIn
  4. postcss.config.js 신규 생성:
     - `plugins: { tailwindcss: {}, autoprefixer: {} }`
  5. globals.css 변경:
     - `@import "tailwindcss"` 제거
     - `@tailwind base; @tailwind components; @tailwind utilities;` 추가
     - `:root` CSS 변수 블록 유지
  6. src/lib/utils.ts 신규:
     - `import { clsx, type ClassValue } from 'clsx'`
     - `import { twMerge } from 'tailwind-merge'`
     - `export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }`
  7. npm install 실행 후 빌드 확인
- **완료 기준**:
  - [ ] npm install 성공
  - [ ] tsc --noEmit 오류 0건
  - [ ] vite build 성공
  - [ ] server.host=127.0.0.1 설정 확인
- **Verify**:
  ```
  cd packages/frontend && npm install
  ./node_modules/.bin/tsc.exe --noEmit
  ./node_modules/.bin/vite.exe build
  ```

---

### TASK-01: shadcn/ui 컴포넌트 설치 + 기존 UI 컴포넌트 교체
- **파일**: packages/frontend/components.json(신규), src/components/ui/(전체)
- **선행 TASK**: TASK-00
- **작업 내용**:
  1. shadcn/ui 초기화:
     `cd packages/frontend && npx shadcn@latest init`
     - style: default, baseColor: slate, CSS variables: yes
     - components: @/components, utils: @/lib/utils
  2. shadcn 컴포넌트 설치:
     `npx shadcn@latest add button badge card dialog table input select label separator dropdown-menu tooltip sonner`
  3. 기존 컴포넌트 재작성 (shadcn 기반, 기존 props 유지):
     - **Button.tsx**: shadcn button 확장, variant에 primary/outline/danger/ghost 추가, size에 default/sm 매핑
     - **Badge.tsx**: shadcn badge 확장, variant에 ok/warn/danger/blue/purple/gray 추가, dot prop 유지
     - **Modal.tsx**: shadcn Dialog 기반, isOpen/onClose/title/children/footer props 유지
     - **Toast.tsx**: shadcn Sonner 기반, App.tsx에 `<Toaster />` 추가
     - **SummaryCard.tsx**: shadcn Card 기반, icon/label/value/sub props 유지
  4. 테스트 업데이트: Button.test.tsx, Badge.test.tsx, Modal.test.tsx
- **완료 기준**:
  - [ ] components.json 생성됨
  - [ ] shadcn 컴포넌트 파일 설치됨
  - [ ] 기존 props 시그니처 유지
  - [ ] vitest run 통과
  - [ ] vite build 성공
- **Verify**:
  ```
  ./node_modules/.bin/vitest.exe run
  ./node_modules/.bin/vite.exe build
  ```

---

### TASK-02: CSS 색상 시스템 통합 + 로그인 화면 재개발
- **파일**: src/styles/globals.css, tailwind.config.ts, src/pages/Login.tsx
- **선행 TASK**: TASK-01
- **작업 내용**:
  1. globals.css 색상 시스템 통합:
     - `@layer base { :root { } }` 안에 shadcn 필수 변수 추가:
       --background, --foreground, --card, --card-foreground,
       --popover, --popover-foreground, --muted, --muted-foreground,
       --destructive, --destructive-foreground, --border, --input, --ring, --radius
     - 기존 프로젝트 변수(--primary: #6B5CE7 등) 그대로 유지
  2. tailwind.config.ts 색상 매핑 업데이트:
     - shadcn 변수와 기존 변수 모두 참조 가능하도록 설정
  3. Login.tsx 2컬럼 재디자인:
     - 최상위: `flex h-screen`
     - 좌측 50%: bg-primary 배경, 📋 로고, "주간업무보고" 제목, "선행연구개발팀 업무 현황을 한눈에" 서브, 기능 bullet 3개
     - 우측 50%: 흰 배경 중앙 카드, shadcn Input/Button/Label 사용, useAuthStore 로그인 로직 유지
     - 에러 표시: bg-destructive/10 영역
- **완료 기준**:
  - [ ] shadcn 색상 변수 + 기존 프로젝트 변수 공존
  - [ ] 로그인 2컬럼 렌더링
  - [ ] 로그인 성공 시 Dashboard 이동
  - [ ] vite build 성공
- **Verify**:
  ```
  ./node_modules/.bin/vite.exe build
  수동: 브라우저에서 /login 접속, 좌측 브랜드 패널 확인
  ```

---

### TASK-03: Layout 재개발 (AppLayout + Sidebar + Header)
- **파일**: src/components/layout/(전체), src/App.tsx
- **선행 TASK**: TASK-02
- **작업 내용**:
  1. `npm install lucide-react` (아이콘 라이브러리)
  2. **Sidebar.tsx** 재작성 (시안 기준):
     - 로고: 📋 + "주간업무보고" (13px bold white)
     - 메뉴 그룹 4개: 업무관리 / 파트 관리 / 팀 관리 / 설정
     - 메뉴 라벨 시안 일치:
       - 업무관리: 대시보드(/), 내 주간업무(/my-weekly), 업무 이력(/my-history)
       - 파트 관리: 파트 업무 현황(/part-status), 파트 취합보고서(/part-summary)
       - 팀 관리: 팀 업무 현황(/team-status), 취합보고서 조회(/team-summary)
       - 설정: 팀·파트 관리(/team-mgmt), 프로젝트 관리(/project-mgmt)
     - lucide-react 아이콘 (LayoutDashboard, FileEdit, ClipboardList, Users, FileText, Building2, FileSearch, Settings, FolderOpen)
     - 활성: bg-sidebar-active + text-white + border-l-3px primary
     - hover: bg-white/5 + text-[#c0c8e0]
     - 하단: 유저 프로필 + 로그아웃 버튼
     - 역할 기반 메뉴 필터링
  3. **Header.tsx** 재작성:
     - 좌측: 페이지 제목(15px bold) + 서브타이틀(12px text-sub)
     - 서브타이틀 맵: 각 라우트별 설명
     - 우측: pulse dot + "YYYY.MM.DD (요일)" 형식
     - 로그아웃 버튼 제거 (사이드바로 이동)
  4. **AppLayout.tsx**: flex h-screen, Sidebar w-[210px] flex-shrink-0, main flex-1 flex-col
  5. **App.tsx**: /team-summary 라우트 추가 (RoleGuard LEADER/PART_LEADER)
- **완료 기준**:
  - [ ] Sidebar 4개 그룹, 시안 라벨 일치
  - [ ] /team-summary 라우팅
  - [ ] Header 서브타이틀 + 요일 표시
  - [ ] 로그아웃 사이드바 하단
  - [ ] vite build 성공
- **Verify**:
  ```
  ./node_modules/.bin/vite.exe build
  수동: Sidebar 활성 하이라이트, hover, pulse dot
  ```

---

### TASK-04: Dashboard 페이지 재개발
- **파일**: src/pages/Dashboard.tsx, Dashboard.test.tsx
- **선행 TASK**: TASK-03
- **작업 내용**:
  1. 인사말/퀵링크/최근4주 패널 제거
  2. 요약 카드 4개: 전체 팀원(primary-bg) / 제출 완료(ok-bg) / 임시저장(warn-bg, 이름 표시) / 미작성(danger-bg)
  3. 팀원 작성 현황 테이블 6컬럼: 파트(Badge) | 성명 | 역할 | 업무항목 수 | 작성 상태(Badge) | 최종 수정
  4. 미작성 행 배경: var(--danger-bg)
  5. 파트 취합 현황 테이블: 파트 | 파트장 | 취합 상태 | 팀원 제출률(progress bar)
  6. Excel 내보내기 버튼 (LEADER만)
  7. Dashboard.test.tsx 업데이트
- **완료 기준**:
  - [ ] 6컬럼 테이블, 파트장 컬럼, Excel 버튼
  - [ ] 인사말/퀵링크/최근4주 없음
  - [ ] vitest 통과, vite build 성공
- **Verify**:
  ```
  ./node_modules/.bin/vitest.exe run
  ./node_modules/.bin/vite.exe build
  ```

---

### TASK-05: MyWeeklyReport + Grid 컴포넌트 재개발
- **파일**: src/pages/MyWeeklyReport.tsx, src/components/grid/(전체)
- **선행 TASK**: TASK-03
- **작업 내용**:
  1. MyWeeklyReport.tsx: 툴바에 "+ 행 추가" 버튼 추가, 전주 할일 불러오기(📋), 제출 확인 Dialog
  2. EditableGrid.tsx:
     - 컬럼 헤더: 프로젝트명 | 프로젝트코드 | 진행업무 (한일) | 예정업무 (할일) | 비고 및 이슈 | 액션
     - 프로젝트 셀: pill 스타일 + ▼ 인디케이터
     - 케밥 메뉴(⋮): shadcn DropdownMenu (확대 편집 / 행 삭제)
     - tbody 하단 dashed 행: "+ 프로젝트 선택"
     - zebra: idx%2===0 → row-alt
  3. GridCell.tsx: 편집 시 outline-2 primary, hover 시 미세 배경
  4. ExpandedEditor.tsx: "📝 셀 확대 편집" 헤더 + 열 라벨 + "✕ 닫기" ghost 버튼, inherit 폰트, code 힌트
  5. FormattedText.tsx: 빈 셀 em-dash(—) placeholder
  6. ProjectDropdown.tsx: shadcn Select 기반, COMMON/EXECUTION 그룹
- **완료 기준**:
  - [ ] 컬럼 헤더 시안 일치
  - [ ] 케밥 메뉴 동작
  - [ ] dashed 행, ExpandedEditor 개선
  - [ ] vitest 통과, vite build 성공
- **Verify**:
  ```
  ./node_modules/.bin/vitest.exe run
  ./node_modules/.bin/vite.exe build
  수동: 셀 편집, 확대 편집, 케밥 메뉴
  ```

---

### TASK-06: PartStatus + ProjectMgmt + 나머지 페이지 스타일 정리
- **파일**: src/pages/(PartStatus, ProjectMgmt, PartSummary, TeamStatus, TeamMgmt, MyHistory).tsx
- **선행 TASK**: TASK-03
- **작업 내용**:
  1. **PartStatus.tsx**: 필터 바 추가 (팀원/프로젝트/상태 Select 3개 + 초기화), 클라이언트 필터링
  2. **ProjectMgmt.tsx**: 요약 카드 grid-cols-3 통합, "참여인원" 컬럼 추가, 삭제 버튼 ghost-danger
  3. **PartSummary.tsx**: shadcn Dialog/Button 적용, 컬럼 헤더 통일
  4. **TeamStatus.tsx**: 테이블 스타일 통일, 컬럼 헤더 통일
  5. **TeamMgmt.tsx**: shadcn Table/Dialog/Input/Select/Label 적용
  6. **MyHistory.tsx**: shadcn Table, 상태 Badge
  7. 테스트 업데이트: PartStatus.test.tsx, ProjectMgmt.test.tsx, TeamMgmt.test.tsx
- **완료 기준**:
  - [ ] PartStatus 필터 3개 동작
  - [ ] ProjectMgmt 참여인원 컬럼
  - [ ] HEX 하드코딩 0건
  - [ ] vitest 통과, vite build 성공
- **Verify**:
  ```
  ./node_modules/.bin/vitest.exe run
  ./node_modules/.bin/vite.exe build
  ```

---

### TASK-07: 취합보고서 조회 신규 페이지 + 최종 통합 검증
- **파일**: src/pages/TeamSummary.tsx(신규)
- **선행 TASK**: TASK-06
- **작업 내용**:
  1. TeamSummary.tsx 신규 구현:
     - 주차 Select + 파트 필터 탭 (LEADER: DX/AX/전체, PART_LEADER: 본인 파트만)
     - 요약 카드: 제출 완료 / 작성 중 / 미작성
     - 취합보고서 목록 테이블: 파트 | 파트장 | 제출 상태 | 업무항목 수 | 제출 일시 | 조회 버튼
     - 조회 클릭 시 하단 상세 패널: 프로젝트 | 코드 | 진행업무 (한일) | 예정업무 (할일) | 비고 및 이슈
     - FormattedText 사용, Excel 다운로드 버튼
  2. 최종 통합 검증:
     - tsc --noEmit 0건
     - vite build 성공
     - vitest run 전체 통과
     - 모든 라우트 확인: /, /my-weekly, /my-history, /part-status, /part-summary, /team-status, /team-summary, /team-mgmt, /project-mgmt, /login
- **완료 기준**:
  - [ ] TeamSummary 페이지 렌더링
  - [ ] /team-summary 라우팅 정상
  - [ ] tsc --noEmit 0건
  - [ ] vite build 성공
  - [ ] vitest 전체 통과
- **Verify**:
  ```
  ./node_modules/.bin/tsc.exe --noEmit
  ./node_modules/.bin/vite.exe build
  ./node_modules/.bin/vitest.exe run
  ```

---

## 공통 주의사항

### 패키지 매니저
- 모든 패키지 설치: **npm** 사용 (bun 사용 금지 — 경로 문제)
- shadcn CLI: **npx** 사용

### 빌드/테스트 명령어
```bash
cd packages/frontend
npm install                           # 패키지 설치
./node_modules/.bin/tsc.exe --noEmit  # 타입 체크
./node_modules/.bin/vite.exe build    # 프로덕션 빌드
./node_modules/.bin/vitest.exe run    # 테스트
```

### 서버 실행
- vite.config.ts: `server.host: '127.0.0.1'` 필수 (Windows IPv6 EACCES 방지)

### 스타일 규칙
- 색상: CSS 변수 `var(--primary)` 사용 — **HEX 하드코딩 절대 금지**
- shadcn/ui 테마 변수와 기존 프로젝트 변수 공존
- Tailwind 클래스에서 CSS 변수 참조: `bg-[var(--primary)]`, `text-[var(--text-sub)]`

### 컴포넌트 호환성
- 기존 컴포넌트 재작성 시 **기존 props 시그니처 유지** (페이지에서 호출 방식 변경 최소화)

## 파일 영향 범위 요약

| TASK | 신규 생성 | 수정 |
|------|-----------|------|
| 00 | tailwind.config.ts, postcss.config.js, lib/utils.ts | package.json, vite.config.ts, globals.css |
| 01 | components.json, shadcn 컴포넌트 다수 | Button.tsx, Badge.tsx, Modal.tsx, Toast.tsx, SummaryCard.tsx, App.tsx |
| 02 | — | globals.css, tailwind.config.ts, Login.tsx |
| 03 | — | Sidebar.tsx, Header.tsx, AppLayout.tsx, App.tsx |
| 04 | — | Dashboard.tsx, Dashboard.test.tsx |
| 05 | — | MyWeeklyReport.tsx, EditableGrid.tsx, GridCell.tsx, ExpandedEditor.tsx, FormattedText.tsx, ProjectDropdown.tsx |
| 06 | — | PartStatus.tsx, ProjectMgmt.tsx, PartSummary.tsx, TeamStatus.tsx, TeamMgmt.tsx, MyHistory.tsx |
| 07 | TeamSummary.tsx | — |
