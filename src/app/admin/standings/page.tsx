'use client';

import React, { useState, useEffect } from 'react';
import { TableProperties, RefreshCw, CheckCircle2 } from 'lucide-react';
import { standingsService } from '@/services/standings.service';
import { adminService } from '@/services/admin.service';
import { tournamentService } from '@/services/tournament.service';
import { StandingsTable } from '@/components/standings/StandingsTable';
import { QualificationLegend } from '@/components/standings/QualificationLegend';
import { TournamentStandingRow } from '@/types';
import { useSocket } from '@/hooks/useSocket';

export default function AdminStandingsPage() {
  const [standings, setStandings] = useState<TournamentStandingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const { socket } = useSocket();

  const loadStandings = async () => {
    try {
      const data = await standingsService.getStandings();
      setStandings(data);
    } catch (err) {
      console.error('Failed loading standings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStandings();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleRealtimeUpdate = (data: any) => {
      if (Array.isArray(data)) {
        setStandings(data);
      } else {
        loadStandings();
      }
    };

    socket.on('standings:update', handleRealtimeUpdate);
    socket.on('match:completed', loadStandings);

    return () => {
      socket.off('standings:update', handleRealtimeUpdate);
      socket.off('match:completed', loadStandings);
    };
  }, [socket]);

  const handleRecalculate = async () => {
    setRecalculating(true);
    const tournaments = await tournamentService.getTournaments();
    const tId = tournaments[0]?._id;
    if (tId) {
      await adminService.recalculateStandings(tId);
    }
    const updated = await standingsService.getStandings();
    setStandings(updated);
    setRecalculating(false);
    setNotification('Tournament point table and tie-breakers successfully recalculated from match database.');
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 flex flex-col gap-6 select-none animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-container-high">
        <div>
          <div className="flex items-center gap-2">
            <TableProperties className="w-5 h-5 text-primary-container" />
            <h1 className="font-headline-lg text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
              Point Table & Standings Authority
            </h1>
          </div>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            Real-time automatic point calculations (Win = 2, Draw = 0, Loss = 0), goal difference rankings, and tournament tie-breakers.
          </p>
        </div>

        <button
          onClick={handleRecalculate}
          disabled={recalculating}
          className="flex items-center gap-2 bg-primary-container hover:bg-primary text-on-primary px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />
          <span>{recalculating ? 'Recalculating...' : 'Force Standings Recalculation'}</span>
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-3.5 flex items-center gap-2 text-xs font-bold shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-primary-container shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Standings Table Card */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high shadow-xs overflow-x-auto p-3 sm:p-6">
        <StandingsTable standings={standings} />
      </div>

      {/* Legend */}
      <QualificationLegend />
    </div>
  );
}
