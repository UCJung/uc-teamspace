import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TeamSummary {
  id: string;
  name: string;
  leaderName?: string;
  memberCount?: number;
  isMember?: boolean;
}

interface TeamState {
  currentTeamId: string | null;
  myTeams: TeamSummary[];
  setCurrentTeamId: (teamId: string | null) => void;
  setMyTeams: (teams: TeamSummary[]) => void;
  clearTeam: () => void;
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set: (partial: Partial<TeamState> | ((state: TeamState) => Partial<TeamState>)) => void) => ({
      currentTeamId: null,
      myTeams: [],

      setCurrentTeamId: (teamId: string | null) => set({ currentTeamId: teamId }),

      setMyTeams: (teams: TeamSummary[]) => set({ myTeams: teams }),

      clearTeam: () => set({ currentTeamId: null, myTeams: [] }),
    }),
    {
      name: 'team-storage',
      partialize: (state: TeamState) => ({
        currentTeamId: state.currentTeamId,
        myTeams: state.myTeams,
      }),
    },
  ),
);
