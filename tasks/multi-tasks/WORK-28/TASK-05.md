# WORK-28 TASK-05 — 프론트엔드: TaskDetailPanel에서 주간보고 연계 개선

## 목표
개인 작업 상세 패널(TaskDetailPanel)에서 현재 작업이 주간보고에 연결되어 있는지 표시하고,
연결되지 않은 작업을 주간보고로 바로 내보낼 수 있는 UI를 개선한다.

## 수정 파일

| 파일 | 작업 |
|------|------|
| `packages/frontend/src/components/personal-task/TaskDetailPanel.tsx` | 주간보고 연계 섹션 추가 |
| `packages/frontend/src/hooks/usePersonalTasks.ts` | `useImportTaskToWeekly` 훅 개선 |

## 구현 상세

### TaskDetailPanel 주간보고 연계 섹션

기존 상세 패널 하단에 "주간보고 연계" 섹션 추가:

```
────────────────────────────
주간보고 연계
────────────────────────────
연결된 주차: 2026-W10        ← linkedWeekLabel이 있으면 표시
[주간보고에서 확인]           ← 해당 주차 주간보고 페이지로 이동

─ 또는 ─

연결된 주차 없음
주차 선택: [이번주 ▼]
[주간보고에 내보내기]         ← importToWeekly 호출
────────────────────────────
```

**동작:**
- `linkedWeekLabel`이 있는 경우:
  - 연결 주차 표시
  - "주간보고에서 확인" 버튼 → `/my-weekly-report?week=2026-W10` 으로 이동 (또는 탐색)
- `linkedWeekLabel`이 없는 경우:
  - 이번주 또는 다음주 선택 드롭다운
  - "주간보고에 내보내기" 버튼 → `importToWeekly` 호출

**주차 선택 옵션:**
- 이번주 (현재 주차)
- 다음주
- 지난주

### useImportTaskToWeekly 훅 개선

기존 `ImportFromTasksModal`에서만 사용하던 import 로직을 개별 작업 단위로도 사용할 수 있도록 훅 추출:

```typescript
export function useImportSingleTaskToWeekly() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, weekLabel, teamId }: { taskId: string; weekLabel: string; teamId: string }) =>
      personalTaskApi.importToWeeklyReport({ taskIds: [taskId], weekLabel, teamId }),
    onSuccess: (_, { weekLabel }) => {
      queryClient.invalidateQueries({ queryKey: ['weekly-report', weekLabel] });
      queryClient.invalidateQueries({ queryKey: ['personal-tasks'] });
    },
  });
}
```

## 완료 기준
- [ ] linkedWeekLabel 있는 작업에서 연결 주차 표시
- [ ] linkedWeekLabel 없는 작업에서 주차 선택 + 내보내기 버튼 표시
- [ ] 내보내기 성공 시 linkedWeekLabel 업데이트 반영
- [ ] "주간보고에서 확인" 버튼 클릭 시 해당 주차 이동
- [ ] `bun run build` + `bun run lint` 오류 없음
