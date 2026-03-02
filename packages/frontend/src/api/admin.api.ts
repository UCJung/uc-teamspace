import apiClient from './client';

export type AccountStatus = 'PENDING' | 'APPROVED' | 'ACTIVE' | 'INACTIVE';
export type TeamStatus = 'PENDING' | 'APPROVED' | 'ACTIVE' | 'INACTIVE';

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  roles: string[];
  accountStatus: AccountStatus;
  mustChangePassword: boolean;
  isActive: boolean;
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

export const adminApi = {
  getAccounts: (status?: AccountStatus) =>
    apiClient.get<{ data: AdminAccount[] }>('/admin/accounts', {
      params: status ? { status } : {},
    }),

  updateAccountStatus: (id: string, data: UpdateAccountStatusDto) =>
    apiClient.patch<{ data: AdminAccount }>(`/admin/accounts/${id}/status`, data),

  getTeams: (status?: TeamStatus) =>
    apiClient.get<{ data: AdminTeam[] }>('/admin/teams', {
      params: status ? { status } : {},
    }),

  updateTeamStatus: (id: string, data: UpdateTeamStatusDto) =>
    apiClient.patch<{ data: AdminTeam }>(`/admin/teams/${id}/status`, data),
};
