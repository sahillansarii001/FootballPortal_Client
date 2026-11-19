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
      }
    }
    loadData();
  }, []);

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
                Completed
              </span>
              <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary-container">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="font-stat-numeral text-2xl font-black text-on-surface">31 Matches</div>
              <div className="text-[11px] text-primary-container font-semibold mt-0.5">Finalized</div>
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
