'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Pencil,
  Trash2,
  Shield,
  Shirt,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Trophy,
  Activity,
  UserCheck
} from 'lucide-react';
import { playerService } from '@/services/player.service';
import { teamService } from '@/services/team.service';
import { adminService } from '@/services/admin.service';
import { Player, Team } from '@/types';
import { useSocket } from '@/hooks/useSocket';
import { cn } from '@/utils/cn';

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('all');
  const [selectedPositionFilter, setSelectedPositionFilter] = useState('all');

  // Add Player Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState('');
  const [addTeamId, setAddTeamId] = useState('');
  const [addJersey, setAddJersey] = useState<number | ''>('');
  const [addPosition, setAddPosition] = useState('Forward');
  const [addClub, setAddClub] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Edit Player Modal State
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editName, setEditName] = useState('');
  const [editTeamId, setEditTeamId] = useState('');
  const [editJersey, setEditJersey] = useState<number | ''>('');
  const [editPosition, setEditPosition] = useState('Forward');
  const [editClub, setEditClub] = useState('');
  const [editGoals, setEditGoals] = useState<number | ''>(0);
  const [editPenaltiesScored, setEditPenaltiesScored] = useState<number | ''>(0);
  const [editMatchesPlayed, setEditMatchesPlayed] = useState<number | ''>(0);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete Confirmation State
  const [deletingPlayer, setDeletingPlayer] = useState<Player | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Global Notification
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const { socket } = useSocket();

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const loadData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const [allPlayers, allTeams] = await Promise.all([
        playerService.getAllPlayers(),
        teamService.getAllTeams(),
      ]);
      setPlayers(allPlayers);
      setTeams(allTeams);
    } catch (err) {
      console.error('Failed to load players data:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Socket.IO real-time sync
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      loadData(false);
    };

    socket.on('player:created', handleUpdate);
    socket.on('player:updated', handleUpdate);
    socket.on('player:deleted', handleUpdate);
    socket.on('teams:update', handleUpdate);

    return () => {
      socket.off('player:created', handleUpdate);
      socket.off('player:updated', handleUpdate);
      socket.off('player:deleted', handleUpdate);
      socket.off('teams:update', handleUpdate);
    };
  }, [socket, loadData]);

  // Filtered Players
  const filteredPlayers = players.filter((p) => {
    if (selectedPositionFilter !== 'all' && p.position?.toLowerCase() !== selectedPositionFilter.toLowerCase()) {
      return false;
    }
    if (selectedTeamFilter !== 'all') {
      const tId = typeof p.team === 'object' && p.team ? p.team._id : String(p.team || '');
      const tName = typeof p.team === 'object' && p.team ? p.team.name : '';
      if (tId !== selectedTeamFilter && tName !== selectedTeamFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const tName = typeof p.team === 'object' && p.team ? p.team.name.toLowerCase() : '';
      const cName = p.club ? p.club.toLowerCase() : '';
      if (!p.name.toLowerCase().includes(q) && !tName.includes(q) && !cName.includes(q)) {
        return false;
      }
    }
    return true;
  });

  // Position Stats
  const totalAthletes = players.length;
  const forwardsCount = players.filter((p) => p.position === 'Forward').length;
  const midfieldersCount = players.filter((p) => p.position === 'Midfielder').length;
  const defendersCount = players.filter((p) => p.position === 'Defender').length;
  const goalkeepersCount = players.filter((p) => p.position === 'Goalkeeper').length;

  // Handle Add Player
  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) {
      setAddError('Player full name is required');
      return;
    }
    if (!addTeamId) {
      setAddError('Please select a team');
      return;
    }
    if (addJersey === '' || Number(addJersey) < 1 || Number(addJersey) > 99) {
      setAddError('Please provide a valid jersey number (1 - 99)');
      return;
    }

    setAddLoading(true);
    setAddError(null);

    try {
      const res = await adminService.createPlayer({
        name: addName.trim(),
        team: addTeamId,
        jerseyNumber: Number(addJersey),
        position: addPosition,
        club: addClub.trim() || 'Independent Athletic Club',
      });

      if (!res.success) {
        setAddError(res.error || 'Failed to create player');
        setAddLoading(false);
        return;
      }

      showToast(`Athlete "${addName.trim()}" added successfully!`);
      setShowAddModal(false);
      setAddName('');
      setAddTeamId('');
      setAddJersey('');
      setAddPosition('Forward');
      setAddClub('');
      await loadData(false);
    } catch (err: any) {
      setAddError(err.message || 'Error creating player');
    } finally {
      setAddLoading(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (player: Player) => {
    setEditingPlayer(player);
    setEditName(player.name);
    const tId = typeof player.team === 'object' && player.team ? player.team._id : String(player.team || '');
    setEditTeamId(tId);
    setEditJersey(player.jerseyNumber ?? '');
    setEditPosition(player.position || 'Forward');
    setEditClub(player.club || '');
    setEditGoals(player.goals ?? 0);
    setEditPenaltiesScored(player.penaltiesScored ?? 0);
    setEditMatchesPlayed(player.matchesPlayed ?? 0);
    setEditError(null);
  };

  // Handle Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer) return;
    if (!editName.trim()) {
      setEditError('Player full name is required');
      return;
    }
    if (!editTeamId) {
      setEditError('Please select a team');
      return;
    }
    if (editJersey === '' || Number(editJersey) < 1 || Number(editJersey) > 99) {
      setEditError('Please provide a valid jersey number (1 - 99)');
      return;
    }

    setEditLoading(true);
    setEditError(null);

    try {
      const res = await adminService.updatePlayer(editingPlayer._id, {
        name: editName.trim(),
        team: editTeamId,
        jerseyNumber: Number(editJersey),
        position: editPosition,
        club: editClub.trim() || 'Independent Athletic Club',
        goals: editGoals === '' ? 0 : Math.max(0, Number(editGoals)),
        penaltiesScored: editPenaltiesScored === '' ? 0 : Math.max(0, Number(editPenaltiesScored)),
        matchesPlayed: editMatchesPlayed === '' ? 0 : Math.max(0, Number(editMatchesPlayed)),
      });

      if (!res.success) {
        setEditError(res.error || 'Failed to update player');
        setEditLoading(false);
        return;
      }

      showToast(`Player "${editName.trim()}" updated successfully!`);
      setEditingPlayer(null);
      await loadData(false);
    } catch (err: any) {
      setEditError(err.message || 'Error updating player');
    } finally {
      setEditLoading(false);
    }
  };

  // Handle Delete Player
  const handleConfirmDelete = async () => {
    if (!deletingPlayer) return;
    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const res = await adminService.deletePlayer(deletingPlayer._id);
      if (!res.success) {
        setDeleteError(res.error || 'Failed to delete player');
        setDeleteLoading(false);
        return;
      }

      showToast(`Athlete "${deletingPlayer.name}" removed successfully.`);
      setDeletingPlayer(null);
      await loadData(false);
    } catch (err: any) {
      setDeleteError(err.message || 'Error deleting player');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getPositionBadge = (pos?: string) => {
    switch (pos) {
      case 'Forward':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30';
      case 'Midfielder':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/30';
      case 'Defender':
        return 'bg-purple-500/10 text-purple-700 border-purple-500/30';
      case 'Goalkeeper':
        return 'bg-amber-500/10 text-amber-800 border-amber-500/30';
      default:
        return 'bg-surface-container text-on-surface border-surface-container-high';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-6 select-none animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={cn(
            'fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl border flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom duration-200',
            toastMsg.type === 'success'
              ? 'bg-emerald-950 text-emerald-200 border-emerald-800'
              : 'bg-rose-950 text-rose-200 border-rose-800'
          )}
        >
          {toastMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-high shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary-container/10 text-primary-container text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Collegiate Athlete Registry</span>
          </div>
          <h1 className="text-2xl font-black text-on-surface tracking-tight">
            Player Management & Roster Directory
          </h1>
          <p className="text-xs text-on-surface-variant mt-1 max-w-2xl font-medium">
            Manage all enrolled team athletes, jersey numbers, positional designations, and team transfers across the 2026 championship.
          </p>
        </div>

        <button
          onClick={() => {
            setShowAddModal(true);
            setAddError(null);
            if (teams.length > 0 && !addTeamId) setAddTeamId(teams[0]._id);
          }}
          className="px-5 py-3 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Athlete</span>
        </button>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-container-high shadow-2xs">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Total Athletes</span>
          <div className="text-2xl font-black text-on-surface mt-1 tabular-nums">{totalAthletes}</div>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-container-high shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Forwards</span>
          <div className="text-2xl font-black text-emerald-700 mt-1 tabular-nums">{forwardsCount}</div>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-container-high shadow-2xs">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Midfielders</span>
          <div className="text-2xl font-black text-blue-700 mt-1 tabular-nums">{midfieldersCount}</div>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-container-high shadow-2xs">
          <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Defenders</span>
          <div className="text-2xl font-black text-purple-700 mt-1 tabular-nums">{defendersCount}</div>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-container-high shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Goalkeepers</span>
          <div className="text-2xl font-black text-amber-700 mt-1 tabular-nums">{goalkeepersCount}</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by player or club..."
            className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary-container/30"
          />
        </div>

        {/* Filters Group */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap sm:flex-nowrap">
          {/* Team Filter */}
          <div className="w-full sm:w-48">
            <select
              value={selectedTeamFilter}
              onChange={(e) => setSelectedTeamFilter(e.target.value)}
              className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/30"
            >
              <option value="all">All Teams ({teams.length})</option>
              {teams.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Position Filter */}
          <div className="w-full sm:w-44">
            <select
              value={selectedPositionFilter}
              onChange={(e) => setSelectedPositionFilter(e.target.value)}
              className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/30"
            >
              <option value="all">All Positions</option>
              <option value="Forward">Forwards</option>
              <option value="Midfielder">Midfielders</option>
              <option value="Defender">Defenders</option>
              <option value="Goalkeeper">Goalkeepers</option>
            </select>
          </div>
        </div>
      </div>

      {/* Players List Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary-container" />
            <span className="text-xs text-on-surface-variant font-medium">Loading athlete roster directory...</span>
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant mb-1">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-on-surface">No Athletes Found</h3>
            <p className="text-xs text-on-surface-variant max-w-sm">
              {searchQuery || selectedTeamFilter !== 'all' || selectedPositionFilter !== 'all'
                ? 'No athletes match the current search filters. Try resetting the filter.'
                : 'No players have been registered yet. Click "Add New Athlete" to enroll players.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/60 border-b border-surface-container-high text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  <th className="py-3 px-4">Jersey</th>
                  <th className="py-3 px-4">Athlete Name</th>
                  <th className="py-3 px-4">Team</th>
                  <th className="py-3 px-4">Position</th>
                  <th className="py-3 px-4 text-center">Matches</th>
                  <th className="py-3 px-4 text-center">Goals</th>
                  <th className="py-3 px-4 text-center">Penalties</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high text-xs">
                {filteredPlayers.map((player) => {
                  const teamObj = typeof player.team === 'object' && player.team ? player.team : null;
                  const teamName = teamObj ? teamObj.name : String(player.team || 'Unassigned');

                  return (
                    <tr key={player._id} className="hover:bg-surface-container-low/40 transition-colors">
                      {/* Jersey Number */}
                      <td className="py-3.5 px-4">
                        <span className="w-8 h-8 rounded-lg bg-primary-container/15 text-primary-container font-black text-xs flex items-center justify-center ring-1 ring-primary-container/20">
                          #{player.jerseyNumber ?? '?'}
                        </span>
                      </td>

                      {/* Name & Club */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-on-surface text-sm">{player.name}</span>
                          <span className="text-[11px] text-on-surface-variant/80 font-medium">
                            {player.club || 'Independent Club'}
                          </span>
                        </div>
                      </td>

                      {/* Team */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-2 bg-surface-container-low px-2.5 py-1 rounded-lg border border-surface-container font-semibold text-on-surface">
                          <span className="w-5 h-5 rounded bg-surface-container-high text-on-surface flex items-center justify-center text-[10px] font-black shrink-0">
                            {teamName.slice(0, 2).toUpperCase()}
                          </span>
                          <span className="truncate max-w-[140px]">{teamName}</span>
                        </div>
                      </td>

                      {/* Position */}
                      <td className="py-3.5 px-4">
                        <span className={cn('px-2.5 py-1 rounded-md text-[11px] font-bold border', getPositionBadge(player.position))}>
                          {player.position || 'Forward'}
                        </span>
                      </td>

                      {/* Matches */}
                      <td className="py-3.5 px-4 text-center font-bold text-on-surface tabular-nums">
                        {player.matchesPlayed ?? 0}
                      </td>

                      {/* Goals */}
                      <td className="py-3.5 px-4 text-center font-black text-primary-container tabular-nums">
                        {player.goals ?? 0}
                      </td>

                      {/* Penalties */}
                      <td className="py-3.5 px-4 text-center text-[11px] font-medium text-on-surface-variant tabular-nums">
                        {player.penaltiesScored ?? 0} Scored / {player.penaltiesSaved ?? 0} Saved
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(player)}
                            className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary-container hover:bg-surface-container border border-transparent hover:border-surface-container-high transition-all"
                            title="Edit Athlete"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeletingPlayer(player);
                              setDeleteError(null);
                            }}
                            className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 border border-transparent hover:border-error/20 transition-all"
                            title="Delete Athlete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer */}
        {!loading && filteredPlayers.length > 0 && (
          <div className="bg-surface-container-low/50 px-6 py-3.5 border-t border-surface-container-high flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-on-surface-variant font-medium">
            <span>Showing <strong className="text-on-surface font-bold">{filteredPlayers.length}</strong> of <strong className="text-on-surface font-bold">{totalAthletes}</strong> registered athletes</span>
            <span className="font-semibold text-primary-container flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              <span>Authoritative Collegiate Database</span>
            </span>
          </div>
        )}
      </div>

      {/* ADD PLAYER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/70 backdrop-blur-sm p-4 flex min-h-screen items-center justify-center animate-in fade-in duration-200">
          <div className="relative bg-surface-container-lowest w-full max-w-lg rounded-3xl border border-surface-container-high shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-container-high bg-surface-container-low/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary-container/15 text-primary-container flex items-center justify-center font-bold">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-on-surface">Add New Athlete</h3>
                  <p className="text-[10px] text-on-surface-variant">Enroll an athlete into a team squad</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-lg text-on-surface-variant hover:bg-surface-container flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddPlayer} className="p-6 space-y-4">
              {addError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{addError}</span>
                </div>
              )}

              {/* Player Name */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Full Athlete Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. Marcus Striker"
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/30"
                />
              </div>

              {/* Team Selection */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Assigned Team <span className="text-error">*</span>
                </label>
                <select
                  required
                  value={addTeamId}
                  onChange={(e) => setAddTeamId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface font-semibold focus:outline-none focus:ring-2 focus:ring-primary-container/30"
                >
                  <option value="" disabled>
                    Select university team...
                  </option>
                  {teams.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Jersey Number & Position */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Jersey Number (1 - 99) <span className="text-error">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    required
                    value={addJersey}
                    onChange={(e) => setAddJersey(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 10"
                    className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Field Position <span className="text-error">*</span>
                  </label>
                  <select
                    value={addPosition}
                    onChange={(e) => setAddPosition(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface font-semibold focus:outline-none focus:ring-2 focus:ring-primary-container/30"
                  >
                    <option value="Forward">Forward (FW)</option>
                    <option value="Midfielder">Midfielder (MF)</option>
                    <option value="Defender">Defender (DF)</option>
                    <option value="Goalkeeper">Goalkeeper (GK)</option>
                  </select>
                </div>
              </div>

              {/* Club / Academy */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Youth Club / Academy <span className="text-on-surface-variant font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={addClub}
                  onChange={(e) => setAddClub(e.target.value)}
                  placeholder="e.g. Independent Youth Academy"
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/30"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-container-high">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-5 py-2 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {addLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Enroll Athlete</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PLAYER MODAL */}
      {editingPlayer && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/70 backdrop-blur-sm p-4 flex min-h-screen items-center justify-center animate-in fade-in duration-200">
          <div className="relative bg-surface-container-lowest w-full max-w-lg rounded-3xl border border-surface-container-high shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-container-high bg-surface-container-low/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary-container/15 text-primary-container flex items-center justify-center font-bold">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-on-surface">Edit Athlete Profile</h3>
                  <p className="text-[10px] text-on-surface-variant">Update details, team assignment or jersey number</p>
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
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              {editError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Player Name */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Full Athlete Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/30"
                />
              </div>

              {/* Team Selection */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Assigned Team <span className="text-error">*</span>
                </label>
                <select
                  required
                  value={editTeamId}
                  onChange={(e) => setEditTeamId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface font-semibold focus:outline-none focus:ring-2 focus:ring-primary-container/30"
                >
                  {teams.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Jersey Number & Position */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Jersey Number (1 - 99) <span className="text-error">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    required
                    value={editJersey}
                    onChange={(e) => setEditJersey(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Field Position <span className="text-error">*</span>
                  </label>
                  <select
                    value={editPosition}
                    onChange={(e) => setEditPosition(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface font-semibold focus:outline-none focus:ring-2 focus:ring-primary-container/30"
                  >
                    <option value="Forward">Forward (FW)</option>
                    <option value="Midfielder">Midfielder (MF)</option>
                    <option value="Defender">Defender (DF)</option>
                    <option value="Goalkeeper">Goalkeeper (GK)</option>
                  </select>
                </div>
              </div>

              {/* Club / Academy */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Youth Club / Academy
                </label>
                <input
                  type="text"
                  value={editClub}
                  onChange={(e) => setEditClub(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/30"
                />
              </div>

              {/* Performance Stats: Goals, Penalties, Matches */}
              <div className="p-3.5 bg-surface-container-low/80 rounded-2xl border border-surface-container-high space-y-2">
                <div className="text-[11px] font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>Cumulative Tournament Statistics</span>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-primary-container mb-1">
                      Goals ⚽
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editGoals}
                      onChange={(e) => setEditGoals(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-xl text-xs font-black text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-on-surface mb-1">
                      PKs Scored 🥅
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editPenaltiesScored}
                      onChange={(e) => setEditPenaltiesScored(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-xl text-xs font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-on-surface mb-1">
                      Matches 🏟️
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editMatchesPlayed}
                      onChange={(e) => setEditMatchesPlayed(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-xl text-xs font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                    />
                  </div>
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
                  disabled={editLoading}
                  className="px-5 py-2 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {editLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingPlayer && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/70 backdrop-blur-sm p-4 flex min-h-screen items-center justify-center animate-in fade-in duration-200">
          <div className="relative bg-surface-container-lowest w-full max-w-md rounded-3xl border border-surface-container-high shadow-2xl overflow-hidden p-6 sm:p-7 my-auto animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-on-surface">Delete Athlete Profile?</h3>
            <p className="text-xs text-on-surface-variant mt-1.5">
              Are you sure you want to release and permanently remove{' '}
              <strong className="text-on-surface font-bold">&quot;{deletingPlayer.name}&quot;</strong> (#{deletingPlayer.jerseyNumber})?
              This action cannot be undone.
            </p>

            {deleteError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 text-xs font-semibold">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setDeletingPlayer(null)}
                className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-colors"
              >
                Keep Athlete
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {deleteLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Player</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
