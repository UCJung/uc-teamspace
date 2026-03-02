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
    (set) => ({
      currentTeamId: null,
      myTeams: [],

      setCurrentTeamId: (teamId) => set({ currentTeamId: teamId }),

      setMyTeams: (teams) => set({ myTeams: teams }),

      clearTeam: () => set({ currentTeamId: null, myTeams: [] }),
    }),
    {
      name: 'team-storage',
      partialize: (state) => ({
        currentTeamId: state.currentTeamId,
        myTeams: state.myTeams,
      }),
    },
  ),
);
