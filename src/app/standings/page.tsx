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
  const [activeDivision, setActiveDivision] = useState('all');

  useEffect(() => {
    async function fetchStandings() {
      setLoading(true);
      const data = await standingsService.getStandings();
      setStandings(data);
      setLoading(false);
    }
    fetchStandings();
  }, []);

  const divisions = [
    { id: 'all', label: 'All Conferences' },
    { id: 'pacific', label: 'Pacific Division' },
    { id: 'ivy', label: 'Ivy Collegiate' },
    { id: 'atlantic', label: 'Atlantic Athletic' },
  ];

  const filteredStandings = standings.filter((row) => {
    if (activeDivision === 'all') return true;
    const conf = row.team.conference?.toLowerCase() || '';
    if (activeDivision === 'pacific') return conf.includes('pacific') || conf.includes('pac');
    if (activeDivision === 'ivy') return conf.includes('ivy');
    if (activeDivision === 'atlantic') return conf.includes('atlantic');
    return true;
  });

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
            <span>Live Sync Verified • Tournament ID #VFL-2025</span>
          </div>
        }
      />

      {/* Division Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto p-1 bg-surface-container-high rounded-xl w-max mb-6 shadow-inner">
        {divisions.map((div) => (
          <button
            key={div.id}
            onClick={() => setActiveDivision(div.id)}
            className={`px-4 py-2 rounded-lg font-label-ui text-label-ui text-xs font-bold transition-all ${
              activeDivision === div.id
                ? 'bg-surface-container-lowest text-primary-container shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {div.label}
          </button>
        ))}
      </div>

      {/* Qualification Legend Strip */}
      <QualificationLegend />

      {/* Standings Table */}
      {loading ? (
        <LoadingState message="Calculating official league standings..." />
      ) : (
        <StandingsTable standings={filteredStandings} />
      )}
    </div>
  );
}
