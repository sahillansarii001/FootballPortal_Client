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
  Gauge
} from 'lucide-react';
import { matchService } from '@/services/match.service';
import { teamService } from '@/services/team.service';
import { adminService } from '@/services/admin.service';
import { formatTime } from '@/utils/formatters';
import { Match } from '@/types';

export default function AdminOverviewPage() {
  const [liveMatch, setLiveMatch] = useState<Match | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [homeScore, setHomeScore] = useState(2);
  const [awayScore, setAwayScore] = useState(1);
  const [timerSeconds, setTimerSeconds] = useState(55); // 00:55 in 4-minute Second Half
  const [auditLogs, setAuditLogs] = useState([
    {
      id: '1',
      title: 'Goal Validated: Devon Kim',
      minute: "87'",
      desc: 'Stanford Cardinal #10 • Verified via Official Pitch Log',
      official: 'Ref: M. Thorne',
      type: 'goal',
    },
    {
      id: '2',
      title: 'Yellow Card: K. Adams',
      minute: "74'",
      desc: 'UCLA Bruins #4 • Tactical foul in defensive third',
      official: 'Opta Log ID #8841',
      type: 'card',
    },
    {
      id: '3',
      title: 'Second Half Whistle Blown',
      minute: "45'",
      desc: 'Authoritative server clock resumed without desync',
      official: 'System Sync #104',
      type: 'timer',
    },
    {
      id: '4',
      title: 'Goal Validated: Julian Morales',
      minute: "31'",
      desc: 'UCLA Bruins #9 • Open play strike',
      official: 'Ref: M. Thorne',
      type: 'goal',
    },
  ]);

  useEffect(() => {
    async function loadData() {
      const allMatches = await matchService.getAllMatches();
      setMatches(allMatches);
      const live = allMatches.find((m) => m.status === 'Live' || m.status === 'Half-Time');
      if (live) {
        setLiveMatch(live);
        setHomeScore(live.score?.teamA || 2);
        setAwayScore(live.score?.teamB || 1);
        if (live.timer?.remainingTime) {
          setTimerSeconds(live.timer.remainingTime);
        }
      }
    }
    loadData();
  }, []);

  // Timer ticker simulation for UI live view
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleToggleTimer = async () => {
    if (liveMatch) {
      if (isTimerRunning) {
        await adminService.pauseMatch(liveMatch._id);
        setIsTimerRunning(false);
      } else {
        await adminService.resumeMatch(liveMatch._id);
        setIsTimerRunning(true);
      }
    } else {
      setIsTimerRunning(!isTimerRunning);
    }
  };

  const handleUndoEvent = (id: string) => {
    setAuditLogs((prev) => prev.filter((item) => item.id !== id));
  };

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
              <option>2026 Inter-College Spring Cup — Quarter Finals</option>
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
            <span>Saturday, Matchday 18 • Super Admin Authority</span>
          </div>
        </div>

        {/* 6 KPI Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* KPI 1 */}
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">
                Tournaments
              </span>
              <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary-container">
                <Trophy className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="font-stat-numeral text-2xl font-black text-on-surface">4 Cups</div>
              <div className="text-[11px] text-primary-container font-semibold mt-0.5">+1 season</div>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">
                Enrolled Teams
              </span>
              <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary-container">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="font-stat-numeral text-2xl font-black text-on-surface">16 Varsities</div>
              <div className="text-[11px] text-primary-container font-semibold mt-0.5">100% verified</div>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">
                Athletes
              </span>
              <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary-container">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="font-stat-numeral text-2xl font-black text-on-surface">384 Players</div>
              <div className="text-[11px] text-primary-container font-semibold mt-0.5">Eligible</div>
            </div>
          </div>

          {/* KPI 4 */}
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">
                Fixtures
              </span>
              <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary-container">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="font-stat-numeral text-2xl font-black text-on-surface">48 Matches</div>
              <div className="text-[11px] text-on-surface-variant font-medium mt-0.5">
                <strong className="text-primary-container font-bold">1</strong> live • 16 left
              </div>
            </div>
          </div>

          {/* KPI 5 */}
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">
                Goals Logged
              </span>
              <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary-container">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="font-stat-numeral text-2xl font-black text-on-surface">104 Total</div>
              <div className="text-[11px] text-on-surface-variant font-medium mt-0.5">2.94 / match</div>
            </div>
          </div>

          {/* KPI 6 */}
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">
                Cards Issued
              </span>
              <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-amber-500">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="font-stat-numeral text-2xl font-black text-on-surface">
                24<span className="text-xs text-amber-500 font-bold ml-0.5">Y</span> / 2<span className="text-xs text-error font-bold ml-0.5">R</span>
              </div>
              <div className="text-[11px] text-primary-container font-semibold mt-0.5">Audit verified</div>
            </div>
          </div>
        </div>

        {/* Live Match Real-Time Telemetry Monitor */}
        <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-surface-container-high/60 px-6 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-surface-container-high">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 bg-emerald-100 text-primary-container font-label-caps text-[11px] px-3 py-0.5 rounded-full font-extrabold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
                LIVE BROADCAST TELEMETRY
              </span>
              <span className="font-label-caps text-xs text-on-surface-variant uppercase font-bold hidden md:inline">
                Quarter Final Match #03 • Stanford Stadium Field 1
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-on-surface-variant font-medium">
              <span>67°F Clear • Pitch 94% Perfect</span>
              <span className="hidden sm:inline">Att: 4,120</span>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Match Core: Stanford vs UCLA */}
              <div className="lg:col-span-7 flex flex-col gap-5">
                <div className="flex items-center justify-between sm:justify-start sm:gap-10">
                  {/* Team A */}
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-13 h-13 rounded-2xl bg-surface-container flex items-center justify-center p-2 shadow-inner border border-surface-container-high font-black text-xl text-primary-container shrink-0">
                      S
                    </div>
                    <div>
                      <div className="font-headline-md text-lg font-black text-on-surface">Stanford</div>
                      <div className="font-label-caps text-[10px] text-on-surface-variant uppercase font-semibold">
                        Cardinal • Host
                      </div>
                    </div>
                  </div>

                  {/* Score & Clock */}
                  <div className="flex flex-col items-center justify-center px-4 text-center shrink-0">
                    <div className="flex items-center gap-2 font-display-score text-4xl sm:text-5xl font-black text-on-surface tabular-nums">
                      <span>{homeScore}</span>
                      <span className="text-on-surface-variant/40">-</span>
                      <span>{awayScore}</span>
                    </div>
                    <span className="font-label-caps text-[9px] text-on-surface-variant uppercase font-semibold mt-1">
                      Live Match Score
                    </span>
                    <div className="inline-flex items-center gap-1.5 bg-surface-container px-3 py-0.5 rounded-full mt-1 border border-surface-container-high">
                      <Clock className="w-3.5 h-3.5 text-primary-container" />
                      <span className="font-label-ui text-xs font-bold text-on-surface tabular-nums">
                        {formatTime(timerSeconds)}
                      </span>
                      <span className="text-[10px] text-on-surface-variant font-bold uppercase">(4m 2H)</span>
                    </div>
                  </div>

                  {/* Team B */}
                  <div className="flex items-center justify-end gap-3 flex-1 text-right">
                    <div>
                      <div className="font-headline-md text-lg font-black text-on-surface">UCLA</div>
                      <div className="font-label-caps text-[10px] text-on-surface-variant uppercase font-semibold">
                        Bruins • Visitor
                      </div>
                    </div>
                    <div className="w-13 h-13 rounded-2xl bg-surface-container flex items-center justify-center p-2 shadow-inner border border-surface-container-high font-black text-xl text-primary shrink-0">
                      U
                    </div>
                  </div>
                </div>

                {/* Timeline Progress */}
                <div className="bg-surface-container-low p-3 rounded-xl flex flex-col gap-1.5 border border-surface-container">
                  <div className="flex items-center justify-between text-[10px] font-label-caps text-on-surface-variant uppercase font-bold">
                    <span>Kickoff (4m)</span>
                    <span>20s Delay</span>
                    <span>Break (2m)</span>
                    <span>2H (4m)</span>
                    <span>FT</span>
                  </div>
                  <div className="relative w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 bg-primary-container rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium pt-0.5">
                    <span className="text-primary-container font-semibold">⚽ M. Vance (02:48 1H), A. Chen (01:05 2H)</span>
                    <span>⚽ J. Morales (02:15 2H)</span>
                  </div>
                </div>
              </div>

              {/* Quick Admin Action Console */}
              <div className="lg:col-span-5 bg-surface-container-low p-5 rounded-2xl border border-surface-container flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                    <span className="font-label-caps text-xs text-on-surface uppercase font-extrabold tracking-wider">
                      Authoritative Match Overrides
                    </span>
                    <span className="text-primary-container text-[11px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
                      Direct Sync
                    </span>
                  </div>

                  {/* Operational Shortcuts (Scoring managed inside Live Control Desk) */}
                  <div className="flex flex-col gap-2.5 mt-3">
                    <p className="text-xs text-on-surface-variant font-medium">
                      All live scoring, athlete goal recording, and stage clock shifts are managed inside the dedicated Live Control Desk.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleToggleTimer}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs ${isTimerRunning
                          ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                          : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                          }`}
                      >
                        {isTimerRunning ? (
                          <>
                            <Pause className="w-3.5 h-3.5 text-amber-600" />
                            <span>Pause Timer</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Resume Timer</span>
                          </>
                        )}
                      </button>
                      <Link
                        href="/admin/standings"
                        className="py-2 px-3 rounded-xl bg-surface-container-lowest hover:bg-surface-container border border-surface-container-high text-xs font-bold text-on-surface flex items-center justify-center gap-1.5 transition-all shadow-xs"
                      >
                        <Trophy className="w-3.5 h-3.5 text-primary-container" />
                        <span>View Standings</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Primary Desk CTA */}
                <Link
                  href="/admin/live-control"
                  className="w-full py-2.5 px-4 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Radio className="w-4 h-4" />
                  <span>Open Full Match Controller</span>
                </Link>
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
                Today&apos;s Order of Play
              </span>
            </div>

            {/* Fixture Card 1 */}
            <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high shadow-xs hover:shadow-md transition-all flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-container-high">
                <div className="flex items-center gap-2.5">
                  <span className="bg-surface-container-high text-on-surface font-bold text-xs px-2.5 py-1 rounded-lg">
                    14:00 EST
                  </span>
                  <span className="font-headline-sm text-sm font-extrabold text-on-surface">
                    MIT Engineers vs Harvard Crimson
                  </span>
                </div>
                <span className="font-label-caps text-[10px] text-primary-container bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                  Field Ready • Pitch #2
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-on-surface-variant font-label-caps text-[10px] uppercase block font-bold">
                    Lead Official
                  </span>
                  <span className="text-on-surface font-semibold mt-0.5 block">
                    Dr. Arthur Vance (FIFA Ref)
                  </span>
                </div>
                <div>
                  <span className="text-on-surface-variant font-label-caps text-[10px] uppercase block font-bold">
                    Inspection Status
                  </span>
                  <span className="text-primary-container font-semibold mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Goals & Turf Certified
                  </span>
                </div>
                <div>
                  <span className="text-on-surface-variant font-label-caps text-[10px] uppercase block font-bold">
                    Lineups
                  </span>
                  <span className="text-primary-container font-semibold mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Confirmed by Coaches
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-surface-container-high">
                <span className="text-xs text-on-surface-variant font-medium">
                  Warm-ups ongoing (32 mins to kickoff)
                </span>
                <Link
                  href="/admin/schedule"
                  className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface transition-colors"
                >
                  Prepare Match Sheet
                </Link>
              </div>
            </div>

            {/* Fixture Card 2 */}
            <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high shadow-xs hover:shadow-md transition-all flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-container-high">
                <div className="flex items-center gap-2.5">
                  <span className="bg-surface-container-high text-on-surface font-bold text-xs px-2.5 py-1 rounded-lg">
                    16:30 EST
                  </span>
                  <span className="font-headline-sm text-sm font-extrabold text-on-surface">
                    Columbia Lions vs Yale Bulldogs
                  </span>
                </div>
                <span className="font-label-caps text-[10px] text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full font-bold border border-amber-200">
                  Inspection in Progress • Field #4
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-on-surface-variant font-label-caps text-[10px] uppercase block font-bold">
                    Lead Official
                  </span>
                  <span className="text-on-surface font-semibold mt-0.5 block">
                    Elena Rostova (National)
                  </span>
                </div>
                <div>
                  <span className="text-on-surface-variant font-label-caps text-[10px] uppercase block font-bold">
                    Medical Standby
                  </span>
                  <span className="text-on-surface font-medium mt-0.5 block">
                    EMS Unit #3 On-Site
                  </span>
                </div>
                <div>
                  <span className="text-on-surface-variant font-label-caps text-[10px] uppercase block font-bold">
                    Rosters
                  </span>
                  <span className="text-amber-600 font-semibold mt-0.5 block">
                    Yale Pending Sign-off
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-surface-container-high">
                <span className="text-xs text-on-surface-variant font-medium">
                  Team arrivals confirmed • Lockers open
                </span>
                <Link
                  href="/admin/schedule"
                  className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface transition-colors"
                >
                  Review Checklist
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Administrative Audit Feed */}
          <div className="lg:col-span-5 flex flex-col gap-4">
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
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 pb-3 border-b border-surface-container-high last:border-0 last:pb-0"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${log.type === 'goal'
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
