'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Pencil,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { playerService } from '@/services/player.service';
import { adminService } from '@/services/admin.service';
import { useSocket } from '@/hooks/useSocket';
import { Player } from '@/types';
import { LoadingState } from '@/components/common/LoadingState';

export default function AdminTopScorersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [teamFilter, setTeamFilter] = useState('ALL');

  // Edit Goals Modal State
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editGoals, setEditGoals] = useState<number | ''>(0);
  const [editPenalties, setEditPenalties] = useState<number | ''>(0);
  const [editMatches, setEditMatches] = useState<number | ''>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const { socket } = useSocket();

  const loadPlayers = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  // Real-time synchronization
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      loadPlayers();
    };
    socket.on('player:updated', handleUpdate);
    socket.on('player:created', handleUpdate);
    socket.on('player:deleted', handleUpdate);
    return () => {
      socket.off('player:updated', handleUpdate);
      socket.off('player:created', handleUpdate);
      socket.off('player:deleted', handleUpdate);
    };
  }, [socket, loadPlayers]);

  const handleOpenEdit = (player: Player) => {
    setEditingPlayer(player);
    setEditGoals(player.goals ?? 0);
    setEditPenalties(player.penaltiesScored ?? 0);
    setEditMatches(player.matchesPlayed ?? 0);
    setSaveError(null);
  };

  const handleSaveStats = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer) return;

    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await adminService.updatePlayer(editingPlayer._id, {
        goals: editGoals === '' ? 0 : Math.max(0, Number(editGoals)),
        penaltiesScored: editPenalties === '' ? 0 : Math.max(0, Number(editPenalties)),
        matchesPlayed: editMatches === '' ? 0 : Math.max(0, Number(editMatches)),
      });

      if (!res.success) {
        setSaveError(res.error || 'Failed to update athlete goals');
        setIsSaving(false);
        return;
      }

      setToastMsg(`Updated goals for ${editingPlayer.name}!`);
      setTimeout(() => setToastMsg(null), 3000);
      setEditingPlayer(null);
      await loadPlayers();
    } catch (err: any) {
      setSaveError(err.message || 'Error updating statistics');
    } finally {
      setIsSaving(false);
    }
  };

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 flex flex-col gap-6 select-none animate-in fade-in duration-200">
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
              Official ranking of certified athletes across all tournament teams with origin club affiliations and scoring records.
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
              placeholder="Search by athlete name, origin club, or team..."
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
                  Team:
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
                    <th className="py-3.5 px-4">Team</th>
                    <th className="py-3.5 px-4">Position</th>
                    <th className="py-3.5 px-4 text-center">Matches</th>
                    <th className="py-3.5 px-4 text-center">Penalties</th>
                    <th className="py-3.5 px-4 text-center text-primary-container font-black">Goals</th>
                    <th className="py-3.5 px-4 text-center">G / Match</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high text-xs">
                  {filteredPlayers.map((player, index) => {
                    const rank = index + 1;
                    const teamName = typeof player.team === 'object' ? (player.team as any)?.name : 'Team';
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

                        {/* Team */}
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
                            className={`font-label-caps text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${player.position === 'Forward'
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
                            className={`inline-block px-3 py-1 rounded-xl font-display-score text-sm font-black tabular-nums ${goals > 0
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

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleOpenEdit(player)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-primary-container hover:text-white text-on-surface text-xs font-bold transition-all shadow-xs border border-surface-container-high"
                            title="Edit Goals & Performance"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit Goals</span>
                          </button>
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

        {/* Toast Notification */}
        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-xl animate-in slide-in-from-bottom duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* QUICK EDIT GOALS MODAL */}
        {editingPlayer && (
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/70 backdrop-blur-sm p-4 flex min-h-screen items-center justify-center animate-in fade-in duration-200">
            <div className="relative bg-surface-container-lowest w-full max-w-md rounded-3xl border border-surface-container-high shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-surface-container-high bg-surface-container-low/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary-container/15 text-primary-container flex items-center justify-center font-bold">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-on-surface">Update Athlete Goals & Record</h3>
                    <p className="text-[10px] text-on-surface-variant">Adjust official statistics for Top Scorers Leaderboard</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingPlayer(null)}
                  className="w-7 h-7 rounded-lg text-on-surface-variant hover:bg-surface-container flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveStats} className="p-6 space-y-4">
                {saveError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{saveError}</span>
                  </div>
                )}

                {/* Player Summary Pill */}
                <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-on-surface block">{editingPlayer.name}</span>
                    <span className="text-[11px] text-on-surface-variant">
                      #{editingPlayer.jerseyNumber} • {editingPlayer.position} • {typeof editingPlayer.team === 'object' ? (editingPlayer.team as any)?.name : 'Team'}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-surface-container-high text-on-surface border border-surface-container-high">
                    {editingPlayer.club || 'Independent Club'}
                  </span>
                </div>

                {/* Goals Scored */}
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Total Goals Scored ⚽ <span className="text-primary-container">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editGoals}
                    onChange={(e) => setEditGoals(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-base font-black text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/30"
                  />
                  <p className="text-[10px] text-on-surface-variant mt-1">
                    Directly updates the official Golden Boot & Top Scorer ranking.
                  </p>
                </div>

                {/* Penalties & Matches */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      Penalties Scored 🥅
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editPenalties}
                      onChange={(e) => setEditPenalties(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      Matches Played 🏟️
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editMatches}
                      onChange={(e) => setEditMatches(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/30"
                    />
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-container-high">
                  <button
                    type="button"
                    onClick={() => setEditingPlayer(null)}
                    className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Record</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
}
