import { TournamentStandingRow } from '@/types';
import { fetchApi } from './api';
import { MOCK_STANDINGS } from './mockData';
import { tournamentService } from './tournament.service';

function normalizeStandingRows(data: any[]): TournamentStandingRow[] {
  return data.map((row: any, idx: number) => ({
    ...row,
    position: row.position || idx + 1,
    matchesPlayed: row.matchesPlayed ?? 0,
    matchesWon: row.matchesWon ?? row.won ?? 0,
    matchesLost: row.matchesLost ?? row.lost ?? 0,
    goalsScored: row.goalsScored ?? row.goalsFor ?? 0,
    goalsConceded: row.goalsConceded ?? row.goalsAgainst ?? 0,
    goalDifference: row.goalDifference ?? ((row.goalsScored ?? row.goalsFor ?? 0) - (row.goalsConceded ?? row.goalsAgainst ?? 0)),
    totalPoints: row.totalPoints ?? row.points ?? 0,
  }));
}

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
        return normalizeStandingRows(res.data);
      }
    }

    // Try root /standings endpoint
    const rootRes = await fetchApi<TournamentStandingRow[]>('/standings');
    if (rootRes?.success && Array.isArray(rootRes.data) && rootRes.data.length > 0) {
      return normalizeStandingRows(rootRes.data);
    }

    return MOCK_STANDINGS;
  },

  async getLeaderboard(): Promise<TournamentStandingRow[]> {
    const res = await fetchApi<TournamentStandingRow[]>('/leaderboard');
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      return normalizeStandingRows(res.data);
    }
    return MOCK_STANDINGS;
  },
};

