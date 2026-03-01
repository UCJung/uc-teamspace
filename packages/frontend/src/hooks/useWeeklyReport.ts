import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { weeklyReportApi } from '../api/weekly-report.api';

export function useMyWeeklyReport(week: string) {
  return useQuery({
    queryKey: ['weekly-report', week],
    queryFn: () => weeklyReportApi.getMyWeeklyReport(week).then((r) => r.data.data),
    enabled: !!week,
  });
}

export function useCreateWeeklyReport(week: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (weekLabel: string) =>
      weeklyReportApi.createWeeklyReport(weekLabel).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-report', week] });
    },
  });
}

export function useSubmitWeeklyReport(week: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'DRAFT' | 'SUBMITTED' }) =>
      weeklyReportApi.updateWeeklyReport(id, status).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-report', week] });
    },
  });
}

export function useCarryForward(week: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      targetWeek,
      sourceWorkItemIds,
    }: {
      targetWeek: string;
      sourceWorkItemIds?: string[];
    }) =>
      weeklyReportApi
        .carryForward(targetWeek, sourceWorkItemIds)
        .then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-report', week] });
    },
  });
}
