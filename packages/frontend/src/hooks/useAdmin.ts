import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminApi,
  AccountStatus,
  TeamStatus,
  ProjectCategory,
  ProjectStatus,
  UpdateAccountStatusDto,
  UpdateTeamStatusDto,
  CreateProjectDto,
  UpdateProjectDto,
  ApproveProjectDto,
  UpdateAccountInfoDto,
} from '../api/admin.api';

export function useAdminAccounts(params?: { status?: AccountStatus; search?: string }) {
  return useQuery({
    queryKey: ['admin', 'accounts', params],
    queryFn: () => adminApi.getAccounts(params).then((r) => r.data.data.data),
    staleTime: 30_000,
  });
}

export function useUpdateAccountStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAccountStatusDto }) =>
      adminApi.updateAccountStatus(id, data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'accounts'] });
    },
  });
}

export function useResetPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      adminApi.resetPassword(id).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'accounts'] });
    },
  });
}

export function useAdminTeams(status?: TeamStatus) {
  return useQuery({
    queryKey: ['admin', 'teams', status],
    queryFn: () => adminApi.getTeams(status).then((r) => r.data.data.data),
    staleTime: 30_000,
  });
}

export function useUpdateTeamStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamStatusDto }) =>
      adminApi.updateTeamStatus(id, data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'teams'] });
    },
  });
}

export function useAdminProjects(params?: { category?: ProjectCategory; status?: ProjectStatus }) {
  return useQuery({
    queryKey: ['admin', 'projects', params],
    queryFn: () => adminApi.getProjects({ ...params, limit: 100 }).then((r) => r.data.data.data),
    staleTime: 30_000,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectDto) =>
      adminApi.createProject(data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] });
      queryClient.invalidateQueries({ queryKey: ['team-projects'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectDto }) =>
      adminApi.updateProject(id, data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] });
      queryClient.invalidateQueries({ queryKey: ['team-projects'] });
    },
  });
}

export function useApproveProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApproveProjectDto }) =>
      adminApi.approveProject(id, data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateAccountInfo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAccountInfoDto }) =>
      adminApi.updateAccountInfo(id, data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'accounts'] });
    },
  });
}
