# WORK-01: Foundation (globals.css + AppLayout)

## 목적
CSS 변수 누락 보완, 애니메이션/스크롤바/폰트 추가, AppLayout을 flex 레이아웃으로 전환하여 콘텐츠 영역 깨짐 해결

## 선행 WORK
없음

## TASK 목록

### TASK-00: globals.css — CSS 변수·애니메이션·스크롤바·폰트
- **파일**: `packages/frontend/src/styles/globals.css`, `packages/frontend/index.html`
- **선행 TASK**: 없음
- **작업 내용**:
  1. 누락 CSS 변수 추가: `--sidebar-active: #252D48`, `--sidebar-divider`, `--sidebar-text`, `--sidebar-menu-title`, `--badge-blue-bg`, `--badge-blue-text`, `--content-pad: 24px`
  2. `@keyframes` 추가: `pulse`, `toastIn`, `modalIn`
  3. 커스텀 스크롤바 스타일링 (`::-webkit-scrollbar` 6px, thumb `var(--gray-border)`)
  4. `index.html`에 Noto Sans KR 폰트 link 확인/추가
  5. `body` 기본 font-family에 'Noto Sans KR' 포함 확인
- **완료 기준**: CSS 변수 정의됨, 빌드 오류 없음

### TASK-01: AppLayout.tsx — flex 레이아웃 전환
- **파일**: `packages/frontend/src/components/layout/AppLayout.tsx`
- **선행 TASK**: TASK-00
- **작업 내용**:
  1. 기존 fragile padding 계산(`paddingLeft`, `paddingTop` 등) 제거
  2. 최상위: `flex h-screen overflow-hidden`
  3. Sidebar: 왼쪽 고정 210px
  4. 우측 영역: `flex flex-col flex-1 overflow-hidden`
  5. Header: static (flex 안에서 자연 배치)
  6. Content: `flex-1 overflow-y-auto`, padding `var(--content-pad)`, bg `var(--gray-light)`
- **완료 기준**: 콘텐츠 영역 정상 크기, 스크롤 동작, 빌드 오류 없음
