import { authService } from './auth.service';
import { Match, MatchEvent, Tournament } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getAuthHeaders(): HeadersInit {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const adminService = {
  // Live Match Controls (Authoritative)
  async startMatch(matchId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/matches/${matchId}/start`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      return json;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async pauseMatch(matchId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/matches/${matchId}/pause`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      return json;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async resumeMatch(matchId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/matches/${matchId}/resume`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      return json;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async startHalfTime(matchId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/matches/${matchId}/halftime`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      return json;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async startSecondHalf(matchId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/matches/${matchId}/second-half`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      return json;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async advanceStage(matchId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/matches/${matchId}/timer/advance`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      return json;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async resetTimer(matchId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/matches/${matchId}/timer/reset`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      return json;
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
    payload: { teamId: string; playerId?: string; round: number; outcome: 'scored' | 'saved' | 'missed' }
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/matches/${matchId}/penalty`, {
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

  // Match Scheduling
  async scheduleMatch(payload: {
    tournamentId: string;
    teamA: string;
    teamB: string;
    matchDate: string;
    matchTime: string;
    venue: string;
    stage: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/matches`, {
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
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/matches/${matchId}`, {
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

  // Delete Match
  async deleteMatch(matchId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/matches/${matchId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const json = await res.json();
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
