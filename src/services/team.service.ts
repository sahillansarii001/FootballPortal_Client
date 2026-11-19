import { Player, Team } from '@/types';
import { fetchApi } from './api';
import { MOCK_PLAYERS, MOCK_TEAMS } from './mockData';

export const teamService = {
  async getAllTeams(): Promise<Team[]> {
    const res = await fetchApi<Team[]>('/teams');
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    return MOCK_TEAMS;
  },

  async getTeamById(id: string): Promise<Team | null> {
    const res = await fetchApi<Team>(`/teams/${id}`);
    if (res?.success && res.data) {
      return res.data;
    }
    const found = MOCK_TEAMS.find((t) => t._id === id || t.name.toLowerCase().includes(id.toLowerCase()));
    return found || MOCK_TEAMS[0];
  },

  async getTeamPlayers(teamId: string): Promise<Player[]> {
    const res = await fetchApi<Player[]>(`/teams/${teamId}/players`);
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    return MOCK_PLAYERS.filter((p) => {
      if (typeof p.team === 'object' && p.team) {
        return p.team._id === teamId || p.team.name.toLowerCase().includes(teamId.toLowerCase());
      }
      return p.team === teamId;
    });
  },

  async getTeamStats(teamId: string): Promise<any> {
    const res = await fetchApi<any>(`/teams/${teamId}/stats`);
    if (res?.success && res.data) {
      return res.data;
    }
    const team = await this.getTeamById(teamId);
    return team?.stats || MOCK_TEAMS[0].stats;
  },
};
