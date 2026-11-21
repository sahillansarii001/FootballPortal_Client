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
  MapPin,
  ArrowLeft,
  Flag
} from 'lucide-react';
import Link from 'next/link';
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
  const [currentStage, setCurrentStage] = useState('Second Half');
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
  const [matchGoals, setMatchGoals] = useState<any[]>([]);

  // Card & Substitution state for Screen 8 Action Tiles
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardTeam, setCardTeam] = useState<'A' | 'B'>('A');
  const [cardPlayerName, setCardPlayerName] = useState('');
  const [cardColor, setCardColor] = useState<'Yellow' | 'Red'>('Yellow');

  const [showSubModal, setShowSubModal] = useState(false);
  const [subTeam, setSubTeam] = useState<'A' | 'B'>('A');
  const [subPlayerIn, setSubPlayerIn] = useState('');
  const [subPlayerOut, setSubPlayerOut] = useState('');

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
  const targetTeamAId = typeof selectedMatch?.teamA === 'object' ? selectedMatch?.teamA?._id : selectedMatch?.teamA;
  const targetTeamBId = typeof selectedMatch?.teamB === 'object' ? selectedMatch?.teamB?._id : selectedMatch?.teamB;

  const teamAGoals = matchGoals.filter((g) => {
    const tId = typeof g.team === 'string' ? g.team : g.team?._id;
    return (targetTeamAId && tId === targetTeamAId) || (g.team as any)?.name === teamAName;
  });

  const teamBGoals = matchGoals.filter((g) => {
    const tId = typeof g.team === 'string' ? g.team : g.team?._id;
    return (targetTeamBId && tId === targetTeamBId) || (g.team as any)?.name === teamBName;
  });

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

    const handleGoalRecorded = (data: any) => {
      if (data?.event) {
        setMatchGoals((prev) => {
          const exists = prev.some((g) => g._id === data.event._id);
          if (exists) return prev;
          return [...prev, data.event];
        });
      }
      if (data?.score) {
        setScoreA(data.score.teamA);
        setScoreB(data.score.teamB);
      } else if (data?.teamAScore !== undefined) {
        setScoreA(data.teamAScore);
        setScoreB(data.teamBScore);
      }
    };

    const handleGoalUndone = (data: any) => {
      const removedId = data?.eventId || data?.id;
      if (removedId) {
        setMatchGoals((prev) => prev.filter((g) => g._id !== removedId));
      }
      if (data?.score) {
        setScoreA(data.score.teamA);
        setScoreB(data.score.teamB);
      }
    };

    socket.on('timer:started', handleTimerSync);
    socket.on('timer:resumed', handleTimerSync);
    socket.on('timer:paused', handleTimerSync);
    socket.on('timer:sync', handleTimerSync);
    socket.on('timer:update', handleTimerSync);
    socket.on('timer:updated', handleTimerSync);
    socket.on('match:phase_changed', handleTimerSync);
    socket.on('stage:change', handleTimerSync);
    socket.on('goal:scored', handleGoalRecorded);
    socket.on('goal:recorded', handleGoalRecorded);
    socket.on('goal:undone', handleGoalUndone);
    socket.on('goal:removed', handleGoalUndone);

    return () => {
      socket.emit('leave:match', matchId);
      socket.off('timer:started', handleTimerSync);
      socket.off('timer:resumed', handleTimerSync);
      socket.off('timer:paused', handleTimerSync);
      socket.off('timer:sync', handleTimerSync);
      socket.off('timer:update', handleTimerSync);
      socket.off('timer:updated', handleTimerSync);
      socket.off('match:phase_changed', handleTimerSync);
      socket.off('stage:change', handleTimerSync);
      socket.off('goal:scored', handleGoalRecorded);
      socket.off('goal:recorded', handleGoalRecorded);
      socket.off('goal:undone', handleGoalUndone);
      socket.off('goal:removed', handleGoalUndone);
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
      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const targetId = urlParams?.get('matchId') || urlParams?.get('match') || urlParams?.get('id');
      const targetMatch = targetId ? all.find((m) => m._id === targetId || String(m.matchNumber) === targetId) : null;
      const live = targetMatch || all.find((m) => m.status === 'Live' || m.status === 'Half-Time') || all.find((m) => m.status === 'Upcoming') || all[0];
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
    setMatchGoals(match.goals || []);
    setPenaltyScoreA(match.shootout?.teamAPenaltyScore ?? 0);
    setPenaltyScoreB(match.shootout?.teamBPenaltyScore ?? 0);

    const teamAIdStr = typeof match.teamA === 'object' && match.teamA ? (match.teamA as any)._id : match.teamA;
    const teamBIdStr = typeof match.teamB === 'object' && match.teamB ? (match.teamB as any)._id : match.teamB;

    setTossState({
      isFlipping: false,
      tossWinner: match.toss?.tossWinner
        ? String(match.toss.tossWinner) === String(teamAIdStr)
          ? 'A'
          : 'B'
        : null,
      tossChoice: match.toss?.choice
        ? match.toss.choice === 'ATTACK'
          ? 'shoot'
          : 'save'
        : null,
      isResolved: match.status === 'Completed' && Boolean(match.winner),
      winnerTeamName: typeof match.winner === 'object' && match.winner ? match.winner.name : null,
      selectedDecisiveShooterId: '',
    });

    // Populate penalty kicks from match or fetch authoritative penalty history
    if (match._id) {
      adminService.getMatchPenalties(match._id).then((res) => {
        if (res?.success && res.data?.penalties && Array.isArray(res.data.penalties)) {
          const kicks = res.data.penalties.map((p: any) => ({
            team: (String(p.team?._id || p.team) === String(teamAIdStr) ? 'A' : 'B') as 'A' | 'B',
            round: p.round || 1,
            playerId: p.player?._id || p.player,
            playerName: p.player?.name || 'Shooter',
            playerClub: p.player?.club || '',
            playerJersey: p.player?.jerseyNumber || 10,
            outcome: p.outcome === 'Goal' ? 'Goal' : p.outcome === 'Saved' ? 'Saved' : 'Missed',
          }));
          setPenaltyKicks(kicks);
        } else if (match.shootout && (match.shootout.teamAPenaltiesTaken || match.shootout.teamBPenaltiesTaken)) {
          const fallbackKicks: any[] = [];
          for (let i = 0; i < (match.shootout.teamAPenaltiesTaken || 0); i++) {
            fallbackKicks.push({
              team: 'A',
              round: i + 1,
              playerName: 'Penalty Shooter',
              outcome: i < (match.shootout.teamAPenaltyScore || 0) ? 'Goal' : 'Saved',
            });
          }
          for (let i = 0; i < (match.shootout.teamBPenaltiesTaken || 0); i++) {
            fallbackKicks.push({
              team: 'B',
              round: i + 1,
              playerName: 'Penalty Shooter',
              outcome: i < (match.shootout.teamBPenaltyScore || 0) ? 'Goal' : 'Saved',
            });
          }
          setPenaltyKicks(fallbackKicks);
        } else {
          setPenaltyKicks([]);
        }
      }).catch(() => {
        setPenaltyKicks([]);
      });
    } else {
      setPenaltyKicks([]);
    }

    // Fetch authoritative match goals
    if (match._id) {
      matchService.getMatchGoals(match._id).then((goals) => {
        if (goals && Array.isArray(goals)) {
          setMatchGoals(goals);
        }
      }).catch(() => {});
    }

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
          if (liveData.goals && Array.isArray(liveData.goals)) {
            setMatchGoals(liveData.goals);
          }
          setSelectedMatch((prev) => {
            if (!prev) return liveData;
            return {
              ...prev,
              status: liveData.status,
              timer: liveData.timer,
              score: liveData.score,
              teamAScore: liveData.teamAScore,
              teamBScore: liveData.teamBScore,
              goals: liveData.goals || prev.goals
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
    const baseSec = (typeof remainingSeconds === 'number' && remainingSeconds > 0) ? remainingSeconds : 0;
    const optimisticRemaining = baseSec + seconds;
    setRemainingSeconds(optimisticRemaining);
    setTimerRunning(true);
    if (selectedMatch.status === 'Penalty Shootout' || currentStage.includes('Penalty')) {
      setCurrentStage('Extra Time');
      setSelectedMatch((prev) => prev ? { ...prev, status: 'Live' } : null);
    }
    const res = await adminService.addTimeToTimer(selectedMatch._id, seconds);
    if (res?.success && res.data) {
      const matchData = res.data;
      if (matchData.remainingTime !== undefined) {
        setRemainingSeconds(matchData.remainingTime);
      }
      if (matchData.currentStage || matchData.phase) {
        setCurrentStage(matchData.currentStage || matchData.phase);
      }
      setTimerRunning(Boolean(matchData.isRunning && !matchData.isPaused));
      setSelectedMatch((prev) => prev ? {
        ...prev,
        status: matchData.status || (matchData.isRunning ? 'Live' : prev.status),
        timer: matchData.timer || {
          ...prev.timer,
          remainingTime: matchData.remainingTime,
          currentStage: matchData.currentStage || matchData.phase,
          isRunning: Boolean(matchData.isRunning),
          isPaused: Boolean(matchData.isPaused)
        }
      } : null);
    }
    showNotification(
      `Added +${seconds >= 60 ? `${Math.floor(seconds / 60)} minute${seconds > 60 ? 's' : ''}` : `${seconds}s`} to match clock!`
    );
  };

  // Reset Clock Handler (Reset 4:00, Reset 2:00)
  const handleResetClock = async (seconds: number) => {
    if (!selectedMatch) return;
    setRemainingSeconds(seconds);
    setTimerRunning(true);
    const targetStage = seconds === 240 ? 'Second Half' : 'Extra Time';
    if (selectedMatch.status === 'Penalty Shootout' || currentStage.includes('Penalty')) {
      setCurrentStage(targetStage);
      setSelectedMatch((prev) => prev ? { ...prev, status: 'Live' } : null);
    }
    const res = await adminService.setClockTime(selectedMatch._id, seconds);
    if (res?.success && res.data) {
      const matchData = res.data;
      if (matchData.remainingTime !== undefined) {
        setRemainingSeconds(matchData.remainingTime);
      }
      if (matchData.currentStage || matchData.phase) {
        setCurrentStage(matchData.currentStage || matchData.phase);
      }
      setTimerRunning(Boolean(matchData.isRunning && !matchData.isPaused));
      setSelectedMatch((prev) => prev ? {
        ...prev,
        status: matchData.status || (matchData.isRunning ? 'Live' : prev.status),
        timer: matchData.timer || {
          ...prev.timer,
          remainingTime: matchData.remainingTime,
          currentStage: matchData.currentStage || matchData.phase,
          isRunning: Boolean(matchData.isRunning),
          isPaused: Boolean(matchData.isPaused)
        }
      } : null);
    }
    showNotification(
      `Clock reset to ${Math.floor(seconds / 60)}:00!`
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
    completedStages.includes('Extra Time') ||
    currentStage.includes('Penalty') ||
    selectedMatch?.status === 'Completed';

  // 1. First Half (4:00)
  const handleStartFirstHalf = async () => {
    if (!selectedMatch || isFirstHalfDone) return;
    setTimerRunning(true);
    setCurrentStage('First Half');
    setRemainingSeconds(240); // 4 minutes
    const res = await adminService.setStage(selectedMatch._id, 'First Half', 240);
    if (res?.success && res.data) {
      const matchData = res.data;
      setCurrentStage(matchData.currentStage || 'First Half');
      setRemainingSeconds(matchData.remainingTime ?? 240);
      setTimerRunning(true);
    }
    showNotification('Stage set: First Half underway (4 minutes countdown).');
  };

  // 2. Half-Time Break (2:00)
  const handleHalfTimeBreak = async () => {
    if (!selectedMatch || isHalfTimeDone) return;
    setTimerRunning(true);
    setCurrentStage('Half-Time');
    setCompletedStages((prev) => Array.from(new Set([...prev, 'First Half'])));
    setRemainingSeconds(120); // 2 minutes break
    const res = await adminService.setStage(selectedMatch._id, 'Half-Time', 120);
    if (res?.success && res.data) {
      const matchData = res.data;
      setCurrentStage(matchData.currentStage || 'Half-Time');
      setRemainingSeconds(matchData.remainingTime ?? 120);
      setTimerRunning(true);
    }
    showNotification('First Half completed! Half-Time Break started (2 minutes interval).');
  };

  // 3. Second Half (4:00)
  const handleSecondHalf = async () => {
    if (!selectedMatch || isSecondHalfDone) return;
    setTimerRunning(true);
    setCurrentStage('Second Half');
    setCompletedStages((prev) => Array.from(new Set([...prev, 'First Half', 'Half-Time Break'])));
    setRemainingSeconds(240); // 4 minutes
    const res = await adminService.setStage(selectedMatch._id, 'Second Half', 240);
    if (res?.success && res.data) {
      const matchData = res.data;
      setCurrentStage(matchData.currentStage || 'Second Half');
      setRemainingSeconds(matchData.remainingTime ?? 240);
      setTimerRunning(true);
    }
    showNotification('Second Half underway (4 minutes countdown).');
  };

  // 4. Draw Decider Extra Time (2:00)
  const handleExtraTimeDraw = async () => {
    if (!selectedMatch || isExtraTimeDone) return;
    setTimerRunning(true);
    setCurrentStage('Extra Time');
    setCompletedStages((prev) => Array.from(new Set([...prev, 'First Half', 'Half-Time Break', 'Second Half'])));
    setRemainingSeconds(120); // 2 minutes extra time
    const res = await adminService.setStage(selectedMatch._id, 'Extra Time', 120);
    if (res?.success && res.data) {
      const matchData = res.data;
      setCurrentStage(matchData.currentStage || 'Extra Time');
      setRemainingSeconds(matchData.remainingTime ?? 120);
      setTimerRunning(true);
    }
    showNotification(`Match transitioned to Extra Time (Draw Decider)! 2:00 clock is LIVE.`);
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

  const handleOpenCardModal = async (team: 'A' | 'B') => {
    setCardTeam(team);
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
        console.error('Failed fetching players for card modal:', err);
      }
    }

    if (players.length > 0) {
      setCardPlayerName(players[0].name);
    } else {
      setCardPlayerName('');
    }
    setShowCardModal(true);
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
    const res = await adminService.recordGoal(selectedMatch._id, {
      teamId,
      playerId: matchedPlayer?._id,
      minute: calculatedMinute,
      type: 'Normal Goal',
    });
    await adminService.updateScore(selectedMatch._id, newScoreA, newScoreB);

    if (res?.success && res.data?.event) {
      setMatchGoals((prev) => {
        const exists = prev.some((g) => g._id === res.data.event._id);
        return exists ? prev : [...prev, res.data.event];
      });
    } else {
      const fallbackGoal = {
        _id: 'goal_' + Date.now(),
        team: { _id: teamId, name: teamName },
        player: matchedPlayer || { name: goalPlayerName, jerseyNumber: 10 },
        matchTime: calculatedMinute,
        detail: { goalType: 'Normal Goal' },
        timestamp: new Date().toISOString()
      };
      setMatchGoals((prev) => [...prev, fallbackGoal]);
    }

    showNotification(`Goal recorded for ${teamName} (${goalPlayerName || 'Athlete'} • ${calculatedMinute})!`);
  };

  const handleDeleteGoal = async (goalId: string, teamId?: string) => {
    if (!selectedMatch) return;
    try {
      await adminService.removeGoal(selectedMatch._id, goalId);
      setMatchGoals((prev) => prev.filter((g) => g._id !== goalId));
      const targetAId = typeof selectedMatch.teamA === 'object' ? selectedMatch.teamA?._id : selectedMatch.teamA;
      if (teamId === targetAId) {
        const nextA = Math.max(0, scoreA - 1);
        setScoreA(nextA);
        await adminService.updateScore(selectedMatch._id, nextA, scoreB);
      } else {
        const nextB = Math.max(0, scoreB - 1);
        setScoreB(nextB);
        await adminService.updateScore(selectedMatch._id, scoreA, nextB);
      }
      showNotification('Goal removed and score updated');
    } catch (err: any) {
      showError('Failed to remove goal');
    }
  };

  // 3-Kick Regulation Penalty Recorder
  const handleRecordPenaltyKick = async (team: 'A' | 'B', outcome: 'Goal' | 'Saved' | 'Missed') => {
    if (!selectedMatch) return;
    if (selectedMatch.status === 'Completed' || selectedMatch.shootout?.isCompleted) {
      showError('This match has already been completed and concluded.');
      return;
    }

    const teamKicks = penaltyKicks.filter((k) => k.team === team);
    const existingTaken = team === 'A'
      ? Math.max(teamKicks.length, selectedMatch.shootout?.teamAPenaltiesTaken || 0)
      : Math.max(teamKicks.length, selectedMatch.shootout?.teamBPenaltiesTaken || 0);

    if (existingTaken >= 3) {
      showError(`${team === 'A' ? teamAName : teamBName} has already completed their 3 regulation penalty kicks.`);
      return;
    }

    const players = team === 'A' ? teamAPlayers : teamBPlayers;
    const selectedKickerId = team === 'A' ? selectedKickerA : selectedKickerB;
    const kicker = players.find((p) => p._id === selectedKickerId) || players[0];

    if (!kicker) {
      showError(`Please choose a penalty shooter for ${team === 'A' ? teamAName : teamBName}.`);
      return;
    }

    const currentRound = existingTaken + 1;

    const newKick = {
      team,
      round: currentRound,
      playerId: kicker._id,
      playerName: kicker.name,
      playerClub: kicker.club || 'Independent Club',
      playerJersey: kicker.jerseyNumber,
      outcome,
    };

    const nextKicks = [...penaltyKicks, newKick];
    setPenaltyKicks(nextKicks);

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
    const rawTeamA = selectedMatch.teamA;
    const rawTeamB = selectedMatch.teamB;
    const teamAId = typeof rawTeamA === 'object' && rawTeamA ? (rawTeamA as any)._id : rawTeamA;
    const teamBId = typeof rawTeamB === 'object' && rawTeamB ? (rawTeamB as any)._id : rawTeamB;
    const teamId = team === 'A' ? teamAId : teamBId;

    const res = await adminService.recordPenalty(selectedMatch._id, {
      team: teamId,
      teamId: teamId,
      player: kicker._id,
      playerId: kicker._id,
      outcome,
    });

    if (res?.success && res.data?.shootoutState) {
      const ss = res.data.shootoutState;
      if (typeof ss.teamAPenaltyScore === 'number') {
        newPenA = ss.teamAPenaltyScore;
        setPenaltyScoreA(ss.teamAPenaltyScore);
      }
      if (typeof ss.teamBPenaltyScore === 'number') {
        newPenB = ss.teamBPenaltyScore;
        setPenaltyScoreB(ss.teamBPenaltyScore);
      }
      setSelectedMatch((prev) =>
        prev
          ? {
              ...prev,
              shootout: {
                ...prev.shootout,
                ...ss,
                isShootout: true,
              },
            }
          : null
      );
    } else if (res?.error) {
      showError(res.error);
    }

    // Advance kicker selection to next player in squad
    const currentIndex = players.findIndex((p) => p._id === kicker._id);
    const nextPlayer = players[(currentIndex + 1) % players.length];
    if (nextPlayer) {
      if (team === 'A') setSelectedKickerA(nextPlayer._id);
      else setSelectedKickerB(nextPlayer._id);
    }

    const updatedKicksA = Math.max(
      nextKicks.filter((k) => k.team === 'A').length,
      res?.data?.shootoutState?.teamAPenaltiesTaken || 0
    );
    const updatedKicksB = Math.max(
      nextKicks.filter((k) => k.team === 'B').length,
      res?.data?.shootoutState?.teamBPenaltiesTaken || 0
    );

    if (res?.data?.evaluation?.isDecided || (updatedKicksA >= 3 && updatedKicksB >= 3 && newPenA !== newPenB)) {
      const winningTeamName = newPenA > newPenB ? teamAName : teamBName;
      showNotification(
        `🏆 SHOOTOUT DECIDED! ${winningTeamName} wins ${newPenA} - ${newPenB}! Click "Finalize Match Victory" to complete.`
      );
    } else if (updatedKicksA >= 3 && updatedKicksB >= 3 && newPenA === newPenB) {
      showNotification(
        `Shootout tied ${newPenA} - ${newPenB} after 3 kicks each! Proceed to Sudden Death Coin Toss below.`
      );
    } else {
      showNotification(
        `Penalty #${currentRound}/3 (${team === 'A' ? teamAName : teamBName}): ${kicker.name} [${kicker.club || 'Club'}] -> ${outcome.toUpperCase()}! Shootout: ${newPenA} - ${newPenB}`
      );
    }
  };

  const handleSaveCard = () => {
    if (!cardPlayerName) {
      showError('Please choose or enter a player name for the card.');
      return;
    }
    const teamName = cardTeam === 'A' ? teamAName : teamBName;
    showNotification(`${cardColor} Card recorded for ${cardPlayerName} (${teamName})`);
    setShowCardModal(false);
  };

  const handleSaveSub = () => {
    if (!subPlayerIn || !subPlayerOut) {
      showError('Please specify both the player entering and exiting.');
      return;
    }
    const teamName = subTeam === 'A' ? teamAName : teamBName;
    showNotification(`Substitution recorded for ${teamName}: ${subPlayerIn} IN, ${subPlayerOut} OUT`);
    setShowSubModal(false);
  };

  // Sudden Death Coin Toss Handler
  const handleSetTossWinner = (winner: 'A' | 'B') => {
    const winnerName = winner === 'A' ? teamAName : teamBName;
    setTossState((prev) => ({
      ...prev,
      isFlipping: false,
      tossWinner: winner,
      tossChoice: null, // Reset choice so the chosen team can choose SHOOT or SAVE
      isResolved: false,
      winnerTeamName: null,
      selectedDecisiveShooterId: winner === 'A' ? teamAPlayers[0]?._id || '' : teamBPlayers[0]?._id || '',
    }));
    showNotification(`🪙 Coin Toss Winner Set: ${winnerName} won the toss! Please choose SHOOT or SAVE.`);
  };

  const handleResetToss = () => {
    setTossState((prev) => ({
      ...prev,
      isFlipping: false,
      tossWinner: null,
      tossChoice: null,
      isResolved: false,
      winnerTeamName: null,
      selectedDecisiveShooterId: '',
    }));
    showNotification(`🪙 Coin toss reset. Select who won the toss.`);
  };

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
    }, 800);
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

    const rawTeamA = selectedMatch.teamA;
    const rawTeamB = selectedMatch.teamB;
    const teamAId = typeof rawTeamA === 'object' && rawTeamA ? (rawTeamA as any)._id : rawTeamA;
    const teamBId = typeof rawTeamB === 'object' && rawTeamB ? (rawTeamB as any)._id : rawTeamB;

    let winnerId: string | null = null;
    let winnerName: string | null = null;
    let resultStr = 'Full Time Draw';
    const hasShootout = penaltyScoreA > 0 || penaltyScoreB > 0 || selectedMatch.shootout?.isShootout;

    if (scoreA > scoreB) {
      winnerId = teamAId;
      winnerName = teamAName;
      resultStr = `${teamAName} Victory`;
    } else if (scoreB > scoreA) {
      winnerId = teamBId;
      winnerName = teamBName;
      resultStr = `${teamBName} Victory`;
    } else if (penaltyScoreA > penaltyScoreB) {
      winnerId = teamAId;
      winnerName = teamAName;
      resultStr = `${teamAName} won on penalties (${penaltyScoreA} - ${penaltyScoreB})`;
    } else if (penaltyScoreB > penaltyScoreA) {
      winnerId = teamBId;
      winnerName = teamBName;
      resultStr = `${teamBName} won on penalties (${penaltyScoreA} - ${penaltyScoreB})`;
    } else if (selectedMatch.shootout?.shootoutWinner) {
      const swId = typeof selectedMatch.shootout.shootoutWinner === 'object'
        ? (selectedMatch.shootout.shootoutWinner as any)._id
        : selectedMatch.shootout.shootoutWinner;
      winnerId = swId;
      winnerName = swId === teamAId ? teamAName : teamBName;
      resultStr = `${winnerName} won on penalties (${penaltyScoreA} - ${penaltyScoreB})`;
    } else if (tossState.tossWinner) {
      winnerName = tossState.tossWinner === 'A' ? teamAName : teamBName;
      winnerId = tossState.tossWinner === 'A' ? teamAId : teamBId;
      resultStr = `${winnerName} Sudden Death Victory`;
    }

    const shootoutData = {
      isShootout: Boolean(hasShootout || (winnerId && scoreA === scoreB)),
      teamAPenaltyScore: penaltyScoreA,
      teamBPenaltyScore: penaltyScoreB,
      isCompleted: true,
      shootoutWinner: winnerId,
    };

    await adminService.finalizeMatch(selectedMatch._id, {
      penaltyScoreA,
      penaltyScoreB,
      shootout: shootoutData,
      winner: winnerId,
      shootoutWinner: winnerId,
      matchResult: resultStr,
    });

    await adminService.updateMatch(selectedMatch._id, {
      status: 'Completed',
      isFinalized: true,
      winner: winnerId,
      matchResult: resultStr,
      shootout: shootoutData,
    } as any);

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
      setMatchGoals([]);
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
        goals: [],
        events: [],
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
  const recordedKicksA = penaltyKicks.filter((k) => k.team === 'A').length;
  const recordedKicksB = penaltyKicks.filter((k) => k.team === 'B').length;
  const kicksA = Math.max(recordedKicksA, selectedMatch?.shootout?.teamAPenaltiesTaken || 0);
  const kicksB = Math.max(recordedKicksB, selectedMatch?.shootout?.teamBPenaltiesTaken || 0);
  const isMatchCompleted = selectedMatch?.status === 'Completed';
  const isShootoutConcluded = isMatchCompleted || Boolean(selectedMatch?.shootout?.isCompleted);
  const regulationKicksComplete = (kicksA >= 3 && kicksB >= 3) || isShootoutConcluded;
  const isShootoutTiedAfterThree = !isShootoutConcluded && kicksA >= 3 && kicksB >= 3 && penaltyScoreA === penaltyScoreB;
  const hasShootoutWinner = isShootoutConcluded
    ? (penaltyScoreA !== penaltyScoreB || Boolean(selectedMatch?.winner) || Boolean(selectedMatch?.shootout?.shootoutWinner))
    : (regulationKicksComplete && penaltyScoreA !== penaltyScoreB);
  const shootoutLeaderOrWinner =
    penaltyScoreA > penaltyScoreB
      ? teamAName
      : penaltyScoreB > penaltyScoreA
      ? teamBName
      : typeof selectedMatch?.winner === 'object'
      ? selectedMatch.winner?.name
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 flex flex-col gap-6 select-none w-full animate-in fade-in duration-200">
      {/* Top Header matching Screen 8: ← Match Control + LIVE badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2 -ml-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2 text-sm font-bold"
          >
            <ArrowLeft className="w-5 h-5 text-slate-800" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Match Control
            </h1>
          </Link>
        </div>

        {/* Match Selector & LIVE badge (Screen 8) */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <select
              disabled={matches.length === 0}
              value={selectedMatch?._id || ''}
              onChange={(e) => {
                const found = matches.find((m) => m._id === e.target.value);
                if (found) selectMatch(found);
              }}
              className="bg-white text-xs font-bold text-slate-800 px-3 py-2 rounded-xl border border-slate-200 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer max-w-[220px] truncate"
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

          <button
            type="button"
            onClick={() => setShowMatchPickerModal(true)}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            Switch
          </button>

          {/* End Match quick button in header */}
          {selectedMatch && selectedMatch.status !== 'Completed' && (
            <button
              type="button"
              onClick={handleFinalizeMatch}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-extrabold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Flag className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
              <span>End Match</span>
            </button>
          )}

          {/* LIVE Badge (Screen 8) */}
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500 text-white font-extrabold text-xs shadow-xs">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            <span>LIVE</span>
          </span>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-3.5 flex items-center gap-2 text-xs font-bold shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {actionError && (
        <div className="bg-rose-50 border border-rose-300 text-rose-900 rounded-xl p-3.5 flex items-center gap-2 text-xs font-bold shadow-xs animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Dynamic Match Controller View */}
      {loading ? (
        <div className="p-16 text-center flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading match telemetry...</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-16 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
            <Calendar className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">No Match Available</h3>
            <p className="text-xs text-slate-500 font-medium mt-1 max-w-md mx-auto">
              There is currently no match scheduled in the tournament. Once a match is scheduled, the live scoreboard, official clock, and protocol controls will appear here.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowQuickSchedule(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Match</span>
          </button>
        </div>
      ) : !selectedMatch ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-16 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-blue-600">
            <Zap className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">No Match Selected</h3>
            <p className="text-xs text-slate-500 font-medium mt-1 max-w-md mx-auto">
              Please choose a scheduled fixture from the dropdown above or click below to choose a match to control.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowMatchPickerModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Choose Match to Start</span>
          </button>
        </div>
      ) : (
        <>
          {/* Main Scoreboard Card (Screen 8: Team A, Score 2 - 1, Second Half, 02:36 green pill, Team B) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 flex flex-col items-center gap-6">
            <div className="w-full flex items-center justify-between gap-4">
              {/* Team A (Home Team) */}
              <div className="flex flex-col items-center sm:items-start gap-3 flex-1 text-center sm:text-left min-w-0">
                <div className="flex flex-col items-center sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center font-black text-xl text-slate-800 shadow-2xs overflow-hidden shrink-0">
                    {selectedMatch?.teamA?.logo ? (
                      <img src={selectedMatch.teamA.logo} alt={teamAName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{teamAName.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-2xl font-black text-slate-900 leading-tight truncate">
                      {teamAName}
                    </h2>
                    <span className="text-xs text-slate-500 font-semibold">Home Team</span>
                  </div>
                </div>

                {/* Team A Direct Actions: Goal & Card Downward of Logo/Name */}
                <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={() => handleOpenGoalModal('A')}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                    title={`Record goal scored by ${teamAName}`}
                  >
                    <span>⚽</span>
                    <span>+ Goal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenCardModal('A')}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                    title={`Issue caution or card to ${teamAName}`}
                  >
                    <span>🟨</span>
                    <span>+ Card</span>
                  </button>
                </div>

                {/* Team A Recorded Goals Downward of Logo & Actions */}
                {teamAGoals.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-1 w-full max-w-xs items-center sm:items-start">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Recorded Goals ({teamAGoals.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                      {teamAGoals.map((g, idx) => (
                        <span
                          key={g._id || idx}
                          className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-800 shadow-2xs"
                        >
                          <span>⚽</span>
                          <span className="font-bold">{g.player?.name || 'Goal'}</span>
                          <span className="text-slate-400 font-mono text-[11px]">({g.matchTime})</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteGoal(g._id, targetTeamAId)}
                            className="text-slate-400 hover:text-rose-600 transition-colors ml-0.5 cursor-pointer"
                            title="Remove goal"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Center: Score + Stage + Green Digital Clock Pill */}
              <div className="flex flex-col items-center justify-center px-2 sm:px-6 shrink-0">
                <div className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight tabular-nums">
                  {scoreA} - {scoreB}
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-500 mt-1">
                  {currentStage}
                </div>
                <div className="mt-2.5 px-6 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-mono font-bold text-2xl tracking-wider shadow-2xs">
                  <span data-testid="match-clock">{formatTime(remainingSeconds)}</span>
                </div>
              </div>

              {/* Team B (Away Team) */}
              <div className="flex flex-col items-center sm:items-end gap-3 flex-1 text-center sm:text-right min-w-0">
                <div className="flex flex-col items-center sm:flex-row-reverse sm:items-center gap-3 sm:gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center font-black text-xl text-slate-800 shadow-2xs overflow-hidden shrink-0">
                    {selectedMatch?.teamB?.logo ? (
                      <img src={selectedMatch.teamB.logo} alt={teamBName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{teamBName.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-2xl font-black text-slate-900 leading-tight truncate">
                      {teamBName}
                    </h2>
                    <span className="text-xs text-slate-500 font-semibold">Away Team</span>
                  </div>
                </div>

                {/* Team B Direct Actions: Goal & Card Downward of Logo/Name */}
                <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
                  <button
                    type="button"
                    onClick={() => handleOpenGoalModal('B')}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                    title={`Record goal scored by ${teamBName}`}
                  >
                    <span>⚽</span>
                    <span>+ Goal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenCardModal('B')}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                    title={`Issue caution or card to ${teamBName}`}
                  >
                    <span>🟨</span>
                    <span>+ Card</span>
                  </button>
                </div>

                {/* Team B Recorded Goals Downward of Logo & Actions */}
                {teamBGoals.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-1 w-full max-w-xs items-center sm:items-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Recorded Goals ({teamBGoals.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5 justify-center sm:justify-end">
                      {teamBGoals.map((g, idx) => (
                        <span
                          key={g._id || idx}
                          className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-800 shadow-2xs"
                        >
                          <span>⚽</span>
                          <span className="font-bold">{g.player?.name || 'Goal'}</span>
                          <span className="text-slate-400 font-mono text-[11px]">({g.matchTime})</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteGoal(g._id, targetTeamBId)}
                            className="text-slate-400 hover:text-rose-600 transition-colors ml-0.5 cursor-pointer"
                            title="Remove goal"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timer Controls Row (Screen 8: Amber Pause pill + Royal Blue Resume pill + Rose End Match) */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 pt-2 flex-wrap">
              <button
                type="button"
                data-testid="timer-action-btn-pause"
                onClick={handlePause}
                disabled={!timerRunning}
                className="px-7 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Pause className="w-4 h-4 fill-white" />
                <span>Pause</span>
              </button>
              <button
                type="button"
                data-testid="timer-action-btn-resume"
                onClick={handleStartOrResume}
                disabled={timerRunning && selectedMatch?.status !== 'Upcoming'}
                className="px-7 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Resume</span>
              </button>
              <button
                type="button"
                data-testid="timer-action-btn-end"
                onClick={handleFinalizeMatch}
                disabled={selectedMatch?.status === 'Completed'}
                className="px-7 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Flag className="w-4 h-4 fill-white text-white" />
                <span>End Match</span>
              </button>
            </div>
          </div>

          {/* Quick Operations Toolbar: Substitution & Penalties */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            {/* 1. Substitution */}
            <button
              type="button"
              onClick={() => setShowSubModal(true)}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-xs transition-all flex items-center gap-4 text-left group cursor-pointer active:scale-[0.99]"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                🔄
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-sm font-extrabold text-slate-800">Squad Substitution</div>
                <div className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Record player-in & player-out interchanges</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
            </button>

            {/* 2. Penalty Shootout Console */}
            <button
              type="button"
              onClick={() => {
                document.getElementById('penalty-shootout-console')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs transition-all flex items-center gap-4 text-left group cursor-pointer active:scale-[0.99]"
            >
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                🥅
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-sm font-extrabold text-slate-800">Penalty Shootout Console</div>
                <div className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Regulation 3 kicks & sudden death decider</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
            </button>
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
                  : currentStage.includes('Extra')
                  ? 'bg-amber-500/20 text-amber-800 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                  : scoreA === scoreB
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 shadow-xs active:scale-95'
                  : 'bg-surface-container-low text-on-surface-variant/40 border-surface-container cursor-not-allowed opacity-50 shadow-none'
              }`}
              title={
                isExtraTimeDone
                  ? 'Extra Time concluded'
                  : scoreA === scoreB
                  ? 'Scores tied! Click to start 2 minutes extra time'
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
                ) : currentStage.includes('Extra') ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
                    <span>4. Extra Time (2:00)</span>
                    <span className="text-[9px] bg-amber-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                      IN PLAY
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
                  : currentStage.includes('Extra')
                  ? '2 minutes extra time countdown underway'
                  : scoreA === scoreB
                  ? 'Scores tied! Click to start 2m decider clock'
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
                onClick={() => handleResetClock(240)}
                className="px-2.5 py-1 rounded-lg bg-surface-container text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors active:scale-95"
              >
                Reset 4:00
              </button>
              <button
                onClick={() => handleResetClock(120)}
                className="px-2.5 py-1 rounded-lg bg-surface-container text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors active:scale-95"
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
              <span className="font-display-score text-base font-black text-white tabular-nums flex items-center gap-1.5">
                <span className={penaltyScoreA > penaltyScoreB ? 'text-emerald-400 font-extrabold flex items-center gap-1' : ''}>
                  {penaltyScoreA > penaltyScoreB && <span>🏆</span>}
                  {teamAName} {penaltyScoreA}
                </span>
                <span className="text-slate-400">—</span>
                <span className={penaltyScoreB > penaltyScoreA ? 'text-emerald-400 font-extrabold flex items-center gap-1' : ''}>
                  {penaltyScoreB} {teamBName}
                  {penaltyScoreB > penaltyScoreA && <span>🏆</span>}
                </span>
              </span>
            </div>

            {/* Shootout Decided Alert if winner after 3 kicks */}
            {hasShootoutWinner && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-black">
                  <Trophy className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    SHOOTOUT DECIDED! 🏆 {shootoutLeaderOrWinner || (penaltyScoreA > penaltyScoreB ? teamAName : teamBName)} wins {Math.max(penaltyScoreA, penaltyScoreB)} - {Math.min(penaltyScoreA, penaltyScoreB)}!
                  </span>
                </div>
                {selectedMatch?.status !== 'Completed' && (
                  <button
                    onClick={handleFinalizeMatch}
                    className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider"
                  >
                    Finalize Match Victory
                  </button>
                )}
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
                  <div className="flex flex-col gap-3">
                    <p className="text-xs text-amber-900 leading-relaxed font-semibold">
                      All 3 regulation penalties are tied! Who won the referee&apos;s official coin toss? Choose the winning team:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleSetTossWinner('A')}
                        className="py-3 px-4 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-95"
                      >
                        <span className="text-base">🪙</span>
                        <span>{teamAName} Won Toss</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetTossWinner('B')}
                        className="py-3 px-4 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-95"
                      >
                        <span className="text-base">🪙</span>
                        <span>{teamBName} Won Toss</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <div className="h-px bg-amber-300 flex-1" />
                      <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">or digital simulation</span>
                      <div className="h-px bg-amber-300 flex-1" />
                    </div>
                    <button
                      type="button"
                      onClick={handleFlipCoin}
                      disabled={tossState.isFlipping}
                      className="w-full py-2 bg-white hover:bg-amber-100 text-amber-900 font-bold text-xs uppercase tracking-wider rounded-xl border border-amber-300 shadow-2xs transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                      <Coins className={`w-3.5 h-3.5 text-amber-600 ${tossState.isFlipping ? 'animate-spin' : ''}`} />
                      <span>{tossState.isFlipping ? 'Flipping Digital Coin...' : '🎲 Random Digital Coin Flip'}</span>
                    </button>
                  </div>
                ) : !tossState.tossChoice ? (
                  <div className="flex flex-col gap-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-amber-100 p-2.5 rounded-xl border border-amber-300">
                      <div className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                        <span className="text-base">🪙</span>
                        <span>{tossState.tossWinner === 'A' ? teamAName : teamBName} WON THE COIN TOSS!</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSetTossWinner(tossState.tossWinner === 'A' ? 'B' : 'A')}
                          className="px-2.5 py-1 text-[11px] font-bold text-amber-900 bg-amber-200 hover:bg-amber-300 rounded-lg transition-all"
                        >
                          Switch to {tossState.tossWinner === 'A' ? teamBName : teamAName}
                        </button>
                        <button
                          type="button"
                          onClick={handleResetToss}
                          className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-amber-200 rounded-lg transition-all"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-amber-900 font-medium">
                      The coin toss winner ({tossState.tossWinner === 'A' ? teamAName : teamBName}) must decide: take the decisive kick (SHOOT) or defend the goal (SAVE)?
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
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 bg-amber-100/70 px-3 py-1.5 rounded-lg border border-amber-200">
                      <span>
                        Toss Winner: <strong className="text-amber-950 font-black">{tossState.tossWinner === 'A' ? teamAName : teamBName}</strong> (Chose <strong className="text-emerald-800 font-black">{tossState.tossChoice.toUpperCase()}</strong>)
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setTossState((prev) => ({ ...prev, tossChoice: null }))}
                          className="text-amber-800 hover:text-amber-950 underline font-semibold text-[11px]"
                        >
                          Change Choice
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={handleResetToss}
                          className="text-amber-800 hover:text-amber-950 underline font-semibold text-[11px]"
                        >
                          Change Winner
                        </button>
                      </div>
                    </div>
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

            {/* 3-Kick Recorder Columns (Visible during regulation 3 kicks only) */}
            {!regulationKicksComplete && !hasShootoutWinner && !isShootoutConcluded && (
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
          <div id="penalty-shootout-console" className="lg:col-span-5 bg-surface-container-lowest p-4 sm:p-6 rounded-2xl border border-surface-container-high shadow-xs flex flex-col items-center justify-center text-center py-8 sm:py-12">
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
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                <span>⚽ Confirm & Add Goal ({goalTeam === 'A' ? teamAName.split(' ')[0] : teamBName.split(' ')[0]})</span>
              </button>
              <button
                type="button"
                onClick={() => setShowGoalModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Card Modal (Screen 8 Action Tile) */}
      {showCardModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/70 backdrop-blur-sm p-4 flex min-h-screen items-center justify-center animate-in fade-in duration-200">
          <div className="relative max-w-lg w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl p-5 sm:p-7 space-y-4 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🟨</span>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Issue Card / Caution
                  </h3>
                  <p className="text-xs text-slate-500">Record disciplinary action for match feed</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCardModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Team Picker */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setCardTeam('A');
                  const p = teamAPlayers[0]?.name || '';
                  setCardPlayerName(p);
                }}
                className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                  cardTeam === 'A'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {teamAName} (Home)
              </button>
              <button
                type="button"
                onClick={() => {
                  setCardTeam('B');
                  const p = teamBPlayers[0]?.name || '';
                  setCardPlayerName(p);
                }}
                className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                  cardTeam === 'B'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {teamBName} (Away)
              </button>
            </div>

            {/* Card Type */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCardColor('Yellow')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  cardColor === 'Yellow'
                    ? 'bg-amber-50 border-amber-500 text-amber-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span>🟨</span>
                <span>Yellow Card</span>
              </button>
              <button
                type="button"
                onClick={() => setCardColor('Red')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  cardColor === 'Red'
                    ? 'bg-rose-50 border-rose-500 text-rose-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span>🟥</span>
                <span>Red Card</span>
              </button>
            </div>

            {/* Player Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Athlete
              </label>
              <select
                value={cardPlayerName}
                onChange={(e) => setCardPlayerName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choose athlete --</option>
                {(cardTeam === 'A' ? teamAPlayers : teamBPlayers).map((p) => (
                  <option key={p._id} value={p.name}>
                    #{p.jerseyNumber} - {p.name} ({p.position})
                  </option>
                ))}
              </select>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={handleSaveCard}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs"
              >
                Confirm & Issue Card
              </button>
              <button
                type="button"
                onClick={() => setShowCardModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Substitution Modal (Screen 8 Action Tile) */}
      {showSubModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/70 backdrop-blur-sm p-4 flex min-h-screen items-center justify-center animate-in fade-in duration-200">
          <div className="relative max-w-lg w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl p-5 sm:p-7 space-y-4 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🔄</span>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Record Substitution
                  </h3>
                  <p className="text-xs text-slate-500">Track player interchange for match feed</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSubModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Team Picker */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSubTeam('A')}
                className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                  subTeam === 'A'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {teamAName} (Home)
              </button>
              <button
                type="button"
                onClick={() => setSubTeam('B')}
                className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${
                  subTeam === 'B'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {teamBName} (Away)
              </button>
            </div>

            {/* Player In */}
            <div>
              <label className="block text-xs font-bold text-emerald-700 mb-1">
                Player Coming IN (⬆)
              </label>
              <select
                value={subPlayerIn}
                onChange={(e) => setSubPlayerIn(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Choose player entering --</option>
                {(subTeam === 'A' ? teamAPlayers : teamBPlayers).map((p) => (
                  <option key={p._id} value={p.name}>
                    #{p.jerseyNumber} - {p.name} ({p.position})
                  </option>
                ))}
              </select>
            </div>

            {/* Player Out */}
            <div>
              <label className="block text-xs font-bold text-rose-700 mb-1">
                Player Going OUT (⬇)
              </label>
              <select
                value={subPlayerOut}
                onChange={(e) => setSubPlayerOut(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="">-- Choose player leaving --</option>
                {(subTeam === 'A' ? teamAPlayers : teamBPlayers).map((p) => (
                  <option key={p._id} value={p.name}>
                    #{p.jerseyNumber} - {p.name} ({p.position})
                  </option>
                ))}
              </select>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={handleSaveSub}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs"
              >
                Confirm Substitution
              </button>
              <button
                type="button"
                onClick={() => setShowSubModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-all"
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
