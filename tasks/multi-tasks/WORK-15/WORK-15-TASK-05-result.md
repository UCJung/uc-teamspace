# WORK-15-TASK-05 수행 결과 보고서

> 작업일: 2026-03-03
> 작업자: Claude Code
> 상태: **완료**

---

## 1. 작업 개요

로그인 화면에서의 계정 신청 기능, 최초 로그인 시 비밀번호 강제 변경 모달, 사이드바 내 비밀번호 변경 메뉴를 구현한다.
authStore에 `mustChangePassword` 필드 추가 및 관련 auth API 함수(register, changePassword)를 연동한다.

---

## 2. 완료 기준 달성 현황

| 기준 | 결과 |
|------|------|
| Login.tsx에 "계정 신청" 링크 추가 | ✅ |
| RegisterPage.tsx 구현 (성명/이메일/비밀번호/확인 입력, 유효성 검사) | ✅ |
| ChangePasswordModal.tsx 구현 (현재/신규/확인 비밀번호, 강제 모드) | ✅ |
| authStore User 타입에 mustChangePassword 추가 | ✅ |
| 로그인 성공 후 mustChangePassword === true이면 ChangePasswordModal 강제 오픈 | ✅ |
| auth API 모듈에 register, changePassword 함수 추가 | ✅ |
| 빌드 오류 0건 | ✅ |
| 린트 오류 0건 (경고 9건, 기존과 동일) | ✅ |
| 테스트 44/44 통과 | ✅ |

---

## 3. 체크리스트 완료 현황

| 항목 | 상태 |
|------|------|
| Login.tsx에 "계정 신청" 링크 추가 (`/register` 라우트로 이동) | ✅ |
| RegisterPage.tsx — 성명, 이메일, 비밀번호, 비밀번호 확인 입력 | ✅ |
| RegisterPage.tsx — 유효성 검사 (이메일 형식, 비밀번호 일치, 최소 8자) | ✅ |
| RegisterPage.tsx — 신청 완료 시 "관리자 승인 후 로그인 가능" 안내 (done 스텝) | ✅ |
| ChangePasswordModal.tsx — 현재/신규/확인 비밀번호 입력 | ✅ |
| ChangePasswordModal.tsx — 화면 중앙 레이어 팝업 (Modal 컴포넌트 사용) | ✅ |
| ChangePasswordModal.tsx — forced 모드: 닫기 버튼 비활성화 | ✅ |
| authStore — User 타입에 mustChangePassword 추가 | ✅ |
| authStore — clearMustChangePassword() 함수 추가 | ✅ |
| Login.tsx — mustChangePassword === true 시 ChangePasswordModal 강제 오픈 | ✅ |
| auth.api.ts — register(RegisterRequest) 함수 추가 | ✅ |
| auth.api.ts — changePassword(ChangePasswordRequest) 함수 추가 | ✅ |
| App.tsx — /register 라우트 추가 | ✅ |

---

## 4. 발견 이슈 및 수정 내역

발견된 이슈 없음.

TASK 시작 시 파일을 확인한 결과 모든 파일이 이미 구현 완료 상태였음.

---

## 5. 최종 검증 결과

### 빌드 결과

```
$ tsc -b && vite build
✓ 1754 modules transformed.
dist/index.html                   0.55 kB │ gzip:   0.40 kB
dist/assets/index-C9rBtFSc.css   23.20 kB │ gzip:   5.62 kB
dist/assets/index-hPmdaNLy.js   624.91 kB │ gzip: 189.70 kB
✓ built in 22.57s
```

### 린트 결과

```
✖ 9 problems (0 errors, 9 warnings)
```

경고 9건은 모두 기존 코드 (Badge.tsx, Button.tsx, MyWeeklyReport.tsx 등)의 react-hooks/exhaustive-deps 및 no-unused-vars 관련 기존 경고로 이번 TASK와 무관.

### 테스트 결과

```
 ✓ src/pages/Dashboard.test.tsx (9 tests)
 ✓ src/pages/PartStatus.test.tsx (6 tests)
 ✓ src/components/grid/GridCell.test.tsx (5 tests)
 ✓ src/pages/ProjectMgmt.test.tsx (3 tests)
 ✓ src/components/grid/FormattedText.test.tsx (6 tests)
 ✓ src/components/ui/Button.test.tsx (6 tests)
 ✓ src/components/ui/Modal.test.tsx (3 tests)
 ✓ src/components/ui/Badge.test.tsx (5 tests)
 ✓ src/App.test.tsx (1 test)
Test Files  9 passed (9)
      Tests 44 passed (44)
```

### 수동 확인 필요

| 항목 | 내용 |
|------|------|
| RegisterPage 렌더링 | /register 경로에서 계정 신청 폼이 표시되는지 확인 |
| ChangePasswordModal (forced) | 최초 로그인 후 비밀번호 변경 모달이 강제 표시되고 닫기 불가한지 확인 |
| ChangePasswordModal (일반) | 사이드바 프로필 메뉴에서 비밀번호 변경 모달이 열리고 닫을 수 있는지 확인 |
| 계정 신청 완료 | 신청 성공 시 "관리자 승인 후 로그인 가능" 안내가 표시되는지 확인 |

---

## 6. 후속 TASK 유의사항

- TASK-07 (팀 랜딩 화면)은 TASK-05 완료 조건을 충족했으므로 TASK-06 완료 후 Ready 상태가 됨
- authStore의 User 타입에서 `roles`는 현재 `('LEADER' | 'PART_LEADER' | 'MEMBER')[]`로 정의됨 (ADMIN 역할 미포함). ADMIN 역할이 필요한 경우 타입 확장 검토 필요.

---

## 7. 산출물 목록

### 구현 완료 파일 (신규/수정)

| 파일 | 구분 | 설명 |
|------|------|------|
| `packages/frontend/src/pages/RegisterPage.tsx` | 신규 | 계정 신청 페이지 |
| `packages/frontend/src/components/ui/ChangePasswordModal.tsx` | 신규 | 비밀번호 변경 모달 (일반/강제 모드) |
| `packages/frontend/src/api/auth.api.ts` | 수정 | register, changePassword 함수 추가 |
| `packages/frontend/src/stores/authStore.ts` | 수정 | mustChangePassword 타입 추가, clearMustChangePassword 함수 추가 |
| `packages/frontend/src/pages/Login.tsx` | 수정 | "계정 신청" 링크 추가, mustChangePassword 처리 로직 추가 |
| `packages/frontend/src/App.tsx` | 수정 | /register 라우트 추가 |
