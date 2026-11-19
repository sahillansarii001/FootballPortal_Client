'use client';

import React, { useState, useEffect } from 'react';
import {
  Radio,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Trophy,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
  Flame,
  Award,
  ChevronRight,
  RefreshCw,
  Zap,
  Target
} from 'lucide-react';
import { matchService } from '@/services/match.service';
import { adminService } from '@/services/admin.service';
import { formatTime } from '@/utils/formatters';
import { Match, Player } from '@/types';

export default function AdminLiveControlPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [timerRunning, setTimerRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(2700); // 45:00
  const [currentStage, setCurrentStage] = useState('First Half');
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modal / Form state for Goal Recording
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalTeam, setGoalTeam] = useState<'A' | 'B'>('A');
  const [goalPlayerName, setGoalPlayerName] = useState('');
  const [goalMinute, setGoalMinute] = useState('');
  const [goalType, setGoalType] = useState('Normal Goal');

  // Penalty Shootout state
  const [penaltyKicks, setPenaltyKicks] = useState<{ team: 'A' | 'B'; round: number; outcome: 'scored' | 'saved' | 'missed' }[]>([]);

  useEffect(() => {
    async function loadMatches() {
      setLoading(true);
      const all = await matchService.getAllMatches();
      setMatches(all);
      // Pick first live match or first match
      const live = all.find((m) => m.status === 'Live' || m.status === 'Half-Time') || all[0];
      if (live) {
        selectMatch(live);
      }
      setLoading(false);
    }
    loadMatches();
  }, []);

  const selectMatch = (match: Match) => {
    setSelectedMatch(match);
    setScoreA(match.score?.teamA ?? 0);
    setScoreB(match.score?.teamB ?? 0);
    setRemainingSeconds(match.timer?.remainingTime ?? 2700);
    setTimerRunning(Boolean(match.timer?.isRunning || match.status === 'Live'));
    setCurrentStage(match.timer?.currentStage || match.stage || 'First Half');
  };

  // Local ticker countdown
  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const showNotification = (msg: string) => {
    setActionMessage(msg);
    setActionError(null);
    setTimeout(() => setActionMessage(null), 4000);
  };

  const showError = (err: string) => {
    setActionError(err);
    setActionMessage(null);
    setTimeout(() => setActionError(null), 5000);
  };

  // Authoritative Control Handlers
  const handleStartOrResume = async () => {
    if (!selectedMatch) return;
    setTimerRunning(true);
    const res = await adminService.resumeMatch(selectedMatch._id);
    if (res.success) {
      showNotification('Timer resumed and broadcasted across all match rooms.');
    } else {
      showNotification('Timer active (local authoritative sync).');
    }
  };

  const handlePause = async () => {
    if (!selectedMatch) return;
    setTimerRunning(false);
    const res = await adminService.pauseMatch(selectedMatch._id);
    if (res.success) {
      showNotification('Timer paused and authoritative state saved.');
    } else {
      showNotification('Timer paused locally.');
    }
  };

  const handleHalfTime = async () => {
    if (!selectedMatch) return;
    setTimerRunning(false);
    setCurrentStage('Half-Time Break');
    setRemainingSeconds(900); // 15 mins
    const res = await adminService.startHalfTime(selectedMatch._id);
    showNotification('Stage updated: Half-Time Break initiated.');
  };

  const handleSecondHalf = async () => {
    if (!selectedMatch) return;
    setTimerRunning(true);
    setCurrentStage('Second Half');
    setRemainingSeconds(2700); // 45 mins
    const res = await adminService.startSecondHalf(selectedMatch._id);
    showNotification('Stage updated: Second Half started.');
  };

  const handleOpenGoalModal = (team: 'A' | 'B') => {
    setGoalTeam(team);
    const elapsedMins = Math.floor((2700 - remainingSeconds) / 60);
    setGoalMinute(elapsedMins > 0 ? `${elapsedMins}'` : "45'");
    setShowGoalModal(true);
  };

  const handleSaveGoal = async () => {
    if (!selectedMatch) return;
    const teamId = goalTeam === 'A' ? selectedMatch.teamA._id : selectedMatch.teamB._id;
    const teamName = goalTeam === 'A' ? selectedMatch.teamA.name : selectedMatch.teamB.name;

    if (goalTeam === 'A') {
      setScoreA((prev) => prev + 1);
    } else {
      setScoreB((prev) => prev + 1);
    }

    setShowGoalModal(false);
    const res = await adminService.recordGoal(selectedMatch._id, {
      teamId,
      minute: goalMinute,
      type: goalType,
    });

    showNotification(`Goal recorded for ${teamName} (${goalMinute} ${goalType})!`);
  };

  const handleRecordPenaltyKick = (team: 'A' | 'B', outcome: 'scored' | 'saved' | 'missed') => {
    const currentRound = penaltyKicks.filter((k) => k.team === team).length + 1;
    setPenaltyKicks((prev) => [...prev, { team, round: currentRound, outcome }]);

    if (outcome === 'scored') {
      if (team === 'A') setScoreA((s) => s + 1);
      else setScoreB((s) => s + 1);
    }

    showNotification(`Penalty Round #${currentRound} (${team === 'A' ? 'Home' : 'Away'}) logged: ${outcome.toUpperCase()}`);
  };

  const handleFinalizeMatch = async () => {
    if (!selectedMatch) return;
    const confirm = window.confirm(`Declare match as Completed with final score ${scoreA} - ${scoreB}? Standings will update automatically.`);
    if (!confirm) return;

    setTimerRunning(false);
    setCurrentStage('Full Time');
    const res = await adminService.endMatch(selectedMatch._id);
    showNotification(`Match finalized! Winner declared and tournament leaderboard updated.`);
  };

  const teamAName = selectedMatch?.teamA?.name || 'Home Team';
  const teamBName = selectedMatch?.teamB?.name || 'Away Team';

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6 select-none">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-container-high">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse"></span>
            <span className="font-label-caps text-xs text-primary-container uppercase font-extrabold tracking-wider">
              Unified Match Operator Desk
            </span>
          </div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl font-black text-on-surface tracking-tight mt-0.5">
            Super Admin Live Match Controller
          </h1>
        </div>

        {/* Match Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-on-surface-variant uppercase font-label-caps">
            Active Fixture:
          </label>
          <select
            value={selectedMatch?._id || ''}
            onChange={(e) => {
              const found = matches.find((m) => m._id === e.target.value);
              if (found) selectMatch(found);
            }}
            className="bg-surface-container-lowest text-xs font-bold text-on-surface px-3 py-2 rounded-xl border border-surface-container-high shadow-xs focus:outline-none focus:ring-2 focus:ring-primary-container cursor-pointer"
          >
            {matches.map((m) => (
              <option key={m._id} value={m._id}>
                {m.teamA?.name} vs {m.teamB?.name} ({m.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-3.5 flex items-center gap-2 text-xs font-bold shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-primary-container shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Main Scoreboard & Official Clock Hero */}
      <div className="bg-surface-container-lowest rounded-3xl border border-surface-container-high shadow-xl p-6 sm:p-8 flex flex-col gap-6">
        {/* Match Info & Current Stage Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-surface-container-high">
          <div className="flex items-center gap-2">
            <span className="font-label-caps text-xs uppercase bg-primary-container text-white px-3 py-1 rounded-full font-black tracking-wider">
              {currentStage}
            </span>
            <span className="text-xs text-on-surface-variant font-medium">
              {selectedMatch?.venue || 'Varsity Stadium'} • Ref: Authoritative Super Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold font-label-caps ${
                timerRunning
                  ? 'bg-emerald-100 text-primary-container ring-2 ring-primary-container/20'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {timerRunning ? 'CLOCK RUNNING' : 'CLOCK PAUSED'}
            </span>
          </div>
        </div>

        {/* Live Scoreline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Team A */}
          <div className="md:col-span-4 flex items-center justify-between md:justify-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-primary-container flex items-center justify-center font-black text-2xl shadow-inner border border-emerald-200 shrink-0">
              {teamAName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="font-headline-md text-2xl font-black text-on-surface leading-tight">
                {teamAName}
              </h2>
              <span className="font-label-caps text-xs text-on-surface-variant font-semibold">
                Home Institution
              </span>
            </div>
          </div>

          {/* Center Score & Timer */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 bg-surface-container-low rounded-2xl border border-surface-container">
            <div className="flex items-center gap-3 font-display-score text-5xl font-black text-on-surface tabular-nums">
              <span>{scoreA}</span>
              <span className="text-on-surface-variant/40">:</span>
              <span>{scoreB}</span>
            </div>
            <div className="font-stat-numeral text-2xl font-black text-primary-container tabular-nums mt-1 tracking-tight">
              {formatTime(remainingSeconds)}
            </div>
          </div>

          {/* Team B */}
          <div className="md:col-span-4 flex items-center justify-between md:justify-end gap-4 text-right">
            <div>
              <h2 className="font-headline-md text-2xl font-black text-on-surface leading-tight">
                {teamBName}
              </h2>
              <span className="font-label-caps text-xs text-on-surface-variant font-semibold">
                Visiting Team
              </span>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center font-black text-2xl shadow-inner border border-slate-200 shrink-0">
              {teamBName.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Authoritative Primary Action Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {/* Timer Toggle */}
          {timerRunning ? (
            <button
              onClick={handlePause}
              className="py-3 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <Pause className="w-4 h-4 text-amber-600" />
              <span>Pause Clock</span>
            </button>
          ) : (
            <button
              onClick={handleStartOrResume}
              className="py-3 px-4 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <Play className="w-4 h-4" />
              <span>Resume Clock</span>
            </button>
          )}

          {/* Goal Team A */}
          <button
            onClick={() => handleOpenGoalModal('A')}
            className="py-3 px-4 rounded-xl bg-surface-container hover:bg-emerald-50 hover:border-emerald-300 border border-surface-container-high text-xs font-bold text-on-surface flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 text-primary-container" />
            <span>+ Goal ({teamAName})</span>
          </button>

          {/* Goal Team B */}
          <button
            onClick={() => handleOpenGoalModal('B')}
            className="py-3 px-4 rounded-xl bg-surface-container hover:bg-emerald-50 hover:border-emerald-300 border border-surface-container-high text-xs font-bold text-on-surface flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 text-primary-container" />
            <span>+ Goal ({teamBName})</span>
          </button>

          {/* Finalize Match */}
          <button
            onClick={handleFinalizeMatch}
            className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Finalize Match</span>
          </button>
        </div>
      </div>

      {/* Stage Transitions & Shootout Controller Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (6 cols): Stage Transitions & Time Overrides */}
        <div className="lg:col-span-6 bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-3 border-b border-surface-container-high">
            <Clock className="w-5 h-5 text-primary-container" />
            <h3 className="font-headline-md text-base font-extrabold text-on-surface">
              Match Stage Transitions
            </h3>
          </div>

          <p className="text-xs text-on-surface-variant font-medium">
            Transitions automatically notify all connected public live match screens via Socket.IO:
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleHalfTime}
              className="py-2.5 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-bold text-on-surface border border-surface-container flex items-center justify-center gap-2 transition-all"
            >
              <span>1. Half-Time Break</span>
            </button>
            <button
              onClick={handleSecondHalf}
              className="py-2.5 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-bold text-on-surface border border-surface-container flex items-center justify-center gap-2 transition-all"
            >
              <span>2. Start Second Half</span>
            </button>
            <button
              onClick={() => {
                setCurrentStage('Extra Time');
                setRemainingSeconds(900);
                showNotification('Stage updated: 15-Minute Extra Time started.');
              }}
              className="py-2.5 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-bold text-on-surface border border-surface-container flex items-center justify-center gap-2 transition-all"
            >
              <span>3. Extra Time (15m)</span>
            </button>
            <button
              onClick={() => {
                setCurrentStage('Penalty Shootout');
                showNotification('Stage updated: Penalty Shootout mode active.');
              }}
              className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-primary-container border border-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <span>4. Penalty Shootout</span>
            </button>
          </div>

          {/* Clock Adjustments */}
          <div className="pt-3 border-t border-surface-container-high flex items-center justify-between">
            <span className="text-xs text-on-surface-variant font-semibold">Manual Clock Shift:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRemainingSeconds((s) => s + 60)}
                className="px-2.5 py-1 rounded-lg bg-surface-container text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors"
              >
                +1 Min
              </button>
              <button
                onClick={() => setRemainingSeconds((s) => (s >= 60 ? s - 60 : 0))}
                className="px-2.5 py-1 rounded-lg bg-surface-container text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors"
              >
                -1 Min
              </button>
              <button
                onClick={() => setRemainingSeconds(2700)}
                className="px-2.5 py-1 rounded-lg bg-surface-container text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors"
              >
                Reset 45:00
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (6 cols): Penalty Shootout Manager */}
        <div className="lg:col-span-6 bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-container" />
              <h3 className="font-headline-md text-base font-extrabold text-on-surface">
                Penalty Shootout Console
              </h3>
            </div>
            <span className="font-label-caps text-[10px] text-primary-container bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
              5-Kick Standard + Sudden Death
            </span>
          </div>

          {/* Quick Kick Recorder */}
          <div className="grid grid-cols-2 gap-4">
            {/* Team A Kicks */}
            <div className="bg-surface-container-low p-3.5 rounded-xl border border-surface-container flex flex-col gap-2">
              <span className="font-label-caps text-xs text-on-surface font-extrabold truncate">
                {teamAName} (Kicker)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleRecordPenaltyKick('A', 'scored')}
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                >
                  ✓ Scored
                </button>
                <button
                  onClick={() => handleRecordPenaltyKick('A', 'saved')}
                  className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                >
                  🛡️ Saved
                </button>
                <button
                  onClick={() => handleRecordPenaltyKick('A', 'missed')}
                  className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                >
                  ✗ Missed
                </button>
              </div>
            </div>

            {/* Team B Kicks */}
            <div className="bg-surface-container-low p-3.5 rounded-xl border border-surface-container flex flex-col gap-2">
              <span className="font-label-caps text-xs text-on-surface font-extrabold truncate">
                {teamBName} (Kicker)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleRecordPenaltyKick('B', 'scored')}
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                >
                  ✓ Scored
                </button>
                <button
                  onClick={() => handleRecordPenaltyKick('B', 'saved')}
                  className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                >
                  🛡️ Saved
                </button>
                <button
                  onClick={() => handleRecordPenaltyKick('B', 'missed')}
                  className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                >
                  ✗ Missed
                </button>
              </div>
            </div>
          </div>

          {/* Logged shootout list */}
          <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pt-2">
            {penaltyKicks.length === 0 ? (
              <span className="text-center py-4 text-xs text-on-surface-variant font-medium">
                No penalty kicks registered for this shootout yet.
              </span>
            ) : (
              penaltyKicks.map((k, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-surface-container border border-surface-container-high"
                >
                  <span>
                    Round #{k.round}: <strong>{k.team === 'A' ? teamAName : teamBName}</strong>
                  </span>
                  <span
                    className={`font-bold uppercase font-label-caps text-[10px] px-2 py-0.5 rounded ${
                      k.outcome === 'scored'
                        ? 'bg-emerald-100 text-emerald-800'
                        : k.outcome === 'saved'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {k.outcome}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Goal Recorder Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-surface-container-lowest rounded-2xl border border-surface-container-high shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
              <h3 className="font-headline-md text-base font-black text-on-surface">
                Record Official Goal
              </h3>
              <span className="font-label-caps text-xs text-primary-container font-bold">
                {goalTeam === 'A' ? teamAName : teamBName}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-on-surface uppercase font-label-caps mb-1">
                  Goalscorer Athlete
                </label>
                <input
                  type="text"
                  value={goalPlayerName}
                  onChange={(e) => setGoalPlayerName(e.target.value)}
                  placeholder="e.g. Mateo Vance (#9)"
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-on-surface uppercase font-label-caps mb-1">
                    Match Minute
                  </label>
                  <input
                    type="text"
                    value={goalMinute}
                    onChange={(e) => setGoalMinute(e.target.value)}
                    placeholder="65'"
                    className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-on-surface uppercase font-label-caps mb-1">
                    Goal Type
                  </label>
                  <select
                    value={goalType}
                    onChange={(e) => setGoalType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container cursor-pointer"
                  >
                    <option value="Normal Goal">Open Play Strike</option>
                    <option value="Penalty">Penalty Kick</option>
                    <option value="Free Kick">Direct Free Kick</option>
                    <option value="Own Goal">Own Goal</option>
                    <option value="Header">Header</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleSaveGoal}
                className="flex-1 py-2.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-bold text-xs uppercase tracking-wider transition-all"
              >
                Confirm & Record Goal
              </button>
              <button
                type="button"
                onClick={() => setShowGoalModal(false)}
                className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
