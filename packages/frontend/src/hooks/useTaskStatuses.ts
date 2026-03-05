import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  teamApi,
  TaskStatusDef,
  CreateTaskStatusDto,
  UpdateTaskStatusDto,
  ReorderTaskStatusItem,
} from '../api/team.api';

const QUERY_KEY = 'task-statuses';

export function useTaskStatuses(teamId: string) {
  return useQuery({
    queryKey: [QUERY_KEY, teamId],
    queryFn: () => teamApi.getTaskStatuses(teamId).then((r) => r.data.data),
    enabled: !!teamId,
    staleTime: 60_000,
  });
}

export function useCreateTaskStatus(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTaskStatusDto) =>
      teamApi.createTaskStatus(teamId, dto).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, teamId] });
    },
  });
}

export function useUpdateTaskStatus(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTaskStatusDto }) =>
      teamApi.updateTaskStatus(teamId, id, dto).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, teamId] });
    },
  });
}

export function useDeleteTaskStatus(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teamApi.deleteTaskStatus(teamId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, teamId] });
    },
  });
}

export function useReorderTaskStatuses(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: ReorderTaskStatusItem[]) =>
      teamApi.reorderTaskStatuses(teamId, items),
    onMutate: async (items: ReorderTaskStatusItem[]) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY, teamId] });
      const previous = queryClient.getQueryData<TaskStatusDef[]>([QUERY_KEY, teamId]);
      queryClient.setQueryData<TaskStatusDef[]>([QUERY_KEY, teamId], (old) => {
        if (!old) return old;
        const orderMap = new Map(items.map((item) => [item.id, item.sortOrder]));
        return [...old]
          .map((s) => ({ ...s, sortOrder: orderMap.get(s.id) ?? s.sortOrder }))
          .sort((a, b) => a.sortOrder - b.sortOrder);
      });
      return { previous };
    },
    onError: (_err, _items, context) => {
      if (context?.previous) {
        queryClient.setQueryData([QUERY_KEY, teamId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, teamId] });
    },
  });
}
