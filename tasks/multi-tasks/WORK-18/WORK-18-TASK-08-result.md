# WORK-18-TASK-08 수행 결과 보고서

> 작업일: 2026-03-04
> 작업자: Claude Code
> 상태: **완료**

---

## 1. 작업 개요

Member에 추가된 position/jobTitle, Project에 추가된 managerId/department/description을 기존 프론트엔드 페이지에 반영했다. 프로젝트 생성 요청 UI를 추가하고, 사이드바 PM 메뉴 및 설정 메뉴 접근 권한을 최종 정리했다. 전체 빌드·린트 검증으로 WORK-18을 마무리했다.

---

## 2. 완료 기준 달성 현황

| 항목 | 상태 |
|------|------|
| RegisterPage.tsx — 직위 선택 드롭다운 추가 | ✅ |
| RegisterPage.tsx — 회원가입 API에 position 파라미터 전달 | ✅ |
| AccountManagement.tsx — 직위/직책 칼럼 추가 | ✅ |
| AccountManagement.tsx — 계정 편집 모달 (직위/직책 수정) | ✅ |
| ProjectManagement.tsx — 책임자/책임부서 칼럼 추가 | ✅ |
| ProjectManagement.tsx — 프로젝트 편집 모달에 책임자/부서/상세 필드 추가 | ✅ |
| ProjectManagement.tsx — PENDING 승인 UI (코드 입력 → 승인 버튼) | ✅ |
| ProjectManagement.tsx — 상태 필터에 PENDING 추가 | ✅ |
| TeamMgmt.tsx — 팀원 목록 직위 칼럼 추가 | ✅ |
| ProjectMgmt.tsx — "프로젝트 생성 요청" 버튼 추가 (LEADER, PART_LEADER) | ✅ |
| ProjectMgmt.tsx — 요청 모달 (프로젝트명/분류/책임부서/상세설명) | ✅ |
| 사이드바 — 설정 메뉴에 PART_LEADER도 프로젝트 관리 접근 허용 | ✅ |
| `bun run build` — 전체 빌드 0 에러 | ✅ |
| `bun run lint` — 전체 린트 0 에러 | ✅ |

---

## 3. 체크리스트 완료 현황

### 2.1 RegisterPage.tsx
| 항목 | 상태 |
|------|------|
| 직위(position) 선택 드롭다운 추가 (POSITION_LABEL 사용) | ✅ |
| 회원가입 API에 position 파라미터 전달 | ✅ |

### 2.2 Admin AccountManagement.tsx
| 항목 | 상태 |
|------|------|
| 계정 목록에 직위(position), 직책(jobTitle) 칼럼 추가 | ✅ |
| 계정 편집 모달에 직위/직책 수정 필드 추가 | ✅ |

### 2.3 Admin ProjectManagement.tsx
| 항목 | 상태 |
|------|------|
| 프로젝트 목록에 책임자, 책임부서 칼럼 추가 | ✅ |
| 프로젝트 편집 모달에 책임자/부서/상세 필드 추가 | ✅ |
| PENDING 프로젝트 승인 UI (코드 입력 → 승인 버튼) | ✅ |
| 프로젝트 상태 필터에 PENDING 추가 | ✅ |

### 2.4 TeamMgmt.tsx
| 항목 | 상태 |
|------|------|
| 팀원 목록 테이블에 직위 칼럼 추가 (POSITION_LABEL 사용) | ✅ |

### 2.5 ProjectMgmt.tsx
| 항목 | 상태 |
|------|------|
| "프로젝트 생성 요청" 버튼 추가 (LEADER, PART_LEADER) | ✅ |
| 요청 모달: 프로젝트명, 분류, 책임부서, 상세설명 입력 | ✅ |

### 2.6 사이드바 최종 정리
| 항목 | 상태 |
|------|------|
| 설정 메뉴 그룹 → PART_LEADER도 접근 허용 (프로젝트 관리만) | ✅ |
| PM 메뉴 — managedProjects 존재 시만 표시 (기존 유지) | ✅ |

### 2.7 통합 검증
| 항목 | 상태 |
|------|------|
| `bun run build` — 전체 빌드 0 에러 | ✅ |
| `bun run lint` — 전체 린트 0 에러 | ✅ |

---

## 4. 발견 이슈 및 수정 내역

### 이슈 #1 — ProjectStatus 타입에 PENDING 미포함
**증상**: `admin.api.ts`의 `ProjectStatus` 타입이 `'ACTIVE' | 'INACTIVE'`만 포함하여 PENDING 상태를 다룰 수 없었음.
**원인**: 초기 설계 시 PENDING 상태를 고려하지 않은 타입 정의.
**수정**: `ProjectStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE'`로 확장. `project.api.ts`의 `Project.status`도 동일하게 수정.

### 이슈 #2 — 관리자 계정 정보 수정 API 미존재
**증상**: 직위/직책 수정을 위한 API 엔드포인트(`PATCH /admin/accounts/:id/info`)와 훅이 없었음.
**원인**: TASK-04에서 백엔드 구현은 되어 있으나 프론트 API 클라이언트/훅 미추가.
**수정**: `admin.api.ts`에 `updateAccountInfo`, `UpdateAccountInfoDto` 추가. `useAdmin.ts`에 `useUpdateAccountInfo` 훅 추가.

### 이슈 #3 — 프로젝트 생성 요청 API 미존재
**증상**: `POST /api/v1/projects/request` 호출을 위한 프론트 클라이언트/훅 미존재.
**원인**: TASK-04에서 백엔드 구현은 되어 있으나 프론트 연동 누락.
**수정**: `project.api.ts`에 `requestProject`, `RequestProjectDto` 추가. `useProjects.ts`에 `useRequestProject` 훅 추가.

---

## 5. 최종 검증 결과

```
Tasks:    3 successful, 3 total
Cached:    2 cached, 3 total
  Time:    16.412s
```

**빌드 결과**: 3 packages 모두 성공 (frontend, backend, shared)

```
✖ 7 problems (0 errors, 7 warnings)
```

**린트 결과**: 0 errors, 7 warnings (기존 코드의 pre-existing warnings 동일)

### 수동 확인 필요 항목 (브라우저)
- 회원가입 화면 → 직위 선택 드롭다운 렌더링 확인
- Admin 계정관리 → 직위/직책 칼럼 데이터 표시 확인
- Admin 계정관리 → 수정 버튼 클릭 → 직위/직책 편집 모달 동작 확인
- Admin 프로젝트관리 → PENDING 필터 동작 및 "승인" 버튼 표시 확인
- Admin 프로젝트관리 → 승인 모달 코드 입력 → 승인 처리 확인
- Admin 프로젝트관리 → 프로젝트 편집 모달에 책임자/부서/상세 필드 표시 확인
- 팀 관리 → 팀원 목록 직위 칼럼 표시 확인
- 프로젝트 관리 → LEADER/PART_LEADER 로그인 시 "생성 요청" 버튼 표시 확인
- 사이드바 → PART_LEADER 로그인 시 "프로젝트 관리" 메뉴 표시 확인

---

## 6. 후속 TASK 유의사항

- WORK-18 모든 TASK 완료. 백엔드 스키마 마이그레이션(`bunx prisma migrate dev`) 후 시드 데이터 재입력이 필요할 수 있음.
- Admin의 `PATCH /admin/accounts/:id/info` 엔드포인트가 백엔드에 구현되어 있는지 확인 필요 (TASK-04 결과 확인).
- `POST /api/v1/projects/request` 엔드포인트도 동일하게 백엔드 구현 확인 필요.

---

## 7. 산출물 목록

### 수정 파일

| 파일 | 변경 내용 |
|------|-----------|
| `packages/frontend/src/pages/RegisterPage.tsx` | 직위(position) 선택 드롭다운 추가, API 호출에 position 파라미터 전달 |
| `packages/frontend/src/api/auth.api.ts` | `RegisterRequest`에 `position?: string` 필드 추가 |
| `packages/frontend/src/api/admin.api.ts` | `ProjectStatus`에 PENDING 추가, `AdminProject`에 manager/department/description 필드 추가, `AdminAccount`에 position/jobTitle 추가, 새 DTO/API 메서드 추가 |
| `packages/frontend/src/api/project.api.ts` | `Project.status`에 PENDING 추가, `RequestProjectDto` 인터페이스 추가, `requestProject` API 메서드 추가 |
| `packages/frontend/src/api/team.api.ts` | `Member`에 `position?`, `jobTitle?` 필드 추가 |
| `packages/frontend/src/hooks/useAdmin.ts` | `useApproveProject`, `useUpdateAccountInfo` 훅 추가 |
| `packages/frontend/src/hooks/useProjects.ts` | `useRequestProject` 훅 추가 |
| `packages/frontend/src/pages/admin/AccountManagement.tsx` | 직위/직책 칼럼 추가, `EditAccountModal` 컴포넌트 추가 |
| `packages/frontend/src/pages/admin/ProjectManagement.tsx` | 책임자/책임부서 칼럼 추가, PENDING 필터 추가, `ApproveProjectModal` 추가, 프로젝트 편집 모달에 필드 추가 |
| `packages/frontend/src/pages/TeamMgmt.tsx` | 팀원 목록 직위 칼럼 추가 (DnD/non-DnD 테이블 모두), `POSITION_LABEL` import 추가 |
| `packages/frontend/src/pages/ProjectMgmt.tsx` | `RequestProjectModal` 컴포넌트 추가, "생성 요청" 버튼 추가 (LEADER/PART_LEADER 조건) |
| `packages/frontend/src/components/layout/Sidebar.tsx` | 설정 그룹 roles에 PART_LEADER 추가, 프로젝트 관리 메뉴 roles에 PART_LEADER 추가 |

### 신규 생성 파일

| 파일 | 내용 |
|------|------|
| `tasks/multi-tasks/WORK-18/WORK-18-TASK-08-result.md` | 본 결과 보고서 |
