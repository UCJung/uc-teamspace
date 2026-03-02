# WORK-12-TASK-04: 프론트 - 프로젝트/파트 DnD 정렬 UI + 복수 역할 UI

## WORK
WORK-12: 프로젝트/파트 정렬 / 복수 역할 / 팀업무현황 제거 / 주차표현 통일

## Dependencies
- WORK-12-TASK-01 (required): 프로젝트/파트 reorder API
- WORK-12-TASK-02 (required): 복수 역할 API (roles 배열)
- WORK-12-TASK-03 (required): TeamStatus 제거 및 주차 통일

## Scope

### 1. 패키지 설치
@dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities 설치

### 2. API 함수 추가

project.api.ts:
- reorderProjects(data: { teamId: string; orderedIds: string[] }) -> PATCH /api/v1/projects/reorder

team.api.ts:
- reorderParts(teamId: string, orderedIds: string[]) -> PATCH /api/v1/teams/:teamId/parts/reorder

### 3. 커스텀 훅 추가

hooks/useProjects.ts:
- useReorderProjects(): useMutation 기반, 성공 시 projects 쿼리 무효화

hooks/useTeamMembers.ts:
- useReorderParts(teamId): useMutation 기반, 성공 시 parts 쿼리 무효화

### 4. ProjectMgmt.tsx - DnD 정렬 UI

핵심 사항:
- @dnd-kit 기반 SortableContext 적용
- 각 프로젝트 행에 Drag Handle (줄무늬 아이콘)
- onDragEnd: arrayMove로 localProjects 즉시 업데이트 (낙관적) + reorderProjects API 호출
- 필터(category/status/searchText) 활성화 중에는 DnD 비활성화
  비활성화 시: "필터를 초기화해야 순서를 변경할 수 있습니다." 안내 표시
- 테이블 헤더에 "순서" 컬럼 추가

SortableProjectRow 컴포넌트 구조:
- useSortable({ id: project.id }) 훅 사용
- isDragging 시 opacity 0.5
- setNodeRef, style(transform, transition) 적용

### 5. TeamMgmt.tsx - 파트 관리 탭 + DnD + 복수 역할

#### 5-1. 탭 UI
TabMode: "members" | "parts"
- "팀원 관리" 탭: 기존 팀원 목록 + 등록/수정 기능 (그대로 유지)
- "파트 관리" 탭: 파트 순서 DnD

#### 5-2. 파트 관리 탭 DnD
SortablePartRow:
- useSortable 훅 적용
- 파트 이름 + Drag Handle 표시
onDragEnd: useReorderParts 호출

#### 5-3. 복수 역할 체크박스 UI

MemberFormData 타입 변경:
- role: string -> roles: string[]
- DEFAULT_FORM.roles = ['MEMBER']

등록/수정 모달 역할 선택:
- 단일 Select 제거
- 체크박스 그룹 (LEADER/팀장, PART_LEADER/파트장, MEMBER/팀원)
- 선택된 역할이 0개이면 에러: "역할을 1개 이상 선택하세요."

팀원 목록 역할 표시:
- 단일 Badge -> 복수 Badge (member.roles 배열을 map으로 렌더링)

### 6. authStore.ts - roles 배열 타입

AuthUser 인터페이스:
- role: string -> roles: string[]
- 로그인/me 응답 파싱 시 roles 배열 저장

### 7. App.tsx - RoleGuard 수정

```
// 기존: roles.includes(user.role)
// 변경: user.roles.some(r => roles.includes(r))
```

### 8. Sidebar.tsx 수정

canAccess():
- roles.includes(user.role) -> user.roles.some(r => roles.includes(r))

역할 표시 (프로필 영역):
- 최고 역할만 표시: LEADER > PART_LEADER > MEMBER 우선순위
- 예: roles=['LEADER','PART_LEADER'] -> "팀장" 표시

### 9. PartStatus.tsx - isLeader 판단 수정

- user?.role === 'LEADER' -> user?.roles.includes('LEADER')

## Files

| Path | Action | Description |
|------|--------|-------------|
| packages/frontend/package.json | MODIFY | @dnd-kit 패키지 추가 |
| packages/frontend/src/api/project.api.ts | MODIFY | reorderProjects API |
| packages/frontend/src/api/team.api.ts | MODIFY | reorderParts API |
| packages/frontend/src/hooks/useProjects.ts | MODIFY | useReorderProjects 훅 |
| packages/frontend/src/hooks/useTeamMembers.ts | MODIFY | useReorderParts 훅 |
| packages/frontend/src/pages/ProjectMgmt.tsx | MODIFY | DnD 정렬 UI |
| packages/frontend/src/pages/TeamMgmt.tsx | MODIFY | 파트 탭 + DnD + 복수 역할 체크박스 |
| packages/frontend/src/stores/authStore.ts | MODIFY | roles 배열 타입 |
| packages/frontend/src/App.tsx | MODIFY | RoleGuard roles.some() |
| packages/frontend/src/components/layout/Sidebar.tsx | MODIFY | canAccess + 역할 표시 |
| packages/frontend/src/pages/PartStatus.tsx | MODIFY | isLeader 판단 수정 |

## Acceptance Criteria
- [ ] ProjectMgmt 테이블에서 드래그로 프로젝트 순서 변경 가능
- [ ] 변경된 순서가 새로고침 후에도 유지 (DB 영속)
- [ ] 필터 활성화 시 DnD 비활성화 + 안내 메시지 표시
- [ ] TeamMgmt에 "파트 관리" 탭 존재, 파트 순서 DnD 가능
- [ ] PartStatus에서 파트 목록이 설정된 순서로 표시
- [ ] 팀원 등록/수정 모달에서 역할 체크박스로 복수 선택 가능
- [ ] 최소 1개 역할 미선택 시 에러 메시지 표시
- [ ] 팀원 목록에서 복수 역할 시 여러 Badge 표시
- [ ] 복수 역할 보유자 접근 권한 정상 동작
- [ ] bun run build 성공
- [ ] bun run lint 성공

## Verify
```bash
cd /c/rnd/weekly-report/packages/frontend
bun install
bun run build
bun run lint
```

## 수동 확인 필요
- 드래그 핸들 시각적 확인 (커서 grab 변경)
- 드래그 중 행 반투명 효과 확인
- 복수 Badge 레이아웃 확인
- 사이드바 역할 최고 역할만 표시 확인
