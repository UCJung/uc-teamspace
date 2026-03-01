import { useMutation, useQueryClient } from '@tanstack/react-query';
import { weeklyReportApi, WorkItem } from '../api/weekly-report.api';
import { useGridStore } from '../stores/gridStore';

export function useAddWorkItem(week: string, reportId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { projectId: string; doneWork: string; planWork: string; remarks?: string }) =>
      weeklyReportApi.addWorkItem(reportId, data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-report', week] });
    },
  });
}

export function useUpdateWorkItem(week: string) {
  const queryClient = useQueryClient();
  const { markClean, setIsSaving } = useGridStore.getState();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Pick<WorkItem, 'projectId' | 'doneWork' | 'planWork' | 'remarks'>>;
    }) => {
      setIsSaving(true);
      return weeklyReportApi.updateWorkItem(id, data).then((r) => r.data.data);
    },
    onSuccess: (_, variables) => {
      markClean(variables.id);
      setIsSaving(false);
      queryClient.invalidateQueries({ queryKey: ['weekly-report', week] });
    },
    onError: () => {
      setIsSaving(false);
    },
  });
}

export function useDeleteWorkItem(week: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      weeklyReportApi.deleteWorkItem(id).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-report', week] });
    },
  });
}
