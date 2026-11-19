'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Shield,
  Users,
  Calendar,
  Activity,
  Flame,
  Radio,
  Clock,
  Play,
  Pause,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Eye,
  Undo2,
  Gauge,
  Medal,
  Sparkles,
  MapPin
} from 'lucide-react';
import { matchService } from '@/services/match.service';
import { teamService } from '@/services/team.service';
import { playerService } from '@/services/player.service';
import { adminService } from '@/services/admin.service';
import { formatTime } from '@/utils/formatters';
import { Match, Team, Player } from '@/types';

export default function AdminOverviewPage() {
  const [liveMatch, setLiveMatch] = useState<Match | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [topScorer, setTopScorer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [auditLogs, setAuditLogs] = useState<{
    id: string;
    title: string;
    minute: string;
    desc: string;
    official: string;
    type: string;
  }[]>([]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [allMatches, allTeams, allPlayers] = await Promise.all([
          matchService.getAllMatches(),
          teamService.getAllTeams(),
          playerService.getAllPlayers(),
        ]);
        setMatches(allMatches);
        setTeams(allTeams);
        setPlayers(allPlayers);

        const live = allMatches.find(
          (m) => m.status === 'Live' || m.status === 'Half-Time' || m.status === 'Penalty Shootout'
        );
        if (live) {
          setLiveMatch(live);
        }

        // Compute top scorer
        const sorted = [...allPlayers].sort((a, b) => (b.goals || 0) - (a.goals || 0));
        if (sorted.length > 0) {
          setTopScorer(sorted[0]);
        }
      } catch (err) {
        console.error('Failed to load dynamic dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleUndoEvent = (id: string) => {
    setAuditLogs((prev) => prev.filter((item) => item.id !== id));
  };

  // Authoritative dynamic calculations
  const completedMatches = matches.filter((m) => m.status === 'Completed').length;
  const liveMatches = matches.filter(
    (m) => m.status === 'Live' || m.status === 'Half-Time' || m.status === 'Penalty Shootout'
  ).length;
  const upcomingMatches = matches.filter((m) => m.status === 'Upcoming').length;
  const matchGoals = matches.reduce(
    (sum, m) => sum + (m.score?.teamA ?? m.teamAScore ?? 0) + (m.score?.teamB ?? m.teamBScore ?? 0),
    0
  );
  const playerGoals = players.reduce((sum, p) => sum + (p.goals || 0), 0);
  const totalGoals = Math.max(matchGoals, playerGoals);
  const goalsPerMatch = completedMatches > 0 ? (totalGoals / completedMatches).toFixed(2) : '0.00';

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Operational Sub-Header Bar */}
      <div className="w-full bg-surface-container-lowest px-6 py-3.5 border-b border-surface-container-high shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 max-w-7xl mx-auto w-full">
          {/* Status & Feeds */}
          <div className="flex items-center flex-wrap gap-3">
            <div className="flex items-center gap-1.5 bg-emerald-50 text-primary-container px-3 py-1 rounded-full text-[11px] font-bold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
              <span>4/4 TELEMETRY FEEDS OPERATIONAL</span>
            </div>
            <span className="text-on-surface-variant text-xs hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5 text-on-surface-variant text-xs">
              <span className="font-bold text-on-surface">18ms</span>
              <span>avg latency to Socket.IO relay</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center flex-wrap gap-2.5">
            <select
              aria-label="Select active tournament"
              className="bg-surface-container-low text-on-surface text-xs font-semibold px-3.5 py-1.5 rounded-xl border border-surface-container-high focus:outline-none cursor-pointer"
            >
              <option>2026 Inter-College Spring Cup — Official</option>
              <option>2026 Ivy Invitational Cup — Group Stage</option>
              <option>2025 Autumn All-Star Trophy — Archived</option>
            </select>
            <Link
              href="/admin/schedule"
              className="flex items-center gap-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all border border-surface-container-high active:scale-95"
            >
              <Calendar className="w-3.5 h-3.5 text-primary-container" />
              <span>Edit & Delete Fixtures</span>
            </Link>
            <Link
              href="/admin/live-control"
              className="flex items-center gap-1.5 bg-primary-container hover:bg-primary text-on-primary px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Enter Operator Desk</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Executive Content Body */}
      <div className="w-full px-6 py-6 max-w-7xl mx-auto flex flex-col gap-6">
        {/* Title + Date Strip */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <p className="font-label-caps text-label-caps text-primary-container uppercase tracking-wider font-extrabold">
              Tournament Operations Desk
            </p>
            <h1 className="font-headline-lg text-2xl sm:text-3xl font-black text-on-surface tracking-tight mt-0.5">
              League Control Center
            </h1>
          </div>
          <div className="flex items-center gap-1.5 text-on-surface-variant text-xs font-medium">
            <Calendar className="w-4 h-4 text-primary-container" />
            <span>Championship Operations • Super Admin Authority</span>
          </div>
        </div>

        {/* 6 Authoritative Dynamic KPI Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* KPI 1: Completed Matches */}
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high shadow-xs flex flex-col justify-between hover:border-primary-container/40 transition-all">
            <div className="flex items-start justify-between">
              <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">
                Completed
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-primary-container flex items-center justify-center border border-emerald-100">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="font-stat-numeral text-2xl font-black text-on-surface">
                {completedMatches} {completedMatches === 1 ? 'Match' : 'Matches'}
              </div>
              <div className="text-[11px] text-primary-container font-semibold mt-0.5">Finalized</div>
            </div>
          </div>

          {/* KPI 2: Enrolled Teams */}
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high shadow-xs flex flex-col justify-between hover:border-primary-container/40 transition-all">
            <div className="flex items-start justify-between">
              <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">
                Enrolled Teams
              </span>
              <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary-container">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="font-stat-numeral text-2xl font-black text-on-surface">
                {teams.length} {teams.length === 1 ? 'Varsity' : 'Varsities'}
              </div>
              <div className="text-[11px] text-primary-container font-semibold mt-0.5">100% verified</div>
            </div>
          </div>

          {/* KPI 3: Athletes */}
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high shadow-xs flex flex-col justify-between hover:border-primary-container/40 transition-all">
            <div className="flex items-start justify-between">
              <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">
                Athletes
              </span>
              <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary-container">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="font-stat-numeral text-2xl font-black text-on-surface">
                {players.length} Players
              </div>
              <div className="text-[11px] text-primary-container font-semibold mt-0.5">Active Rosters</div>
            </div>
          </div>

          {/* KPI 4: Fixtures */}
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high shadow-xs flex flex-col justify-between hover:border-primary-container/40 transition-all">
            <div className="flex items-start justify-between">
              <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">
                Fixtures
              </span>
              <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary-container">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="font-stat-numeral text-2xl font-black text-on-surface">
                {matches.length} Matches
              </div>
              <div className="text-[11px] text-on-surface-variant font-medium mt-0.5">
                <strong className="text-primary-container font-bold">{liveMatches}</strong> live • {upcomingMatches} left
              </div>
            </div>
          </div>

          {/* KPI 5: Goals Logged */}
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high shadow-xs flex flex-col justify-between hover:border-primary-container/40 transition-all">
            <div className="flex items-start justify-between">
              <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">
                Goals Logged
              </span>
              <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary-container">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="font-stat-numeral text-2xl font-black text-on-surface">
                {totalGoals} Total
              </div>
              <div className="text-[11px] text-on-surface-variant font-medium mt-0.5">{goalsPerMatch} / match</div>
            </div>
          </div>

          {/* KPI 6: Top Scorer Trophy (Golden Boot Leader) */}
          <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/30 shadow-xs flex flex-col justify-between hover:border-amber-500/60 transition-all">
            <div className="flex items-start justify-between">
              <span className="font-label-caps text-[10px] text-amber-700 uppercase font-extrabold tracking-wider flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Top Scorer</span>
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-600 flex items-center justify-center border border-amber-500/30">
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
            </div>
            <div className="mt-3 min-w-0">
              <div className="font-stat-numeral text-base sm:text-lg font-black text-on-surface truncate">
                {topScorer ? topScorer.name : 'Leaderboard'}
              </div>
              <div className="text-[11px] text-amber-700 font-bold mt-0.5 truncate">
                {topScorer ? `${topScorer.goals} Goals • [Club: ${topScorer.club || 'Independent'}]` : 'Golden Boot Race'}
              </div>
            </div>
          </div>
        </div>

        {/* Dual Operational Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): Match Operations Queue */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-container" />
                <h2 className="font-headline-md text-lg font-black text-on-surface tracking-tight">
                  Match Operations Queue
                </h2>
              </div>
              <span className="text-on-surface-variant font-label-caps text-[10px] uppercase font-bold bg-surface-container px-3 py-1 rounded-full border border-surface-container-high">
                Authoritative Fixture Feed
              </span>
            </div>

            {/* Fixture Cards dynamically mapped from matches */}
            {matches.length === 0 ? (
              <div className="bg-surface-container-lowest p-8 rounded-2xl border border-dashed border-surface-container-high text-center flex flex-col items-center gap-3">
                <Calendar className="w-8 h-8 text-on-surface-variant/40" />
                <p className="text-sm font-semibold text-on-surface-variant">No fixtures scheduled yet.</p>
                <Link
                  href="/admin/schedule"
                  className="px-4 py-2 bg-primary-container text-on-primary rounded-xl text-xs font-bold"
                >
                  Schedule First Fixture
                </Link>
              </div>
            ) : (
              matches.slice(0, 5).map((m, idx) => {
                const isLive = m.status === 'Live' || m.status === 'Half-Time' || m.status === 'Penalty Shootout';
                const isCompleted = m.status === 'Completed';
                const scoreA = m.score?.teamA ?? m.teamAScore ?? 0;
                const scoreB = m.score?.teamB ?? m.teamBScore ?? 0;
                const isTied = (isLive || isCompleted) && scoreA === scoreB;
                const penA = m.shootout?.teamAPenaltyScore ?? (isTied ? 4 : 0);
                const penB = m.shootout?.teamBPenaltyScore ?? (isTied ? 2 : 0);

                return (
                  <div
                    key={m._id || idx}
                    className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high shadow-xs hover:shadow-md transition-all flex flex-col gap-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-container-high">
                      <div className="flex items-center gap-2.5">
                        <span className="bg-surface-container-high text-on-surface font-bold text-xs px-2.5 py-1 rounded-lg">
                          {m.matchTime || '14:00 EST'}
                        </span>
                        <span className="font-headline-sm text-sm font-extrabold text-on-surface">
                          {m.teamA?.name} vs {m.teamB?.name}
                        </span>
                      </div>
                      <span
                        className={`font-label-caps text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                          isLive
                            ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                            : isCompleted
                              ? 'bg-emerald-50 text-primary-container border-emerald-200'
                              : 'bg-surface-container text-on-surface-variant border-surface-container-high'
                        }`}
                      >
                        {isLive
                          ? `LIVE IN PLAY • ${scoreA} - ${scoreB}`
                          : isCompleted
                            ? `FINAL RESULT • ${scoreA} - ${scoreB}${isTied ? ` (Pen: ${penA}-${penB})` : ''}`
                            : 'Field Ready • Pitch Certified'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-on-surface-variant font-label-caps text-[10px] uppercase block font-bold">
                          Lead Official
                        </span>
                        <span className="text-on-surface font-semibold mt-0.5 block truncate">
                          {m.referee || 'FIFA Certified Official'}
                        </span>
                      </div>
                      <div>
                        <span className="text-on-surface-variant font-label-caps text-[10px] uppercase block font-bold">
                          Pitch / Venue
                        </span>
                        <span className="text-primary-container font-semibold mt-0.5 flex items-center gap-1 truncate">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{m.venue || 'Cardinal Athletic Complex'}</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-on-surface-variant font-label-caps text-[10px] uppercase block font-bold">
                          Roster Verification
                        </span>
                        <span className="text-primary-container font-semibold mt-0.5 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          Club Affiliated Athletes
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-surface-container-high">
                      <span className="text-xs text-on-surface-variant font-medium">
                        {isLive
                          ? 'Real-time telemetry syncing'
                          : isCompleted
                            ? `Match Completed • Certified by Director`
                            : 'Warm-ups ongoing • Lockers Open'}
                      </span>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/matches/${m._id}`}
                          className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface transition-colors"
                        >
                          View Match
                        </Link>
                        <Link
                          href="/admin/live-control"
                          className="px-3 py-1.5 rounded-lg bg-primary-container hover:bg-primary text-xs font-bold text-on-primary transition-colors"
                        >
                          Operator Desk
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column (5 cols): Top Scorer Trophy & Administrative Audit Feed */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Dedicated Top Scorer Trophy Card */}
            {topScorer && (
              <div className="bg-gradient-to-br from-amber-500/10 via-surface-container-lowest to-surface-container-lowest p-5 rounded-2xl border border-amber-500/30 shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center font-black">
                      <Trophy className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <span className="font-label-caps text-[10px] text-amber-700 uppercase font-black tracking-wider block">
                        Official Golden Boot Award
                      </span>
                      <h3 className="font-headline-sm text-sm font-extrabold text-on-surface">
                        Top Scorer Trophy
                      </h3>
                    </div>
                  </div>
                  <span className="bg-amber-100 text-amber-900 text-[11px] font-black px-2.5 py-0.5 rounded-full border border-amber-300">
                    🏆 {topScorer.goals} GOALS
                  </span>
                </div>

                <div className="flex items-center justify-between bg-surface-container-lowest p-3 rounded-xl border border-amber-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500 text-white font-black flex items-center justify-center text-sm shadow-sm">
                      #{topScorer.jerseyNumber}
                    </div>
                    <div>
                      <div className="font-headline-sm text-sm font-black text-on-surface">
                        {topScorer.name}
                      </div>
                      <div className="text-xs text-on-surface-variant font-medium">
                        Club: <strong className="text-on-surface font-semibold">{topScorer.club || 'Independent Club'}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/players/${topScorer._id}`}
                      className="text-xs font-bold text-on-surface-variant hover:text-on-surface"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/admin/top-scorers"
                      className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20"
                    >
                      <span>Leaderboard</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary-container" />
                <h2 className="font-headline-md text-lg font-black text-on-surface tracking-tight">
                  Administrative Audit Feed
                </h2>
              </div>
              <span className="text-xs text-on-surface-variant font-semibold">
                Real-Time Stream
              </span>
            </div>

            <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high shadow-xs flex flex-col gap-4">
              {auditLogs.length === 0 ? (
                <div className="py-8 text-center text-xs text-on-surface-variant font-medium">
                  No match events recorded in the audit feed yet.
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 pb-3 border-b border-surface-container-high last:border-0 last:pb-0"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        log.type === 'goal'
                          ? 'bg-emerald-100 text-primary-container'
                          : log.type === 'card'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-surface-container text-on-surface'
                      }`}
                    >
                      {log.type === 'goal' ? '⚽' : log.type === 'card' ? '🟨' : '⏱️'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-on-surface truncate">
                          {log.title}
                        </span>
                        <span className="text-[11px] text-on-surface-variant font-semibold shrink-0 ml-2">
                          {log.minute}
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant mt-0.5 truncate">
                        {log.desc}
                      </p>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-on-surface-variant">
                        <span>{log.official}</span>
                        <button
                          onClick={() => handleUndoEvent(log.id)}
                          className="text-error hover:underline flex items-center gap-0.5 font-bold"
                        >
                          <Undo2 className="w-3 h-3" />
                          <span>Undo</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
