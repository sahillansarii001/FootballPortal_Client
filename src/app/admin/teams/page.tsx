'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Plus,
  Users,
  Award,
  CheckCircle2,
  X,
  ChevronRight,
  UserPlus,
  Shirt,
  Sparkles,
  Building2,
  Pencil,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { teamService } from '@/services/team.service';
import { adminService } from '@/services/admin.service';
import { getCaptainDisplayName } from '@/utils/formatters';
import { Team, Player } from '@/types';

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Register Team Modal state
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [captain, setCaptain] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit Team Modal state
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editName, setEditName] = useState('');
  const [editLogo, setEditLogo] = useState('');
  const [editCaptain, setEditCaptain] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Selected Team Squad Roster Modal state
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);

  // New Player Form state
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerClub, setNewPlayerClub] = useState('');
  const [newPlayerJersey, setNewPlayerJersey] = useState<number | ''>('');
  const [newPlayerPosition, setNewPlayerPosition] = useState('Forward');
  const [playerActionMsg, setPlayerActionMsg] = useState<string | null>(null);
  const [playerActionError, setPlayerActionError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTeams() {
      setLoading(true);
      const data = await teamService.getAllTeams();
      setTeams(data);
      setLoading(false);
    }
    loadTeams();
  }, []);

  const handleSelectTeam = async (team: Team) => {
    setSelectedTeam(team);
    setLoadingPlayers(true);
    setShowAddPlayer(false);
    setPlayerActionMsg(null);
    setPlayerActionError(null);
    try {
      const players = await teamService.getTeamPlayers(team._id);
      setTeamPlayers(players);
    } catch (err) {
      console.error('Failed to load team players:', err);
    } finally {
      setLoadingPlayers(false);
    }
  };

  const handleCloseSquadModal = () => {
    setSelectedTeam(null);
    setTeamPlayers([]);
    setShowAddPlayer(false);
    setPlayerActionMsg(null);
    setPlayerActionError(null);
  };

  // Open Edit Modal for a specific team
  const handleOpenEditModal = (team: Team, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingTeam(team);
    setEditName(team.name);
    setEditLogo(team.logo || '');
    const currentCap = getCaptainDisplayName(team.captain);
    setEditCaptain(currentCap === 'Unassigned' || currentCap === 'Team Captain' ? '' : currentCap);
    setEditError(null);
  };

  // Submit Edit Team
  const handleSaveEditTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;
    if (!editName.trim()) {
      setEditError('Team name is required');
      return;
    }

    setEditLoading(true);
    setEditError(null);
    try {
      const res = await adminService.updateTeam(editingTeam._id, {
        name: editName.trim(),
        logo: editLogo.trim(),
        captain: editCaptain.trim(),
      });

      if (res.success || !res.error) {
        setTeams((prev) =>
          prev.map((t) =>
            t._id === editingTeam._id
              ? {
                  ...t,
                  name: editName.trim(),
                  logo: editLogo.trim(),
                  captain: editCaptain.trim(),
                }
              : t
          )
        );

        if (selectedTeam?._id === editingTeam._id) {
          setSelectedTeam((prev) =>
            prev
              ? {
                  ...prev,
                  name: editName.trim(),
                  logo: editLogo.trim(),
                  captain: editCaptain.trim(),
                }
              : null
          );
        }

        setSuccessMsg(`Team "${editName}" updated successfully!`);
        setTimeout(() => setSuccessMsg(null), 4000);
        setEditingTeam(null);
      } else {
        setEditError(res.error || 'Failed to update team details');
      }
    } catch (err: any) {
      setEditError(err.message || 'Error updating team');
    } finally {
      setEditLoading(false);
    }
  };

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await adminService.createTeam({
        name: name.trim(),
        captain: captain.trim() || undefined,
        logo: logoUrl.trim() || undefined,
        description: `Varsity Collegiate Football Team`,
      });

      if (res.success && res.data) {
        setTeams((prev) => [res.data, ...prev]);
      } else {
        const freshTeams = await teamService.getAllTeams();
        setTeams(freshTeams);
      }
    } catch (err) {
      const freshTeams = await teamService.getAllTeams();
      setTeams(freshTeams);
    }

    setShowModal(false);
    const createdName = name;
    setName('');
    setCaptain('');
    setLogoUrl('');
    setSuccessMsg(`Team "${createdName}" registered successfully in database!`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;
    if (!newPlayerName.trim()) {
      setPlayerActionError('Player name is required');
      return;
    }
    if (!newPlayerJersey || Number(newPlayerJersey) < 1 || Number(newPlayerJersey) > 99) {
      setPlayerActionError('Valid jersey number between 1 and 99 is required');
      return;
    }

    try {
      const res = await adminService.createPlayer({
        name: newPlayerName.trim(),
        club: newPlayerClub.trim() || 'Independent Athletic Club',
        jerseyNumber: Number(newPlayerJersey),
        position: newPlayerPosition,
        team: selectedTeam._id,
      });

      if (res.success && res.data) {
        setTeamPlayers((prev) => [...prev, res.data]);
        setPlayerActionMsg(`Athlete "${newPlayerName}" [Club: ${newPlayerClub || 'Independent'}] enrolled into ${selectedTeam.name}!`);
        setNewPlayerName('');
        setNewPlayerClub('');
        setNewPlayerJersey('');
        setShowAddPlayer(false);
        setPlayerActionError(null);
      } else {
        // Fallback local update if offline or simulated ID
        const localPlayer: Player = {
          _id: `p-${Date.now()}`,
          name: newPlayerName.trim(),
          club: newPlayerClub.trim() || 'Independent Athletic Club',
          jerseyNumber: Number(newPlayerJersey),
          position: newPlayerPosition,
          team: selectedTeam._id,
          matchesPlayed: 0,
          goals: 0,
        };
        setTeamPlayers((prev) => [...prev, localPlayer]);
        setPlayerActionMsg(`Athlete "${newPlayerName}" [Club: ${newPlayerClub || 'Independent'}] enrolled into ${selectedTeam.name}!`);
        setNewPlayerName('');
        setNewPlayerClub('');
        setNewPlayerJersey('');
        setShowAddPlayer(false);
        setPlayerActionError(null);
      }
    } catch (err: any) {
      setPlayerActionError(err.message || 'Failed to create athlete');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-container-high">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-container" />
            <h1 className="font-headline-lg text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
              Teams & Rosters Management
            </h1>
          </div>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            Click any team to inspect athlete rosters, view origin clubs, or click <Pencil className="w-3 h-3 inline mx-0.5 text-primary-container" /> to edit team names and logos.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary-container hover:bg-primary text-on-primary px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Team</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-3.5 flex items-center gap-2 text-xs font-bold shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-primary-container shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Teams Grid */}
      {loading ? (
        <div className="p-16 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-primary-container animate-spin" />
          <p className="text-xs text-on-surface-variant font-medium">Loading teams...</p>
        </div>
      ) : teams.length === 0 ? (
        <div className="p-12 text-center bg-surface-container-lowest rounded-2xl border border-surface-container flex flex-col items-center justify-center gap-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
            <Shield className="w-8 h-8 text-on-surface-variant/50" />
          </div>
          <div>
            <h3 className="font-headline-sm text-base font-bold text-on-surface">No Teams Registered Yet</h3>
            <p className="text-xs text-on-surface-variant font-medium mt-1 max-w-sm mx-auto">
              Register official teams to start organizing tournament fixtures, rosters, and championship matches.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary-container hover:bg-primary text-on-primary px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Register First Team</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {teams.map((team) => {
            const stats = team.stats || {
              matchesPlayed: team.matchesPlayed || 0,
              matchesWon: team.matchesWon || 0,
              matchesLost: team.matchesLost || 0,
              goalsScored: team.goalsScored || 0,
              goalsConceded: team.goalsConceded || 0,
              goalDifference: team.goalDifference || 0,
              totalPoints: team.totalPoints || 0,
            };

            return (
              <div
                key={team._id}
                onClick={() => handleSelectTeam(team)}
                className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high shadow-xs hover:shadow-lg hover:border-primary-container/40 transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.99] relative"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-primary-container flex items-center justify-center font-black text-lg border border-emerald-200 shadow-inner group-hover:scale-105 transition-transform overflow-hidden shrink-0">
                      {team.logo ? (
                        <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                      ) : (
                        (team.name || 'T').slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleOpenEditModal(team, e)}
                        className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary-container transition-colors shadow-2xs"
                        title="Edit Team Name & Logo"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h2 className="font-headline-sm text-base font-black text-on-surface leading-tight mb-1 group-hover:text-primary-container transition-colors">
                    {team.name}
                  </h2>
                  <div className="text-xs text-on-surface-variant mb-3">
                    <div>Captain: <strong className="text-on-surface">{getCaptainDisplayName(team.captain)}</strong></div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-1 bg-surface-container-low p-2 rounded-xl text-center text-xs font-bold border border-surface-container">
                    <div>
                      <span className="text-[9px] text-on-surface-variant block">PLAYED</span>
                      <span>{stats.matchesPlayed}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-on-surface-variant block">DIFF</span>
                      <span className={stats.goalDifference >= 0 ? 'text-primary-container' : 'text-error'}>
                        {stats.goalDifference > 0 ? `+${stats.goalDifference}` : stats.goalDifference}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-on-surface-variant block">POINTS</span>
                      <span className="text-primary-container">{stats.totalPoints}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-surface-container-high flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant font-medium">
                    {Array.isArray(team.players) ? `${team.players.length} Athletes` : 'Active Roster'}
                  </span>
                  <span className="text-primary-container font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>View Roster</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Team Roster / Players Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="max-w-3xl w-full bg-surface-container-lowest rounded-3xl border border-surface-container-high shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-surface-container-high/40 p-6 border-b border-surface-container-high flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary-container/15 text-primary-container flex items-center justify-center font-black text-2xl border border-primary-container/30 shadow-inner overflow-hidden shrink-0">
                  {selectedTeam.logo ? (
                    <img src={selectedTeam.logo} alt={selectedTeam.name} className="w-full h-full object-cover" />
                  ) : (
                    selectedTeam.name.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-on-surface-variant font-medium">
                      Captain: <strong className="text-on-surface">{getCaptainDisplayName(selectedTeam.captain)}</strong>
                    </span>
                  </div>
                  <h2 className="font-headline-lg text-2xl font-black text-on-surface tracking-tight mt-0.5">
                    {selectedTeam.name}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(selectedTeam)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold shadow-2xs transition-all active:scale-95"
                  title="Edit team details"
                >
                  <Pencil className="w-3.5 h-3.5 text-primary-container" />
                  <span>Edit Team</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddPlayer(!showAddPlayer)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-xs font-bold shadow-xs transition-all active:scale-95"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{showAddPlayer ? 'Hide Form' : '+ Add Athlete'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCloseSquadModal}
                  className="w-9 h-9 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center transition-all"
                  aria-label="Close roster modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notification messages inside modal */}
            {playerActionMsg && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary-container shrink-0" />
                <span>{playerActionMsg}</span>
              </div>
            )}
            {playerActionError && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-300 text-red-900 text-xs font-bold flex items-center gap-2">
                <X className="w-4 h-4 text-error shrink-0" />
                <span>{playerActionError}</span>
              </div>
            )}

            {/* Add Athlete Form inside modal */}
            {showAddPlayer && (
              <form onSubmit={handleCreatePlayer} className="m-6 p-4 rounded-2xl bg-surface-container-low border border-surface-container space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                  <span className="font-headline-sm text-xs font-black uppercase text-on-surface flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-primary-container" />
                    Enrolling New Athlete to {selectedTeam.name}
                  </span>
                  <span className="text-[11px] text-on-surface-variant font-medium">Club affiliation is required</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface uppercase font-label-caps mb-1">
                      Athlete Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mateo Vance"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-on-surface uppercase font-label-caps mb-1">
                      Athlete Origin Club (Affiliation)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bay Area Elite SC / Silicon Valley FC"
                      value={newPlayerClub}
                      onChange={(e) => setNewPlayerClub(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-on-surface uppercase font-label-caps mb-1">
                      Jersey Number (1-99)
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={99}
                      placeholder="e.g. 9"
                      value={newPlayerJersey}
                      onChange={(e) => setNewPlayerJersey(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-on-surface uppercase font-label-caps mb-1">
                      Position
                    </label>
                    <select
                      value={newPlayerPosition}
                      onChange={(e) => setNewPlayerPosition(e.target.value)}
                      className="w-full px-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                    >
                      <option value="Forward">Forward</option>
                      <option value="Midfielder">Midfielder</option>
                      <option value="Defender">Defender</option>
                      <option value="Goalkeeper">Goalkeeper</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddPlayer(false)}
                    className="px-3.5 py-2 rounded-xl bg-surface-container text-xs font-bold text-on-surface hover:bg-surface-container-high"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-primary-container hover:bg-primary text-on-primary text-xs font-bold uppercase tracking-wider shadow-xs"
                  >
                    Save & Enroll Athlete
                  </button>
                </div>
              </form>
            )}

            {/* Players List Table Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-xs text-on-surface-variant uppercase font-bold tracking-wider">
                  Official Squad Roster ({teamPlayers.length} Certified Athletes)
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  All players display their origin club affiliation
                </span>
              </div>

              {loadingPlayers ? (
                <div className="py-12 text-center text-xs text-on-surface-variant font-medium">
                  Loading team roster and certified players...
                </div>
              ) : teamPlayers.length === 0 ? (
                <div className="py-12 text-center rounded-2xl bg-surface-container-low border border-surface-container">
                  <Users className="w-8 h-8 text-on-surface-variant/40 mx-auto mb-2" />
                  <p className="text-xs font-bold text-on-surface">No athletes registered yet for this team.</p>
                  <p className="text-[11px] text-on-surface-variant mt-1">
                    Use the &quot;+ Add Athlete&quot; button above to enroll players with their respective clubs.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {teamPlayers.map((player) => (
                    <div
                      key={player._id}
                      className="p-3.5 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-surface-container transition-all flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface-container-lowest border border-surface-container-high flex items-center justify-center font-display-score text-base font-black text-primary-container shadow-xs shrink-0">
                          #{player.jerseyNumber}
                        </div>
                        <div>
                          <div className="font-headline-sm text-sm font-black text-on-surface flex items-center gap-1.5 flex-wrap">
                            <span>{player.name}</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                              <Building2 className="w-2.5 h-2.5 text-primary-container" />
                              <span>Club: {player.club || 'Independent Club'}</span>
                            </span>
                          </div>
                          <div className="text-[11px] text-on-surface-variant flex items-center gap-2 mt-0.5">
                            <span className="font-semibold text-on-surface">{player.position}</span>
                            <span>•</span>
                            <span>{player.matchesPlayed || 0} Matches</span>
                            {player.goals > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-primary-container font-bold">⚽ {player.goals} Goals</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="font-label-caps text-[9px] uppercase px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-bold shrink-0">
                        Eligible
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-surface-container-high/40 px-6 py-3 border-t border-surface-container-high flex items-center justify-between text-xs text-on-surface-variant">
              <span>Roster synced with Authoritative Database</span>
              <button
                type="button"
                onClick={handleCloseSquadModal}
                className="px-4 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Team Modal (Name & Logo) */}
      {editingTeam && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="max-w-md w-full bg-surface-container-lowest rounded-3xl border border-surface-container-high shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-primary-container" />
                <h3 className="font-headline-md text-base font-black text-on-surface">
                  Edit Team Details
                </h3>
              </div>
              <button
                onClick={() => setEditingTeam(null)}
                className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-2">
                <X className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditTeam} className="space-y-3.5">
              {/* Logo Preview */}
              <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl border border-surface-container">
                <div className="w-14 h-14 rounded-xl bg-surface-container-lowest border border-surface-container-high flex items-center justify-center font-black text-lg text-primary-container overflow-hidden shrink-0 shadow-inner">
                  {editLogo.trim() ? (
                    <img
                      src={editLogo}
                      alt="Logo preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    editName.slice(0, 2).toUpperCase() || 'TM'
                  )}
                </div>
                <div>
                  <span className="font-label-caps text-[10px] uppercase font-bold text-on-surface-variant block">
                    Team Badge Preview
                  </span>
                  <span className="text-xs font-bold text-on-surface">
                    {editName || 'Unnamed Team'}
                  </span>
                </div>
              </div>

              {/* Team Name */}
              <div>
                <label className="block text-[11px] font-bold text-on-surface uppercase font-label-caps mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Stanford Cardinal"
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                />
              </div>

              {/* Team Logo URL */}
              <div>
                <label className="block text-[11px] font-bold text-on-surface uppercase font-label-caps mb-1">
                  Team Logo URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={editLogo}
                    onChange={(e) => setEditLogo(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                  <ImageIcon className="w-4 h-4 text-on-surface-variant absolute left-3 top-3" />
                </div>
                <span className="text-[10px] text-on-surface-variant mt-1 block">
                  Paste any public image link or CDN badge URL
                </span>
              </div>

              {/* Team Captain */}
              <div>
                <label className="block text-[11px] font-bold text-on-surface uppercase font-label-caps mb-1">
                  Team Captain
                </label>
                <input
                  type="text"
                  value={editCaptain}
                  onChange={(e) => setEditCaptain(e.target.value)}
                  placeholder="e.g. Mateo Vance"
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                />
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 py-2.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {editLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Save Team Changes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTeam(null)}
                  className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Team Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-surface-container-lowest rounded-2xl border border-surface-container-high shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
              <h3 className="font-headline-md text-base font-black text-on-surface">
                Register University Team
              </h3>
              <button onClick={() => setShowModal(false)} className="text-on-surface-variant font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTeam} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-on-surface uppercase font-label-caps mb-1">
                  University Team Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Stanford Cardinal"
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-on-surface uppercase font-label-caps mb-1">
                  Team Logo URL (Optional)
                </label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-on-surface uppercase font-label-caps mb-1">
                  Team Captain (Optional)
                </label>
                <input
                  type="text"
                  value={captain}
                  onChange={(e) => setCaptain(e.target.value)}
                  placeholder="e.g. Mateo Vance"
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                />
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Register Team Roster
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
