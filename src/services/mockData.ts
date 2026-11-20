import { Match, Player, Team, Tournament, TournamentOverviewStats, TournamentStandingRow } from '@/types';

export const MOCK_TOURNAMENT: Tournament = {
  _id: 'default-tournament',
  name: 'Alliance Premier League',
  description: 'Official Collegiate Football Championship',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  status: 'Ongoing',
  rules: {
    halfDurationSeconds: 240,
    transitionDurationSeconds: 20,
    halfTimeDurationSeconds: 120,
    initialPenaltyKicks: 3,
    pointsForWin: 1,
    pointsForLoss: 0,
  },
};

export const MOCK_TEAMS: Team[] = [];

export const MOCK_PLAYERS: Player[] = [];

export const MOCK_MATCHES: Match[] = [];

export const MOCK_LIVE_MATCH: Match | null = null as any;

export const MOCK_STANDINGS: TournamentStandingRow[] = [];

export const MOCK_TIMELINE_EVENTS: any[] = [];
export const MOCK_EVENTS: any[] = [];
export const MOCK_GOALS: any[] = [];

export const MOCK_OVERVIEW_STATS: TournamentOverviewStats = {
  totalTeams: 0,
  totalPlayers: 0,
  totalMatches: 0,
  completedMatches: 0,
  upcomingMatches: 0,
  liveMatches: 0,
  totalGoals: 0,
  goalsPerMatch: '0.00',
};
