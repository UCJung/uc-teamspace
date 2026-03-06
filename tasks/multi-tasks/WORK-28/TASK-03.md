# WORK-28 TASK-03 — 프론트엔드: ExpandedEditor에 연관 작업 패널 추가

## 목표
WorkItem 확대 편집기(ExpandedEditor)에 연관 PersonalTask 목록을 보여주는 사이드 패널을 추가한다.

## 수정 파일

| 파일 | 작업 |
|------|------|
| `packages/frontend/src/api/weekly-report.api.ts` | `getLinkedTasks`, `applyTasksToWorkItem` API 함수 추가 |
| `packages/frontend/src/hooks/useWorkItems.ts` | `useLinkedTasks`, `useApplyTasksToWorkItem` 훅 추가 |
| `packages/frontend/src/components/grid/ExpandedEditor.tsx` | 연관 작업 사이드 패널 추가 |

## 구현 상세

### API 추가 (weekly-report.api.ts)

```typescript
export interface LinkedTask {
  id: string;
  title: string;
  memo?: string;
  priority: TaskPriority;
  statusId: string;
  taskStatus: { id: string; name: string; category: string; color: string };
  dueDate?: string;
  scheduledDate?: string;
  linkedWeekLabel?: string;
  completedAt?: string;
}

export interface LinkedTasksResult {
  workItemId: string;
  projectId?: string;
  weekLabel: string;
  tasks: LinkedTask[];
}

// API 함수 추가
getLinkedTasks: (workItemId: string, teamId: string) =>
  apiClient.get<{ data: LinkedTasksResult }>(`/work-items/${workItemId}/linked-tasks`, { params: { teamId } }),

applyTasksToWorkItem: (
  workItemId: string,
  dto: { taskIds: string[]; appendMode: 'replace' | 'append'; teamId: string }
) => apiClient.post<{ data: WorkItem }>(`/work-items/${workItemId}/apply-tasks`, dto),
```

### 훅 추가 (useWorkItems.ts)

```typescript
export function useLinkedTasks(workItemId: string, teamId: string) {
  return useQuery({
    queryKey: ['work-item-linked-tasks', workItemId, teamId],
    queryFn: () => weeklyReportApi.getLinkedTasks(workItemId, teamId).then(r => r.data.data),
    enabled: !!workItemId && !!teamId,
    staleTime: 30_000,
  });
}

export function useApplyTasksToWorkItem(currentWeek: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workItemId, dto }: { workItemId: string; dto: ApplyTasksDto }) =>
      weeklyReportApi.applyTasksToWorkItem(workItemId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-report', currentWeek] });
    },
  });
}
```

### ExpandedEditor UI 변경

기존 2열 레이아웃(한일/할일)에서 3열 레이아웃으로 확장:

```
┌──────────────────────────────────┬─────────────────────┐
│ 편집 영역 (기존 유지)              │ 연관 작업 패널      │
│                                  │ ─────────────────── │
│ [프로젝트 선택]                   │ [완료] [진행] [예정] │
│                                  │                     │
│ 한 일:                           │ □ 작업A (완료)      │
│ [텍스트 편집기]                   │ □ 작업B (진행중)    │
│                                  │ □ 작업C (예정)      │
│ 할 일:                           │                     │
│ [텍스트 편집기]                   │ [한일에 추가]       │
│                                  │ [할일에 추가]       │
│ 비 고:                           │ ─────────────────── │
│ [텍스트 편집기]                   │ 연관작업 없음 시:   │
│                                  │ "이 프로젝트의      │
│                                  │  이번주 작업 없음"  │
└──────────────────────────────────┴─────────────────────┘
```

**연관 작업 패널 기능:**
- 탭: 완료(COMPLETED) / 진행중(IN_PROGRESS) / 예정(BEFORE_START)
- 체크박스로 다중 선택
- "한일에 추가" 버튼: COMPLETED 작업 선택 → append 모드로 doneWork 업데이트
- "할일에 추가" 버튼: 나머지 작업 선택 → append 모드로 planWork 업데이트
- 작업 없으면 "이번 주 연관 작업이 없습니다" 안내 텍스트
- projectId가 없는 WorkItem이면 패널 숨김

## 완료 기준
- [ ] ExpandedEditor에 연관 작업 패널 렌더링
- [ ] 탭별 작업 목록 표시
- [ ] 선택 후 "한일에 추가" 클릭 시 doneWork 업데이트
- [ ] 선택 후 "할일에 추가" 클릭 시 planWork 업데이트
- [ ] projectId 없는 WorkItem은 패널 미표시
- [ ] `bun run build` + `bun run lint` 오류 없음
