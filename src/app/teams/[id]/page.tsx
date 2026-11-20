'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Shield,
  Users,
  Trophy,
  Activity,
  Award,
  Medal,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { Team, Player } from '@/types';
import { teamService } from '@/services/team.service';
import { playerService } from '@/services/player.service';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { getCaptainDisplayName } from '@/utils/formatters';

export default function TeamDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params?.id as string;

  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeamData() {
      if (!teamId) return;
      setLoading(true);
      try {
        const [teamData, allPlayers] = await Promise.all([
          teamService.getTeamById(teamId),
          playerService.getAllPlayers().catch(() => [])
        ]);

        if (teamData) {
          setTeam(teamData);
          // Filter players for this team
          const teamRoster = allPlayers.filter((p) => {
            const pTeamId = typeof p.team === 'object' && p.team ? p.team._id : p.team;
            const pTeamName = typeof p.team === 'object' && p.team ? p.team.name : '';
            return (
              pTeamId === teamData._id ||
              pTeamName.toLowerCase() === teamData.name.toLowerCase() ||
              (teamData.players && teamData.players.some((tp: any) => (tp._id || tp) === p._id))
            );
          });
          setPlayers(teamRoster);
        }
      } catch (err) {
        console.error('Failed to load team details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTeamData();
  }, [teamId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <LoadingState message="Loading team roster & match pack..." />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyState
          title="Team Not Found"
          description="The requested university squad could not be located in the tournament records."
          action={
            <Link
              href="/teams"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-container text-white font-bold rounded-xl text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Teams</span>
            </Link>
          }
        />
      </div>
    );
  }

  const captainName = getCaptainDisplayName(team.captain || (team as any).captainName);
  const stats = team.stats || {
    matchesPlayed: team.matchesPlayed ?? 0,
    matchesWon: team.matchesWon ?? 0,
    matchesLost: team.matchesLost ?? 0,
    goalsScored: team.goalsScored ?? 0,
    goalsConceded: team.goalsConceded ?? 0,
    goalDifference: team.goalDifference ?? 0,
    totalPoints: team.totalPoints ?? 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      {/* Breadcrumb / Back button */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/teams"
          className="inline-flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-on-surface bg-surface-container-low px-3.5 py-1.5 rounded-xl border border-surface-container transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Teams</span>
        </Link>
        <Link
          href="/players"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-container hover:underline"
        >
          <span>View All Tournament Athletes</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Hero Header */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 border border-surface-container-high shadow-xs mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-primary-container/15 text-primary-container font-black text-3xl flex items-center justify-center ring-4 ring-primary-container/20 shadow-sm">
              {team.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <span className="px-2.5 py-0.5 rounded-md bg-secondary-container/50 text-on-secondary-container font-label-caps text-xs font-bold">
                  {team.seed ? String(team.seed) : 'TEAM CONTENDER'}
                </span>
                <span className="text-xs font-bold text-primary-container flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Verified Collegiate Program</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
                {team.name}
              </h1>
              <p className="text-sm text-on-surface-variant font-medium mt-1">
                Captain: <span className="text-on-surface font-bold">{captainName}</span> • Club: <span className="font-semibold">{team.club || 'Independent Club'}</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 bg-surface-container-low p-4 rounded-xl border border-surface-container text-center">
            <div>
              <div className="text-[10px] uppercase font-bold text-on-surface-variant">Record</div>
              <div className="text-xl font-black text-on-surface tabular-nums">
                {stats.matchesWon}-{stats.matchesLost}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-on-surface-variant">Diff</div>
              <div className={`text-xl font-black tabular-nums ${stats.goalDifference >= 0 ? 'text-primary-container' : 'text-error'}`}>
                {stats.goalDifference > 0 ? `+${stats.goalDifference}` : stats.goalDifference}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-on-surface-variant">Points</div>
              <div className="text-xl font-black text-primary-container tabular-nums">
                {stats.totalPoints} PTS
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Squad Roster Section */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 border border-surface-container-high shadow-xs mb-8">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-surface-container">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-primary-container" />
            <h2 className="text-lg font-black text-on-surface uppercase tracking-wide">
              Official Squad Roster ({players.length} Athletes)
            </h2>
          </div>
          <Link
            href="/admin/players"
            className="text-xs font-bold text-primary-container hover:underline flex items-center gap-1"
          >
            <span>Manage Players</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {players.length === 0 ? (
          <div className="text-center py-12 bg-surface-container-low/40 rounded-xl border border-surface-container">
            <Users className="w-10 h-10 text-on-surface-variant/40 mx-auto mb-2" />
            <p className="text-sm font-bold text-on-surface">No athletes currently assigned</p>
            <p className="text-xs text-on-surface-variant mt-1">
              Add players to this team through the Player Management panel.
            </p>
            <Link
              href="/admin/players"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-primary-container text-white text-xs font-bold rounded-xl"
            >
              + Add Athlete
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {players.map((p) => (
              <div
                key={p._id}
                className="bg-surface-container-low rounded-xl p-4 border border-surface-container hover:border-primary-container/40 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-10 h-10 rounded-xl bg-primary-container/15 text-primary-container font-black text-sm flex items-center justify-center shrink-0">
                    #{p.jerseyNumber ?? '??'}
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-sm text-on-surface truncate">{p.name}</div>
                    <div className="text-[11px] font-medium text-on-surface-variant">{p.position || 'Forward'}</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-extrabold text-primary-container bg-primary-container/10 px-2 py-0.5 rounded-full">
                    {p.goals ?? 0} Goals
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Match Pack & Tactical Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-high shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-primary-container" />
            <h3 className="text-base font-black text-on-surface">Match Pack Information</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-surface-container">
              <span className="text-on-surface-variant font-medium">Head Coach / Captain:</span>
              <span className="font-bold text-on-surface">{captainName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-surface-container">
              <span className="text-on-surface-variant font-medium">Club Affiliation:</span>
              <span className="font-bold text-on-surface">{team.club || 'Football Association'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-surface-container">
              <span className="text-on-surface-variant font-medium">Official Squad Size:</span>
              <span className="font-bold text-primary-container">{players.length} Registered</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-high shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary-container" />
            <h3 className="text-base font-black text-on-surface">Tournament Performance</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-surface-container">
              <span className="text-on-surface-variant font-medium">Goals Scored:</span>
              <span className="font-bold text-primary-container">{stats.goalsScored}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-surface-container">
              <span className="text-on-surface-variant font-medium">Goals Conceded:</span>
              <span className="font-bold text-error">{stats.goalsConceded}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-surface-container">
              <span className="text-on-surface-variant font-medium">Goal Difference:</span>
              <span className="font-bold text-on-surface">
                {stats.goalDifference > 0 ? `+${stats.goalDifference}` : stats.goalDifference}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
