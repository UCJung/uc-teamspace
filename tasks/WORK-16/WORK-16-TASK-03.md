# WORK-16-TASK-03: 팀 프로젝트 관리 API

> WORK: WORK-16 프로젝트 관리 프로세스 구조 변경
> 의존: WORK-16-TASK-01

---

## 목표

TeamController에 팀 프로젝트 등록/해제/조회/순서변경 API를 추가한다.

---

## 체크리스트

- [ ] `AddTeamProjectsDto` DTO 생성 (projectIds 배열)
- [ ] `ReorderTeamProjectsDto` DTO 생성 (orderedIds 배열)
- [ ] `TeamProjectService` 신규 서비스 생성
  - [ ] `findTeamProjects(teamId)`: 팀에 등록된 프로젝트 목록
  - [ ] `addTeamProjects(teamId, dto)`: 프로젝트 등록 (중복 체크, 이미 등록된 프로젝트 스킵)
  - [ ] `removeTeamProject(teamId, projectId)`: 프로젝트 해제 (기존 workItem 경고)
  - [ ] `reorderTeamProjects(teamId, dto)`: 순서 변경
- [ ] `TeamModule`에 TeamProjectService 등록
- [ ] `TeamController`에 팀 프로젝트 엔드포인트 추가
  - [ ] GET `/api/v1/teams/:teamId/projects`
  - [ ] POST `/api/v1/teams/:teamId/projects`
  - [ ] DELETE `/api/v1/teams/:teamId/projects/:projectId`
  - [ ] PATCH `/api/v1/teams/:teamId/projects/reorder`
