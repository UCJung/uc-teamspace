# WORK-24-TASK-04: 프론트엔드 — 팀 작업 상태 관리 화면

> **Phase:** 3
> **선행 TASK:** WORK-24-TASK-02
> **목표:** 팀 관리 화면에 작업 상태 관리 탭을 추가하고, 상태 추가/수정/삭제/DnD 정렬 UI를 구현한다

---

## Step 1 — 계획서

### 1.1 작업 범위

`team.api.ts`에 TaskStatusDef 타입과 API 함수를 추가한다. `useTaskStatuses.ts` 커스텀 훅을 신규 생성한다. `TaskStatusManager.tsx` 컴포넌트를 신규 생성하여 카테고리별 그룹 목록 + 추가/수정/삭제 폼 + DnD 정렬을 구현한다. `TeamMgmt.tsx`에 작업 상태 관리 탭을 추가한다. DnD 정렬은 기존 `@dnd-kit` 라이브러리를 사용한다.

### 1.2 산출물 목록

| 구분 | 산출물 |
|------|--------|
| API (수정) | `packages/frontend/src/api/team.api.ts` — TaskStatusDef 타입 + 5개 API 함수 추가 |
| Hook (신규) | `packages/frontend/src/hooks/useTaskStatuses.ts` |
| Component (신규) | `packages/frontend/src/components/team/TaskStatusManager.tsx` |
| Page (수정) | `packages/frontend/src/pages/TeamMgmt.tsx` — 작업 상태 탭 추가 |

---

## Step 2 — 체크리스트

### 2.1 API 타입 및 함수 추가 (team.api.ts)

- [ ] `TaskStatusCategory` 타입 추가: `'BEFORE_START' | 'IN_PROGRESS' | 'COMPLETED'`
- [ ] `TaskStatusDef` 타입 추가
  ```ts
  type TaskStatusDef = {
    id: string;
    teamId: string;
    name: string;
    category: TaskStatusCategory;
    color: string;
    sortOrder: number;
    isDefault: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
  }
  ```
- [ ] `CreateTaskStatusDto` 타입 추가: `{ name: string; category: TaskStatusCategory; color?: string; isDefault?: boolean }`
- [ ] `UpdateTaskStatusDto` 타입 추가: `{ name?: string; color?: string; isDefault?: boolean }`
- [ ] `getTaskStatuses(teamId: string): Promise<TaskStatusDef[]>` 함수 추가
- [ ] `createTaskStatus(teamId: string, dto: CreateTaskStatusDto): Promise<TaskStatusDef>` 함수 추가
- [ ] `updateTaskStatus(teamId: string, id: string, dto: UpdateTaskStatusDto): Promise<TaskStatusDef>` 함수 추가
- [ ] `deleteTaskStatus(teamId: string, id: string): Promise<void>` 함수 추가
- [ ] `reorderTaskStatuses(teamId: string, items: { id: string; sortOrder: number }[]): Promise<void>` 함수 추가

### 2.2 useTaskStatuses 훅 (useTaskStatuses.ts)

- [ ] `useTaskStatuses(teamId: string)` 훅 구현
  - `useQuery`: queryKey `['task-statuses', teamId]`, staleTime 60s
  - 반환: `{ statuses, isLoading, error }`
- [ ] `useCreateTaskStatus(teamId: string)` 훅 구현
  - `useMutation`: 성공 시 `['task-statuses', teamId]` 캐시 무효화
- [ ] `useUpdateTaskStatus(teamId: string)` 훅 구현
  - `useMutation`: 성공 시 캐시 무효화
- [ ] `useDeleteTaskStatus(teamId: string)` 훅 구현
  - `useMutation`: 성공 시 캐시 무효화
- [ ] `useReorderTaskStatuses(teamId: string)` 훅 구현
  - `useMutation`: 낙관적 업데이트 + 실패 시 롤백

### 2.3 TaskStatusManager 컴포넌트

- [ ] `TaskStatusManager.tsx` 파일 생성 (`interface Props { teamId: string }`)
- [ ] 카테고리 그룹 렌더링: BEFORE_START(진행전) / IN_PROGRESS(진행중) / COMPLETED(완료) 섹션
- [ ] 각 상태 행 구성
  - 드래그 핸들 (`@dnd-kit/sortable` DragHandle)
  - 색상 원형 인디케이터 (`backgroundColor: statusDef.color`)
  - 상태명 텍스트
  - 기본상태 배지 (isDefault=true일 때 표시)
  - 수정 버튼 (연필 아이콘)
  - 삭제 버튼 (휴지통 아이콘, isDefault=true이면 비활성화)
- [ ] 카테고리 내 DnD 정렬: `@dnd-kit/sortable` + `SortableContext` 사용
  - DnD 완료 시 전체 sortOrder 재계산 → `useReorderTaskStatuses` 호출
- [ ] 각 카테고리 하단에 "상태 추가" 버튼
- [ ] 상태 추가/수정 인라인 폼 또는 모달
  - 상태명 입력 (최대 20자)
  - 카테고리 선택 드롭다운 (추가 시에만, 수정 시 숨김)
  - 색상 팔레트 선택 (6색: `#6C7A89`, `#6B5CE7`, `#27AE60`, `#F5A623`, `#E74C3C`, `#3498DB`)
  - 저장 / 취소 버튼
- [ ] 삭제 확인 다이얼로그: "이 상태에 속한 작업이 기본 상태로 이전됩니다" 안내 문구 포함
- [ ] 로딩 상태 표시 (스켈레톤 또는 스피너)
- [ ] 에러 상태 처리 (Toast 알림)
- [ ] CSS 변수 사용 (HEX 하드코딩 금지, 단 color 팔레트 값은 예외)

### 2.4 TeamMgmt 페이지 수정

- [ ] 기존 탭 목록에 "작업 상태" 탭 추가 (탭 위치: 팀 관리 탭 그룹 내 적절한 위치)
- [ ] 탭 전환 시 `TaskStatusManager` 컴포넌트 렌더링 (teamId 전달)
- [ ] import 구문 추가

### 2.5 빌드/린트 확인

- [ ] `cd packages/frontend && bun run build` 오류 0건
- [ ] `bun run lint` 오류 0건

---

## Step 3 — 완료 검증

```bash
# 1. 프론트엔드 빌드
cd /c/rnd/uc-teamspace/packages/frontend
bun run build

# 2. 린트
bun run lint

# 3. 수동 확인 항목 (브라우저에서 확인 필요)
# - 팀 관리 화면 → "작업 상태" 탭 표시 확인
# - 상태 목록 카테고리별 그룹 표시 확인
# - 상태 추가 폼 열림/닫힘 확인
# - 색상 팔레트 6색 선택 확인
# - DnD 드래그로 순서 변경 후 서버에 저장 확인
# - 상태 수정 (이름/색상 변경) 확인
# - 상태 삭제 (마지막 상태 삭제 시 오류 메시지 확인)
# - 삭제 시 확인 다이얼로그 표시 확인
```
