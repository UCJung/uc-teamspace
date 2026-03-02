import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamApi, GetTeamsParams } from '../api/team.api';

export function useTeams(params?: GetTeamsParams) {
  return useQuery({
    queryKey: ['teams', params],
    queryFn: () => teamApi.getTeams(params).then((r) => r.data.data),
  });
}

export function useMyTeams() {
  return useQuery({
    queryKey: ['my-teams'],
    queryFn: () => teamApi.getMyTeams().then((r) => r.data.data),
  });
}

export function useRequestCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamName: string) =>
      teamApi.requestCreateTeam(teamName).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['my-teams'] });
    },
  });
}

export function useRequestJoinTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamId: string) =>
      teamApi.requestJoinTeam(teamId).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['my-teams'] });
    },
  });
}
