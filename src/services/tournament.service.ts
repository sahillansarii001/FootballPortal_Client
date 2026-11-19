import { Tournament, TournamentOverviewStats } from '@/types';
import { fetchApi } from './api';
import { MOCK_OVERVIEW_STATS, MOCK_TOURNAMENT } from './mockData';

export const tournamentService = {
  async getTournaments(): Promise<Tournament[]> {
    const res = await fetchApi<Tournament[]>('/tournaments');
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    return [MOCK_TOURNAMENT];
  },

  async getTournamentById(id: string): Promise<Tournament> {
    const res = await fetchApi<Tournament>(`/tournaments/${id}`);
    if (res?.success && res.data) {
      return res.data;
    }
    return MOCK_TOURNAMENT;
  },

  async getOverviewStats(): Promise<TournamentOverviewStats> {
    return MOCK_OVERVIEW_STATS;
  },
};
