# WORK-18-TASK-08: 기존 코드 수정 + 통합 빌드 검증

> **Phase:** 6
> **선행 TASK:** TASK-06, TASK-07
> **목표:** 기존 페이지에 직위/직책, 프로젝트 책임자 등 변경사항을 반영하고 전체 빌드를 검증한다

---

## Step 1 — 계획서

### 1.1 작업 범위

Member에 추가된 position/jobTitle, Project에 추가된 managerId/department/description을 기존 프론트엔드 페이지에 반영한다. 프로젝트 생성 요청 UI를 추가하고, 사이드바 PM 메뉴를 최종 정리한다. 전체 빌드·린트를 검증하여 WORK-18을 마무리한다.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| 수정 | `src/pages/RegisterPage.tsx` — 직위 선택 필드 추가 |
| 수정 | `src/pages/admin/AccountManagement.tsx` — 직위/직책 표시+편집 |
| 수정 | `src/pages/admin/ProjectManagement.tsx` — 책임자/부서/상세 + 승인 UI |
| 수정 | `src/pages/TeamMgmt.tsx` — 팀원 직위 칼럼 |
| 수정 | `src/pages/ProjectMgmt.tsx` — 생성 요청 기능 |
| 수정 | `src/components/layout/Sidebar.tsx` — PM 메뉴 조건부 |

---

## Step 2 — 체크리스트

### 2.1 RegisterPage.tsx

- [ ] 직위(position) 선택 드롭다운 추가 (POSITION_LABEL 사용)
- [ ] 회원가입 API에 position 파라미터 전달

### 2.2 Admin AccountManagement.tsx

- [ ] 계정 목록에 직위(position), 직책(jobTitle) 칼럼 추가
- [ ] 계정 편집 모달에 직위/직책 수정 필드 추가

### 2.3 Admin ProjectManagement.tsx

- [ ] 프로젝트 목록에 책임자, 책임부서 칼럼 추가
- [ ] 프로젝트 편집 모달에 책임자/부서/상세 필드 추가
- [ ] PENDING 프로젝트 승인 UI (코드 입력 → 승인 버튼)
- [ ] 프로젝트 상태 필터에 PENDING 추가

### 2.4 TeamMgmt.tsx

- [ ] 팀원 목록 테이블에 직위 칼럼 추가 (POSITION_LABEL 사용)

### 2.5 ProjectMgmt.tsx

- [ ] "프로젝트 생성 요청" 버튼 추가 (LEADER, PART_LEADER)
- [ ] 요청 모달: 프로젝트명, 분류, 책임자, 책임부서, 상세설명 입력

### 2.6 사이드바 최종 정리

- [ ] PM 메뉴 ("프로젝트 투입현황") — managedProjects 존재 시만 표시
- [ ] 전체 메뉴 순서 정리

### 2.7 통합 검증

- [ ] `bun run build` — 전체 빌드 0 에러
- [ ] `bun run lint` — 전체 린트 0 에러
- [ ] 백엔드 기동 확인 (`bun run start:dev`)
- [ ] 프론트엔드 기동 확인 (`bun run dev`)

---

## Step 3 — 완료 검증

```bash
# 1. 전체 빌드
bun run build

# 2. 전체 린트
bun run lint

# 3. 백엔드 기동
cd packages/backend && bun run start:dev &
sleep 3
curl http://localhost:3000/api/v1/auth/me -H "Authorization: Bearer <token>" | jq .
kill %1

# 4. 프론트엔드 빌드 결과 확인
ls packages/frontend/dist/index.html

# 5. 수동 확인 필요 항목 (브라우저)
# - 회원가입 → 직위 선택 표시 확인
# - Admin 계정관리 → 직위/직책 칼럼 표시 확인
# - Admin 프로젝트관리 → PENDING 프로젝트 승인 UI 확인
# - 팀 관리 → 팀원 직위 칼럼 확인
# - 사이드바 → 역할별 메뉴 조건부 표시 확인
```
