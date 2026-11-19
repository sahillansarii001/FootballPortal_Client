import { Match, MatchEvent } from '@/types';
import { fetchApi } from './api';
import { MOCK_LIVE_MATCH, MOCK_MATCHES } from './mockData';

function normalizeMatch(match: any): Match {
  if (!match) return match;
  const teamAScore = match.score?.teamA ?? match.teamAScore ?? 0;
  const teamBScore = match.score?.teamB ?? match.teamBScore ?? 0;
  return {
    ...match,
    teamAScore,
    teamBScore,
    score: {
      teamA: teamAScore,
      teamB: teamBScore,
    },
  };
}

export const matchService = {
  async getAllMatches(): Promise<Match[]> {
    const res = await fetchApi<Match[]>('/matches');
    if (res?.success && Array.isArray(res.data)) {
      return res.data.map(normalizeMatch);
    }
    return MOCK_MATCHES.map(normalizeMatch);
  },

  async getUpcomingMatches(): Promise<Match[]> {
    const res = await fetchApi<Match[]>('/matches/upcoming');
    if (res?.success && Array.isArray(res.data)) {
      return res.data.map(normalizeMatch);
    }
    return MOCK_MATCHES.filter((m) => m.status === 'Upcoming').map(normalizeMatch);
  },

  async getLiveMatches(): Promise<Match[]> {
    const res = await fetchApi<Match[]>('/matches/live');
    if (res?.success && Array.isArray(res.data)) {
      return res.data.map(normalizeMatch);
    }
    return MOCK_MATCHES.filter(
      (m) => m.status === 'Live' || m.status === 'Half-Time' || m.status === 'Penalty Shootout'
    ).map(normalizeMatch);
  },

  async getCompletedMatches(): Promise<Match[]> {
    const res = await fetchApi<Match[]>('/matches/completed');
    if (res?.success && Array.isArray(res.data)) {
      return res.data.map(normalizeMatch);
    }
    return MOCK_MATCHES.filter((m) => m.status === 'Completed').map(normalizeMatch);
  },

  async getMatchById(id: string): Promise<Match | null> {
    const res = await fetchApi<Match>(`/matches/${id}`);
    if (res?.success && res.data) {
      return normalizeMatch(res.data);
    }
    const found = MOCK_MATCHES.find((m) => m._id === id);
    return normalizeMatch(found || MOCK_LIVE_MATCH);
  },

  async getAuthoritativeLiveState(id: string): Promise<Match | null> {
    const res = await fetchApi<Match>(`/matches/${id}/live`);
    if (res?.success && res.data) {
      return normalizeMatch(res.data);
    }
    const found = MOCK_MATCHES.find((m) => m._id === id);
    return normalizeMatch(found || MOCK_LIVE_MATCH);
  },

  async getMatchTimeline(id: string): Promise<MatchEvent[]> {
    const res = await fetchApi<MatchEvent[]>(`/matches/${id}/timeline`);
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    const match = MOCK_MATCHES.find((m) => m._id === id) || MOCK_LIVE_MATCH;
    return match?.events || [];
  },
};
