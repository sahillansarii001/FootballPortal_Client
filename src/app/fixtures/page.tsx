'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, RefreshCw, FilterX } from 'lucide-react';
import { Match } from '@/types';
import { matchService } from '@/services/match.service';
import { MatchCard } from '@/components/matches/MatchCard';
import { SearchBar } from '@/components/common/SearchBar';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';

export default function FixturesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'live' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');

  useEffect(() => {
    async function fetchMatches() {
      setLoading(true);
      const data = await matchService.getAllMatches();
      setMatches(data);
      setLoading(false);
    }
    fetchMatches();
  }, []);

  const availableTeams = Array.from(
    new Set(
      matches
        .flatMap((m) => [m.teamA?.name, m.teamB?.name])
        .filter((name): name is string => Boolean(name))
    )
  );

  // Filter logic
  const filteredMatches = matches.filter((m) => {
    // Tab filter
    if (activeTab === 'upcoming' && m.status !== 'Upcoming') return false;
    if (activeTab === 'live' && m.status !== 'Live' && m.status !== 'Half-Time' && m.status !== 'Penalty Shootout') return false;
    if (activeTab === 'completed' && m.status !== 'Completed') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = `${m.teamA?.name || ''} ${m.teamB?.name || ''} ${m.venue || ''}`.toLowerCase();
      if (!matchName.includes(q)) return false;
    }

    // Stage filter
    if (selectedStage && !m.stage?.toLowerCase().includes(selectedStage.toLowerCase())) {
      return false;
    }

    // Team filter
    if (selectedTeam) {
      const t = selectedTeam.toLowerCase();
      const teamAName = (m.teamA?.name || '').toLowerCase();
      const teamBName = (m.teamB?.name || '').toLowerCase();
      if (!teamAName.includes(t) && !teamBName.includes(t)) {
        return false;
      }
    }

    return true;
  });

  const liveCount = matches.filter((m) => m.status === 'Live' || m.status === 'Half-Time').length;
  const upcomingCount = matches.filter((m) => m.status === 'Upcoming').length;
  const completedCount = matches.filter((m) => m.status === 'Completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 select-none animate-in fade-in duration-200">
      {/* Header matching Reference Screen 4 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Fixtures
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            All upcoming and scheduled matches
          </p>
        </div>

        {/* Live Count Pill */}
        <div className="flex items-center gap-2">
          {liveCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500 text-white font-bold text-xs shadow-xs">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              {liveCount} Live Now
            </span>
          )}
          <span className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 font-bold text-xs shadow-xs">
            {matches.length} Total Matches
          </span>
        </div>
      </div>

      {/* Pill Filter Tabs matching Reference Screen 4 */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-xs ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-blue-500/20'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-xs ${
              activeTab === 'upcoming'
                ? 'bg-blue-600 text-white shadow-blue-500/20'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
              activeTab === 'live'
                ? 'bg-blue-600 text-white shadow-blue-500/20'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>Live</span>
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-xs ${
              activeTab === 'completed'
                ? 'bg-blue-600 text-white shadow-blue-500/20'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-72">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
      </div>

      {/* Fixtures Grid */}
      {loading ? (
        <LoadingState message="Loading tournament fixtures..." />
      ) : filteredMatches.length === 0 ? (
        <EmptyState
          title="No Fixtures Found"
          description="No matches match your selected filters. Try resetting the filters or searching for another university."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match) => (
            <MatchCard key={match._id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
