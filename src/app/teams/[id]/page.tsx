'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { teamService } from '@/services/team.service';
import { matchService } from '@/services/match.service';
import { Team, Player, Match } from '@/types';
import { TeamHeader } from '@/components/teams/TeamHeader';
import { TeamStatsGrid } from '@/components/teams/TeamStatsGrid';
import { TeamRoster } from '@/components/teams/TeamRoster';
import { MatchCard } from '@/components/matches/MatchCard';
import { LoadingState } from '@/components/common/LoadingState';
import { ArrowLeft, Calendar, Trophy } from 'lucide-react';

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = (params?.id as string) || 'team-stanford';

  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeamData() {
      setLoading(true);
      const [t, p, m] = await Promise.all([
        teamService.getTeamById(teamId),
        teamService.getTeamPlayers(teamId),
        matchService.getAllMatches(),
      ]);
      setTeam(t);
      setPlayers(p);
      // Filter matches involving this team
      const teamMatches = m.filter(
        (match) => match.teamA._id === teamId || match.teamB._id === teamId || match.teamA.name === t?.name || match.teamB.name === t?.name
      );
      setMatches(teamMatches);
      setLoading(false);
    }
    loadTeamData();
  }, [teamId]);

  if (loading || !team) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <LoadingState message="Loading varsity team records..." />
      </div>
    );
  }

  const upcomingMatches = matches.filter((m) => m.status === 'Upcoming');
  const pastMatches = matches.filter((m) => m.status === 'Completed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/teams"
          className="inline-flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-primary-container transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Teams Directory</span>
        </Link>
      </div>

      {/* Header Banner */}
      <TeamHeader team={team} />

      {/* Season Stats Grid */}
      <TeamStatsGrid
        stats={
          team.stats || {
            matchesPlayed: team.matchesPlayed || 0,
            matchesWon: team.matchesWon || 0,
            matchesLost: team.matchesLost || 0,
            goalsScored: team.goalsScored || 0,
            goalsConceded: team.goalsConceded || 0,
            goalDifference: team.goalDifference || 0,
            totalPoints: team.totalPoints || 0,
          }
        }
      />

      {/* Squad Roster */}
      <TeamRoster players={players} />

      {/* Fixtures & Results for this team */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Fixtures */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-3 border-b border-surface-container">
            <Calendar className="w-5 h-5 text-primary-container" />
            <h3 className="font-headline-md text-headline-md text-on-surface font-extrabold">
              Upcoming Team Fixtures
            </h3>
          </div>
          {upcomingMatches.length === 0 ? (
            <div className="p-6 text-center text-xs text-on-surface-variant bg-surface-container-lowest rounded-xl border border-surface-container">
              No upcoming fixtures scheduled for {team.name} this week.
            </div>
          ) : (
            upcomingMatches.map((m) => <MatchCard key={m._id} match={m} />)
          )}
        </div>

        {/* Recent Results */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-3 border-b border-surface-container">
            <Trophy className="w-5 h-5 text-primary-container" />
            <h3 className="font-headline-md text-headline-md text-on-surface font-extrabold">
              Recent Match Results
            </h3>
          </div>
          {pastMatches.length === 0 ? (
            <div className="p-6 text-center text-xs text-on-surface-variant bg-surface-container-lowest rounded-xl border border-surface-container">
              No past completed matches on record.
            </div>
          ) : (
            pastMatches.map((m) => <MatchCard key={m._id} match={m} />)
          )}
        </div>
      </div>
    </div>
  );
}
