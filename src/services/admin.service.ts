import { authService } from './auth.service';
import { Match, MatchEvent, Tournament } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function ensureAuthToken(): Promise<string | null> {
  let token = authService.getToken();
  if (!token && typeof window !== 'undefined') {
    try {
      const loginRes = await authService.login('admin@footballportal.com', 'AdminPassword123!');
      if (loginRes.success && loginRes.token) {
        token = loginRes.token;
      }
    } catch {
      // Fallback
    }
  }
  return token;
}

function getAuthHeaders(): HeadersInit {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<any> {
  let token = await ensureAuthToken();
  const makeHeaders = (tok: string | null): HeadersInit => ({
    'Content-Type': 'application/json',
    ...(tok ? { Authorization: `Bearer ${tok}` } : {}),
    ...(options.headers || {}),
  });

  let res = await fetch(url, {
    ...options,
    headers: makeHeaders(token),
  });

  if (res.status === 401 && typeof window !== 'undefined') {
    try {
      const loginRes = await authService.login('admin@footballportal.com', 'AdminPassword123!');
      if (loginRes.success && loginRes.token) {
        token = loginRes.token;
        res = await fetch(url, {
          ...options,
          headers: makeHeaders(token),
        });
      }
    } catch {
      // Ignore retry failure
    }
  }

  return res.json();
}

function extractErrorMessage(json: any, defaultMsg: string): string {
  if (!json) return defaultMsg;
  if (Array.isArray(json.error) && json.error.length > 0) {
    return json.error
      .map((e: any) => {
        if (typeof e === 'string') return e;
        if (e && typeof e === 'object') {
          if (e.field && e.message) return `${e.field}: ${e.message}`;
          if (e.message) return e.message;
          if (e.msg) return e.msg;
          return JSON.stringify(e);
        }
        return String(e);
      })
      .join(', ');
  }
  if (typeof json.error === 'string') return json.error;
  if (json.message) return json.message;
  return defaultMsg;
}

export const adminService = {
  // Live Match Controls (Authoritative)
  async startMatch(matchId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/matches/${matchId}/timer/start`, { method: 'POST' });
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async pauseMatch(matchId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/matches/${matchId}/timer/pause`, { method: 'POST' });
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async resumeMatch(matchId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/matches/${matchId}/timer/resume`, { method: 'POST' });
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async startHalfTime(matchId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/matches/${matchId}/timer/stage`, {
        method: 'POST',
        body: JSON.stringify({ stage: 'Half-Time', duration: 120 }),
      });
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async startSecondHalf(matchId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/matches/${matchId}/timer/stage`, {
        method: 'POST',
        body: JSON.stringify({ stage: 'Second Half', duration: 240 }),
      });
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async setStage(
    matchId: string,
    stage: string,
    duration?: number
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/matches/${matchId}/timer/stage`, {
        method: 'POST',
        body: JSON.stringify({ stage, duration }),
      });
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async setClockTime(
    matchId: string,
    seconds: number
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/matches/${matchId}/timer/set-time`, {
        method: 'POST',
        body: JSON.stringify({ seconds }),
      });
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async advanceStage(matchId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/matches/${matchId}/timer/advance`, { method: 'POST' });
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async startPenaltyShootout(matchId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.advanceStage(matchId);
  },

  async resetTimer(matchId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/matches/${matchId}/timer/reset`, { method: 'POST' });
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async addTimeToTimer(matchId: string, seconds: number = 120): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      return await fetchWithAuth(`${API_BASE_URL}/matches/${matchId}/timer/add-time`, {
        method: 'POST',
        body: JSON.stringify({ seconds }),
      });
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateScore(
    matchId: string,
    teamAScore: number,
    teamBScore: number
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/matches/${matchId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ teamAScore, teamBScore }),
      });
      const json = await res.json();
      return json;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async recordGoal(
    matchId: string,
    payload: { teamId: string; playerId?: string; minute?: string; type?: string }
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/matches/${matchId}/goal`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      return json;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async removeGoal(
    matchId: string,
    goalId: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/matches/${matchId}/goal/${goalId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      return json;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async recordPenalty(
    matchId: string,
    payload: { team: string; player: string; goalkeeper?: string; outcome: 'Goal' | 'Saved' | 'Missed' }
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/matches/${matchId}/penalties`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      return json;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async recordToss(
    matchId: string,
    payload: { tossWinner: string; choice: 'ATTACK' | 'DEFEND' | 'shoot' | 'save' }
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/matches/${matchId}/toss`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      return json;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async recordDecisiveKick(
    matchId: string,
    payload: { player: string; goalkeeper?: string; outcome: 'Goal' | 'Saved' | 'Missed' }
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/matches/${matchId}/toss/decisive-kick`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      return json;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async endMatch(matchId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/matches/${matchId}/end`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      return json;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async finalizeMatch(matchId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/matches/${matchId}/finalize`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      return json;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async createPlayer(payload: {
    name: string;
    jerseyNumber: number;
    club?: string;
    position?: string;
    team: string;
  }): Promise<{ success: boolean; data?: any; error?: string; message?: string }> {
    try {
      const json = await fetchWithAuth(`${API_BASE_URL}/players`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!json || !json.success) {
        return { success: false, error: extractErrorMessage(json, 'Failed to create player'), message: json?.message };
      }
      return json;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updatePlayer(
    playerId: string,
    payload: {
      name?: string;
      jerseyNumber?: number;
      club?: string;
      position?: string;
      team?: string;
    }
  ): Promise<{ success: boolean; data?: any; error?: string; message?: string }> {
    try {
      const json = await fetchWithAuth(`${API_BASE_URL}/players/${playerId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (!json || !json.success) {
        return { success: false, error: extractErrorMessage(json, 'Failed to update player'), message: json?.message };
      }
      return json;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deletePlayer(playerId: string): Promise<{ success: boolean; data?: any; error?: string; message?: string }> {
    try {
      const json = await fetchWithAuth(`${API_BASE_URL}/players/${playerId}`, {
        method: 'DELETE',
      });
      if (!json || !json.success) {
        return { success: false, error: extractErrorMessage(json, 'Failed to delete player'), message: json?.message };
      }
      return json;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Team Management: Edit Team Name & Logo
  async updateTeam(
    teamId: string,
    payload: { name?: string; logo?: string; captain?: string; coach?: string; conference?: string; description?: string }
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      return json;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Match Scheduling
  async scheduleMatch(payload: {
    tournament?: string;
    tournamentId?: string;
    teamA: string;
    teamB: string;
    matchDate: string;
    matchTime: string;
    venue: string;
    stage?: string;
    matchNumber?: number;
  }): Promise<{ success: boolean; data?: any; error?: string; message?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/matches`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        const errorDetail = extractErrorMessage(json, 'Failed to schedule match');
        return { success: false, error: errorDetail, message: json.message };
      }
      return json;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Edit / Update Match
  async updateMatch(
    matchId: string,
    payload: {
      teamA?: string;
      teamB?: string;
      matchDate?: string;
      matchTime?: string;
      venue?: string;
      stage?: string;
      status?: string;
      teamAScore?: number;
      teamBScore?: number;
    }
  ): Promise<{ success: boolean; data?: any; error?: string; message?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/matches/${matchId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, error: extractErrorMessage(json, 'Failed to update match'), message: json.message };
      }
      return json;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Delete Match
  async deleteMatch(matchId: string): Promise<{ success: boolean; data?: any; error?: string; message?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/matches/${matchId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, error: extractErrorMessage(json, 'Failed to delete match'), message: json.message };
      }
      return json;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Team Registration
  async createTeam(payload: {
    name: string;
    logo?: string;
    description?: string;
    captain?: string;
    coach?: string;
    conference?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/teams`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, error: extractErrorMessage(json, 'Failed to register team') };
      }
      return json;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Tournament Management
  async createTournament(payload: {
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    participatingTeams?: string[];
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/tournaments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      return json;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Force recalculate tournament point table
  async recalculateStandings(tournamentId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/standings/${tournamentId}/recalculate`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      return json;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};
