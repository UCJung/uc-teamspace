import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timesheetApi, SaveEntryData, BatchSaveEntry } from '../api/timesheet.api';

export function useMyTimesheet(yearMonth: string, teamId: string | null) {
  return useQuery({
    queryKey: ['timesheet', yearMonth, teamId],
    queryFn: () =>
      timesheetApi.getMyTimesheet(yearMonth, teamId!).then((r) => r.data.data),
    enabled: !!yearMonth && !!teamId,
    staleTime: 30_000,
  });
}

export function useCreateTimesheet(yearMonth: string, teamId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      timesheetApi.createTimesheet(yearMonth, teamId!).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheet', yearMonth, teamId] });
    },
  });
}

export function useSaveEntry(yearMonth: string, teamId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ entryId, data }: { entryId: string; data: SaveEntryData }) =>
      timesheetApi.saveEntry(entryId, data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheet', yearMonth, teamId] });
    },
  });
}

export function useBatchSaveEntries(yearMonth: string, teamId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entries: BatchSaveEntry[]) =>
      timesheetApi.batchSaveEntries(entries).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheet', yearMonth, teamId] });
    },
  });
}

export function useSubmitTimesheet(yearMonth: string, teamId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      timesheetApi.submitTimesheet(id).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheet', yearMonth, teamId] });
    },
  });
}

// ──────────── 팀장 훅 ────────────

export function useTeamMembersStatus(teamId: string | null, yearMonth: string) {
  return useQuery({
    queryKey: ['timesheet-team-members-status', teamId, yearMonth],
    queryFn: () =>
      timesheetApi.getTeamMembersStatus(teamId!, yearMonth).then((r) => r.data.data),
    enabled: !!teamId && !!yearMonth,
    staleTime: 30_000,
  });
}

export function useTeamSummary(teamId: string | null, yearMonth: string) {
  return useQuery({
    queryKey: ['timesheet-team-summary', teamId, yearMonth],
    queryFn: () =>
      timesheetApi.getTeamSummary(teamId!, yearMonth).then((r) => r.data.data),
    enabled: !!teamId && !!yearMonth,
    staleTime: 30_000,
  });
}

export function useApproveTimesheet(teamId: string | null, yearMonth: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      timesheetApi.approveTimesheet(id).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheet-team-members-status', teamId, yearMonth] });
      queryClient.invalidateQueries({ queryKey: ['timesheet-team-summary', teamId, yearMonth] });
    },
  });
}


export function useBatchApproveTimesheets(teamId: string | null, yearMonth: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (timesheetIds: string[]) =>
      timesheetApi.batchApproveTimesheets(timesheetIds).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheet-team-members-status', teamId, yearMonth] });
      queryClient.invalidateQueries({ queryKey: ['timesheet-team-summary', teamId, yearMonth] });
    },
  });
}

export function useRejectTimesheet(teamId: string | null, yearMonth: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) =>
      timesheetApi.rejectTimesheet(id, comment).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheet-team-members-status', teamId, yearMonth] });
      queryClient.invalidateQueries({ queryKey: ['timesheet-team-summary', teamId, yearMonth] });
    },
  });
}

// ──────────── PM 훅 ────────────

export function useManagedProjects() {
  return useQuery({
    queryKey: ['managed-projects'],
    queryFn: () => timesheetApi.getManagedProjects().then((r) => r.data.data),
    staleTime: 60_000,
  });
}

export function useProjectAllocationSummary(yearMonth: string) {
  return useQuery({
    queryKey: ['project-allocation-summary', yearMonth],
    queryFn: () =>
      timesheetApi.getProjectAllocationSummary(yearMonth).then((r) => r.data.data),
    staleTime: 30_000,
  });
}

export function useProjectAllocationMonthly(projectId: string | null, yearMonth: string) {
  return useQuery({
    queryKey: ['project-allocation-monthly', projectId, yearMonth],
    queryFn: () =>
      timesheetApi.getProjectAllocationMonthly(projectId!, yearMonth).then((r) => r.data.data),
    enabled: !!projectId && !!yearMonth,
    staleTime: 30_000,
  });
}

export function useProjectAllocationYearly(projectId: string | null, year: string) {
  return useQuery({
    queryKey: ['project-allocation-yearly', projectId, year],
    queryFn: () =>
      timesheetApi.getProjectAllocationYearly(projectId!, year).then((r) => r.data.data),
    enabled: !!projectId && !!year,
    staleTime: 30_000,
  });
}

export function useApproveProjectTimesheet(projectId: string | null, yearMonth: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      timesheetApi.approveProjectTimesheet(projectId!, yearMonth).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-allocation-monthly', projectId, yearMonth] });
    },
  });
}

// ──────────── 관리자 훅 ────────────

export function useAdminTimesheetOverview(yearMonth: string) {
  return useQuery({
    queryKey: ['admin-timesheet-overview', yearMonth],
    queryFn: () => timesheetApi.getAdminOverview(yearMonth).then((r) => r.data.data),
    enabled: !!yearMonth,
    staleTime: 30_000,
  });
}

export function useAdminApprove(yearMonth: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => timesheetApi.adminApprove(yearMonth).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-timesheet-overview', yearMonth] });
    },
  });
}
