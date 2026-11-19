'use client';

import React, { useState, useEffect } from 'react';
import { TableProperties, RefreshCw, Trophy, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { standingsService } from '@/services/standings.service';
import { adminService } from '@/services/admin.service';
import { StandingsTable } from '@/components/standings/StandingsTable';
import { QualificationLegend } from '@/components/standings/QualificationLegend';
import { TournamentStandingRow } from '@/types';

export default function AdminStandingsPage() {
  const [standings, setStandings] = useState<TournamentStandingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    async function loadStandings() {
      setLoading(true);
      const data = await standingsService.getStandings('tourn-2025-vfl');
      setStandings(data);
      setLoading(false);
    }
    loadStandings();
  }, []);

  const handleRecalculate = async () => {
    setRecalculating(true);
    await adminService.recalculateStandings('tourn-2025-vfl');
    const updated = await standingsService.getStandings('tourn-2025-vfl');
    setStandings(updated);
    setRecalculating(false);
    setNotification('Tournament point table and tie-breakers successfully recalculated from match database.');
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6 select-none">
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
            Real-time automatic point calculations, goal difference rankings, and tournament bracket qualification.
          </p>
        </div>

        <button
          onClick={handleRecalculate}
          disabled={recalculating}
          className="flex items-center gap-2 bg-primary-container hover:bg-primary text-on-primary px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 disabled:opacity-50"
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
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high shadow-xs overflow-hidden p-6">
        <StandingsTable standings={standings} />
      </div>

      {/* Legend */}
      <QualificationLegend />
    </div>
  );
}
