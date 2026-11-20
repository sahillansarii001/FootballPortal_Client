'use client';

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  Medal,
  Search,
  Filter,
  Users,
  Building2,
  Shield,
  Target,
  Sparkles,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';
import { playerService } from '@/services/player.service';
import { Player } from '@/types';
import { LoadingState } from '@/components/common/LoadingState';

export default function AdminTopScorersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [teamFilter, setTeamFilter] = useState('ALL');

  const loadPlayers = async () => {
    setLoading(true);
    try {
      const data = await playerService.getAllPlayers();
      // Sort primarily by goals descending, then penalties, then matches
      const sorted = [...data].sort((a, b) => {
        if ((b.goals || 0) !== (a.goals || 0)) {
          return (b.goals || 0) - (a.goals || 0);
        }
        if ((b.penaltiesScored || 0) !== (a.penaltiesScored || 0)) {
          return (b.penaltiesScored || 0) - (a.penaltiesScored || 0);
        }
        return (a.matchesPlayed || 0) - (b.matchesPlayed || 0);
      });
      setPlayers(sorted);
    } catch (err) {
      console.error('Failed to load players leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlayers();
  }, []);

  // Filter logic
  const filteredPlayers = players.filter((player) => {
    const teamName = typeof player.team === 'object' ? (player.team as any)?.name : '';
    const matchesSearch =
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (player.club || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      teamName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPosition = positionFilter === 'ALL' || player.position === positionFilter;
    const matchesTeam = teamFilter === 'ALL' || teamName === teamFilter;

    return matchesSearch && matchesPosition && matchesTeam;
  });

  // Extract unique teams for dropdown
  const uniqueTeams = Array.from(
    new Set(
      players
        .map((p) => (typeof p.team === 'object' ? (p.team as any)?.name : null))
        .filter(Boolean)
    )
  ) as string[];

  // Top scorer leader
  const topScorer = players[0] || null;
  const totalGoals = players.reduce((sum, p) => sum + (p.goals || 0), 0);
  const uniqueClubs = new Set(players.map((p) => p.club).filter(Boolean)).size;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col gap-4 sm:gap-6 select-none animate-slide-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-container-high">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="font-label-caps text-xs text-amber-600 uppercase font-extrabold tracking-wider">
              Golden Boot & Athlete Leaderboard
            </span>
          </div>
          <h1 className="font-headline-lg text-2xl sm:text-3xl font-black text-on-surface tracking-tight mt-0.5">
            Top Goal Scorers & Player Registry
          </h1>
          <p className="text-xs text-on-surface-variant font-medium mt-1">
            Official ranking of certified athletes across all collegiate varsities with origin club affiliations and scoring records.
          </p>
        </div>

        <button
          onClick={loadPlayers}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface transition-all shadow-xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-primary-container" />
          <span>Refresh Leaderboard</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Golden Boot Leader */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border-2 border-amber-400/40 shadow-xs flex items-center gap-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black text-xl shrink-0 border border-amber-400/30">
            🥇
          </div>
          <div className="min-w-0">
            <span className="font-label-caps text-[10px] text-amber-600 uppercase font-extrabold tracking-wider block">
              Golden Boot Leader
            </span>
            <h2 className="font-headline-sm text-base font-black text-on-surface truncate">
              {topScorer?.name || 'No goals yet'}
            </h2>
            <p className="text-[11px] text-on-surface-variant truncate">
              {topScorer ? `${topScorer.goals || 0} Goals • ${topScorer.club || 'Independent Club'}` : 'Awaiting tournament kickoff'}
            </p>
          </div>
        </div>

        {/* Total Goals */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-primary-container flex items-center justify-center shrink-0 border border-emerald-400/30">
            <Target className="w-6 h-6 text-primary-container" />
          </div>
          <div>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold tracking-wider block">
              Total Goals Logged
            </span>
            <div className="font-display-score text-2xl font-black text-on-surface">
              {totalGoals}
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold">
              Live official tally
            </span>
          </div>
        </div>

        {/* Certified Athletes */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 border border-blue-400/30">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold tracking-wider block">
              Active Athletes
            </span>
            <div className="font-display-score text-2xl font-black text-on-surface">
              {players.length}
            </div>
            <span className="text-[11px] text-on-surface-variant font-medium">
              Registered in rosters
            </span>
          </div>
        </div>

        {/* Origin Clubs Represented */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0 border border-purple-400/30">
            <Building2 className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold tracking-wider block">
              Certified Clubs
            </span>
            <div className="font-display-score text-2xl font-black text-on-surface">
              {uniqueClubs}
            </div>
            <span className="text-[11px] text-on-surface-variant font-medium">
              Athlete origins verified
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filters Strip */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by athlete name, origin club, or varsity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
          />
        </div>

        {/* Position & Team Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <label className="text-[10px] uppercase font-bold font-label-caps text-on-surface-variant">
              Position:
            </label>
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container font-medium"
            >
              <option value="ALL">All Positions</option>
              <option value="Forward">Forward</option>
              <option value="Midfielder">Midfielder</option>
              <option value="Defender">Defender</option>
              <option value="Goalkeeper">Goalkeeper</option>
            </select>
          </div>

          {uniqueTeams.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-[10px] uppercase font-bold font-label-caps text-on-surface-variant">
                Varsity:
              </label>
              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container font-medium"
              >
                <option value="ALL">All Teams</option>
                {uniqueTeams.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Players Leaderboard Table */}
      {loading ? (
        <LoadingState message="Fetching official goal scorers leaderboard..." />
      ) : filteredPlayers.length === 0 ? (
        <div className="bg-surface-container-lowest p-12 text-center rounded-2xl border border-surface-container-high shadow-xs">
          <Users className="w-10 h-10 text-on-surface-variant/40 mx-auto mb-3" />
          <h3 className="font-headline-sm text-base font-bold text-on-surface">No athletes matched your query</h3>
          <p className="text-xs text-on-surface-variant mt-1">Try resetting the search bar or changing your position filters.</p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-container-high bg-surface-container-low/50 font-label-caps text-[11px] text-on-surface-variant uppercase font-bold tracking-wider">
                  <th className="py-3.5 px-4 text-center w-16">Rank</th>
                  <th className="py-3.5 px-4">Athlete Details</th>
                  <th className="py-3.5 px-4">Origin Club Affiliation</th>
                  <th className="py-3.5 px-4">Varsity Team</th>
                  <th className="py-3.5 px-4">Position</th>
                  <th className="py-3.5 px-4 text-center">Matches</th>
                  <th className="py-3.5 px-4 text-center">Penalties</th>
                  <th className="py-3.5 px-4 text-center text-primary-container font-black">Goals</th>
                  <th className="py-3.5 px-4 text-center">G / Match</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high text-xs">
                {filteredPlayers.map((player, index) => {
                  const rank = index + 1;
                  const teamName = typeof player.team === 'object' ? (player.team as any)?.name : 'Varsity';
                  const teamLogo = typeof player.team === 'object' ? (player.team as any)?.logo : null;
                  const goals = player.goals || 0;
                  const matches = player.matchesPlayed || 0;
                  const gpm = matches > 0 ? (goals / matches).toFixed(2) : (goals > 0 ? goals.toFixed(2) : '0.00');

                  return (
                    <tr
                      key={player._id}
                      className="hover:bg-surface-container-low/40 transition-colors group"
                    >
                      {/* Rank with Trophy / Medal Badges */}
                      <td className="py-3.5 px-4 text-center">
                        {rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-amber-500/15 text-amber-600 font-black text-sm border border-amber-400/40 shadow-xs">
                            🥇
                          </span>
                        ) : rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-slate-300/30 text-slate-700 font-black text-sm border border-slate-300 shadow-xs">
                            🥈
                          </span>
                        ) : rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-amber-700/15 text-amber-800 font-black text-sm border border-amber-700/30 shadow-xs">
                            🥉
                          </span>
                        ) : (
                          <span className="font-mono text-on-surface-variant font-bold text-xs">
                            #{rank}
                          </span>
                        )}
                      </td>

                      {/* Athlete Name and Jersey */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-surface-container-low border border-surface-container-high flex items-center justify-center font-display-score text-xs font-black text-primary-container shrink-0">
                            #{player.jerseyNumber}
                          </div>
                          <div>
                            <div className="font-headline-sm text-xs sm:text-sm font-black text-on-surface flex items-center gap-1.5">
                              <span>{player.name}</span>
                              {player.isCaptain && (
                                <span className="font-label-caps text-[9px] uppercase px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300">
                                  Captain
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-on-surface-variant font-medium">
                              Certified NCAA Athlete
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Origin Club Affiliation */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-bold border border-emerald-200">
                          <Building2 className="w-3 h-3 text-primary-container shrink-0" />
                          <span>{player.club || 'Independent Athletic Club'}</span>
                        </span>
                      </td>

                      {/* Varsity Team */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-surface-container flex items-center justify-center font-black text-[10px] text-primary-container overflow-hidden shrink-0 border border-surface-container-high">
                            {teamLogo ? (
                              <img src={teamLogo} alt={teamName} className="w-full h-full object-cover" />
                            ) : (
                              teamName.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <span className="font-bold text-on-surface truncate max-w-[130px]">
                            {teamName}
                          </span>
                        </div>
                      </td>

                      {/* Position */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-label-caps text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            player.position === 'Forward'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : player.position === 'Midfielder'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : player.position === 'Defender'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {player.position}
                        </span>
                      </td>

                      {/* Matches Played */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-on-surface">
                        {matches}
                      </td>

                      {/* Penalties */}
                      <td className="py-3.5 px-4 text-center font-mono text-on-surface-variant font-medium">
                        {player.position === 'Goalkeeper'
                          ? `${player.penaltiesSaved || 0} saved`
                          : `${player.penaltiesScored || 0} scored`}
                      </td>

                      {/* Goals Scored */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-xl font-display-score text-sm font-black tabular-nums ${
                            goals > 0
                              ? 'bg-primary-container text-white shadow-xs'
                              : 'bg-surface-container text-on-surface-variant font-bold'
                          }`}
                        >
                          {goals}
                        </span>
                      </td>

                      {/* Goals Per Match */}
                      <td className="py-3.5 px-4 text-center font-mono text-xs font-bold text-on-surface-variant">
                        {gpm}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-surface-container-low/40 p-3.5 border-t border-surface-container-high flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-on-surface-variant">
            <span>
              Showing <strong>{filteredPlayers.length}</strong> of <strong>{players.length}</strong> certified athletes
            </span>
            <span className="font-semibold text-primary-container">
              Official Golden Boot Trophy Leaderboard
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
