'use client';

import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { TournamentStandingRow } from '@/types';
import { standingsService } from '@/services/standings.service';
import { StandingsTable } from '@/components/standings/StandingsTable';
import { QualificationLegend } from '@/components/standings/QualificationLegend';
import { LoadingState } from '@/components/common/LoadingState';
import { PageHeader } from '@/components/common/PageHeader';
import { useSocket } from '@/hooks/useSocket';

export default function StandingsPage() {
  const [standings, setStandings] = useState<TournamentStandingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const fetchStandings = async () => {
    try {
      const data = await standingsService.getStandings();
      setStandings(data);
    } catch (err) {
      console.error('Failed to load standings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStandings();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleRealtimeUpdate = (data: any) => {
      if (Array.isArray(data)) {
        setStandings(data);
      } else {
        fetchStandings();
      }
    };

    socket.on('standings:update', handleRealtimeUpdate);
    socket.on('match:completed', fetchStandings);

    return () => {
      socket.off('standings:update', handleRealtimeUpdate);
      socket.off('match:completed', fetchStandings);
    };
  }, [socket]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <PageHeader
        badge="Official Tournament Classification"
        badgeIcon={<Trophy className="w-4 h-4 text-primary-container" />}
        title="Tournament Standings & Points Table"
        description="Official collegiate classification and real-time point-table ranking (Win = 2 Pts, Draw = 0 Pts, Loss = 0 Pts)."
        action={
          <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2 rounded-xl text-xs font-bold text-on-surface border border-surface-container">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
            <span>Real-Time Sync Verified</span>
          </div>
        }
      />

      {/* Qualification Legend Strip */}
      <QualificationLegend />

      {/* Standings Table */}
      {loading ? (
        <LoadingState message="Calculating official league standings..." />
      ) : (
        <StandingsTable standings={standings} />
      )}
    </div>
  );
}
