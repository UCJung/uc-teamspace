# WORK-16-TASK-02: Admin 프로젝트 관리 API

> WORK: WORK-16 프로젝트 관리 프로세스 구조 변경
> 의존: WORK-16-TASK-01

---

## 목표

AdminController/AdminService에 전역 프로젝트 CRUD API를 추가한다.

---

## 체크리스트

- [ ] `CreateGlobalProjectDto` DTO 생성 (name, code, category)
- [ ] `UpdateGlobalProjectDto` DTO 생성 (name, code, category, status 모두 optional)
- [ ] `ListGlobalProjectsDto` DTO 생성 (category, status 필터, 페이지네이션)
- [ ] `AdminService.listProjects()` 구현 (페이지네이션, teamCount/workItemCount 포함)
- [ ] `AdminService.createProject()` 구현 (전역 코드 중복 체크, sortOrder 자동 지정)
- [ ] `AdminService.updateProject()` 구현 (코드 변경 시 중복 체크, 상태 변경)
- [ ] `AdminController` GET/POST/PATCH `/api/v1/admin/projects` 엔드포인트 추가
- [ ] `admin.service.spec.ts` 프로젝트 관련 테스트 추가
