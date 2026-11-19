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
  const [lastEvent, setLastEvent] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initial fetch if initialMatch is not provided or to ensure fresh data
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const liveData = await matchService.getAuthoritativeLiveState(matchId);
      if (isMounted && liveData) {
        setMatch(liveData);
        if (liveData.events && liveData.events.length > 0) {
          setTimeline(liveData.events);
        }
      }
      const timelineData = await matchService.getMatchTimeline(matchId);
      if (isMounted && timelineData && timelineData.length > 0) {
        setTimeline(timelineData);
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

    // Timer updates
    socket.on('timer:update', (data: { remainingTime: number; stage?: string }) => {
      setMatch((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          timer: {
            ...(prev.timer || { currentStage: 'First Half', stageDuration: 240, remainingTime: 240, isRunning: true, isPaused: false }),
            remainingTime: data.remainingTime,
            currentStage: data.stage || prev.timer?.currentStage || prev.currentStage || 'First Half',
            isRunning: true,
            isPaused: false,
          },
        };
      });
    });

    socket.on('timer:updated', (data: { remainingTime: number; stage?: string }) => {
      setMatch((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          timer: {
            ...(prev.timer || { currentStage: 'First Half', stageDuration: 240, remainingTime: 240, isRunning: true, isPaused: false }),
            remainingTime: data.remainingTime,
            currentStage: data.stage || prev.timer?.currentStage || prev.currentStage || 'First Half',
            isRunning: true,
            isPaused: false,
          },
        };
      });
    });

    socket.on('timer:started', () => {
      setMatch((prev) => prev ? { ...prev, status: 'Live', timer: { ...(prev.timer || { currentStage: 'First Half', stageDuration: 240, remainingTime: 240, isRunning: true, isPaused: false }), isRunning: true, isPaused: false } } : prev);
      setLastEvent('Timer Started');
    });

    socket.on('timer:paused', (data: any) => {
      setMatch((prev) => prev ? { ...prev, timer: { ...(prev.timer || { currentStage: 'First Half', stageDuration: 240, remainingTime: 240, isRunning: false, isPaused: true }), isRunning: false, isPaused: true, remainingTime: data?.remainingTime ?? prev.timer?.remainingTime } } : prev);
      setLastEvent('Timer Paused');
    });

    socket.on('timer:resumed', (data: any) => {
      setMatch((prev) => prev ? { ...prev, timer: { ...(prev.timer || { currentStage: 'First Half', stageDuration: 240, remainingTime: 240, isRunning: true, isPaused: false }), isRunning: true, isPaused: false, remainingTime: data?.remainingTime ?? prev.timer?.remainingTime } } : prev);
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

    // Stage changes
    socket.on('stage:change', (data: any) => {
      setLastEvent(`Stage changed: ${data?.stage || data}`);
      setMatch((prev) => prev ? { ...prev, currentStage: data?.stage || data } : prev);
    });

    // Match completed
    socket.on('match:completed', (data: any) => {
      setLastEvent('Match Completed');
      setMatch((prev) => prev ? { ...prev, status: 'Completed', isFinalized: true, ...data } : prev);
    });

    return () => {
      socket.emit('leave:match', matchId);
      socket.disconnect();
    };
  }, [matchId]);

  return { match, timeline, isConnected, lastEvent };
}
