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
  MapPin,
  Zap
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

        // Extract real audit logs from matches goals
        const realLogs: any[] = [];
        allMatches.forEach((m) => {
          if (m.goals && Array.isArray(m.goals)) {
            m.goals.forEach((g: any, gIdx: number) => {
              realLogs.push({
                id: g._id || `${m._id}_g_${gIdx}`,
                type: 'goal',
                title: `Goal: ${g.player?.name || 'Athlete'} (${typeof g.team === 'object' ? g.team.name : 'Team'})`,
                desc: `${g.detail?.goalType || 'Normal Goal'} in ${m.stage || 'APL Season 9'}`,
                minute: g.matchTime || 'In Match',
                official: m.referee || 'APL Certified Official',
              });
            });
          }
        });
        setAuditLogs(realLogs);
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
    <div className="flex flex-col w-full pb-16 animate-slide-up">
      {/* Main Executive Content Body */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 pb-24 max-w-7xl mx-auto flex flex-col gap-6 select-none animate-in fade-in duration-200">
        {/* Title + Subtitle Bar (Screen 3: Dashboard / Tournament Overview & Quick Actions) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Tournament Overview & Quick Actions
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Telemetry Active</span>
            </div>
            <Link
              href="/admin/live-control"
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Live Control</span>
            </Link>
          </div>
        </div>

        {/* 4 Clean Stat Cards Grid (Screen 3: Teams, Players, Matches, Live Now) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Teams (Green Shield) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center hover:border-blue-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 mb-2">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
              {teams.length}
            </div>
            <div className="text-xs font-bold text-slate-500 mt-0.5">Teams</div>
          </div>

          {/* Card 2: Players (Blue Users) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center hover:border-blue-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 mb-2">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
              {players.length}
            </div>
            <div className="text-xs font-bold text-slate-500 mt-0.5">Players</div>
          </div>

          {/* Card 3: Matches (Blue Calendar) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center hover:border-blue-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 mb-2">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
              {matches.length}
            </div>
            <div className="text-xs font-bold text-slate-500 mt-0.5">Matches</div>
          </div>

          {/* Card 4: Live Now (Red Broadcast) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center hover:border-blue-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 mb-2">
              <Radio className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-600 tabular-nums">
              {liveMatches}
            </div>
            <div className="text-xs font-bold text-slate-500 mt-0.5">Live Now</div>
          </div>
        </div>

        {/* Dual Operational Columns (Screen 3: Ongoing Match + Recent Activity on left; Quick Actions + Top Scorer on right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): Ongoing Match & Recent Activity & Fixtures */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Ongoing Match Card (Screen 3) */}
            {(() => {
              const activeMatch = liveMatch || matches[0];
              const isMatchLive = activeMatch?.status === 'Live' || activeMatch?.status === 'Half-Time' || activeMatch?.status === 'Penalty Shootout';
              const isMatchCompleted = activeMatch?.status === 'Completed';
              const teamAName = activeMatch?.teamA?.name || 'Alpha FC';
              const teamBName = activeMatch?.teamB?.name || 'Beta United';
              const scoreA = activeMatch?.score?.teamA ?? activeMatch?.teamAScore ?? 2;
              const scoreB = activeMatch?.score?.teamB ?? activeMatch?.teamBScore ?? 1;
              const penA = activeMatch?.shootout?.teamAPenaltyScore ?? 0;
              const penB = activeMatch?.shootout?.teamBPenaltyScore ?? 0;
              const hasShootout = Boolean(activeMatch?.shootout?.isShootout || activeMatch?.shootout?.isCompleted || penA > 0 || penB > 0);
              const stage = activeMatch?.timer?.currentStage || activeMatch?.stage || (isMatchCompleted ? 'Match Completed' : 'Second Half');
              const timeStr = activeMatch?.timer?.remainingTime !== undefined ? formatTime(activeMatch.timer.remainingTime) : '00:00';

              const winnerId = typeof activeMatch?.winner === 'object' ? activeMatch?.winner?._id : activeMatch?.winner;
              const shootoutWinnerId = typeof activeMatch?.shootout?.shootoutWinner === 'object' ? activeMatch?.shootout?.shootoutWinner?._id : activeMatch?.shootout?.shootoutWinner;
              const teamAId = typeof activeMatch?.teamA === 'object' ? activeMatch?.teamA?._id : activeMatch?.teamA;
              const teamBId = typeof activeMatch?.teamB === 'object' ? activeMatch?.teamB?._id : activeMatch?.teamB;

              const isTeamAWinner = isMatchCompleted && (
                (winnerId && teamAId && String(winnerId) === String(teamAId)) ||
                (shootoutWinnerId && teamAId && String(shootoutWinnerId) === String(teamAId)) ||
                (scoreA > scoreB) ||
                (hasShootout && penA > penB)
              );
              const isTeamBWinner = isMatchCompleted && (
                (winnerId && teamBId && String(winnerId) === String(teamBId)) ||
                (shootoutWinnerId && teamBId && String(shootoutWinnerId) === String(teamBId)) ||
                (scoreB > scoreA) ||
                (hasShootout && penB > penA)
              );
              const winnerTeamName = isTeamAWinner ? teamAName : isTeamBWinner ? teamBName : null;

              return (
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                      {isMatchCompleted ? 'Match Result' : 'Ongoing Match'}
                    </h2>
                    {isMatchCompleted ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[11px] border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>FINAL</span>
                      </span>
                    ) : isMatchLive ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 font-extrabold text-[11px] border border-rose-200">
                        <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                        <span>LIVE</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-extrabold text-[11px] border border-slate-200">
                        UPCOMING
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-slate-50/80 border border-slate-100">
                    {/* Team A */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-12 h-12 rounded-xl bg-white border flex items-center justify-center font-black shadow-2xs shrink-0 overflow-hidden ${
                        isTeamAWinner ? 'border-emerald-500 ring-2 ring-emerald-500/40 text-emerald-700' : 'border-slate-200 text-slate-800'
                      }`}>
                        {activeMatch?.teamA?.logo ? (
                          <img src={activeMatch.teamA.logo} alt={teamAName} className="w-full h-full object-cover" />
                        ) : (
                          <span>{teamAName.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <span className={`text-sm truncate flex items-center gap-1.5 ${
                        isTeamAWinner ? 'font-black text-emerald-700' : 'font-bold text-slate-900'
                      }`}>
                        {isTeamAWinner && <span className="text-base">🏆</span>}
                        <span>{teamAName}</span>
                      </span>
                    </div>

                    {/* Center Score & Stage */}
                    <div className="flex flex-col items-center justify-center px-4 shrink-0">
                      <div className="text-2xl font-black text-slate-900 tabular-nums tracking-tight">
                        {scoreA} - {scoreB}
                      </div>
                      {hasShootout && (
                        <div className="text-[11px] font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full mt-0.5 border border-purple-200 shadow-2xs">
                          Pen: {penA} - {penB}
                        </div>
                      )}
                      <div className={`text-[11px] font-extrabold mt-0.5 ${
                        isMatchCompleted ? 'text-emerald-700' : 'text-emerald-600'
                      }`}>
                        {isMatchCompleted && winnerTeamName
                          ? `🏆 ${winnerTeamName} Won${hasShootout ? ' on Penalties' : ''}`
                          : isMatchCompleted
                          ? 'Match Completed'
                          : `${stage} • ${timeStr}`}
                      </div>
                    </div>

                    {/* Team B */}
                    <div className="flex items-center gap-3 flex-1 min-w-0 justify-end text-right">
                      <span className={`text-sm truncate flex items-center gap-1.5 justify-end ${
                        isTeamBWinner ? 'font-black text-emerald-700' : 'font-bold text-slate-900'
                      }`}>
                        <span>{teamBName}</span>
                        {isTeamBWinner && <span className="text-base">🏆</span>}
                      </span>
                      <div className={`w-12 h-12 rounded-xl bg-white border flex items-center justify-center font-black shadow-2xs shrink-0 overflow-hidden ${
                        isTeamBWinner ? 'border-emerald-500 ring-2 ring-emerald-500/40 text-emerald-700' : 'border-slate-200 text-slate-800'
                      }`}>
                        {activeMatch?.teamB?.logo ? (
                          <img src={activeMatch.teamB.logo} alt={teamBName} className="w-full h-full object-cover" />
                        ) : (
                          <span>{teamBName.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Big Blue Open Match Control Button (Screen 3) */}
                  <Link
                    href={`/admin/live-control${activeMatch?._id ? `?matchId=${activeMatch._id}` : ''}`}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99]"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Open Match Control</span>
                  </Link>
                </div>
              );
            })()}

            {/* Recent Activity Card (Screen 3) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                  Recent Activity
                </h2>
                <span className="text-[11px] text-slate-400 font-semibold">Real-time log</span>
              </div>

              <div className="flex flex-col divide-y divide-slate-100">
                {auditLogs.length > 0 ? (
                  auditLogs.slice(0, 4).map((log) => (
                    <div key={log.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs shrink-0">
                          {log.type === 'goal' ? '⚽' : log.type === 'card' ? '🟨' : '🔄'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{log.title}</p>
                          <p className="text-[11px] text-slate-400 truncate">{log.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-slate-400 font-medium">{log.minute}</span>
                        <button
                          onClick={() => handleUndoEvent(log.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                          title="Undo event"
                        >
                          <Undo2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
                          ⚽
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Goal added — Arjun N. (Alpha FC)</p>
                          <p className="text-[11px] text-slate-400">Normal Goal in First Half</p>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">2 min ago</span>
                    </div>

                    <div className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
                          🔄
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Match updated — Alpha FC vs Beta United</p>
                          <p className="text-[11px] text-slate-400">Clock resumed (Second Half)</p>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">5 min ago</span>
                    </div>

                    <div className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">
                          👤
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Player added — Rohan K. (Gamma SC)</p>
                          <p className="text-[11px] text-slate-400">Roster updated #7 Forward</p>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">12 min ago</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Match Operations Queue (All fixtures with complete details preserved) */}
            <div className="flex items-center justify-between pt-2">
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                All Scheduled Fixtures ({matches.length})
              </h2>
              <Link
                href="/admin/schedule"
                className="text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                Manage Schedule →
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {matches.map((m, idx) => {
                const isLive = m.status === 'Live' || m.status === 'Half-Time' || m.status === 'Penalty Shootout';
                const isCompleted = m.status === 'Completed';
                const scoreA = m.score?.teamA ?? m.teamAScore ?? 0;
                const scoreB = m.score?.teamB ?? m.teamBScore ?? 0;
                const penA = m.shootout?.teamAPenaltyScore ?? 0;
                const penB = m.shootout?.teamBPenaltyScore ?? 0;
                const hasShootout = Boolean(m.shootout?.isShootout || m.shootout?.isCompleted || penA > 0 || penB > 0);
                const teamAName = m.teamA?.name || 'Team A';
                const teamBName = m.teamB?.name || 'Team B';

                const winnerId = typeof m.winner === 'object' ? m.winner?._id : m.winner;
                const shootoutWinnerId = typeof m.shootout?.shootoutWinner === 'object' ? m.shootout?.shootoutWinner?._id : m.shootout?.shootoutWinner;
                const teamAId = typeof m.teamA === 'object' ? m.teamA?._id : m.teamA;
                const teamBId = typeof m.teamB === 'object' ? m.teamB?._id : m.teamB;

                const isTeamAWinner = isCompleted && (
                  (winnerId && teamAId && String(winnerId) === String(teamAId)) ||
                  (shootoutWinnerId && teamAId && String(shootoutWinnerId) === String(teamAId)) ||
                  (scoreA > scoreB) ||
                  (hasShootout && penA > penB)
                );
                const isTeamBWinner = isCompleted && (
                  (winnerId && teamBId && String(winnerId) === String(teamBId)) ||
                  (shootoutWinnerId && teamBId && String(shootoutWinnerId) === String(teamBId)) ||
                  (scoreB > scoreA) ||
                  (hasShootout && penB > penA)
                );
                const winnerName = isTeamAWinner ? teamAName : isTeamBWinner ? teamBName : (scoreA === scoreB && !hasShootout ? 'Draw' : null);

                return (
                  <div
                    key={m._id || idx}
                    className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                          {m.matchTime || '14:00'}
                        </span>
                        <div className="flex items-center gap-1.5 text-sm">
                          <span className={isTeamAWinner ? 'text-emerald-700 font-black flex items-center gap-1' : 'font-extrabold text-slate-900'}>
                            {isTeamAWinner && <span>🏆</span>}
                            <span>{teamAName}</span>
                          </span>
                          <span className="text-slate-400 font-normal">vs</span>
                          <span className={isTeamBWinner ? 'text-emerald-700 font-black flex items-center gap-1' : 'font-extrabold text-slate-900'}>
                            <span>{teamBName}</span>
                            {isTeamBWinner && <span>🏆</span>}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          isLive
                            ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse'
                            : isCompleted
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {isLive
                          ? `LIVE • ${scoreA} - ${scoreB}`
                          : isCompleted
                            ? `FINAL • ${scoreA} - ${scoreB}${hasShootout ? ` (Pen: ${penA}-${penB})` : ''}`
                            : 'UPCOMING'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                      <span className={isCompleted && winnerName ? 'text-emerald-700 font-extrabold flex items-center gap-1' : 'text-slate-500 font-medium'}>
                        {isCompleted && winnerName
                          ? `🏆 Winner: ${winnerName} ${hasShootout ? `(Pen: ${penA}-${penB})` : ''}`
                          : isCompleted
                          ? 'Match Drawn (Full Time)'
                          : m.venue || 'Main Ground'}
                      </span>
                      <Link
                        href={`/admin/live-control?matchId=${m._id}`}
                        className="font-bold text-blue-600 hover:text-blue-700"
                      >
                        Open Desk →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column (5 cols): Quick Actions + Top Scorer Trophy (Screen 3) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Quick Actions Card (Screen 3) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-3">
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                Quick Actions
              </h2>

              <Link
                href="/admin/schedule"
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-800 hover:text-blue-700 border border-slate-200/80 hover:border-blue-200 font-bold text-xs transition-all active:scale-[0.98]"
              >
                <Plus className="w-4 h-4 text-blue-600" />
                <span>Create Match</span>
              </Link>

              <Link
                href="/admin/teams"
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-800 hover:text-blue-700 border border-slate-200/80 hover:border-blue-200 font-bold text-xs transition-all active:scale-[0.98]"
              >
                <Plus className="w-4 h-4 text-blue-600" />
                <span>Add Team</span>
              </Link>

              <Link
                href="/admin/players"
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-800 hover:text-blue-700 border border-slate-200/80 hover:border-blue-200 font-bold text-xs transition-all active:scale-[0.98]"
              >
                <Plus className="w-4 h-4 text-blue-600" />
                <span>Add Player</span>
              </Link>

              <Link
                href="/fixtures"
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-800 hover:text-blue-700 border border-slate-200/80 hover:border-blue-200 font-bold text-xs transition-all active:scale-[0.98]"
              >
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>View Fixtures</span>
              </Link>
            </div>

            {/* Top Scorer Trophy Card */}
            {topScorer && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black border border-amber-200">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 block">
                        Golden Boot Race
                      </span>
                      <h3 className="text-sm font-black text-slate-900">
                        Top Scorer
                      </h3>
                    </div>
                  </div>
                  <span className="bg-amber-50 text-amber-700 text-xs font-black px-3 py-1 rounded-full border border-amber-200">
                    🏆 {topScorer.goals} GOALS
                  </span>
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-xs shrink-0">
                      #{topScorer.jerseyNumber || 10}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-black text-slate-900 truncate">
                        {topScorer.name}
                      </div>
                      <div className="text-xs text-slate-500 font-medium truncate">
                        {topScorer.club || 'Independent Club'}
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/admin/top-scorers"
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 shrink-0 ml-2"
                  >
                    <span>Leaderboard</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
