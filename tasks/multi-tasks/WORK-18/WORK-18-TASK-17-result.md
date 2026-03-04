# WORK-18-TASK-17 수행 결과 보고서

> 작업일: 2026-03-04
> 작업자: Claude Code
> 상태: **완료**

---

## 1. 작업 개요

관리자 프로젝트 관리 화면에서 책임자(manager) 이름이 표시되지 않는 버그를 수정했다.

---

## 2. 완료 기준 달성 현황

| 항목 | 상태 |
|------|------|
| 관리자 프로젝트 목록에서 책임자 이름 표시 | ✅ |
| `bun run build` — 0 에러 | ✅ |
| `bun run lint` — 0 에러 | ✅ |

---

## 3. 체크리스트 완료 현황

| 항목 | 상태 |
|------|------|
| 백엔드 `listProjects` 응답에 `managerName` 필드 추가 | ✅ |
| `bun run build` — 0 에러 | ✅ |
| `bun run lint` — 0 에러 | ✅ |

---

## 4. 발견 이슈 및 수정 내역

### 이슈 #1 — 관리자 프로젝트 목록에서 책임자 미표시
**증상**: 프로젝트 목록 테이블의 책임자 컬럼에 항상 '—' 표시
**원인**: 백엔드 `AdminService.listProjects`는 `manager: { id, name, email }` 중첩 객체를 반환하지만, 프론트엔드 `ProjectManagement.tsx`는 `project.managerName` (평탄화된 필드)을 참조함
**수정**: 백엔드 응답 매핑에서 `managerName: p.manager?.name ?? null` 추가

---

## 5. 최종 검증 결과

```
 Tasks:    3 successful, 3 total
Cached:    2 cached, 3 total
  Time:    7.552s
```

**빌드 결과**: 3 packages 모두 성공

**린트 결과**: 0 errors

### 수동 확인 필요 항목 (브라우저)
- 관리자 > 프로젝트 관리 화면에서 책임자 컬럼에 팀장/파트장 이름 표시 확인

---

## 6. 산출물 목록

### 수정 파일

| 파일 | 변경 내용 |
|------|-----------:|
| `packages/backend/src/admin/admin.service.ts` | `listProjects` 응답에 `managerName: p.manager?.name` 추가 |

### 신규 생성 파일

| 파일 | 내용 |
|------|------|
| `tasks/multi-tasks/WORK-18/WORK-18-TASK-17-result.md` | 본 결과 보고서 |
