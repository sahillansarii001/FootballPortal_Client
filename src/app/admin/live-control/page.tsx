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
  Target,
  Coins,
  Sparkles,
  Hourglass
} from 'lucide-react';
import { matchService } from '@/services/match.service';
import { teamService } from '@/services/team.service';
import { adminService } from '@/services/admin.service';
import { formatTime } from '@/utils/formatters';
import { Match, Player } from '@/types';

export default function AdminLiveControlPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [timerRunning, setTimerRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(240); // 4:00 First Half default
  const [currentStage, setCurrentStage] = useState('First Half');
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [teamAPlayers, setTeamAPlayers] = useState<Player[]>([]);
  const [teamBPlayers, setTeamBPlayers] = useState<Player[]>([]);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modal / Form state for Goal Recording
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalTeam, setGoalTeam] = useState<'A' | 'B'>('A');
  const [goalPlayerName, setGoalPlayerName] = useState('');
  const [goalMinute, setGoalMinute] = useState('02:30 (1H)');

  // 3-Kick Regulation Penalty Shootout state
  const [selectedKickerA, setSelectedKickerA] = useState<string>('');
  const [selectedKickerB, setSelectedKickerB] = useState<string>('');
  const [penaltyKicks, setPenaltyKicks] = useState<{
    team: 'A' | 'B';
    round: number;
    playerId: string;
    playerName: string;
    playerClub?: string;
    playerJersey: number;
    outcome: 'Goal' | 'Saved' | 'Missed';
  }[]>([]);
  const [penaltyScoreA, setPenaltyScoreA] = useState(0);
  const [penaltyScoreB, setPenaltyScoreB] = useState(0);

  // Sudden Death Coin Toss State
  const [tossState, setTossState] = useState<{
    isFlipping: boolean;
    tossWinner: 'A' | 'B' | null;
    tossChoice: 'shoot' | 'save' | null;
    isResolved: boolean;
    winnerTeamName: string | null;
    selectedDecisiveShooterId: string;
  }>({
    isFlipping: false,
    tossWinner: null,
    tossChoice: null,
    isResolved: false,
    winnerTeamName: null,
    selectedDecisiveShooterId: '',
  });

  const teamAName = selectedMatch?.teamA?.name || 'Stanford Cardinal';
  const teamBName = selectedMatch?.teamB?.name || 'UCLA Bruins';

  useEffect(() => {
    async function loadMatches() {
      setLoading(true);
      const all = await matchService.getAllMatches();
      setMatches(all);
      const live = all.find((m) => m.status === 'Live' || m.status === 'Half-Time') || all[0];
      if (live) {
        await selectMatch(live);
      }
      setLoading(false);
    }
    loadMatches();
  }, []);

  const selectMatch = async (match: Match) => {
    setSelectedMatch(match);
    setScoreA(match.score?.teamA ?? match.teamAScore ?? 0);
    setScoreB(match.score?.teamB ?? match.teamBScore ?? 0);
    setRemainingSeconds(match.timer?.remainingTime ?? 240);
    setTimerRunning(Boolean(match.timer?.isRunning || match.status === 'Live'));
    setCurrentStage(match.timer?.currentStage || match.stage || 'First Half');
    setPenaltyKicks([]);
    setPenaltyScoreA(match.shootout?.teamAPenaltyScore ?? 0);
    setPenaltyScoreB(match.shootout?.teamBPenaltyScore ?? 0);
    setTossState({
      isFlipping: false,
      tossWinner: null,
      tossChoice: null,
      isResolved: match.status === 'Completed' && Boolean(match.winner),
      winnerTeamName: typeof match.winner === 'object' && match.winner ? match.winner.name : null,
      selectedDecisiveShooterId: '',
    });

    // Fetch players for both teams to populate goalscorer and penalty kicker dropdowns
    if (match.teamA?._id) {
      const pA = await teamService.getTeamPlayers(match.teamA._id);
      setTeamAPlayers(pA);
      if (pA.length > 0) setSelectedKickerA(pA[0]._id);
    }
    if (match.teamB?._id) {
      const pB = await teamService.getTeamPlayers(match.teamB._id);
      setTeamBPlayers(pB);
      if (pB.length > 0) setSelectedKickerB(pB[0]._id);
    }
  };

  // Local ticker countdown with automatic match completion
  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          // When stage timer reaches 0
          if (currentStage.includes('Second') || currentStage.includes('Extra')) {
            if (scoreA !== scoreB) {
              setTimerRunning(false);
              setCurrentStage('Completed');
              if (selectedMatch) {
                adminService.finalizeMatch(selectedMatch._id).then(() => {
                  setSelectedMatch((m) =>
                    m
                      ? {
                          ...m,
                          status: 'Completed',
                          matchResult: scoreA > scoreB ? `${teamAName} won` : `${teamBName} won`,
                        }
                      : null
                  );
                  setMatches((all) =>
                    all.map((m) => (m._id === selectedMatch._id ? { ...m, status: 'Completed' } : m))
                  );
                });
                showNotification(
                  `Full Time whistle! Match has concluded: ${teamAName} ${scoreA} - ${scoreB} ${teamBName}. Marked as Completed.`
                );
              }
              return 0;
            } else {
              setTimerRunning(false);
              showNotification(
                `Regulation time expired at ${scoreA} - ${scoreB} draw! You can add 2 minutes extra time or proceed to 3-kick Penalty Shootout.`
              );
              return 0;
            }
          } else {
            setTimerRunning(false);
            showNotification(`${currentStage} time expired! Please advance to the next stage.`);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, currentStage, scoreA, scoreB, selectedMatch, teamAName, teamBName]);

  const showNotification = (msg: string) => {
    setActionMessage(msg);
    setActionError(null);
    setTimeout(() => setActionMessage(null), 5000);
  };

  const showError = (err: string) => {
    setActionError(err);
    setActionMessage(null);
    setTimeout(() => setActionError(null), 5000);
  };

  // Direct Score Adjustment Handlers
  const handleScoreAdjust = async (team: 'A' | 'B', delta: number) => {
    let nextA = scoreA;
    let nextB = scoreB;
    if (team === 'A') {
      nextA = Math.max(0, scoreA + delta);
      setScoreA(nextA);
    } else {
      nextB = Math.max(0, scoreB + delta);
      setScoreB(nextB);
    }

    if (selectedMatch) {
      await adminService.updateScore(selectedMatch._id, nextA, nextB);
      showNotification(`Score updated: ${teamAName} ${nextA} - ${nextB} ${teamBName}`);
    }
  };

  // Authoritative Control Handlers
  const handleStartOrResume = async () => {
    if (!selectedMatch) return;
    setTimerRunning(true);
    let res;
    if (selectedMatch.status === 'Upcoming' || !selectedMatch.timer?.isRunning) {
      res = await adminService.startMatch(selectedMatch._id);
    } else {
      res = await adminService.resumeMatch(selectedMatch._id);
    }
    setSelectedMatch((prev) => (prev ? { ...prev, status: 'Live' } : null));
    setMatches((prev) =>
      prev.map((m) => (m._id === selectedMatch._id ? { ...m, status: 'Live' } : m))
    );
    if (res?.success) {
      showNotification('Match started! Live telemetry synchronized with Live Match Center.');
    } else {
      showNotification('Timer active (authoritative live clock running).');
    }
  };

  const handlePause = async () => {
    if (!selectedMatch) return;
    setTimerRunning(false);
    const res = await adminService.pauseMatch(selectedMatch._id);
    setSelectedMatch((prev) =>
      prev ? { ...prev, timer: prev.timer ? { ...prev.timer, isPaused: true } : undefined } : null
    );
    if (res?.success) {
      showNotification('Timer paused and authoritative state broadcasted to Live viewers.');
    } else {
      showNotification('Timer paused locally.');
    }
  };

  // Add Time Handler (+1 Min, +2 Min Extra Time)
  const handleAddTime = async (seconds: number = 120) => {
    if (!selectedMatch) return;
    setRemainingSeconds((prev) => prev + seconds);
    setTimerRunning(true);
    await adminService.addTimeToTimer(selectedMatch._id, seconds);
    showNotification(
      `Added +${seconds >= 60 ? `${Math.floor(seconds / 60)} minute${seconds > 60 ? 's' : ''}` : `${seconds}s`} to match clock!`
    );
  };

  // 1. First Half (4:00)
  const handleStartFirstHalf = async () => {
    if (!selectedMatch) return;
    setTimerRunning(true);
    setCurrentStage('First Half');
    setRemainingSeconds(240); // 4 minutes
    await adminService.resumeMatch(selectedMatch._id);
    showNotification('Stage set: First Half underway (4 minutes countdown).');
  };

  // 2. Half-Time Break (2:00)
  const handleHalfTimeBreak = async () => {
    if (!selectedMatch) return;
    setTimerRunning(true);
    setCurrentStage('Half-Time Break');
    setRemainingSeconds(120); // 2 minutes break
    await adminService.advanceStage(selectedMatch._id);
    showNotification('Half-Time Break started (2 minutes interval).');
  };

  // 3. Second Half (4:00)
  const handleSecondHalf = async () => {
    if (!selectedMatch) return;
    setTimerRunning(true);
    setCurrentStage('Second Half');
    setRemainingSeconds(240); // 4 minutes
    await adminService.advanceStage(selectedMatch._id);
    showNotification('Second Half underway (4 minutes countdown).');
  };

  // 4. Draw Decider Extra Time (2:00)
  const handleExtraTimeDraw = async () => {
    if (!selectedMatch) return;
    setTimerRunning(true);
    setCurrentStage('Extra Time (Draw Decider)');
    setRemainingSeconds(120); // 2 minutes extra time
    await adminService.addTimeToTimer(selectedMatch._id, 120);
    showNotification(`Match is a Draw (${scoreA} - ${scoreB})! 2 minutes extra time added to timer.`);
  };

  // Auto-Advance Next Stage in Sequence
  const handleAdvanceNextStage = async () => {
    if (!selectedMatch) return;
    if (currentStage.includes('First')) {
      await handleHalfTimeBreak();
    } else if (currentStage.includes('Half-Time') || currentStage.includes('Break')) {
      await handleSecondHalf();
    } else if (currentStage.includes('Second')) {
      if (scoreA === scoreB) {
        await handleExtraTimeDraw();
      } else {
        await handleFinalizeMatch();
      }
    } else if (currentStage.includes('Extra Time')) {
      if (scoreA === scoreB) {
        showNotification(
          `Still tied (${scoreA} - ${scoreB}) after 2-minute Extra Time! 3-kick Penalty Shootout unlocked.`
        );
      } else {
        await handleFinalizeMatch();
      }
    } else {
      await handleFinalizeMatch();
    }
  };

  const handleOpenGoalModal = (team: 'A' | 'B') => {
    setGoalTeam(team);
    const players = team === 'A' ? teamAPlayers : teamBPlayers;
    if (players.length > 0) {
      setGoalPlayerName(players[0].name);
    } else {
      setGoalPlayerName('');
    }
    const elapsedSec = Math.max(0, 240 - remainingSeconds);
    const elapsedMins = Math.floor(elapsedSec / 60);
    const elapsedRemainderSec = elapsedSec % 60;
    const stagePrefix = currentStage.includes('Second') ? '2H' : currentStage.includes('Extra') ? 'ET' : '1H';
    setGoalMinute(`${String(elapsedMins).padStart(2, '0')}:${String(elapsedRemainderSec).padStart(2, '0')} (${stagePrefix})`);
    setShowGoalModal(true);
  };

  const handleSaveGoal = async () => {
    if (!selectedMatch) return;
    const teamId = goalTeam === 'A' ? selectedMatch.teamA._id : selectedMatch.teamB._id;
    const teamName = goalTeam === 'A' ? teamAName : teamBName;

    const newScoreA = goalTeam === 'A' ? scoreA + 1 : scoreA;
    const newScoreB = goalTeam === 'B' ? scoreB + 1 : scoreB;

    if (goalTeam === 'A') {
      setScoreA(newScoreA);
    } else {
      setScoreB(newScoreB);
    }

    setShowGoalModal(false);

    const calculatedMinute =
      goalMinute ||
      `${formatTime(remainingSeconds)} (${currentStage.includes('Second') ? '2H' : currentStage.includes('Extra') ? 'ET' : '1H'})`;

    const players = goalTeam === 'A' ? teamAPlayers : teamBPlayers;
    const matchedPlayer = players.find((p) => p.name === goalPlayerName);

    // Save goal and sync score
    await adminService.recordGoal(selectedMatch._id, {
      teamId,
      playerId: matchedPlayer?._id,
      minute: calculatedMinute,
      type: 'Normal Goal',
    });
    await adminService.updateScore(selectedMatch._id, newScoreA, newScoreB);

    showNotification(`Goal recorded for ${teamName} (${goalPlayerName || 'Athlete'} • ${calculatedMinute})!`);
  };

  // 3-Kick Regulation Penalty Recorder
  const handleRecordPenaltyKick = async (team: 'A' | 'B', outcome: 'Goal' | 'Saved' | 'Missed') => {
    if (!selectedMatch) return;
    const players = team === 'A' ? teamAPlayers : teamBPlayers;
    const selectedKickerId = team === 'A' ? selectedKickerA : selectedKickerB;
    const kicker = players.find((p) => p._id === selectedKickerId) || players[0];

    if (!kicker) {
      showError(`Please choose a penalty shooter for ${team === 'A' ? teamAName : teamBName}.`);
      return;
    }

    const teamKicks = penaltyKicks.filter((k) => k.team === team);
    if (teamKicks.length >= 3) {
      showError(`${team === 'A' ? teamAName : teamBName} has already completed their 3 regulation penalty kicks.`);
      return;
    }

    const currentRound = teamKicks.length + 1;

    const newKick = {
      team,
      round: currentRound,
      playerId: kicker._id,
      playerName: kicker.name,
      playerClub: kicker.club || 'Independent Club',
      playerJersey: kicker.jerseyNumber,
      outcome,
    };

    setPenaltyKicks((prev) => [...prev, newKick]);

    let newPenA = penaltyScoreA;
    let newPenB = penaltyScoreB;
    if (outcome === 'Goal') {
      if (team === 'A') {
        newPenA = penaltyScoreA + 1;
        setPenaltyScoreA(newPenA);
      } else {
        newPenB = penaltyScoreB + 1;
        setPenaltyScoreB(newPenB);
      }
    }

    // Call backend authoritative penalty endpoint
    const teamId = team === 'A' ? selectedMatch.teamA._id : selectedMatch.teamB._id;
    await adminService.recordPenalty(selectedMatch._id, {
      team: teamId,
      player: kicker._id,
      outcome,
    });

    // Advance kicker selection to next player in squad
    const currentIndex = players.findIndex((p) => p._id === kicker._id);
    const nextPlayer = players[(currentIndex + 1) % players.length];
    if (nextPlayer) {
      if (team === 'A') setSelectedKickerA(nextPlayer._id);
      else setSelectedKickerB(nextPlayer._id);
    }

    showNotification(
      `Penalty #${currentRound}/3 (${team === 'A' ? teamAName : teamBName}): ${kicker.name} [${kicker.club || 'Club'}] -> ${outcome.toUpperCase()}! Shootout score: ${newPenA} - ${newPenB}`
    );
  };

  // Sudden Death Coin Toss Handler
  const handleFlipCoin = () => {
    setTossState((prev) => ({ ...prev, isFlipping: true, tossWinner: null, tossChoice: null }));
    setTimeout(() => {
      const winner: 'A' | 'B' = Math.random() < 0.5 ? 'A' : 'B';
      const winnerName = winner === 'A' ? teamAName : teamBName;
      setTossState((prev) => ({
        ...prev,
        isFlipping: false,
        tossWinner: winner,
        selectedDecisiveShooterId: winner === 'A' ? teamAPlayers[0]?._id || '' : teamBPlayers[0]?._id || '',
      }));
      showNotification(`🪙 Coin Toss Result: ${winnerName} won the toss! The winner must choose to SHOOT or SAVE.`);
    }, 1000);
  };

  const handleSelectTossChoice = (choice: 'shoot' | 'save') => {
    const winner = tossState.tossWinner;
    const winnerName = winner === 'A' ? teamAName : teamBName;
    const shootingTeam = (winner === 'A' && choice === 'shoot') || (winner === 'B' && choice === 'save') ? 'A' : 'B';
    const shootingTeamName = shootingTeam === 'A' ? teamAName : teamBName;
    const initialShooter = (shootingTeam === 'A' ? teamAPlayers[0]?._id : teamBPlayers[0]?._id) || '';

    setTossState((prev) => ({
      ...prev,
      tossChoice: choice,
      selectedDecisiveShooterId: initialShooter,
    }));
    showNotification(
      `${winnerName} chose to ${choice.toUpperCase()}! ${shootingTeamName} will take the decisive sudden-death penalty kick.`
    );
  };

  // Sudden Death Decisive Kick Resolution
  const handleResolveDecisiveKick = async (outcome: 'Goal' | 'Saved' | 'Missed') => {
    if (!selectedMatch || !tossState.tossWinner || !tossState.tossChoice) return;
    const winner = tossState.tossWinner;
    const choice = tossState.tossChoice;
    const shootingTeam = (winner === 'A' && choice === 'shoot') || (winner === 'B' && choice === 'save') ? 'A' : 'B';
    const defendingTeam = shootingTeam === 'A' ? 'B' : 'A';
    const shootingTeamName = shootingTeam === 'A' ? teamAName : teamBName;
    const defendingTeamName = defendingTeam === 'A' ? teamAName : teamBName;

    const shooterPlayer =
      (shootingTeam === 'A' ? teamAPlayers : teamBPlayers).find(
        (p) => p._id === tossState.selectedDecisiveShooterId
      ) || (shootingTeam === 'A' ? teamAPlayers[0] : teamBPlayers[0]);

    let championshipWinnerName = '';
    let finalPenaltyA = penaltyScoreA;
    let finalPenaltyB = penaltyScoreB;

    if (outcome === 'Goal') {
      championshipWinnerName = shootingTeamName;
      if (shootingTeam === 'A') finalPenaltyA += 1;
      else finalPenaltyB += 1;
    } else {
      championshipWinnerName = defendingTeamName;
    }

    setPenaltyScoreA(finalPenaltyA);
    setPenaltyScoreB(finalPenaltyB);

    setTossState((prev) => ({
      ...prev,
      isResolved: true,
      winnerTeamName: championshipWinnerName,
    }));

    setPenaltyKicks((prev) => [
      ...prev,
      {
        team: shootingTeam,
        round: 4,
        playerId: shooterPlayer?._id || '',
        playerName: shooterPlayer?.name || 'Decisive Shooter',
        playerClub: shooterPlayer?.club || 'Independent Club',
        playerJersey: shooterPlayer?.jerseyNumber || 10,
        outcome,
      },
    ]);

    await adminService.finalizeMatch(selectedMatch._id);

    const finalMatchResult = `${championshipWinnerName} Victory (${outcome === 'Goal' ? 'Sudden Death Goal' : 'Decisive Penalty Save'})`;
    setSelectedMatch((prev) =>
      prev
        ? {
            ...prev,
            status: 'Completed',
            matchResult: finalMatchResult,
            shootout: {
              isShootout: true,
              teamAPenaltyScore: finalPenaltyA,
              teamBPenaltyScore: finalPenaltyB,
              isCompleted: true,
            },
          }
        : null
    );

    setMatches((prev) =>
      prev.map((m) =>
        m._id === selectedMatch._id
          ? {
              ...m,
              status: 'Completed',
              matchResult: finalMatchResult,
            }
          : m
      )
    );

    showNotification(
      `🏆 MATCH DECIDED! ${championshipWinnerName} WINS! Kick outcome: ${outcome.toUpperCase()}! Shootout: ${finalPenaltyA} - ${finalPenaltyB}.`
    );
  };

  const handleFinalizeMatch = async () => {
    if (!selectedMatch) return;
    const confirm = window.confirm(
      `Declare match as Completed with final score ${scoreA} - ${scoreB}? Standings will update automatically.`
    );
    if (!confirm) return;

    setTimerRunning(false);
    setCurrentStage('Completed');
    setRemainingSeconds(0);

    await adminService.finalizeMatch(selectedMatch._id);

    const winnerName = scoreA > scoreB ? teamAName : scoreB > scoreA ? teamBName : null;
    const resultStr = winnerName ? `${winnerName} Victory` : 'Full Time Draw';

    setSelectedMatch((prev) => (prev ? { ...prev, status: 'Completed', matchResult: resultStr } : null));
    setMatches((prev) => prev.map((m) => (m._id === selectedMatch._id ? { ...m, status: 'Completed' } : m)));

    showNotification(`Match is officially OVER! Marked as Completed (${scoreA} - ${scoreB}). Standings updated.`);
  };

  // Penalties calculation
  const kicksA = penaltyKicks.filter((k) => k.team === 'A').length;
  const kicksB = penaltyKicks.filter((k) => k.team === 'B').length;
  const regulationKicksComplete = kicksA >= 3 && kicksB >= 3;
  const isShootoutTiedAfterThree = regulationKicksComplete && penaltyScoreA === penaltyScoreB;
  const hasShootoutWinner = regulationKicksComplete && penaltyScoreA !== penaltyScoreB;

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
          <p className="text-xs text-on-surface-variant font-medium mt-1">
            Official 10-Minute Tournament Clock: 4m 1st Half • 2m Half-Time Break • 4m 2nd Half • 2m Extra Time if tied • 3-Kick Shootout + Coin Toss
          </p>
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

      {actionError && (
        <div className="bg-rose-50 border border-rose-300 text-rose-900 rounded-xl p-3.5 flex items-center gap-2 text-xs font-bold shadow-xs animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{actionError}</span>
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
              {selectedMatch?.venue || 'Varsity Stadium'} • Ref: Official Director
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

        {/* Completion Alert Banner if match is over */}
        {selectedMatch?.status === 'Completed' && (
          <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg border border-slate-800 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-lg">
                ✓
              </div>
              <div>
                <div className="font-headline-md text-sm font-black tracking-wide text-emerald-400 uppercase">
                  MATCH FINISHED & OVER (FULL TIME)
                </div>
                <div className="text-xs text-slate-300">
                  Final Result: <strong className="text-white">{teamAName} {scoreA} - {scoreB} {teamBName}</strong> • {selectedMatch.matchResult || (scoreA > scoreB ? `${teamAName} Win` : scoreB > scoreA ? `${teamBName} Win` : 'Draw')}
                </div>
              </div>
            </div>
            <span className="font-label-caps text-xs px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-bold">
              OFFICIALLY COMPLETED
            </span>
          </div>
        )}

        {/* Central Score Display */}
        <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-6">
          {/* Team A */}
          <div className="md:col-span-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-container/15 text-primary-container flex items-center justify-center font-black text-2xl shadow-inner border border-primary-container/30 shrink-0">
              {teamAName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="font-headline-md text-2xl font-black text-on-surface leading-tight">
                {teamAName}
              </h2>
              <span className="font-label-caps text-xs text-on-surface-variant font-semibold">
                Home Squad
              </span>
            </div>
          </div>

          {/* Middle: Dark Scoreboard matching official reference */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 bg-surface-container-low rounded-2xl border border-surface-container shadow-inner">
            <span className="font-label-caps text-[10px] text-primary-container font-extrabold uppercase mb-1 tracking-wider bg-primary-container/10 px-3 py-0.5 rounded-full border border-primary-container/20">
              Official Match Score
            </span>

            {/* Dark Scoreboard Box matching user screenshot */}
            <div className="bg-[#1e2025] px-8 py-3.5 rounded-2xl border border-white/10 shadow-lg flex flex-col items-center gap-1 my-2 min-w-[210px]">
              <div className="flex items-center justify-center gap-6">
                <span className="font-display-score text-4xl sm:text-5xl font-black text-white tabular-nums">
                  {scoreA}
                </span>
                <span className="font-display-score text-3xl font-light text-slate-400">
                  -
                </span>
                <span className="font-display-score text-4xl sm:text-5xl font-black text-white tabular-nums">
                  {scoreB}
                </span>
              </div>

              {(scoreA === scoreB || penaltyScoreA > 0 || penaltyScoreB > 0) && (
                <div className="text-xs sm:text-sm font-semibold text-[#8a94a6] font-label-ui">
                  Penalties: <span className="text-white font-extrabold">{penaltyScoreA} - {penaltyScoreB}</span>
                </div>
              )}
            </div>

            {/* Direct Score Adjustment Controls */}
            <div className="flex items-center justify-center gap-6 mt-1">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleScoreAdjust('A', -1)}
                  disabled={selectedMatch?.status === 'Completed'}
                  className="w-6 h-6 rounded-md bg-surface-container hover:bg-surface-container-high border border-surface-container-high text-on-surface-variant font-black flex items-center justify-center text-xs disabled:opacity-30"
                  title="Decrease Team A score"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => handleScoreAdjust('A', 1)}
                  disabled={selectedMatch?.status === 'Completed'}
                  className="w-6 h-6 rounded-md bg-surface-container hover:bg-surface-container-high border border-surface-container-high text-primary-container font-black flex items-center justify-center text-xs disabled:opacity-30"
                  title="Increase Team A score"
                >
                  +
                </button>
              </div>
              <span className="text-[10px] text-on-surface-variant font-semibold">Adjust Score</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleScoreAdjust('B', -1)}
                  disabled={selectedMatch?.status === 'Completed'}
                  className="w-6 h-6 rounded-md bg-surface-container hover:bg-surface-container-high border border-surface-container-high text-on-surface-variant font-black flex items-center justify-center text-xs disabled:opacity-30"
                  title="Decrease Team B score"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => handleScoreAdjust('B', 1)}
                  disabled={selectedMatch?.status === 'Completed'}
                  className="w-6 h-6 rounded-md bg-surface-container hover:bg-surface-container-high border border-surface-container-high text-primary-container font-black flex items-center justify-center text-xs disabled:opacity-30"
                  title="Increase Team B score"
                >
                  +
                </button>
              </div>
            </div>

            <div className="font-stat-numeral text-2xl font-black text-primary-container tabular-nums mt-2 tracking-tight">
              {formatTime(remainingSeconds)}
            </div>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase mt-0.5">
              Stage: <strong>{currentStage}</strong>
            </span>
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
            <div className="w-16 h-16 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center font-black text-2xl shadow-inner border border-secondary/30 shrink-0">
              {teamBName.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Primary Action Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {/* Pause / Resume Clock Button */}
          {selectedMatch?.status === 'Completed' ? (
            <div className="py-3 px-4 rounded-xl bg-surface-container-high/60 text-on-surface-variant font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-surface-container-high cursor-not-allowed">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Full Time</span>
            </div>
          ) : timerRunning ? (
            <button
              onClick={handlePause}
              className="py-3 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs active:scale-95"
            >
              <Pause className="w-4 h-4 text-amber-600" />
              <span>Pause Clock</span>
            </button>
          ) : (
            <button
              onClick={handleStartOrResume}
              className="py-3 px-4 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs active:scale-95"
            >
              <Play className="w-4 h-4" />
              <span>{selectedMatch?.status === 'Upcoming' ? 'Start Match' : 'Resume Clock'}</span>
            </button>
          )}

          {/* Goal Team A */}
          <button
            onClick={() => handleOpenGoalModal('A')}
            disabled={selectedMatch?.status === 'Completed'}
            className="py-3 px-4 rounded-xl bg-surface-container hover:bg-emerald-50 hover:border-emerald-300 border border-surface-container-high text-xs font-bold text-on-surface flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-40"
          >
            <Plus className="w-4 h-4 text-primary-container" />
            <span>+ Goal ({teamAName.split(' ')[0]})</span>
          </button>

          {/* Goal Team B */}
          <button
            onClick={() => handleOpenGoalModal('B')}
            disabled={selectedMatch?.status === 'Completed'}
            className="py-3 px-4 rounded-xl bg-surface-container hover:bg-emerald-50 hover:border-emerald-300 border border-surface-container-high text-xs font-bold text-on-surface flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-40"
          >
            <Plus className="w-4 h-4 text-primary-container" />
            <span>+ Goal ({teamBName.split(' ')[0]})</span>
          </button>

          {/* Finalize / Stop Match */}
          {selectedMatch?.status === 'Completed' ? (
            <div className="py-3 px-4 rounded-xl bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs cursor-default">
              <CheckCircle2 className="w-4 h-4" />
              <span>Completed</span>
            </div>
          ) : (
            <button
              onClick={handleFinalizeMatch}
              className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Finalize Match</span>
            </button>
          )}
        </div>
      </div>

      {/* Stage Transitions & Shootout Controller Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Official 10-Minute Match Stage Transitions */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-container" />
              <h3 className="font-headline-md text-base font-extrabold text-on-surface">
                10-Minute Match Protocol Stages
              </h3>
            </div>
            <button
              onClick={handleAdvanceNextStage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-bold text-xs shadow-xs transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Advance Next Stage ⚡</span>
            </button>
          </div>

          <p className="text-xs text-on-surface-variant font-medium">
            Standard match timeline: 4m 1st Half &rarr; 2m Half-Time Break &rarr; 4m 2nd Half &rarr; +2m Extra Time if tied:
          </p>

          <div className="grid grid-cols-2 gap-3">
            {/* 1. First Half */}
            <button
              onClick={handleStartFirstHalf}
              className={`py-3 px-3 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all ${
                currentStage.includes('First')
                  ? 'bg-primary-container/15 text-primary-container border-primary-container'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface border-surface-container'
              }`}
            >
              <span className="font-extrabold">1. First Half (4:00)</span>
              <span className="text-[10px] text-on-surface-variant">4 minutes countdown kickoff</span>
            </button>

            {/* 2. Half-Time Break */}
            <button
              onClick={handleHalfTimeBreak}
              className={`py-3 px-3 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all ${
                currentStage.includes('Half-Time') || currentStage.includes('Break')
                  ? 'bg-primary-container/15 text-primary-container border-primary-container'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface border-surface-container'
              }`}
            >
              <span className="font-extrabold">2. Half-Time Break (2:00)</span>
              <span className="text-[10px] text-on-surface-variant">2 minutes interval break</span>
            </button>

            {/* 3. Second Half */}
            <button
              onClick={handleSecondHalf}
              className={`py-3 px-3 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all ${
                currentStage.includes('Second')
                  ? 'bg-primary-container/15 text-primary-container border-primary-container'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface border-surface-container'
              }`}
            >
              <span className="font-extrabold">3. Second Half (4:00)</span>
              <span className="text-[10px] text-on-surface-variant">4 minutes second half clock</span>
            </button>

            {/* 4. Draw Decider Extra Time (2:00) */}
            <button
              onClick={handleExtraTimeDraw}
              className={`py-3 px-3 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all ${
                currentStage.includes('Extra Time')
                  ? 'bg-amber-500/20 text-amber-800 border-amber-500'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface border-surface-container'
              }`}
            >
              <span className="font-extrabold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>4. Extra Time if Tied (2:00)</span>
                {scoreA === scoreB && (
                  <span className="text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-black uppercase">
                    Tied
                  </span>
                )}
              </span>
              <span className="text-[10px] text-on-surface-variant">
                If scores are equal, add 2 minutes extra time
              </span>
            </button>
          </div>

          {/* Clock Adjustments Strip */}
          <div className="pt-3 border-t border-surface-container-high flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-on-surface-variant font-semibold">Quick Time Buttons:</span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleAddTime(60)}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors"
              >
                +1 Min Time
              </button>
              <button
                onClick={() => handleAddTime(120)}
                className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold hover:bg-emerald-200 transition-colors"
              >
                +2 Min Extra Time
              </button>
              <button
                onClick={() => setRemainingSeconds(240)}
                className="px-2.5 py-1 rounded-lg bg-surface-container text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors"
              >
                Reset 4:00
              </button>
              <button
                onClick={() => setRemainingSeconds(120)}
                className="px-2.5 py-1 rounded-lg bg-surface-container text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors"
              >
                Reset 2:00
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): 3-Kick Penalty Shootout + Sudden Death Coin Toss */}
        {scoreA === scoreB ? (
          <div className="lg:col-span-5 bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high shadow-xs flex flex-col gap-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary-container" />
                <h3 className="font-headline-md text-base font-extrabold text-on-surface">
                  Penalty Shootout Console
                </h3>
              </div>
              <span className="font-label-caps text-[10px] text-primary-container bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                3-KICK STANDARD
              </span>
            </div>

            {/* Shootout Score Header */}
            <div className="bg-[#1e2025] px-4 py-2.5 rounded-xl border border-white/10 flex items-center justify-between text-xs text-white">
              <span className="font-bold text-slate-300">Shootout Score:</span>
              <span className="font-display-score text-base font-black text-white tabular-nums">
                {teamAName} {penaltyScoreA} — {penaltyScoreB} {teamBName}
              </span>
            </div>

            {/* Shootout Decided Alert if winner after 3 kicks */}
            {hasShootoutWinner && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-black">
                  <Trophy className="w-4 h-4 text-emerald-600" />
                  <span>
                    SHOOTOUT DECIDED! {penaltyScoreA > penaltyScoreB ? teamAName : teamBName} wins {penaltyScoreA} - {penaltyScoreB}!
                  </span>
                </div>
                <button
                  onClick={handleFinalizeMatch}
                  className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider"
                >
                  Finalize Match Victory
                </button>
              </div>
            )}

            {/* Sudden Death Coin Toss Section if tied after 3 kicks */}
            {isShootoutTiedAfterThree && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-col gap-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-amber-800">
                    <Coins className="w-4 h-4 text-amber-600" />
                    <span>Sudden Death Coin Toss</span>
                  </span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                    3 Kicks Tied ({penaltyScoreA}-{penaltyScoreB})
                  </span>
                </div>

                {!tossState.tossWinner ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-amber-900 leading-relaxed font-medium">
                      All 3 regulation penalties are tied! Flip the coin to decide which team chooses their decisive role.
                    </p>
                    <button
                      type="button"
                      onClick={handleFlipCoin}
                      disabled={tossState.isFlipping}
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                      <Coins className={`w-4 h-4 ${tossState.isFlipping ? 'animate-spin' : ''}`} />
                      <span>{tossState.isFlipping ? 'Flipping Coin...' : '🪙 Flip Coin for Sudden Death'}</span>
                    </button>
                  </div>
                ) : !tossState.tossChoice ? (
                  <div className="flex flex-col gap-2.5">
                    <div className="bg-amber-100 p-2.5 rounded-lg border border-amber-300 text-xs font-black text-amber-950">
                      🪙 {tossState.tossWinner === 'A' ? teamAName : teamBName} WON THE COIN TOSS!
                    </div>
                    <p className="text-xs text-amber-900 font-medium">
                      The coin toss winner must decide: do you take the decisive kick (SHOOT) or defend the goal (SAVE)?
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectTossChoice('shoot')}
                        className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
                      >
                        🎯 We Choose to SHOOT
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectTossChoice('save')}
                        className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
                      >
                        🧤 We Choose to SAVE
                      </button>
                    </div>
                  </div>
                ) : !tossState.isResolved ? (
                  <div className="flex flex-col gap-3">
                    {(() => {
                      const winner = tossState.tossWinner;
                      const choice = tossState.tossChoice;
                      const shootingTeam = (winner === 'A' && choice === 'shoot') || (winner === 'B' && choice === 'save') ? 'A' : 'B';
                      const defendingTeam = shootingTeam === 'A' ? 'B' : 'A';
                      const shootingTeamName = shootingTeam === 'A' ? teamAName : teamBName;
                      const defendingTeamName = defendingTeam === 'A' ? teamAName : teamBName;
                      const shootingPlayers = shootingTeam === 'A' ? teamAPlayers : teamBPlayers;

                      return (
                        <>
                          <div className="bg-amber-100 p-2.5 rounded-lg border border-amber-300 text-xs">
                            <span className="font-bold block text-amber-950">
                              Decisive Kick: <strong className="text-emerald-800">{shootingTeamName} (Shooter)</strong> vs{' '}
                              <strong className="text-blue-800">{defendingTeamName} (Goalkeeper)</strong>
                            </span>
                            <span className="text-[11px] text-amber-800 block mt-0.5">
                              If the shooter scores, {shootingTeamName} wins! If saved or missed, {defendingTeamName} wins!
                            </span>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-amber-900 uppercase font-label-caps mb-1">
                              Select Sudden-Death Shooter ({shootingTeamName}):
                            </label>
                            <select
                              value={tossState.selectedDecisiveShooterId}
                              onChange={(e) =>
                                setTossState((prev) => ({
                                  ...prev,
                                  selectedDecisiveShooterId: e.target.value,
                                }))
                              }
                              className="w-full px-2.5 py-2 bg-white border border-amber-300 rounded-xl text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-2xs"
                            >
                              {shootingPlayers.map((p) => (
                                <option key={p._id} value={p._id}>
                                  #{p.jerseyNumber} - {p.name} {p.club ? `[Club: ${p.club}]` : ''}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleResolveDecisiveKick('Goal')}
                              className="py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-all active:scale-95 text-center"
                            >
                              ⚽ Goal! ({shootingTeamName} Wins)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleResolveDecisiveKick('Saved')}
                              className="py-2 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-xs transition-all active:scale-95 text-center"
                            >
                              🧤 Saved! ({defendingTeamName} Wins)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleResolveDecisiveKick('Missed')}
                              className="py-2 px-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-xs transition-all active:scale-95 text-center"
                            >
                              ❌ Missed! ({defendingTeamName} Wins)
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-100 rounded-xl border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-emerald-700" />
                    <span>CHAMPIONSHIP DECIDED: {tossState.winnerTeamName} WINS!</span>
                  </div>
                )}
              </div>
            )}

            {/* 3-Kick Recorder Columns (Visible during regulation 3 kicks) */}
            {!regulationKicksComplete && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Team A Kicks (Max 3) */}
                <div className="bg-surface-container-low p-3.5 rounded-xl border border-surface-container flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-label-caps text-xs text-on-surface font-extrabold truncate">
                      {teamAName}
                    </span>
                    <span className="font-display-score text-xs font-black text-primary-container">
                      {kicksA}/3 Kicks • {penaltyScoreA} PK
                    </span>
                  </div>

                  {/* Athlete Selector for Team A */}
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase font-label-caps mb-1">
                      Penalty Shooter:
                    </label>
                    <select
                      value={selectedKickerA}
                      onChange={(e) => setSelectedKickerA(e.target.value)}
                      disabled={kicksA >= 3}
                      className="w-full px-2.5 py-2 bg-surface-container-lowest border border-surface-container-high rounded-xl text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container cursor-pointer shadow-2xs truncate disabled:opacity-40"
                    >
                      {teamAPlayers.map((p) => (
                        <option key={p._id} value={p._id}>
                          #{p.jerseyNumber} - {p.name} {p.club ? `[Club: ${p.club}]` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Action Buttons Team A */}
                  <div className="flex flex-col gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleRecordPenaltyKick('A', 'Goal')}
                      disabled={kicksA >= 3}
                      className="py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 disabled:opacity-40"
                    >
                      ⚽ Goal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRecordPenaltyKick('A', 'Saved')}
                      disabled={kicksA >= 3}
                      className="py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 disabled:opacity-40"
                    >
                      🧤 Saved
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRecordPenaltyKick('A', 'Missed')}
                      disabled={kicksA >= 3}
                      className="py-1.5 px-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 disabled:opacity-40"
                    >
                      ❌ Missed
                    </button>
                  </div>
                </div>

                {/* Team B Kicks (Max 3) */}
                <div className="bg-surface-container-low p-3.5 rounded-xl border border-surface-container flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-label-caps text-xs text-on-surface font-extrabold truncate">
                      {teamBName}
                    </span>
                    <span className="font-display-score text-xs font-black text-primary-container">
                      {kicksB}/3 Kicks • {penaltyScoreB} PK
                    </span>
                  </div>

                  {/* Athlete Selector for Team B */}
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase font-label-caps mb-1">
                      Penalty Shooter:
                    </label>
                    <select
                      value={selectedKickerB}
                      onChange={(e) => setSelectedKickerB(e.target.value)}
                      disabled={kicksB >= 3}
                      className="w-full px-2.5 py-2 bg-surface-container-lowest border border-surface-container-high rounded-xl text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container cursor-pointer shadow-2xs truncate disabled:opacity-40"
                    >
                      {teamBPlayers.map((p) => (
                        <option key={p._id} value={p._id}>
                          #{p.jerseyNumber} - {p.name} {p.club ? `[Club: ${p.club}]` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Action Buttons Team B */}
                  <div className="flex flex-col gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleRecordPenaltyKick('B', 'Goal')}
                      disabled={kicksB >= 3}
                      className="py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 disabled:opacity-40"
                    >
                      ⚽ Goal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRecordPenaltyKick('B', 'Saved')}
                      disabled={kicksB >= 3}
                      className="py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 disabled:opacity-40"
                    >
                      🧤 Saved
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRecordPenaltyKick('B', 'Missed')}
                      disabled={kicksB >= 3}
                      className="py-1.5 px-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 disabled:opacity-40"
                    >
                      ❌ Missed
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Kicks Log with Athlete Names and Clubs */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pt-2 border-t border-surface-container">
              {penaltyKicks.length === 0 ? (
                <p className="text-center text-xs text-on-surface-variant py-3 font-medium">
                  3 penalty kicks per team. Select shooter and record penalty outcomes.
                </p>
              ) : (
                penaltyKicks.map((k, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-surface-container border border-surface-container-high/60 shadow-2xs"
                  >
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-on-surface">
                        {k.round === 4 ? '⚡ SUDDEN DEATH:' : `Kick #${k.round}/3 (${k.team === 'A' ? teamAName : teamBName}):`}
                      </span>
                      <span className="font-semibold text-primary-container">
                        {k.playerName} (#{k.playerJersey})
                      </span>
                      {k.playerClub && (
                        <span className="text-[10px] text-on-surface-variant font-medium">
                          [{k.playerClub}]
                        </span>
                      )}
                    </div>
                    <span
                      className={`font-bold uppercase px-2.5 py-0.5 rounded-full text-[10px] shrink-0 ${
                        k.outcome === 'Goal'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : k.outcome === 'Saved'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}
                    >
                      {k.outcome}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Penalty Shootout Inactive Placeholder when not tied */
          <div className="lg:col-span-5 bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high shadow-xs flex flex-col items-center justify-center text-center py-12">
            <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant/40 mb-3 border border-surface-container-high">
              <Target className="w-6 h-6" />
            </div>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold bg-surface-container px-3 py-0.5 rounded-full mb-2 border border-surface-container-high">
              Conditional Tie-Breaker
            </span>
            <h4 className="font-headline-md text-base font-black text-on-surface">
              Penalty Shootout Inactive
            </h4>
            <p className="text-xs text-on-surface-variant max-w-sm mt-1.5 font-medium leading-relaxed">
              Penalty shootout unlocks exclusively if the match ends in a draw (<strong className="text-on-surface">{teamAName} {scoreA} - {scoreB} {teamBName}</strong>). When scores are tied, the 3-kick penalty shootout console will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Goal Recorder Modal with Roster Dropdown */}
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
              {/* Goalscorer Athlete Dropdown */}
              <div>
                <label className="block text-[11px] font-bold text-on-surface uppercase font-label-caps mb-1">
                  Goalscorer Athlete (Dropdown)
                </label>
                <select
                  value={goalPlayerName}
                  onChange={(e) => setGoalPlayerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container cursor-pointer font-semibold"
                >
                  <option value="">-- Select Athlete --</option>
                  {(goalTeam === 'A' ? teamAPlayers : teamBPlayers).map((p) => (
                    <option key={p._id} value={p.name}>
                      #{p.jerseyNumber} - {p.name} {p.club ? `[Club: ${p.club}]` : ''} ({p.position})
                    </option>
                  ))}
                </select>
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
