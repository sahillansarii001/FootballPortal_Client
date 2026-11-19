import { Match, MatchEvent } from '@/types';
import { fetchApi } from './api';
import { MOCK_LIVE_MATCH, MOCK_MATCHES } from './mockData';

export const matchService = {
  async getAllMatches(): Promise<Match[]> {
    const res = await fetchApi<Match[]>('/matches');
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    return MOCK_MATCHES;
  },

  async getUpcomingMatches(): Promise<Match[]> {
    const res = await fetchApi<Match[]>('/matches/upcoming');
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    return MOCK_MATCHES.filter((m) => m.status === 'Upcoming');
  },

  async getLiveMatches(): Promise<Match[]> {
    const res = await fetchApi<Match[]>('/matches/live');
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    return MOCK_MATCHES.filter((m) => m.status === 'Live' || m.status === 'Half-Time' || m.status === 'Penalty Shootout');
  },

  async getCompletedMatches(): Promise<Match[]> {
    const res = await fetchApi<Match[]>('/matches/completed');
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    return MOCK_MATCHES.filter((m) => m.status === 'Completed');
  },

  async getMatchById(id: string): Promise<Match | null> {
    const res = await fetchApi<Match>(`/matches/${id}`);
    if (res?.success && res.data) {
      return res.data;
    }
    const found = MOCK_MATCHES.find((m) => m._id === id);
    return found || MOCK_LIVE_MATCH;
  },

  async getAuthoritativeLiveState(id: string): Promise<Match | null> {
    const res = await fetchApi<Match>(`/matches/${id}/live`);
    if (res?.success && res.data) {
      return res.data;
    }
    const found = MOCK_MATCHES.find((m) => m._id === id);
    return found || MOCK_LIVE_MATCH;
  },

  async getMatchTimeline(id: string): Promise<MatchEvent[]> {
    const res = await fetchApi<MatchEvent[]>(`/matches/${id}/timeline`);
    if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    const match = MOCK_MATCHES.find((m) => m._id === id) || MOCK_LIVE_MATCH;
    return match.events || [];
  },
};
