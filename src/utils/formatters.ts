export function formatTime(seconds: number | undefined | null): string {
  if (seconds === undefined || seconds === null || isNaN(seconds)) return '00:00';
  const clamped = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatShortDate(dateString: string | undefined): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }).toUpperCase();
  } catch {
    return dateString;
  }
}

export function getStageDisplay(stage: string | undefined): { label: string; short: string; isLive: boolean } {
  if (!stage) return { label: 'Upcoming', short: 'UP', isLive: false };
  const lower = stage.toLowerCase();
  if (lower.includes('first')) return { label: 'First Half', short: '1H', isLive: true };
  if (lower.includes('transition')) return { label: 'Transition', short: 'TRANS', isLive: true };
  if (lower.includes('half-time') || lower.includes('halftime')) return { label: 'Half-Time Break', short: 'HT', isLive: true };
  if (lower.includes('second')) return { label: 'Second Half', short: '2H', isLive: true };
  if (lower.includes('penalty') || lower.includes('shootout')) return { label: 'Penalty Shootout', short: 'PEN', isLive: true };
  if (lower.includes('completed') || lower.includes('ft')) return { label: 'Full Time', short: 'FT', isLive: false };
  return { label: stage, short: stage.slice(0, 3).toUpperCase(), isLive: false };
}

export function getCaptainDisplayName(captain?: unknown): string {
  if (!captain) return 'Unassigned';
  if (typeof captain === 'string') return captain;
  if (typeof captain === 'object' && captain !== null) {
    const c = captain as { name?: string; jerseyNumber?: number };
    if (c.name) {
      return c.jerseyNumber ? `${c.name} (#${c.jerseyNumber})` : c.name;
    }
  }
  return 'Team Captain';
}

export function getTeamName(team?: unknown): string {
  if (!team) return 'Team';
  if (typeof team === 'string') return team;
  if (typeof team === 'object' && team !== null) {
    const t = team as { name?: string };
    if (t.name) return t.name;
  }
  return 'Team';
}


