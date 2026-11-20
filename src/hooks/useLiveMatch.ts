'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Match, MatchEvent } from '@/types';
import { matchService } from '@/services/match.service';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export function useLiveMatch(matchId: string, initialMatch?: Match | null) {
  const [match, setMatch] = useState<Match | null>(initialMatch || null);
  const [timeline, setTimeline] = useState<MatchEvent[]>(initialMatch?.events || []);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(!initialMatch);
  const [lastEvent, setLastEvent] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initial fetch if initialMatch is not provided or to ensure fresh data
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!matchId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        let matchResult = await matchService.getAuthoritativeLiveState(matchId);
        if (!matchResult) {
          matchResult = await matchService.getMatchById(matchId);
        }
        if (isMounted && matchResult) {
          setMatch(matchResult);
          if (matchResult.events && matchResult.events.length > 0) {
            setTimeline(matchResult.events);
          }
        }
        const timelineData = await matchService.getMatchTimeline(matchId);
        if (isMounted && timelineData && timelineData.length > 0) {
          setTimeline(timelineData);
        }
      } catch (err) {
        console.error('Error fetching match data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [matchId]);

  // Socket setup
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      // Join match room
      socket.emit('join:match', matchId);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Authoritative full state sync
    const handleSync = (data: any) => {
      if (!data) return;
      setMatch((prev) => ({
        ...(prev || ({} as Match)),
        ...data,
      }));
      if (data.events) {
        setTimeline(data.events);
      }
    };

    socket.on('match:sync', handleSync);
    socket.on('sync:state', handleSync);

    // Timer updates & authoritative synchronization
    socket.on('timer:sync', (data: any) => {
      setMatch((prev) => {
        if (!prev) return prev;
        const remainingTime = data.remainingTime ?? prev.timer?.remainingTime ?? 240;
        return {
          ...prev,
          currentStage: data.currentStage || prev.currentStage,
          timer: {
            ...(prev.timer || { currentStage: 'First Half', stageDuration: 240, remainingTime: 240, isRunning: false, isPaused: false }),
            remainingTime,
            stageDuration: data.stageDuration ?? prev.timer?.stageDuration ?? 240,
            currentStage: data.currentStage || prev.timer?.currentStage || 'First Half',
            phaseEndsAt: data.phaseEndsAt,
            isRunning: Boolean(data.isRunning),
            isPaused: Boolean(data.isPaused),
          },
        };
      });
    });

    socket.on('timer:update', (data: any) => {
      setMatch((prev) => {
        if (!prev) return prev;
        const remainingTime = data.remainingTime ?? prev.timer?.remainingTime ?? 240;
        return {
          ...prev,
          currentStage: data.currentStage || data.stage || prev.currentStage,
          timer: {
            ...(prev.timer || { currentStage: 'First Half', stageDuration: 240, remainingTime: 240, isRunning: true, isPaused: false }),
            remainingTime,
            phaseEndsAt: data.phaseEndsAt ?? prev.timer?.phaseEndsAt,
            currentStage: data.currentStage || data.stage || prev.timer?.currentStage || 'First Half',
            isRunning: data.isRunning !== undefined ? Boolean(data.isRunning) : true,
            isPaused: data.isPaused !== undefined ? Boolean(data.isPaused) : false,
          },
        };
      });
    });

    socket.on('timer:updated', (data: any) => {
      setMatch((prev) => {
        if (!prev) return prev;
        const remainingTime = data.remainingTime ?? prev.timer?.remainingTime ?? 240;
        return {
          ...prev,
          currentStage: data.currentStage || data.stage || prev.currentStage,
          timer: {
            ...(prev.timer || { currentStage: 'First Half', stageDuration: 240, remainingTime: 240, isRunning: true, isPaused: false }),
            remainingTime,
            phaseEndsAt: data.phaseEndsAt ?? prev.timer?.phaseEndsAt,
            currentStage: data.currentStage || data.stage || prev.timer?.currentStage || 'First Half',
            isRunning: data.isRunning !== undefined ? Boolean(data.isRunning) : true,
            isPaused: data.isPaused !== undefined ? Boolean(data.isPaused) : false,
          },
        };
      });
    });

    socket.on('timer:started', (data: any) => {
      setMatch((prev) => {
        if (!prev) return prev;
        const stage = data?.currentStage || prev.timer?.currentStage || 'First Half';
        return {
          ...prev,
          status: stage === 'Half-Time' ? 'Half-Time' : 'Live',
          currentStage: stage,
          timer: {
            ...(prev.timer || { currentStage: stage, stageDuration: 240, remainingTime: 240, isRunning: true, isPaused: false }),
            remainingTime: data?.remainingTime ?? prev.timer?.remainingTime ?? 240,
            phaseEndsAt: data?.phaseEndsAt ?? null,
            isRunning: true,
            isPaused: false,
          },
        };
      });
      setLastEvent('Timer Started');
    });

    socket.on('timer:paused', (data: any) => {
      setMatch((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          timer: {
            ...(prev.timer || { currentStage: 'First Half', stageDuration: 240, remainingTime: 240, isRunning: false, isPaused: true }),
            remainingTime: data?.remainingTime ?? prev.timer?.remainingTime,
            phaseEndsAt: null,
            isRunning: true,
            isPaused: true,
          },
        };
      });
      setLastEvent('Timer Paused');
    });

    socket.on('timer:resumed', (data: any) => {
      setMatch((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          timer: {
            ...(prev.timer || { currentStage: 'First Half', stageDuration: 240, remainingTime: 240, isRunning: true, isPaused: false }),
            remainingTime: data?.remainingTime ?? prev.timer?.remainingTime,
            phaseEndsAt: data?.phaseEndsAt ?? null,
            isRunning: true,
            isPaused: false,
          },
        };
      });
      setLastEvent('Timer Resumed');
    });

    // Score updates
    socket.on('score:update', (data: { teamAScore: number; teamBScore: number }) => {
      setMatch((prev) => prev ? { ...prev, score: { teamA: data.teamAScore, teamB: data.teamBScore } } : prev);
    });

    socket.on('score:updated', (data: { teamAScore: number; teamBScore: number }) => {
      setMatch((prev) => prev ? { ...prev, score: { teamA: data.teamAScore, teamB: data.teamBScore } } : prev);
    });

    // Goal scored
    socket.on('goal:scored', (goalData: any) => {
      setLastEvent(`Goal scored!`);
      // Refresh authoritative live state
      matchService.getAuthoritativeLiveState(matchId).then((res) => {
        if (res) setMatch(res);
      });
      matchService.getMatchTimeline(matchId).then((res) => {
        if (res) setTimeline(res);
      });
    });

    // Goal removed / undone
    socket.on('goal:removed', () => {
      setLastEvent('Goal removed (VAR correction)');
      matchService.getAuthoritativeLiveState(matchId).then((res) => {
        if (res) setMatch(res);
      });
      matchService.getMatchTimeline(matchId).then((res) => {
        if (res) setTimeline(res);
      });
    });

    // Stage / Phase changes
    const handlePhaseChange = (data: any) => {
      const stage = data?.currentStage || data?.phase || data?.stage || data;
      setLastEvent(`Stage changed: ${stage}`);
      setMatch((prev) => {
        if (!prev) return prev;
        const status = data?.status || (stage === 'Half-Time' ? 'Half-Time' : stage === 'Penalty Shootout' ? 'Penalty Shootout' : 'Live');
        return {
          ...prev,
          status,
          currentStage: stage,
          timer: {
            ...(prev.timer || { currentStage: stage, stageDuration: data?.stageDuration ?? 240, remainingTime: data?.remainingTime ?? 240, isRunning: true, isPaused: false }),
            currentStage: stage,
            remainingTime: data?.remainingTime ?? prev.timer?.remainingTime ?? 240,
            stageDuration: data?.stageDuration ?? prev.timer?.stageDuration ?? 240,
            phaseEndsAt: data?.phaseEndsAt ?? null,
            isRunning: stage !== 'Penalty Shootout' && stage !== 'Match Completed',
            isPaused: false,
          },
        };
      });
    };

    socket.on('stage:change', handlePhaseChange);
    socket.on('match:phase_changed', handlePhaseChange);

    // Match completed
    socket.on('match:completed', (data: any) => {
      setLastEvent('Match Completed');
      setMatch((prev) => prev ? {
        ...prev,
        status: 'Completed',
        isFinalized: true,
        timer: prev.timer ? { ...prev.timer, isRunning: false, isPaused: false, remainingTime: 0, phaseEndsAt: null } : prev.timer,
        ...data
      } : prev);
    });

    return () => {
      socket.emit('leave:match', matchId);
      socket.disconnect();
    };
  }, [matchId]);

  // Smooth local countdown calculation synchronized with authoritative phaseEndsAt
  useEffect(() => {
    if (!match?.timer?.isRunning || match.timer.isPaused) return;

    const ticker = setInterval(() => {
      setMatch((prev) => {
        if (!prev || !prev.timer || !prev.timer.isRunning || prev.timer.isPaused) return prev;
        let remaining = prev.timer.remainingTime;
        if (prev.timer.phaseEndsAt) {
          const diffMs = new Date(prev.timer.phaseEndsAt).getTime() - Date.now();
          remaining = Math.max(0, Math.ceil(diffMs / 1000));
        } else {
          remaining = Math.max(0, remaining - 1);
        }
        return {
          ...prev,
          timer: {
            ...prev.timer,
            remainingTime: remaining,
          },
        };
      });
    }, 1000);

    return () => clearInterval(ticker);
  }, [match?.timer?.isRunning, match?.timer?.isPaused, match?.timer?.phaseEndsAt]);

  return { match, timeline, isConnected, lastEvent, loading };
}
