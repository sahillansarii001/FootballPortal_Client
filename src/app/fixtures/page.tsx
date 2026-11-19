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
      const matchName = `${m.teamA.name} ${m.teamB.name} ${m.venue || ''}`.toLowerCase();
      if (!matchName.includes(q)) return false;
    }

    // Stage filter
    if (selectedStage && !m.stage?.toLowerCase().includes(selectedStage.toLowerCase())) {
      return false;
    }

    // Team filter
    if (selectedTeam) {
      const t = selectedTeam.toLowerCase();
      if (!m.teamA.name.toLowerCase().includes(t) && !m.teamB.name.toLowerCase().includes(t)) {
        return false;
      }
    }

    return true;
  });

  const liveCount = matches.filter((m) => m.status === 'Live' || m.status === 'Half-Time').length;
  const upcomingCount = matches.filter((m) => m.status === 'Upcoming').length;
  const completedCount = matches.filter((m) => m.status === 'Completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <PageHeader
        badge="Official Championship Schedule"
        badgeIcon={<Calendar className="w-4 h-4 text-primary-container" />}
        title="Fixtures & Tournament Schedule"
        description="Track verified inter-college match schedules, real-time scorelines, penalty shootouts, and aggregate fixtures across all conferences."
        action={
          <div className="flex items-center gap-2 bg-surface-container p-1.5 rounded-xl shadow-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container-lowest rounded-lg shadow-xs">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
              <span className="font-label-caps text-label-caps text-on-surface font-extrabold uppercase">
                {liveCount} Live Matches
              </span>
            </div>
            <div className="px-3 py-1 text-on-surface-variant font-label-ui text-label-ui">
              <strong className="text-on-surface">{matches.length}</strong> Total Fixtures
            </div>
          </div>
        }
      />

      {/* Filter Console Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high mb-8 flex flex-col gap-4">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-surface-container-high">
          <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-surface-container rounded-xl shadow-inner">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg font-headline-sm text-headline-sm transition-all flex items-center gap-1.5 text-xs font-bold ${
                activeTab === 'all'
                  ? 'bg-surface-container-lowest text-primary-container shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>All Matches</span>
              <span className="px-1.5 py-0.2 rounded-full bg-primary-container/10 text-primary-container text-[10px]">
                {matches.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-3.5 py-1.5 rounded-lg font-headline-sm text-headline-sm transition-all flex items-center gap-1.5 text-xs font-bold ${
                activeTab === 'upcoming'
                  ? 'bg-surface-container-lowest text-primary-container shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>Upcoming</span>
              <span className="px-1.5 py-0.2 rounded-full bg-surface-container-high text-on-surface-variant text-[10px]">
                {upcomingCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className={`px-3.5 py-1.5 rounded-lg font-headline-sm text-headline-sm transition-all flex items-center gap-1.5 text-xs font-bold ${
                activeTab === 'live'
                  ? 'bg-surface-container-lowest text-primary-container shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container"></span>
              </span>
              <span>Live Now</span>
              <span className="px-1.5 py-0.2 rounded-full bg-primary-container text-white text-[10px]">
                {liveCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3.5 py-1.5 rounded-lg font-headline-sm text-headline-sm transition-all flex items-center gap-1.5 text-xs font-bold ${
                activeTab === 'completed'
                  ? 'bg-surface-container-lowest text-primary-container shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>Completed</span>
              <span className="px-1.5 py-0.2 rounded-full bg-surface-container-high text-on-surface-variant text-[10px]">
                {completedCount}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-on-surface-variant font-label-ui text-label-ui bg-surface px-3 py-1.5 rounded-lg border border-surface-container-high text-xs">
            <RefreshCw className="w-3.5 h-3.5 text-primary-container" />
            <span>Official Feed Active</span>
          </div>
        </div>

        {/* Search & Dropdown Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-6">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full bg-surface text-on-surface font-label-ui text-label-ui px-3 py-2.5 rounded-xl border border-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary-container/20 cursor-pointer shadow-sm text-xs font-semibold"
            >
              <option value="">Stage: All Stages</option>
              <option value="group">Group Stage</option>
              <option value="quarter">Quarter-Finals</option>
              <option value="semi">Semi-Finals</option>
              <option value="final">Championship Final</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full bg-surface text-on-surface font-label-ui text-label-ui px-3 py-2.5 rounded-xl border border-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary-container/20 cursor-pointer shadow-sm text-xs font-semibold"
            >
              <option value="">Team: All Teams</option>
              {availableTeams.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1">
            <button
              onClick={() => {
                setActiveTab('all');
                setSearchQuery('');
                setSelectedStage('');
                setSelectedTeam('');
              }}
              className="w-full px-3 py-2.5 text-on-surface-variant hover:text-on-surface bg-surface hover:bg-surface-container rounded-xl border border-surface-container-high font-label-ui text-label-ui flex items-center justify-center gap-1 transition-colors shadow-xs"
              title="Reset Filters"
            >
              <FilterX className="w-4 h-4" />
            </button>
          </div>
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
