import { TournamentStandingRow } from '@/types';
import { fetchApi } from './api';
import { MOCK_STANDINGS, MOCK_TOURNAMENT } from './mockData';

export const standingsService = {
  async getStandings(tournamentId?: string): Promise<TournamentStandingRow[]> {
    const id = tournamentId || MOCK_TOURNAMENT._id;
    const res = await fetchApi<TournamentStandingRow[]>(`/standings/${id}`);
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    return MOCK_STANDINGS;
  },

  async getLeaderboard(): Promise<TournamentStandingRow[]> {
    const res = await fetchApi<TournamentStandingRow[]>('/leaderboard');
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    return MOCK_STANDINGS;
  },
};
