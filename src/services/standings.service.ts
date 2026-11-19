import { TournamentStandingRow } from '@/types';
import { fetchApi } from './api';
import { MOCK_STANDINGS } from './mockData';
import { tournamentService } from './tournament.service';

export const standingsService = {
  async getStandings(tournamentId?: string): Promise<TournamentStandingRow[]> {
    let id = tournamentId;
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      const tournaments = await tournamentService.getTournaments();
      id = tournaments[0]?._id;
    }

    if (id && /^[0-9a-fA-F]{24}$/.test(id)) {
      const res = await fetchApi<TournamentStandingRow[]>(`/standings/${id}`);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
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

