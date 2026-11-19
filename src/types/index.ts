export interface Tournament {
  _id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  participatingTeams?: Team[] | string[];
  rules?: {
    halfDurationSeconds: number;
    transitionDurationSeconds: number;
    halfTimeDurationSeconds: number;
    initialPenaltyKicks: number;
    pointsForWin: number;
    pointsForLoss: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Team {
  _id: string;
  name: string;
  logo?: string;
  description?: string;
  coach?: string;
  captain?: string;
  conference?: string;
  seed?: string | number;
  players?: Player[] | string[];
  stats?: {
    matchesPlayed: number;
    matchesWon: number;
    matchesLost: number;
    goalsScored: number;
    goalsConceded: number;
    goalDifference: number;
    totalPoints: number;
  };
  form?: ('W' | 'D' | 'L')[];
}

export interface Player {
  _id: string;
  name: string;
  jerseyNumber: number;
  position: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward' | string;
  team: Team | string;
  avatar?: string;
  matchesPlayed: number;
  goals: number;
  assists?: number;
  shots?: number;
  penaltiesScored?: number;
  penaltiesSaved?: number;
  wins?: number;
  losses?: number;
  goalHistory?: Array<{
    matchId: string;
    minute: string;
    type: string;
    timestamp: string;
  }>;
}

export interface MatchEventDetail {
  goalType?: string;
  isPenalty?: boolean;
  notes?: string;
  outcome?: string;
  kickNumber?: number;
}

export interface MatchEvent {
  _id?: string;
  id?: string;
  match?: string;
  tournament?: string;
  type: string;
  stage?: string;
  matchTime?: string;
  clockTime?: string;
  title?: string;
  team?: Team | { _id: string; id?: string; name: string; logo?: string };
  player?: Player | { _id: string; id?: string; name: string; jerseyNumber?: number };
  detail?: MatchEventDetail;
  timestamp: string;
  createdAt?: string;
}

export interface MatchTimerState {
  currentStage: 'First Half' | 'Transition Gap' | 'Half-Time' | 'Second Half' | 'Match Completed' | 'Penalty Shootout' | string;
  stageDuration: number;
  remainingTime: number;
  isRunning: boolean;
  isPaused: boolean;
  startedTimestamp?: string | null;
  pausedTimestamp?: string | null;
  totalPausedDuration?: number;
}

export interface PenaltyKick {
  round: number;
  kickingTeam: 'teamA' | 'teamB';
  team: string | Team;
  kicker: string | Player;
  goalkeeper: string | Player;
  outcome: 'Goal' | 'Saved' | 'Missed';
  currentScoreAfterKick: {
    teamA: number;
    teamB: number;
  };
  timestamp: string;
}

export interface PenaltyShootoutState {
  shootoutState?: {
    isShootout: boolean;
    teamAPenaltyScore: number;
    teamBPenaltyScore: number;
    round: number;
    currentTurn?: 'teamA' | 'teamB';
    isSuddenDeath?: boolean;
    isCompleted?: boolean;
    winner?: string | null;
  };
  kicks?: PenaltyKick[];
}

export interface Match {
  _id: string;
  matchNumber?: number;
  tournament: string | Tournament;
  stage?: string;
  round?: string;
  venue?: string;
  matchDate: string;
  matchTime: string;
  status: 'Upcoming' | 'Live' | 'Half-Time' | 'Completed' | 'Penalty Shootout' | string;
  teamA: Team;
  teamB: Team;
  score: {
    teamA: number;
    teamB: number;
  };
  timer?: MatchTimerState;
  currentStage?: string;
  winner?: Team | string | null;
  matchResult?: string;
  isFinalized?: boolean;
  attendance?: string | number;
  referee?: string;
  goals?: Array<{
    _id?: string;
    team: Team | { _id: string; name: string };
    player: Player | { _id: string; name: string; jerseyNumber?: number };
    matchTime: string;
    detail?: { goalType?: string };
    timestamp: string;
  }>;
  penalties?: PenaltyShootoutState;
  events?: MatchEvent[];
  stats?: {
    possessionA: number;
    possessionB: number;
    shotsOnTargetA: number;
    shotsOnTargetB: number;
    foulsA: number;
    foulsB: number;
    cornersA: number;
    cornersB: number;
    savesA: number;
    savesB: number;
  };
}

export interface TournamentStandingRow {
  _id?: string;
  position: number;
  team: Team;
  matchesPlayed: number;
  matchesWon: number;
  matchesDrawn?: number;
  matchesLost: number;
  goalsScored: number;
  goalsConceded: number;
  goalDifference: number;
  totalPoints: number;
  form?: ('W' | 'D' | 'L')[];
  qualificationZone?: 'semi' | 'wildcard' | 'relegation' | 'safe';
}

export interface TournamentOverviewStats {
  totalTeams: number;
  totalPlayers: number;
  totalMatches: number;
  completedMatches: number;
  upcomingMatches: number;
  liveMatches: number;
  totalGoals: number;
  goalsPerMatch: string;
}
