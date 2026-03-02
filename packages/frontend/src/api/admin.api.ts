import apiClient from './client';

export type AccountStatus = 'PENDING' | 'APPROVED' | 'ACTIVE' | 'INACTIVE';
export type TeamStatus = 'PENDING' | 'APPROVED' | 'ACTIVE' | 'INACTIVE';
export type ProjectCategory = 'COMMON' | 'EXECUTION';
export type ProjectStatus = 'ACTIVE' | 'INACTIVE';

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  roles: string[];
  accountStatus: AccountStatus;
  mustChangePassword: boolean;
  isActive: boolean;
  teams?: { id: string; name: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminTeam {
  id: string;
  name: string;
  description?: string;
  teamStatus: TeamStatus;
  requestedById?: string | null;
  requestedBy?: { name: string; email: string } | null;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAccountStatusDto {
  status: AccountStatus;
}

export interface UpdateTeamStatusDto {
  status: TeamStatus;
}

export interface AdminProject {
  id: string;
  name: string;
  code: string;
  category: ProjectCategory;
  status: ProjectStatus;
  sortOrder: number;
  teamCount: number;
  workItemCount: number;
}

export interface CreateProjectDto {
  name: string;
  code: string;
  category: ProjectCategory;
}

export interface UpdateProjectDto {
  name?: string;
  code?: string;
  category?: ProjectCategory;
  status?: ProjectStatus;
}

export const adminApi = {
  getAccounts: (params?: { status?: AccountStatus; search?: string }) =>
    apiClient.get<{ data: { data: AdminAccount[]; pagination?: unknown } }>('/admin/accounts', {
      params: params ?? {},
    }),

  updateAccountStatus: (id: string, data: UpdateAccountStatusDto) =>
    apiClient.patch<{ data: AdminAccount }>(`/admin/accounts/${id}/status`, data),

  resetPassword: (id: string) =>
    apiClient.patch<{ data: unknown }>(`/admin/accounts/${id}/reset-password`),

  getTeams: (status?: TeamStatus) =>
    apiClient.get<{ data: { data: AdminTeam[]; pagination?: unknown } }>('/admin/teams', {
      params: status ? { status } : {},
    }),

  updateTeamStatus: (id: string, data: UpdateTeamStatusDto) =>
    apiClient.patch<{ data: AdminTeam }>(`/admin/teams/${id}/status`, data),

  getProjects: (params?: { category?: ProjectCategory; status?: ProjectStatus; page?: number; limit?: number }) =>
    apiClient.get<{ data: { data: AdminProject[]; pagination?: { total: number; page: number; limit: number; totalPages: number } } }>(
      '/admin/projects',
      { params: params ?? {} }
    ),

  createProject: (data: CreateProjectDto) =>
    apiClient.post<{ data: AdminProject }>('/admin/projects', data),

  updateProject: (id: string, data: UpdateProjectDto) =>
    apiClient.patch<{ data: AdminProject }>(`/admin/projects/${id}`, data),
};
