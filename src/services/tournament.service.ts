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
    try {
      const [matchesRes, teamsRes, playersRes] = await Promise.all([
        fetchApi<any[]>('/matches'),
        fetchApi<any[]>('/teams'),
        fetchApi<any[]>('/players'),
      ]);

      const matches = matchesRes?.success && Array.isArray(matchesRes.data) ? matchesRes.data : [];
      const teams = teamsRes?.success && Array.isArray(teamsRes.data) ? teamsRes.data : [];
      const players = playersRes?.success && Array.isArray(playersRes.data) ? playersRes.data : [];

      if (matches.length > 0 || teams.length > 0) {
        const completed = matches.filter((m: any) => m.status === 'Completed').length;
        const live = matches.filter((m: any) => m.status === 'Live' || m.status === 'Half-Time' || m.status === 'Penalty Shootout').length;
        const upcoming = matches.filter((m: any) => m.status === 'Upcoming').length;
        const totalGoals = matches.reduce((sum: number, m: any) => sum + (m.score?.teamA ?? m.teamAScore ?? 0) + (m.score?.teamB ?? m.teamBScore ?? 0), 0) ||
                           players.reduce((sum: number, p: any) => sum + (p.goals || 0), 0);
        const goalsPerMatch = completed > 0 ? (totalGoals / completed).toFixed(2) : '0.00';

        return {
          totalTeams: teams.length,
          totalPlayers: players.length,
          totalMatches: matches.length,
          completedMatches: completed,
          upcomingMatches: upcoming,
          liveMatches: live,
          totalGoals,
          goalsPerMatch,
        };
      }
    } catch {
      // fallback to mock if network/server unavailable
    }
    return MOCK_OVERVIEW_STATS;
  },
};
