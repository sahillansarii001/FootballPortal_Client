import { Player } from '@/types';
import { fetchApi } from './api';
import { MOCK_PLAYERS } from './mockData';

export const playerService = {
  async getAllPlayers(): Promise<Player[]> {
    const res = await fetchApi<Player[]>('/players');
    if (res?.success && Array.isArray(res.data)) {
      return res.data;
    }
    return MOCK_PLAYERS;
  },

  async getPlayerById(id: string): Promise<Player | null> {
    const res = await fetchApi<Player>(`/players/${id}`);
    if (res?.success && res.data) {
      return res.data;
    }
    const found = MOCK_PLAYERS.find((p) => p._id === id || p.name.toLowerCase().includes(id.toLowerCase()));
    return found || null;
  },

  async getTopScorers(limit = 10): Promise<Player[]> {
    const res = await fetchApi<Player[]>(`/leaderboard/top-scorers?limit=${limit}`);
    if (res?.success && Array.isArray(res.data)) {
      return res.data;
    }
    return [...MOCK_PLAYERS].sort((a, b) => b.goals - a.goals).slice(0, limit);
  },

  async getPlayerStats(id: string): Promise<any> {
    const res = await fetchApi<any>(`/players/${id}/stats`);
    if (res?.success && res.data) {
      return res.data;
    }
    const p = await this.getPlayerById(id);
    return {
      matchesPlayed: p?.matchesPlayed || 0,
      goals: p?.goals || 0,
      assists: p?.assists || 0,
      shots: p?.shots || 0,
      penaltiesScored: p?.penaltiesScored || 0,
      penaltiesSaved: p?.penaltiesSaved || 0,
    };
  },
};
