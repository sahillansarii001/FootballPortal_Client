'use client';

import React, { useState, useEffect } from 'react';
import { ListOrdered, Trophy, RefreshCw, Award } from 'lucide-react';
import { TournamentStandingRow } from '@/types';
import { standingsService } from '@/services/standings.service';
import { StandingsTable } from '@/components/standings/StandingsTable';
import { QualificationLegend } from '@/components/standings/QualificationLegend';
import { LoadingState } from '@/components/common/LoadingState';
import { PageHeader } from '@/components/common/PageHeader';

export default function StandingsPage() {
  const [standings, setStandings] = useState<TournamentStandingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStandings() {
      setLoading(true);
      const data = await standingsService.getStandings();
      setStandings(data);
      setLoading(false);
    }
    fetchStandings();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <PageHeader
        badge="Official Tournament Classification"
        badgeIcon={<Trophy className="w-4 h-4 text-primary-container" />}
        title="Tournament Standings & Bracket Tracker"
        description="Official collegiate classification, live qualification thresholds, and real-time point-table calculation toward the National Championship Trophy."
        action={
          <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2 rounded-xl text-xs font-bold text-on-surface border border-surface-container">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
            <span>Live Sync Verified • Tournament Championship 2026</span>
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
