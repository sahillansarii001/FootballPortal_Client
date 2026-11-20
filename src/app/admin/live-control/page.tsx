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
  Hourglass,
  X,
  Search,
  Calendar,
  Layers,
  MapPin
} from 'lucide-react';
import { matchService } from '@/services/match.service';
import { teamService } from '@/services/team.service';
import { adminService } from '@/services/admin.service';
import { formatTime } from '@/utils/formatters';
import { Match, Player, Team } from '@/types';
import { useSocket } from '@/hooks/useSocket';

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

  // Match Selector / Launcher Modal
  const [showMatchPickerModal, setShowMatchPickerModal] = useState(false);
  const [matchPickerFilter, setMatchPickerFilter] = useState<'all' | 'Upcoming' | 'Live' | 'Completed'>('all');
  const [matchSearchTerm, setMatchSearchTerm] = useState('');
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [showQuickSchedule, setShowQuickSchedule] = useState(false);
  const [newTeamA, setNewTeamA] = useState('');
  const [newTeamB, setNewTeamB] = useState('');
  const [newVenue, setNewVenue] = useState('Championship Field 1');
  const [newStage, setNewStage] = useState('Quarter Final');

  // Modal / Form state for Goal Recording
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalTeam, setGoalTeam] = useState<'A' | 'B'>('A');
  const [goalPlayerName, setGoalPlayerName] = useState('');
  const [goalMinute, setGoalMinute] = useState('02:30 (1H)');

  // Completed Match Protocol Stages tracker
  const [completedStages, setCompletedStages] = useState<string[]>([]);

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

  const teamAName = selectedMatch?.teamA?.name || 'Team A';
  const teamBName = selectedMatch?.teamB?.name || 'Team B';

  const { socket } = useSocket();

  // Real-time authoritative Socket.IO listeners
  useEffect(() => {
    if (!socket || !selectedMatch?._id) return;
    const matchId = selectedMatch._id;

    socket.emit('join:match', matchId);

    const handleTimerSync = (data: any) => {
      if (data?.remainingTime !== undefined) {
        setRemainingSeconds(data.remainingTime);
      }
      if (data?.currentStage) {
        setCurrentStage(data.currentStage);
      }
      if (data?.isRunning !== undefined) {
        setTimerRunning(Boolean(data.isRunning && !data.isPaused));
      }
      setSelectedMatch((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: data?.status || (data?.isRunning ? 'Live' : prev.status),
          timer: {
            ...(prev.timer || {}),
            ...data,
            isRunning: Boolean(data.isRunning),
            isPaused: Boolean(data.isPaused),
          }
        };
      });
    };

    socket.on('timer:started', handleTimerSync);
    socket.on('timer:resumed', handleTimerSync);
    socket.on('timer:paused', handleTimerSync);
    socket.on('timer:sync', handleTimerSync);
    socket.on('match:phase_changed', handleTimerSync);
    socket.on('stage:change', handleTimerSync);

    return () => {
      socket.emit('leave:match', matchId);
      socket.off('timer:started', handleTimerSync);
      socket.off('timer:resumed', handleTimerSync);
      socket.off('timer:paused', handleTimerSync);
      socket.off('timer:sync', handleTimerSync);
      socket.off('match:phase_changed', handleTimerSync);
      socket.off('stage:change', handleTimerSync);
    };
  }, [socket, selectedMatch?._id]);

  useEffect(() => {
    async function loadMatches() {
      setLoading(true);
      const [all, teams] = await Promise.all([
        matchService.getAllMatches(),
        teamService.getAllTeams(),
      ]);
      setMatches(all);
      setAllTeams(teams);
      if (teams.length >= 2) {
        setNewTeamA(teams[0]._id);
        setNewTeamB(teams[1]._id);
      }
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
    setTimerRunning(Boolean(match.timer?.isRunning && !match.timer?.isPaused));
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

    // Synchronize completed stages based on match state
    if (match.status === 'Completed') {
      setCompletedStages(['First Half', 'Half-Time Break', 'Second Half', 'Extra Time (Draw Decider)']);
    } else if (match.timer?.currentStage?.includes('Extra') || match.timer?.currentStage?.includes('Penalty')) {
      setCompletedStages(['First Half', 'Half-Time Break', 'Second Half']);
    } else if (match.timer?.currentStage?.includes('Second')) {
      setCompletedStages(['First Half', 'Half-Time Break']);
    } else if (match.timer?.currentStage?.includes('Half-Time') || match.timer?.currentStage?.includes('Break')) {
      setCompletedStages(['First Half']);
    } else {
      setCompletedStages([]);
    }

    // Fetch players for both teams to populate goalscorer and penalty kicker dropdowns
    const teamAId = typeof match.teamA === 'object' && match.teamA ? match.teamA._id : (match.teamA as string);
    const teamBId = typeof match.teamB === 'object' && match.teamB ? match.teamB._id : (match.teamB as string);

    if (teamAId) {
      const pA = await teamService.getTeamPlayers(teamAId);
      setTeamAPlayers(pA);
      if (pA.length > 0) setSelectedKickerA(pA[0]._id);
    }
    if (teamBId) {
      const pB = await teamService.getTeamPlayers(teamBId);
      setTeamBPlayers(pB);
      if (pB.length > 0) setSelectedKickerB(pB[0]._id);
    }
  };

  // Authoritative server clock synchronization (every 2.5s) to guarantee Live Control & Broadcast panels match 100%
  useEffect(() => {
    if (!selectedMatch?._id || selectedMatch.status === 'Completed') return;
    let isCancelled = false;

    const syncInterval = setInterval(async () => {
      try {
        const liveData = await matchService.getMatchById(selectedMatch._id);
        if (liveData && !isCancelled) {
          const isRunningNow = Boolean(liveData.timer?.isRunning && !liveData.timer?.isPaused);
          setTimerRunning(isRunningNow);
          if (liveData.timer?.remainingTime !== undefined) {
            setRemainingSeconds(liveData.timer.remainingTime);
          }
          if (liveData.timer?.currentStage) {
            setCurrentStage(liveData.timer.currentStage);
          }
          setSelectedMatch((prev) => {
            if (!prev) return liveData;
            return {
              ...prev,
              status: liveData.status,
              timer: liveData.timer,
              score: liveData.score,
              teamAScore: liveData.teamAScore,
              teamBScore: liveData.teamBScore
            };
          });
        }
      } catch (err) {
        // Silent catch for background poll
      }
    }, 2500);

    return () => {
      isCancelled = true;
      clearInterval(syncInterval);
    };
  }, [selectedMatch?._id, selectedMatch?.status]);

  // Local ticker countdown for smooth visual representation (backend ticker is authoritative for transitions)
  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

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
    const isUpcoming = selectedMatch.status === 'Upcoming' || !selectedMatch.timer?.isRunning;
    
    let res;
    if (isUpcoming) {
      res = await adminService.startMatch(selectedMatch._id);
    } else {
      res = await adminService.resumeMatch(selectedMatch._id);
    }

    if (!res || !res.success) {
      setTimerRunning(false);
      showError(res?.error || (res as any)?.message || 'Failed to start timer. Check authorization.');
      return;
    }

    // Backend accepted authoritative start/resume:
    setTimerRunning(true);
    const updatedTimer = res.data?.timer || {
      ...selectedMatch.timer,
      isRunning: true,
      isPaused: false,
      remainingTime: res.data?.remainingMs ? Math.round(res.data.remainingMs / 1000) : selectedMatch.timer?.remainingTime ?? 240,
      phaseEndsAt: res.data?.phaseEndsAt,
      currentStage: res.data?.phase || selectedMatch.timer?.currentStage || 'First Half',
      timerStatus: 'RUNNING'
    };

    setSelectedMatch((prev) => prev ? {
      ...prev,
      status: 'Live',
      timer: updatedTimer
    } : null);

    setMatches((prev) =>
      prev.map((m) => (m._id === selectedMatch._id ? { ...m, status: 'Live', timer: updatedTimer } : m))
    );

    if (updatedTimer.remainingTime !== undefined) {
      setRemainingSeconds(updatedTimer.remainingTime);
    }
    if (updatedTimer.currentStage) {
      setCurrentStage(updatedTimer.currentStage);
    }

    showNotification(isUpcoming ? 'Match started! Live clock is RUNNING.' : 'Clock resumed! Live clock is RUNNING.');
  };

  const handlePause = async () => {
    if (!selectedMatch) return;
    const res = await adminService.pauseMatch(selectedMatch._id);
    if (!res || !res.success) {
      showError(res?.error || (res as any)?.message || 'Failed to pause clock.');
      return;
    }

    setTimerRunning(false);
    const pausedTimer = res.data?.timer || {
      ...selectedMatch.timer,
      isRunning: true,
      isPaused: true,
      remainingTime: res.data?.remainingMs ? Math.round(res.data.remainingMs / 1000) : remainingSeconds,
      phaseEndsAt: null,
      timerStatus: 'PAUSED'
    };

    setSelectedMatch((prev) => prev ? { ...prev, timer: pausedTimer } : null);
    setMatches((prev) =>
      prev.map((m) => (m._id === selectedMatch._id ? { ...m, timer: pausedTimer } : m))
    );

    if (pausedTimer.remainingTime !== undefined) {
      setRemainingSeconds(pausedTimer.remainingTime);
    }

    showNotification('Timer paused and authoritative state broadcasted to Live viewers.');
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

  // Stage completion calculation
  const isFirstHalfDone =
    completedStages.includes('First Half') ||
    currentStage.includes('Half-Time') ||
    currentStage.includes('Break') ||
    currentStage.includes('Second') ||
    currentStage.includes('Extra') ||
    currentStage.includes('Penalty') ||
    selectedMatch?.status === 'Completed';

  const isHalfTimeDone =
    completedStages.includes('Half-Time Break') ||
    currentStage.includes('Second') ||
    currentStage.includes('Extra') ||
    currentStage.includes('Penalty') ||
    selectedMatch?.status === 'Completed';

  const isSecondHalfDone =
    completedStages.includes('Second Half') ||
    currentStage.includes('Extra') ||
    currentStage.includes('Penalty') ||
    selectedMatch?.status === 'Completed';

  const isExtraTimeDone =
    completedStages.includes('Extra Time (Draw Decider)') ||
    currentStage.includes('Penalty') ||
    selectedMatch?.status === 'Completed';

  // 1. First Half (4:00)
  const handleStartFirstHalf = async () => {
    if (!selectedMatch || isFirstHalfDone) return;
    setTimerRunning(true);
    setCurrentStage('First Half');
    setRemainingSeconds(240); // 4 minutes
    await adminService.resumeMatch(selectedMatch._id);
    showNotification('Stage set: First Half underway (4 minutes countdown).');
  };

  // 2. Half-Time Break (2:00)
  const handleHalfTimeBreak = async () => {
    if (!selectedMatch || isHalfTimeDone) return;
    setTimerRunning(true);
    setCurrentStage('Half-Time Break');
    setCompletedStages((prev) => Array.from(new Set([...prev, 'First Half'])));
    setRemainingSeconds(120); // 2 minutes break
    await adminService.advanceStage(selectedMatch._id);
    showNotification('First Half completed! Half-Time Break started (2 minutes interval).');
  };

  // 3. Second Half (4:00)
  const handleSecondHalf = async () => {
    if (!selectedMatch || isSecondHalfDone) return;
    setTimerRunning(true);
    setCurrentStage('Second Half');
    setCompletedStages((prev) => Array.from(new Set([...prev, 'First Half', 'Half-Time Break'])));
    setRemainingSeconds(240); // 4 minutes
    await adminService.advanceStage(selectedMatch._id);
    showNotification('Second Half underway (4 minutes countdown).');
  };

  // 4. Draw Decider Extra Time (2:00)
  const handleExtraTimeDraw = async () => {
    if (!selectedMatch || isExtraTimeDone) return;
    setTimerRunning(true);
    setCurrentStage('Extra Time (Draw Decider)');
    setCompletedStages((prev) => Array.from(new Set([...prev, 'First Half', 'Half-Time Break', 'Second Half'])));
    setRemainingSeconds(120); // 2 minutes extra time
    await adminService.addTimeToTimer(selectedMatch._id, 120);
    showNotification(`Match is a Draw (${scoreA} - ${scoreB})! 2 minutes extra time added to timer.`);
  };

  // Auto-Advance Next Stage in Sequence via Backend Authority
  const handleAdvanceNextStage = async () => {
    if (!selectedMatch) return;
    const res = await adminService.advanceStage(selectedMatch._id);
    if (res?.success && res.data) {
      const matchData = res.data;
      const stage = matchData.timer?.currentStage || matchData.phase || matchData.status;
      setCurrentStage(stage);
      setRemainingSeconds(matchData.timer?.remainingTime ?? 0);
      setTimerRunning(Boolean(matchData.timer?.isRunning && !matchData.timer?.isPaused));

      if (stage === 'Penalty Shootout' || matchData.status === 'Penalty Shootout') {
        setCompletedStages((all) =>
          Array.from(new Set([...all, 'First Half', 'Half-Time Break', 'Second Half', 'Extra Time (Draw Decider)']))
        );
        showNotification(`Advanced to Penalty Shootout! 3 regulation kicks per team.`);
        setTimeout(() => {
          document.getElementById('penalty-shootout-console')?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else if (matchData.status === 'Completed' || stage === 'Match Completed') {
        showNotification(`Match finalized and marked Completed.`);
      } else {
        showNotification(`Advanced stage to ${stage}!`);
      }

      const updated = await matchService.getMatchById(selectedMatch._id);
      if (updated) setSelectedMatch(updated);
    } else {
      showError(res?.error || 'Failed to advance stage');
    }
  };

  const handleOpenGoalModal = async (team: 'A' | 'B') => {
    setGoalTeam(team);
    const rawTarget = team === 'A' ? selectedMatch?.teamA : selectedMatch?.teamB;
    const targetTeamId: string =
      typeof rawTarget === 'object' && rawTarget ? rawTarget._id : typeof rawTarget === 'string' ? rawTarget : '';

    let players = team === 'A' ? teamAPlayers : teamBPlayers;
    if (targetTeamId) {
      try {
        const fetched = await teamService.getTeamPlayers(targetTeamId);
        if (team === 'A') {
          setTeamAPlayers(fetched);
        } else {
          setTeamBPlayers(fetched);
        }
        players = fetched;
      } catch (err) {
        console.error('Failed fetching players for goal modal:', err);
      }
    }

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
    const targetTeam = goalTeam === 'A' ? selectedMatch.teamA : selectedMatch.teamB;
    const teamId = typeof targetTeam === 'object' && targetTeam ? targetTeam._id : (targetTeam as string);
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

  const handleSelectTossChoice = async (choice: 'shoot' | 'save') => {
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

    if (selectedMatch && winner) {
      const winnerTeamId = winner === 'A' ? (typeof selectedMatch.teamA === 'string' ? selectedMatch.teamA : selectedMatch.teamA?._id) : (typeof selectedMatch.teamB === 'string' ? selectedMatch.teamB : selectedMatch.teamB?._id);
      if (winnerTeamId) {
        await adminService.recordToss(selectedMatch._id, {
          tossWinner: winnerTeamId,
          choice
        });
      }
    }

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

    if (shooterPlayer?._id) {
      await adminService.recordDecisiveKick(selectedMatch._id, {
        player: shooterPlayer._id,
        outcome,
      });
    }

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

  // Finalize / Complete Match directly without blocking popups
  const handleFinalizeMatch = async () => {
    if (!selectedMatch) return;

    setTimerRunning(false);
    setCurrentStage('Completed');
    setRemainingSeconds(0);

    await adminService.finalizeMatch(selectedMatch._id);

    let winnerId: string | null = null;
    let winnerName: string | null = null;
    let resultStr = 'Full Time Draw';

    if (scoreA > scoreB) {
      winnerId = selectedMatch.teamA?._id || null;
      winnerName = teamAName;
      resultStr = `${teamAName} Victory`;
    } else if (scoreB > scoreA) {
      winnerId = selectedMatch.teamB?._id || null;
      winnerName = teamBName;
      resultStr = `${teamBName} Victory`;
    } else if (penaltyScoreA > penaltyScoreB) {
      winnerId = selectedMatch.teamA?._id || null;
      winnerName = teamAName;
      resultStr = `${teamAName} won on penalties (${penaltyScoreA} - ${penaltyScoreB})`;
    } else if (penaltyScoreB > penaltyScoreA) {
      winnerId = selectedMatch.teamB?._id || null;
      winnerName = teamBName;
      resultStr = `${teamBName} won on penalties (${penaltyScoreA} - ${penaltyScoreB})`;
    } else if (selectedMatch.shootout?.shootoutWinner) {
      const swId = typeof selectedMatch.shootout.shootoutWinner === 'object'
        ? (selectedMatch.shootout.shootoutWinner as any)._id
        : selectedMatch.shootout.shootoutWinner;
      winnerId = swId;
      winnerName = swId === selectedMatch.teamA?._id ? teamAName : teamBName;
      resultStr = `${winnerName} won on penalties (${penaltyScoreA} - ${penaltyScoreB})`;
    } else if (tossState.tossWinner) {
      winnerName = tossState.tossWinner === 'A' ? teamAName : teamBName;
      winnerId = tossState.tossWinner === 'A' ? selectedMatch.teamA?._id : selectedMatch.teamB?._id;
      resultStr = `${winnerName} Sudden Death Victory`;
    }

    const finalizedMatch: Match = {
      ...selectedMatch,
      status: 'Completed',
      isFinalized: true,
      winner: winnerId,
      matchResult: resultStr,
      shootout: {
        isShootout: penaltyScoreA > 0 || penaltyScoreB > 0,
        teamAPenaltyScore: penaltyScoreA,
        teamBPenaltyScore: penaltyScoreB,
        isCompleted: true,
        shootoutWinner: winnerId,
      },
      timer: {
        stageDuration: selectedMatch.timer?.stageDuration || 240,
        ...selectedMatch.timer,
        isRunning: false,
        isPaused: false,
        remainingTime: 0,
        currentStage: 'Completed',
      },
    };

    setSelectedMatch(finalizedMatch);
    setMatches((prev) =>
      prev.map((m) => (m._id === selectedMatch._id ? finalizedMatch : m))
    );

    showNotification(
      `Match officially marked as Completed (${scoreA} - ${scoreB})! Result: ${resultStr}. Standings updated.`
    );
  };

  // Launch / Start a specific chosen match
  const handleLaunchMatch = async (targetMatch: Match) => {
    try {
      await selectMatch(targetMatch);
      await adminService.startMatch(targetMatch._id);

      setTimerRunning(true);
      setCurrentStage('First Half');
      setRemainingSeconds(240);
      setCompletedStages([]);

      const updatedMatch: Match = {
        ...targetMatch,
        status: 'Live',
        isFinalized: false,
        timer: {
          stageDuration: targetMatch.timer?.stageDuration || 240,
          isRunning: true,
          isPaused: false,
          remainingTime: 240,
          currentStage: 'First Half',
        },
      };

      setSelectedMatch(updatedMatch);
      setMatches((prev) =>
        prev.map((m) => (m._id === targetMatch._id ? updatedMatch : m))
      );
      setShowMatchPickerModal(false);
      showNotification(
        `▶ Started match: ${targetMatch.teamA?.name || 'Team A'} vs ${targetMatch.teamB?.name || 'Team B'}! 4:00 First Half clock is LIVE.`
      );
    } catch (err: any) {
      showError(`Failed to start match: ${err.message || 'Unknown error'}`);
    }
  };

  // Restart an already completed or current match at 0-0
  const handleRestartMatch = async (targetMatch?: Match | null) => {
    const match = targetMatch || selectedMatch;
    if (!match) return;
    try {
      await adminService.resetTimer(match._id);
      await adminService.startMatch(match._id);
      await adminService.updateScore(match._id, 0, 0);

      setScoreA(0);
      setScoreB(0);
      setPenaltyScoreA(0);
      setPenaltyScoreB(0);
      setPenaltyKicks([]);
      setRemainingSeconds(240);
      setCurrentStage('First Half');
      setCompletedStages([]);
      setTimerRunning(true);
      setTossState({
        isFlipping: false,
        tossWinner: null,
        tossChoice: null,
        isResolved: false,
        winnerTeamName: null,
        selectedDecisiveShooterId: '',
      });

      const updatedMatch: Match = {
        ...match,
        status: 'Live',
        isFinalized: false,
        teamAScore: 0,
        teamBScore: 0,
        score: { teamA: 0, teamB: 0 },
        winner: undefined,
        matchResult: '',
        timer: {
          stageDuration: match.timer?.stageDuration || 240,
          isRunning: true,
          isPaused: false,
          remainingTime: 240,
          currentStage: 'First Half',
        },
        shootout: {
          isShootout: false,
          teamAPenaltyScore: 0,
          teamBPenaltyScore: 0,
          isCompleted: false,
        },
      };

      setSelectedMatch(updatedMatch);
      setMatches((prev) =>
        prev.map((m) => (m._id === match._id ? updatedMatch : m))
      );
      setShowMatchPickerModal(false);
      showNotification(`Match restarted! Scores reset to 0 - 0 and 4:00 First Half clock is LIVE.`);
    } catch (err: any) {
      showError(`Failed to restart match: ${err.message || 'Unknown error'}`);
    }
  };

  // Quick schedule and start immediately
  const handleQuickCreateAndStart = async () => {
    if (!newTeamA || !newTeamB || newTeamA === newTeamB) {
      showError('Please select two distinct university teams.');
      return;
    }

    try {
      const res = await adminService.scheduleMatch({
        tournamentId: 'tourn-2026-spring',
        teamA: newTeamA,
        teamB: newTeamB,
        matchDate: new Date().toISOString().split('T')[0],
        matchTime: new Date().toTimeString().slice(0, 5),
        venue: newVenue || 'Championship Field 1',
        stage: newStage || 'Official Match',
      });

      if (res?.success && res.data) {
        const teamAObj = allTeams.find((t) => t._id === newTeamA);
        const teamBObj = allTeams.find((t) => t._id === newTeamB);
        const newMatch: Match = {
          ...res.data,
          teamA: teamAObj || res.data.teamA,
          teamB: teamBObj || res.data.teamB,
        };

        setMatches((prev) => [newMatch, ...prev]);
        setShowQuickSchedule(false);
        await handleLaunchMatch(newMatch);
      } else {
        showError(res?.error || 'Failed creating new match.');
      }
    } catch (err: any) {
      showError(`Failed to create match: ${err.message || 'Error'}`);
    }
  };

  // Penalties calculation
  const kicksA = penaltyKicks.filter((k) => k.team === 'A').length;
  const kicksB = penaltyKicks.filter((k) => k.team === 'B').length;
  const regulationKicksComplete = kicksA >= 3 && kicksB >= 3;
  const isShootoutTiedAfterThree = regulationKicksComplete && penaltyScoreA === penaltyScoreB;
  const hasShootoutWinner = regulationKicksComplete && penaltyScoreA !== penaltyScoreB;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 flex flex-col gap-6 select-none w-full animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-surface-container-high">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse"></span>
            <span className="font-label-caps text-xs text-primary-container uppercase font-extrabold tracking-wider">
              Unified Match Operator Desk
            </span>
          </div>
          <h1 className="font-headline-lg text-xl sm:text-2xl md:text-3xl font-black text-on-surface tracking-tight mt-0.5">
            Super Admin Live Match Controller
          </h1>
          <p className="text-xs text-on-surface-variant font-medium mt-1">
            Official 10-Minute Tournament Clock: 4m 1st Half • 2m Half-Time Break • 4m 2nd Half • 2m Extra Time if tied • 3-Kick Shootout + Coin Toss
          </p>
        </div>

        {/* Match Selector & Launch Center */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
            <label className="text-[11px] font-bold text-on-surface-variant uppercase font-label-caps shrink-0">
              Fixture:
            </label>
            <select
              disabled={matches.length === 0}
              value={selectedMatch?._id || ''}
              onChange={(e) => {
                const found = matches.find((m) => m._id === e.target.value);
                if (found) selectMatch(found);
              }}
              className="bg-surface-container-lowest text-xs font-bold text-on-surface px-3 py-2 rounded-xl border border-surface-container-high shadow-xs focus:outline-none focus:ring-2 focus:ring-primary-container cursor-pointer w-full sm:w-auto sm:max-w-[220px] truncate disabled:opacity-50"
            >
              {matches.length === 0 ? (
                <option value="">No fixtures scheduled</option>
              ) : (
                matches.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.teamA?.name} vs {m.teamB?.name} ({m.status})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Quick Start for Upcoming Match */}
          {selectedMatch?.status === 'Upcoming' && (
            <button
              type="button"
              onClick={() => handleLaunchMatch(selectedMatch)}
              className="px-3 py-2 rounded-xl bg-primary-container hover:bg-primary text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
              title="Launch selected fixture live"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Start</span>
            </button>
          )}

          {/* Quick Restart for Completed Match */}
          {selectedMatch?.status === 'Completed' && (
            <button
              type="button"
              onClick={() => handleRestartMatch(selectedMatch)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-slate-600 shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
              title="Restart selected completed match at 0-0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Restart</span>
            </button>
          )}

          {/* Prominent Match Picker Modal Opener */}
          <button
            type="button"
            onClick={() => setShowMatchPickerModal(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-primary-container border border-emerald-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Zap className="w-3.5 h-3.5 fill-primary-container text-primary-container" />
            <span className="hidden sm:inline">Choose Match to Start</span>
            <span className="sm:hidden">Choose Match</span>
          </button>
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

      {/* Dynamic Match Controller View: If no match exists or is selected, show clean empty state */}
      {loading ? (
        <div className="p-16 text-center flex flex-col items-center justify-center gap-3 bg-surface-container-lowest rounded-3xl border border-surface-container-high shadow-xs">
          <RefreshCw className="w-8 h-8 text-primary-container animate-spin" />
          <p className="text-xs text-on-surface-variant font-medium">Loading match telemetry...</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-3xl border border-surface-container-high shadow-xl p-16 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant">
            <Calendar className="w-8 h-8 text-on-surface-variant/50" />
          </div>
          <div>
            <h3 className="font-headline-md text-xl font-black text-on-surface">No Match Available</h3>
            <p className="text-xs text-on-surface-variant font-medium mt-1 max-w-md mx-auto">
              There is currently no match scheduled in the tournament. Once a match is scheduled, the live scoreboard, official clock, and protocol controls will appear here.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowQuickSchedule(true)}
            className="flex items-center gap-2 bg-primary-container hover:bg-primary text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Match</span>
          </button>
        </div>
      ) : !selectedMatch ? (
        <div className="bg-surface-container-lowest rounded-3xl border border-surface-container-high shadow-xl p-16 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-primary-container">
            <Zap className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-headline-md text-xl font-black text-on-surface">No Match Selected</h3>
            <p className="text-xs text-on-surface-variant font-medium mt-1 max-w-md mx-auto">
              Please choose a scheduled fixture from the dropdown above or click below to choose a match to control.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowMatchPickerModal(true)}
            className="flex items-center gap-2 bg-primary-container hover:bg-primary text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Choose Match to Start</span>
          </button>
        </div>
      ) : (
        <>
          {/* Main Scoreboard & Official Clock Hero */}
          <div className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl border border-surface-container-high shadow-xl p-4 sm:p-8 flex flex-col gap-4 sm:gap-6 transition-all duration-200">
        {/* Match Info & Current Stage Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 sm:pb-4 border-b border-surface-container-high">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-label-caps text-xs uppercase bg-primary-container text-white px-3 py-1 rounded-full font-black tracking-wider">
              {currentStage}
            </span>
            <span className="text-xs text-on-surface-variant font-medium">
              {selectedMatch?.venue || 'Varsity Stadium'} • Ref: Official Director
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold font-label-caps transition-all ${
                timerRunning
                  ? 'bg-emerald-100 text-primary-container ring-2 ring-primary-container/20 animate-live-glow'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {timerRunning ? 'CLOCK RUNNING' : 'CLOCK PAUSED'}
            </span>
          </div>
        </div>

        {/* Completion Alert Banner if match is over */}
        {selectedMatch?.status === 'Completed' && (
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl border border-emerald-500/30 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xl border border-emerald-500/30 shrink-0">
                ✓
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-headline-md text-sm font-black tracking-wide text-emerald-400 uppercase">
                    MATCH FINISHED & OVER (FULL TIME)
                  </span>
                  <span className="font-label-caps text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-bold">
                    OFFICIALLY COMPLETED
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  Final Result: <strong className="text-white font-extrabold">{teamAName} {scoreA} - {scoreB} {teamBName}</strong> • {(() => {
                    const penLeader = penaltyScoreA > penaltyScoreB ? teamAName : penaltyScoreB > penaltyScoreA ? teamBName : null;
                    const winnerByName = scoreA > scoreB ? teamAName : scoreB > scoreA ? teamBName : penLeader;
                    if (winnerByName && scoreA === scoreB && (penaltyScoreA > 0 || penaltyScoreB > 0)) {
                      return `${winnerByName} Won on Penalties (${penaltyScoreA}-${penaltyScoreB})`;
                    }
                    if (winnerByName && scoreA !== scoreB) {
                      return `${winnerByName} Win`;
                    }
                    if (selectedMatch.matchResult && !selectedMatch.matchResult.toLowerCase().includes('draw')) {
                      return selectedMatch.matchResult;
                    }
                    return 'Full Time Draw';
                  })()}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons on Completion */}
            <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
              <button
                type="button"
                onClick={() => setShowMatchPickerModal(true)}
                className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-primary-container hover:bg-primary text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-95 cursor-pointer ring-2 ring-emerald-400/40"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>⚡ Choose Match to Start</span>
              </button>
              <button
                type="button"
                onClick={() => handleRestartMatch(selectedMatch)}
                className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-surface-container-high/80 hover:bg-surface-container-highest text-white border border-white/20 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-emerald-400" />
                <span>Restart (0:0)</span>
              </button>
            </div>
          </div>
        )}

        {/* Central Score Display */}
        <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4 sm:gap-6">
          {/* Team A */}
          <div className="md:col-span-4 flex items-center justify-between md:justify-start gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary-container/15 text-primary-container flex items-center justify-center font-black text-xl sm:text-2xl shadow-inner border border-primary-container/30 shrink-0 overflow-hidden relative">
                <span className="absolute inset-0 flex items-center justify-center font-black text-lg sm:text-xl text-primary-container">
                  {teamAName.slice(0, 2).toUpperCase()}
                </span>
                {selectedMatch?.teamA?.logo && (
                  <img
                    src={selectedMatch.teamA.logo}
                    alt=""
                    className="w-full h-full object-cover relative z-10"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                )}
              </div>
              <div>
                <h2 className="font-headline-md text-xl sm:text-2xl font-black text-on-surface leading-tight">
                  {teamAName}
                </h2>
                <span className="font-label-caps text-xs text-on-surface-variant font-semibold block">
                  Home Squad
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleOpenGoalModal('A')}
              disabled={selectedMatch?.status === 'Completed'}
              className="py-2 sm:py-1 px-3 sm:px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-primary-container text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 disabled:opacity-30 shrink-0 min-h-[38px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Goal</span>
            </button>
          </div>

          {/* Middle: Dark Scoreboard matching official reference */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-3 sm:p-4 bg-surface-container-low rounded-2xl border border-surface-container shadow-inner">
            <span className="font-label-caps text-[10px] text-primary-container font-extrabold uppercase mb-1 tracking-wider bg-primary-container/10 px-3 py-0.5 rounded-full border border-primary-container/20">
              Official Match Score
            </span>

            {/* Dark Scoreboard Box matching user screenshot */}
            <div className="bg-[#1e2025] px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl border border-white/10 shadow-lg flex flex-col items-center gap-1 my-1.5 sm:my-2 w-full max-w-[240px] transition-transform hover:scale-[1.02]">
              <div className="flex items-center justify-center gap-5 sm:gap-6">
                <span className="font-display-score text-3xl sm:text-5xl font-black text-white tabular-nums tracking-tight">
                  {scoreA}
                </span>
                <span className="font-display-score text-2xl sm:text-3xl font-light text-slate-400">
                  -
                </span>
                <span className="font-display-score text-3xl sm:text-5xl font-black text-white tabular-nums tracking-tight">
                  {scoreB}
                </span>
              </div>

              {(scoreA === scoreB || penaltyScoreA > 0 || penaltyScoreB > 0) && (
                <div className="text-xs sm:text-sm font-semibold text-[#8a94a6] font-label-ui">
                  Penalties: <span className="text-white font-extrabold">{penaltyScoreA} - {penaltyScoreB}</span>
                </div>
              )}
            </div>

            <div className="font-stat-numeral text-2xl sm:text-3xl font-black text-primary-container tabular-nums mt-1.5 tracking-tight flex items-center justify-center gap-2">
              {timerRunning && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>}
              <span>{formatTime(remainingSeconds)}</span>
            </div>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase mt-0.5">
              Stage: <strong>{currentStage}</strong>
            </span>
          </div>

          {/* Team B */}
          <div className="md:col-span-4 flex items-center justify-between md:justify-end gap-3 sm:gap-4 text-right">
            <button
              type="button"
              onClick={() => handleOpenGoalModal('B')}
              disabled={selectedMatch?.status === 'Completed'}
              className="py-2 sm:py-1 px-3 sm:px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-primary-container text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 disabled:opacity-30 shrink-0 md:order-1 min-h-[38px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Goal</span>
            </button>
            <div className="flex items-center gap-3 md:order-2">
              <div className="text-right">
                <h2 className="font-headline-md text-xl sm:text-2xl font-black text-on-surface leading-tight">
                  {teamBName}
                </h2>
                <span className="font-label-caps text-xs text-on-surface-variant font-semibold block">
                  Visiting Team
                </span>
              </div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center font-black text-xl sm:text-2xl shadow-inner border border-secondary/30 shrink-0 overflow-hidden relative">
                <span className="absolute inset-0 flex items-center justify-center font-black text-lg sm:text-xl text-secondary">
                  {teamBName.slice(0, 2).toUpperCase()}
                </span>
                {selectedMatch?.teamB?.logo && (
                  <img
                    src={selectedMatch.teamB.logo}
                    alt=""
                    className="w-full h-full object-cover relative z-10"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Primary Action Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-2">
          {/* Pause / Resume Clock / Restart Match Button */}
          {selectedMatch?.status === 'Completed' ? (
            <button
              type="button"
              onClick={() => handleRestartMatch(selectedMatch)}
              className="py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-600 transition-all shadow-xs active:scale-95 cursor-pointer min-h-[46px]"
              title="Reset scores and restart this match at 0-0"
            >
              <RotateCcw className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Restart (0:0)</span>
            </button>
          ) : timerRunning ? (
            <button
              type="button"
              onClick={handlePause}
              className="py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-[11px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs active:scale-95 min-h-[46px]"
            >
              <Pause className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Pause Clock</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartOrResume}
              className="py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl bg-primary-container hover:bg-primary text-white font-black text-[11px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs active:scale-95 cursor-pointer min-h-[46px]"
            >
              <Play className="w-4 h-4 fill-white shrink-0" />
              <span>{selectedMatch?.status === 'Upcoming' ? 'Start Match' : 'Resume Clock'}</span>
            </button>
          )}

          {/* Direct Goal Record for Team A */}
          <button
            type="button"
            onClick={() => handleOpenGoalModal('A')}
            disabled={selectedMatch?.status === 'Completed'}
            className="py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl bg-surface-container hover:bg-emerald-50 hover:border-emerald-300 border border-surface-container-high text-primary-container font-bold text-[11px] sm:text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 disabled:opacity-40 min-h-[46px] truncate"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">+ Goal ({teamAName.split(' ')[0]})</span>
          </button>

          {/* Direct Goal Record for Team B */}
          <button
            type="button"
            onClick={() => handleOpenGoalModal('B')}
            disabled={selectedMatch?.status === 'Completed'}
            className="py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl bg-surface-container hover:bg-emerald-50 hover:border-emerald-300 border border-surface-container-high text-primary-container font-bold text-[11px] sm:text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 disabled:opacity-40 min-h-[46px] truncate"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">+ Goal ({teamBName.split(' ')[0]})</span>
          </button>

          {/* Finalize Match Button */}
          {selectedMatch?.status === 'Completed' ? (
            <button
              type="button"
              onClick={() => setShowMatchPickerModal(true)}
              className="py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl bg-primary-container hover:bg-primary text-white font-black text-[11px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer ring-2 ring-emerald-400/40 min-h-[46px]"
              title="Select which fixture to start next"
            >
              <Play className="w-4 h-4 fill-white shrink-0" />
              <span>⚡ Start Match</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalizeMatch}
              className="py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-[11px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs active:scale-95 min-h-[46px]"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Finalize Match</span>
            </button>
          )}
        </div>
      </div>

      {/* Stage Transitions & Shootout Controller Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column (7 cols): Official 10-Minute Match Stage Transitions */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-4 sm:p-6 rounded-2xl border border-surface-container-high shadow-xs flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-surface-container-high">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-container" />
              <h3 className="font-headline-md text-base font-extrabold text-on-surface">
                10-Minute Match Protocol Stages
              </h3>
            </div>
            <button
              onClick={handleAdvanceNextStage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-container hover:bg-primary text-white font-bold text-xs shadow-xs transition-all active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Advance Next Stage ⚡</span>
            </button>
          </div>

          <p className="text-xs text-on-surface-variant font-medium">
            Standard match timeline: 4m 1st Half &rarr; 2m Half-Time Break &rarr; 4m 2nd Half &rarr; +2m Extra Time if tied. Completed stages are locked and cannot be re-triggered.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {/* 1. First Half */}
            <button
              type="button"
              disabled={isFirstHalfDone}
              onClick={isFirstHalfDone ? undefined : handleStartFirstHalf}
              className={`py-3 px-3 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all text-center ${
                isFirstHalfDone
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60 shadow-none'
                  : currentStage.includes('First')
                  ? 'bg-primary-container/15 text-primary-container border-primary-container ring-2 ring-primary-container/20 shadow-xs'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface border-surface-container shadow-xs active:scale-95'
              }`}
              title={isFirstHalfDone ? 'First Half already concluded and cannot be clicked' : 'Start First Half (4:00)'}
            >
              <span className="font-extrabold flex items-center gap-1.5 flex-wrap justify-center">
                {isFirstHalfDone ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="line-through text-slate-500">1. First Half (4:00)</span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
                      DONE
                    </span>
                  </>
                ) : currentStage.includes('First') ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse shrink-0"></span>
                    <span>1. First Half (4:00)</span>
                    <span className="text-[9px] bg-primary-container text-white px-1.5 py-0.2 rounded-full font-bold">
                      IN PLAY
                    </span>
                  </>
                ) : (
                  <span>1. First Half (4:00)</span>
                )}
              </span>
              <span className="text-[10px] text-on-surface-variant font-medium">
                {isFirstHalfDone ? 'First half concluded (Locked)' : '4 minutes countdown kickoff'}
              </span>
            </button>

            {/* 2. Half-Time Break */}
            <button
              type="button"
              disabled={isHalfTimeDone}
              onClick={isHalfTimeDone ? undefined : handleHalfTimeBreak}
              className={`py-3 px-3 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all text-center ${
                isHalfTimeDone
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60 shadow-none'
                  : currentStage.includes('Half-Time') || currentStage.includes('Break')
                  ? 'bg-primary-container/15 text-primary-container border-primary-container ring-2 ring-primary-container/20 shadow-xs'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface border-surface-container shadow-xs active:scale-95'
              }`}
              title={isHalfTimeDone ? 'Half-Time Break concluded' : 'Start Half-Time Break (2:00)'}
            >
              <span className="font-extrabold flex items-center gap-1.5 flex-wrap justify-center">
                {isHalfTimeDone ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="line-through text-slate-500">2. Half-Time Break (2:00)</span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
                      DONE
                    </span>
                  </>
                ) : currentStage.includes('Half-Time') || currentStage.includes('Break') ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
                    <span>2. Half-Time Break (2:00)</span>
                    <span className="text-[9px] bg-amber-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                      IN BREAK
                    </span>
                  </>
                ) : (
                  <span>2. Half-Time Break (2:00)</span>
                )}
              </span>
              <span className="text-[10px] text-on-surface-variant font-medium">
                {isHalfTimeDone ? 'Break concluded (Locked)' : '2 minutes interval break'}
              </span>
            </button>

            {/* 3. Second Half */}
            <button
              type="button"
              disabled={isSecondHalfDone}
              onClick={isSecondHalfDone ? undefined : handleSecondHalf}
              className={`py-3 px-3 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all text-center ${
                isSecondHalfDone
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60 shadow-none'
                  : currentStage.includes('Second')
                  ? 'bg-primary-container/15 text-primary-container border-primary-container ring-2 ring-primary-container/20 shadow-xs'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface border-surface-container shadow-xs active:scale-95'
              }`}
              title={isSecondHalfDone ? 'Second Half concluded' : 'Start Second Half (4:00)'}
            >
              <span className="font-extrabold flex items-center gap-1.5 flex-wrap justify-center">
                {isSecondHalfDone ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="line-through text-slate-500">3. Second Half (4:00)</span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
                      DONE
                    </span>
                  </>
                ) : currentStage.includes('Second') ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse shrink-0"></span>
                    <span>3. Second Half (4:00)</span>
                    <span className="text-[9px] bg-primary-container text-white px-1.5 py-0.2 rounded-full font-bold">
                      IN PLAY
                    </span>
                  </>
                ) : (
                  <span>3. Second Half (4:00)</span>
                )}
              </span>
              <span className="text-[10px] text-on-surface-variant font-medium">
                {isSecondHalfDone ? 'Second half concluded (Locked)' : '4 minutes second half clock'}
              </span>
            </button>

            {/* 4. Draw Decider Extra Time (2:00) */}
            <button
              type="button"
              disabled={isExtraTimeDone || selectedMatch?.status === 'Completed' || (scoreA !== scoreB && !currentStage.includes('Extra'))}
              onClick={isExtraTimeDone ? undefined : handleExtraTimeDraw}
              className={`py-3 px-3 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all text-center ${
                isExtraTimeDone
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60 shadow-none'
                  : currentStage.includes('Extra Time')
                  ? 'bg-amber-500/20 text-amber-800 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                  : scoreA === scoreB
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 shadow-xs active:scale-95'
                  : 'bg-surface-container-low text-on-surface-variant/40 border-surface-container cursor-not-allowed opacity-50 shadow-none'
              }`}
              title={
                isExtraTimeDone
                  ? 'Extra Time concluded'
                  : scoreA === scoreB
                  ? 'Scores tied! Click to add 2 minutes extra time'
                  : 'Only enabled if scores are tied at full time'
              }
            >
              <span className="font-extrabold flex items-center gap-1.5 flex-wrap justify-center">
                {isExtraTimeDone ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="line-through text-slate-500">4. Extra Time (2:00)</span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
                      DONE
                    </span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>4. Extra Time if Tied (2:00)</span>
                    {scoreA === scoreB && (
                      <span className="text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-black uppercase">
                        TIED
                      </span>
                    )}
                  </>
                )}
              </span>
              <span className="text-[10px] text-on-surface-variant font-medium">
                {isExtraTimeDone
                  ? 'Extra time concluded'
                  : scoreA === scoreB
                  ? 'Scores tied! Click to add 2m decider clock'
                  : 'Active only if scores are tied at full time'}
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

        {/* Right Column (5 cols): 3-Kick Penalty Shootout + Sudden Death Coin Toss (Conditional Tie-Breaker) */}
        {(Boolean(selectedMatch?.shootout?.isShootout) || currentStage.includes('Penalty') || (isExtraTimeDone && scoreA === scoreB)) ? (
          <div id="penalty-shootout-console" className="lg:col-span-5 bg-surface-container-lowest p-4 sm:p-6 rounded-2xl border border-surface-container-high shadow-xs flex flex-col gap-4 animate-in fade-in">
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
          <div className="lg:col-span-5 bg-surface-container-lowest p-4 sm:p-6 rounded-2xl border border-surface-container-high shadow-xs flex flex-col items-center justify-center text-center py-8 sm:py-12">
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
      </>
      )}

      {/* Goal Recorder Modal - Shows ONLY the Scoring Team's Players */}
      {showGoalModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/70 backdrop-blur-sm p-3 sm:p-4 flex min-h-screen items-center justify-center animate-in fade-in duration-200">
          <div className="relative max-w-lg w-full bg-surface-container-lowest rounded-2xl sm:rounded-3xl border border-surface-container-high shadow-2xl p-4 sm:p-6 space-y-3.5 sm:space-y-4 max-h-[92vh] flex flex-col my-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-primary-container flex items-center justify-center font-black text-lg">
                  ⚽
                </div>
                <div>
                  <h3 className="font-headline-md text-base font-black text-on-surface">
                    Record Goal for {goalTeam === 'A' ? teamAName : teamBName}
                  </h3>
                  <span className="text-[11px] text-primary-container font-bold flex items-center gap-1">
                    <span>✓</span>
                    <span>Exclusive Team Roster: Only {goalTeam === 'A' ? teamAName : teamBName} athletes shown</span>
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGoalModal(false)}
                className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Scoring Team Banner & Prospective Score Preview */}
            <div className="p-3 bg-surface-container-low rounded-2xl border border-surface-container flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-container text-white font-black text-base flex items-center justify-center shadow-xs">
                  {goalTeam === 'A' ? teamAName.slice(0, 2).toUpperCase() : teamBName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-headline-sm text-sm font-black text-on-surface">
                    {goalTeam === 'A' ? teamAName : teamBName}
                  </div>
                  <div className="text-[11px] text-on-surface-variant font-medium">
                    Current: <strong className="text-on-surface">{scoreA} - {scoreB}</strong> &rarr; New:{' '}
                    <strong className="text-primary-container font-black">
                      {goalTeam === 'A' ? scoreA + 1 : scoreA} - {goalTeam === 'B' ? scoreB + 1 : scoreB}
                    </strong>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                +1 Goal
              </span>
            </div>

            {/* Scrollable Body: Athletes Grid */}
            <div className="space-y-3 overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block text-[11px] font-bold text-on-surface uppercase font-label-caps mb-1.5 flex items-center justify-between">
                  <span>1. Click to Select Goalscorer ({goalTeam === 'A' ? teamAName : teamBName}):</span>
                  <span className="text-[10px] text-primary-container font-bold">
                    {(goalTeam === 'A' ? teamAPlayers : teamBPlayers).length} Certified Athletes
                  </span>
                </label>

                {/* Athlete Quick Select Cards */}
                {(goalTeam === 'A' ? teamAPlayers : teamBPlayers).length === 0 ? (
                  <div className="p-4 text-center rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface-variant">
                    No athletes found in roster for this team.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto p-1 border border-surface-container-high rounded-xl bg-surface-container-low/40">
                    {(goalTeam === 'A' ? teamAPlayers : teamBPlayers).map((p) => {
                      const isSelected = goalPlayerName === p.name;
                      return (
                        <div
                          key={p._id}
                          onClick={() => setGoalPlayerName(p.name)}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
                            isSelected
                              ? 'bg-primary-container/15 border-primary-container ring-2 ring-primary-container/30 shadow-xs'
                              : 'bg-surface-container-lowest hover:bg-surface-container border-surface-container-high'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-display-score text-xs font-black shrink-0 ${
                              isSelected
                                ? 'bg-primary-container text-white'
                                : 'bg-surface-container text-on-surface-variant'
                            }`}
                          >
                            #{p.jerseyNumber}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-headline-sm text-xs font-black text-on-surface truncate">
                              {p.name}
                            </div>
                            <div className="text-[10px] text-primary-container truncate font-bold">
                              {goalTeam === 'A' ? teamAName : teamBName} • {p.position}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-primary-container text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                              ✓
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Dropdown Alternative */}
                <div className="mt-2">
                  <select
                    value={goalPlayerName}
                    onChange={(e) => setGoalPlayerName(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container font-semibold cursor-pointer"
                  >
                    <option value="">-- Or choose from dropdown --</option>
                    {(goalTeam === 'A' ? teamAPlayers : teamBPlayers).map((p) => (
                      <option key={p._id} value={p.name}>
                        #{p.jerseyNumber} - {p.name} ({p.position}) [{goalTeam === 'A' ? teamAName : teamBName}]
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Goal Minute & Method */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface uppercase font-label-caps mb-1">
                    Goal Timestamp
                  </label>
                  <input
                    type="text"
                    value={goalMinute}
                    onChange={(e) => setGoalMinute(e.target.value)}
                    placeholder="e.g. 02:45 (1H)"
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface uppercase font-label-caps mb-1">
                    Goal Method
                  </label>
                  <select className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container font-medium">
                    <option value="Normal Goal">Normal Goal</option>
                    <option value="Penalty Kick">Penalty Kick</option>
                    <option value="Free Kick">Free Kick</option>
                    <option value="Header">Header Strike</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-surface-container-high">
              <button
                type="button"
                onClick={handleSaveGoal}
                disabled={!goalPlayerName}
                className="flex-1 py-2.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-bold text-xs uppercase tracking-wider transition-all shadow-xs disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                <span>⚽ Confirm & Add Goal ({goalTeam === 'A' ? teamAName.split(' ')[0] : teamBName.split(' ')[0]})</span>
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
      {/* Match Selection & Launch Modal (Choose Which Match to Start) */}
      {showMatchPickerModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/70 backdrop-blur-sm p-3 sm:p-4 flex min-h-screen items-center justify-center animate-in fade-in duration-200">
          <div className="relative max-w-3xl w-full bg-surface-container-lowest rounded-2xl sm:rounded-3xl border border-surface-container-high shadow-2xl p-4 sm:p-7 space-y-3.5 sm:space-y-4 max-h-[92vh] flex flex-col my-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-primary-container border border-emerald-300 flex items-center justify-center font-black">
                  <Zap className="w-5 h-5 fill-primary-container" />
                </div>
                <div>
                  <h3 className="font-headline-md text-lg sm:text-xl font-black text-on-surface">
                    Choose Which Match to Start
                  </h3>
                  <p className="text-xs text-on-surface-variant font-medium">
                    Select any fixture to immediately launch live with the official 10-minute clock, or restart a finished game.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMatchPickerModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Tabs Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex flex-wrap items-center gap-2">
                {(['all', 'Upcoming', 'Live', 'Completed'] as const).map((filter) => {
                  const count =
                    filter === 'all'
                      ? matches.length
                      : matches.filter((m) =>
                          filter === 'Live'
                            ? m.status === 'Live' || m.status === 'Half-Time'
                            : m.status === filter
                        ).length;
                  const isActive = matchPickerFilter === filter;
                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setMatchPickerFilter(filter)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                        isActive
                          ? 'bg-primary-container text-white shadow-xs'
                          : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                      }`}
                    >
                      {filter === 'all' ? 'All Matches' : filter} ({count})
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setShowQuickSchedule(!showQuickSchedule)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs ${
                  showQuickSchedule
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-primary-container border border-emerald-300'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showQuickSchedule ? 'Hide Match Creator' : '+ Schedule New Match'}</span>
              </button>
            </div>

            {/* Search Bar Row */}
            <div className="relative shrink-0">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search teams by name, venue, or stage..."
                value={matchSearchTerm}
                onChange={(e) => setMatchSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-surface-container-low border border-surface-container-high rounded-xl text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary-container font-medium"
              />
            </div>

            {/* Quick Match Creator Drawer */}
            {showQuickSchedule && (
              <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low border border-emerald-200 shadow-sm space-y-3.5 shrink-0 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary-container" />
                    <span className="font-headline-md text-xs sm:text-sm text-on-surface font-extrabold uppercase tracking-wide">
                      ⚡ Quick Schedule & Live Provisioning
                    </span>
                  </div>
                  <span className="text-[10px] text-primary-container bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                    Instant Kickoff
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="bg-surface-container-lowest p-3 rounded-xl border border-surface-container-high">
                    <label className="text-[10px] font-bold text-on-surface uppercase block mb-1.5 flex items-center gap-1.5 text-primary-container">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Home Team (Team A)</span>
                    </label>
                    <select
                      value={newTeamA}
                      onChange={(e) => setNewTeamA(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container cursor-pointer"
                    >
                      {allTeams.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="bg-surface-container-lowest p-3 rounded-xl border border-surface-container-high">
                    <label className="text-[10px] font-bold text-on-surface uppercase block mb-1.5 flex items-center gap-1.5 text-secondary">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Visiting Team (Team B)</span>
                    </label>
                    <select
                      value={newTeamB}
                      onChange={(e) => setNewTeamB(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container cursor-pointer"
                    >
                      {allTeams.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-on-surface uppercase block mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-primary-container" />
                      <span>Match Venue</span>
                    </label>
                    <input
                      type="text"
                      value={newVenue}
                      onChange={(e) => setNewVenue(e.target.value)}
                      placeholder="Championship Field 1"
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-container"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-on-surface uppercase block mb-1 flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-amber-500" />
                      <span>Tournament Stage / Round</span>
                    </label>
                    <input
                      type="text"
                      value={newStage}
                      onChange={(e) => setNewStage(e.target.value)}
                      placeholder="Quarter Final Match"
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-container"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleQuickCreateAndStart}
                  className="w-full py-2.5 rounded-xl bg-primary-container hover:bg-primary text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer ring-2 ring-emerald-400/30"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Create & Launch Match Live Immediately</span>
                </button>
              </div>
            )}

            {/* Matches List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {matches
                .filter((m) => {
                  if (matchPickerFilter === 'Upcoming') return m.status === 'Upcoming';
                  if (matchPickerFilter === 'Live') return m.status === 'Live' || m.status === 'Half-Time';
                  if (matchPickerFilter === 'Completed') return m.status === 'Completed';
                  return true;
                })
                .filter((m) => {
                  if (!matchSearchTerm) return true;
                  const q = matchSearchTerm.toLowerCase();
                  return (
                    m.teamA?.name?.toLowerCase().includes(q) ||
                    m.teamB?.name?.toLowerCase().includes(q) ||
                    m.venue?.toLowerCase().includes(q) ||
                    m.stage?.toLowerCase().includes(q)
                  );
                })
                .map((m) => {
                  const isCurrent = selectedMatch?._id === m._id;
                  const isLive = m.status === 'Live' || m.status === 'Half-Time';
                  const isUpcoming = m.status === 'Upcoming';
                  const isCompleted = m.status === 'Completed';

                  return (
                    <div
                      key={m._id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-emerald-50/70 border-emerald-400 shadow-sm ring-1 ring-emerald-300'
                          : 'bg-surface-container-low hover:bg-surface-container border-surface-container-high'
                      }`}
                    >
                      {/* Left: Team & Match Info */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center -space-x-2 shrink-0">
                          {/* Team A Badge */}
                          <div className="w-10 h-10 rounded-xl bg-primary-container/15 text-primary-container font-black text-xs flex items-center justify-center border border-primary-container/30 overflow-hidden shadow-2xs relative">
                            <span className="absolute inset-0 flex items-center justify-center font-black text-xs text-primary-container">
                              {m.teamA?.name?.slice(0, 2).toUpperCase() || 'TA'}
                            </span>
                            {m.teamA?.logo && (
                              <img
                                src={m.teamA.logo}
                                alt=""
                                className="w-full h-full object-cover relative z-10"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            )}
                          </div>
                          {/* Team B Badge */}
                          <div className="w-10 h-10 rounded-xl bg-secondary/15 text-secondary font-black text-xs flex items-center justify-center border border-secondary/30 overflow-hidden shadow-2xs relative">
                            <span className="absolute inset-0 flex items-center justify-center font-black text-xs text-secondary">
                              {m.teamB?.name?.slice(0, 2).toUpperCase() || 'TB'}
                            </span>
                            {m.teamB?.logo && (
                              <img
                                src={m.teamB.logo}
                                alt=""
                                className="w-full h-full object-cover relative z-10"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-headline-md text-sm font-black text-on-surface">
                              {m.teamA?.name || 'Team A'} <span className="text-on-surface-variant font-normal">vs</span> {m.teamB?.name || 'Team B'}
                            </h4>
                            {isCurrent && (
                              <span className="font-label-caps text-[9px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-extrabold uppercase">
                                Selected
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-on-surface-variant mt-0.5">
                            <span>{m.stage || 'Official Fixture'}</span>
                            <span>•</span>
                            <span>{m.venue || 'Main Stadium'}</span>
                            {(isLive || isCompleted) && (
                              <>
                                <span>•</span>
                                <strong className="text-on-surface font-extrabold">
                                  Score: {m.score?.teamA ?? m.teamAScore ?? 0} - {m.score?.teamB ?? m.teamBScore ?? 0}
                                </strong>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Status badge & Action buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Status Tag */}
                        <span
                          className={`font-label-caps text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                            isLive
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse'
                              : isUpcoming
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-slate-200 text-slate-800 border border-slate-300'
                          }`}
                        >
                          {m.status}
                        </span>

                        {/* Action CTA */}
                        {isUpcoming && (
                          <button
                            type="button"
                            onClick={() => handleLaunchMatch(m)}
                            className="px-3.5 py-2 rounded-xl bg-primary-container hover:bg-primary text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Start Match</span>
                          </button>
                        )}

                        {isLive && (
                          <button
                            type="button"
                            onClick={() => {
                              selectMatch(m);
                              setShowMatchPickerModal(false);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                          >
                            <Zap className="w-3.5 h-3.5 fill-white" />
                            <span>Control Desk</span>
                          </button>
                        )}

                        {isCompleted && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleRestartMatch(m)}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
                              title="Restart this completed match at 0-0"
                            >
                              <RotateCcw className="w-3 h-3 text-emerald-400" />
                              <span>Restart (0:0)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                selectMatch(m);
                                setShowMatchPickerModal(false);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface transition-all cursor-pointer"
                            >
                              View
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

              {matches.length === 0 && (
                <div className="text-center py-12 text-on-surface-variant text-xs font-medium">
                  No fixtures found. Click &quot;+ Schedule New Match&quot; to launch one now!
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-surface-container-high shrink-0 text-xs text-on-surface-variant">
              <span>Total Fixtures: <strong>{matches.length}</strong></span>
              <button
                type="button"
                onClick={() => setShowMatchPickerModal(false)}
                className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
