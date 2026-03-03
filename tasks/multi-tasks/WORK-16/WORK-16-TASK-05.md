# WORK-16-TASK-05: Admin 프로젝트 관리 프론트엔드

> WORK: WORK-16 프로젝트 관리 프로세스 구조 변경
> 의존: WORK-16-TASK-02

---

## 목표

`/admin/projects` 페이지와 API 클라이언트, 사이드바 메뉴를 추가한다.

---

## 체크리스트

- [ ] `admin.api.ts`: AdminProject 타입, CreateProjectDto, UpdateProjectDto, getProjects/createProject/updateProject API 추가
- [ ] `useAdmin.ts`: useAdminProjects/useCreateProject/useUpdateProject hooks 추가
- [ ] `ProjectManagement.tsx` 신규 페이지 생성
  - [ ] 전역 프로젝트 목록 테이블
  - [ ] 카테고리/상태 필터, 검색
  - [ ] 프로젝트 생성/수정 모달
  - [ ] 상태 토글 버튼 (사용중 ↔ 사용안함)
- [ ] `AdminLayout.tsx`: 프로젝트 관리 메뉴 추가
- [ ] `App.tsx`: `/admin/projects` 라우트 추가
