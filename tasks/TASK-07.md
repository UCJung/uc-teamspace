# TASK-07: Front-end — 팀·파트·프로젝트 관리 화면

> **Phase:** 7
> **선행 TASK:** TASK-06, TASK-03
> **목표:** 팀장용 관리 화면 구현 — 팀원 관리, 파트 관리, 프로젝트 관리 CRUD UI

---

## Step 1 — 계획서

### 1.1 작업 범위

LEADER 역할 전용 관리 화면 2개를 구현한다. TeamMgmt(팀·파트·팀원 관리)와 ProjectMgmt(프로젝트 관리)에서 각각 테이블 기반 목록 조회, 모달 기반 등록/수정 폼을 제공한다. TanStack Query로 서버 상태를 관리하고, 각 API 클라이언트 함수와 커스텀 훅을 구현한다.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| API | `api/team.api.ts`, `api/project.api.ts` |
| Hooks | `hooks/useTeamMembers.ts`, `hooks/useProjects.ts` |
| 페이지 | `pages/TeamMgmt.tsx`, `pages/ProjectMgmt.tsx` |

---

## Step 2 — 체크리스트

### 2.1 API 클라이언트

- [ ] `api/team.api.ts`
  - getTeam(teamId) — 팀 정보
  - getParts(teamId) — 파트 목록
  - getMembers(teamId, partId?) — 팀원 목록
  - createMember(data) — 팀원 등록
  - updateMember(id, data) — 팀원 수정
- [ ] `api/project.api.ts`
  - getProjects(filters) — 프로젝트 목록
  - createProject(data) — 프로젝트 생성
  - updateProject(id, data) — 프로젝트 수정
  - deleteProject(id) — 프로젝트 삭제

### 2.2 TanStack Query 훅

- [ ] `hooks/useTeamMembers.ts`
  - useTeamMembers(teamId, partId?) — 팀원 목록 쿼리
  - useCreateMember() — 등록 뮤테이션
  - useUpdateMember() — 수정 뮤테이션
- [ ] `hooks/useProjects.ts`
  - useProjects(filters) — 프로젝트 목록 쿼리
  - useCreateProject() — 생성 뮤테이션
  - useUpdateProject() — 수정 뮤테이션
  - useDeleteProject() — 삭제 뮤테이션

### 2.3 팀 관리 화면 (TeamMgmt.tsx)

- [ ] 페이지 헤더: "팀 관리" 제목
- [ ] 요약 카드: 전체 인원 수, 파트별 인원 수
- [ ] 필터 바: 파트 선택 드롭다운, 역할 필터, 검색
- [ ] 팀원 목록 테이블
  - 컬럼: 이름, 이메일, 파트, 역할, 상태(활성/비활성), 액션
  - 행: 역할별 배지 표시 (LEADER=보라, PART_LEADER=파랑, MEMBER=회색)
  - 비활성 팀원 회색 처리
- [ ] 팀원 등록 모달
  - 필드: 이름, 이메일, 비밀번호, 파트(드롭다운), 역할(드롭다운)
  - 유효성 검증 (이메일 형식, 필수값)
- [ ] 팀원 수정 모달
  - 기존 데이터 로드
  - 파트 변경, 역할 변경 가능
  - 비활성화 토글
- [ ] 성공/실패 토스트 알림

### 2.4 프로젝트 관리 화면 (ProjectMgmt.tsx)

- [ ] 페이지 헤더: "프로젝트 관리" 제목
- [ ] 요약 카드: 전체 프로젝트 수, 공통/수행별 수, 활성 프로젝트 수
- [ ] 필터 바: 분류(공통/수행) 드롭다운, 상태 드롭다운, 검색
- [ ] 프로젝트 목록 테이블
  - 컬럼: 프로젝트명, 프로젝트코드, 분류, 상태, 액션
  - 분류별 배지 (공통=보라, 수행=파랑)
  - 상태별 배지 (ACTIVE=초록, HOLD=주황, COMPLETED=회색)
- [ ] 프로젝트 등록 모달
  - 필드: 프로젝트명, 프로젝트코드, 분류(드롭다운), 설명
  - 코드 중복 체크
- [ ] 프로젝트 수정 모달
- [ ] 프로젝트 삭제 확인 다이얼로그
  - 연관 업무항목 존재 시 경고 메시지
- [ ] 성공/실패 토스트 알림

### 2.5 RBAC 적용

- [ ] LEADER 외 접근 시 대시보드로 리다이렉트
- [ ] 사이드바에서 역할별 메뉴 표시/숨김 동작 확인

### 2.6 테스트

- [ ] 컴포넌트 테스트: TeamMgmt 테이블 렌더링
- [ ] 컴포넌트 테스트: ProjectMgmt 테이블 렌더링
- [ ] 컴포넌트 테스트: 등록 모달 폼 유효성 검증
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

# 4. 전체 빌드
cd ../.. && bun run build

# 5. 전체 린트
bun run lint

# 6. 수동 확인 필요 항목:
# - 브라우저에서 /team-mgmt 접근 → 팀원 테이블 렌더링
# - 팀원 등록 모달 열기/닫기, 폼 유효성
# - /project-mgmt 접근 → 프로젝트 테이블 렌더링
# - 프로젝트 등록/수정/삭제 모달 동작
# - MEMBER 역할로 접근 시 리다이렉트
```
