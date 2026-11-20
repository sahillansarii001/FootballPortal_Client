'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, CheckCircle2, Search, FilterX, Flame, Target, ShieldCheck } from 'lucide-react';
import { Match } from '@/types';
import { matchService } from '@/services/match.service';
import { ResultsList } from '@/components/results/ResultsList';
import { SearchBar } from '@/components/common/SearchBar';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';

export default function ResultsPage() {
  const [results, setResults] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      const data = await matchService.getCompletedMatches();
      setResults(data);
      setLoading(false);
    }
    fetchResults();
  }, []);

  const availableTeams = Array.from(
    new Set(
      results
        .flatMap((m) => [m.teamA?.name, m.teamB?.name])
        .filter((name): name is string => Boolean(name))
    )
  );

  const filteredResults = results.filter((m) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = `${m.teamA?.name || ''} ${m.teamB?.name || ''} ${m.venue || ''}`.toLowerCase();
      if (!matchName.includes(q)) return false;
    }

    if (selectedStage && !m.stage?.toLowerCase().includes(selectedStage.toLowerCase())) {
      return false;
    }

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

  // Calculate quick summary metrics
  const totalGoals = results.reduce((acc, m) => acc + (m.score?.teamA || 0) + (m.score?.teamB || 0), 0);
  const avgGoalsPerMatch = results.length > 0 ? (totalGoals / results.length).toFixed(1) : '0';
  const cleanSheets = results.reduce((acc, m) => {
    let count = 0;
    if (m.score?.teamA === 0) count++;
    if (m.score?.teamB === 0) count++;
    return acc + count;
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <PageHeader
        badge="Official Championship Archives"
        badgeIcon={<CheckCircle2 className="w-4 h-4 text-primary-container" />}
        title="Tournament Results & Final Scores"
        description="Official final scores, penalty outcomes, and verified match reports from Alliance Premier League Season 9."
        action={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-xl shadow-xs border border-surface-container-high">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="font-label-ui text-label-ui text-on-surface font-extrabold">
                {results.length} Completed Matches
              </span>
            </div>
          </div>
        }
      />

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-container-high shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-primary-container flex items-center justify-center font-bold">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="font-headline-sm text-2xl font-black text-on-surface tabular-nums">{totalGoals}</div>
            <div className="text-xs text-on-surface-variant font-medium">Total Goals Scored</div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-container-high shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="font-headline-sm text-2xl font-black text-on-surface tabular-nums">{avgGoalsPerMatch}</div>
            <div className="text-xs text-on-surface-variant font-medium">Goals / Match Average</div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-container-high shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="font-headline-sm text-2xl font-black text-on-surface tabular-nums">{cleanSheets}</div>
            <div className="text-xs text-on-surface-variant font-medium">Clean Sheets Logged</div>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high mb-8 flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-5">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by team or venue..."
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              aria-label="Filter by Stage"
              className="w-full bg-surface-container-low border border-surface-container-high rounded-xl px-3.5 py-2.5 text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
            >
              <option value="">All Tournament Stages</option>
              <option value="Group Stage">Group Stage</option>
              <option value="Quarter">Quarter-Finals</option>
              <option value="Semi">Semi-Finals</option>
              <option value="Final">Championship Final</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              aria-label="Filter by Team"
              className="w-full bg-surface-container-low border border-surface-container-high rounded-xl px-3.5 py-2.5 text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
            >
              <option value="">All Universities</option>
              {availableTeams.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1 flex justify-end">
            {(searchQuery || selectedStage || selectedTeam) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStage('');
                  setSelectedTeam('');
                }}
                title="Reset filters"
                className="p-2.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-xl transition-all"
              >
                <FilterX className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content list */}
      {loading ? (
        <LoadingState message="Loading verified tournament match results..." />
      ) : filteredResults.length > 0 ? (
        <ResultsList results={filteredResults} />
      ) : (
        <EmptyState
          title="No Match Results Found"
          description="No completed matches match your selected filters. Try broadening your criteria or reset the search."
          action={
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStage('');
                setSelectedTeam('');
              }}
              className="px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-xl text-xs font-bold text-on-surface transition-all"
            >
              Reset Filters
            </button>
          }
        />
      )}
    </div>
  );
}
