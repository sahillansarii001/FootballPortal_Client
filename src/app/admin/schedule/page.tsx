'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trophy, Shield, MapPin, Clock, CheckCircle2, AlertCircle, Pencil, Trash2, X } from 'lucide-react';
import { matchService } from '@/services/match.service';
import { teamService } from '@/services/team.service';
import { tournamentService } from '@/services/tournament.service';
import { adminService } from '@/services/admin.service';
import { formatDate } from '@/utils/formatters';
import { Match, Team, Tournament } from '@/types';

export default function AdminSchedulePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [currentTournamentId, setCurrentTournamentId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const getTodayDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Create Form State
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [matchDate, setMatchDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [venue, setVenue] = useState('Alliance National Field #1');
  const [stage, setStage] = useState('Group Stage');

  const handleOpenCreateModal = () => {
    setMatchDate(getTodayDateString());
    setShowModal(true);
  };

  // Edit Modal State
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [editTeamA, setEditTeamA] = useState('');
  const [editTeamB, setEditTeamB] = useState('');
  const [editMatchDate, setEditMatchDate] = useState('');
  const [editMatchTime, setEditMatchTime] = useState('');
  const [editVenue, setEditVenue] = useState('');
  const [editStage, setEditStage] = useState('');
  const [editStatus, setEditStatus] = useState('Upcoming');
  const [editScoreA, setEditScoreA] = useState(0);
  const [editScoreB, setEditScoreB] = useState(0);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [m, t, tourns] = await Promise.all([
        matchService.getAllMatches(),
        teamService.getAllTeams(),
        tournamentService.getTournaments(),
      ]);
      setMatches(m);
      setTeams(t);
      setTournaments(tourns);
      if (tourns && tourns.length > 0 && tourns[0]._id) {
        setCurrentTournamentId(tourns[0]._id);
      }
      if (t.length >= 2) {
        setTeamA(t[0]._id);
        setTeamB(t[1]._id);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamA || !teamB || teamA === teamB) {
      alert('Please select two distinct university teams.');
      return;
    }

    const tId = currentTournamentId || (tournaments[0] ? tournaments[0]._id : undefined);

    let cleanDate = matchDate;
    if (/^\d{2}-\d{2}-\d{4}$/.test(cleanDate)) {
      const [d, m, y] = cleanDate.split('-');
      cleanDate = `${y}-${m}-${d}`;
    }

    const todayStr = getTodayDateString();
    if (cleanDate < todayStr) {
      alert('Match date cannot be in the past. Matches must be scheduled for today or a future date.');
      return;
    }

    const res = await adminService.scheduleMatch({
      tournament: tId,
      tournamentId: tId,
      teamA,
      teamB,
      matchDate: cleanDate,
      matchTime: '14:00',
      venue,
      stage,
      matchNumber: matches.length + 1,
    });

    if (!res.success) {
      alert(res.error || res.message || 'Failed to schedule match on server');
      return;
    }

    // Refresh directly from database to ensure persistence
    const updated = await matchService.getAllMatches();
    setMatches(updated);
    setShowModal(false);

    const teamAObj = teams.find((t) => t._id === teamA);
    const teamBObj = teams.find((t) => t._id === teamB);
    setSuccessMsg(`Fixture scheduled: ${teamAObj?.name || 'Team A'} vs ${teamBObj?.name || 'Team B'} on ${cleanDate}!`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Open Edit Modal with selected match details
  const handleOpenEditModal = (match: Match) => {
    setEditingMatch(match);
    setEditTeamA(match.teamA?._id || '');
    setEditTeamB(match.teamB?._id || '');
    setEditMatchDate(match.matchDate ? match.matchDate.substring(0, 10) : '2026-03-24');
    setEditMatchTime(match.matchTime || '14:00');
    setEditVenue(match.venue || 'Alliance Field #1');
    setEditStage(match.stage || 'Quarter Final');
    setEditStatus(match.status || 'Upcoming');
    setEditScoreA(match.score?.teamA ?? match.teamAScore ?? 0);
    setEditScoreB(match.score?.teamB ?? match.teamBScore ?? 0);
  };

  // Submit Edit Match
  const handleUpdateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMatch) return;
    if (!editTeamA || !editTeamB || editTeamA === editTeamB) {
      alert('Please select two distinct university teams.');
      return;
    }

    let cleanDate = editMatchDate;
    if (/^\d{2}-\d{2}-\d{4}$/.test(cleanDate)) {
      const [d, m, y] = cleanDate.split('-');
      cleanDate = `${y}-${m}-${d}`;
    }

    const payload = {
      teamA: editTeamA,
      teamB: editTeamB,
      matchDate: cleanDate,
      matchTime: editMatchTime,
      venue: editVenue,
      stage: editStage,
      status: editStatus,
      teamAScore: Number(editScoreA),
      teamBScore: Number(editScoreB),
    };

    const res = await adminService.updateMatch(editingMatch._id, payload);
    if (!res.success) {
      alert(res.error || res.message || 'Failed to update fixture');
      return;
    }

    const updated = await matchService.getAllMatches();
    setMatches(updated);
    setEditingMatch(null);
    setSuccessMsg(`Fixture details updated and saved to database!`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Delete Match
  const handleDeleteMatch = async (matchId: string) => {
    const matchToDelete = matches.find((m) => m._id === matchId);
    const matchTitle = matchToDelete
      ? `${matchToDelete.teamA?.name} vs ${matchToDelete.teamB?.name}`
      : 'this match';

    const confirm = window.confirm(`Are you sure you want to delete fixture ${matchTitle}? This action cannot be undone.`);
    if (!confirm) return;

    const res = await adminService.deleteMatch(matchId);
    if (!res.success) {
      alert(res.error || res.message || 'Failed to delete fixture');
      return;
    }

    const updated = await matchService.getAllMatches();
    setMatches(updated);
    setSuccessMsg(`Fixture deleted successfully.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 flex flex-col gap-6 select-none animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-container-high">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-container" />
            <h1 className="font-headline-lg text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
              Match Scheduling & Dispatch
            </h1>
          </div>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            Create, schedule, and assign referees for official tournament fixtures.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-primary-container hover:bg-primary text-on-primary px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Match</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-3.5 flex items-center gap-2 text-xs font-bold shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-primary-container shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Fixtures Table / List */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-container-high flex items-center justify-between">
          <h3 className="font-headline-md text-sm font-extrabold text-on-surface uppercase tracking-wider">
            All Scheduled League Fixtures ({matches.length})
          </h3>
          <span className="text-xs text-on-surface-variant font-medium">Sorted chronologically</span>
        </div>

        <div className="divide-y divide-surface-container-high">
          {matches.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <Calendar className="w-10 h-10 text-on-surface-variant/40" />
              <p className="font-headline-sm text-sm font-bold text-on-surface">No Matches Scheduled Yet</p>
              <p className="text-xs text-on-surface-variant font-medium max-w-sm">
                Schedule tournament fixtures between registered teams.
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="mt-2 flex items-center gap-2 bg-primary-container hover:bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule New Match</span>
              </button>
            </div>
          ) : (
            matches.map((match) => {
              const isCompleted = match.status === 'Completed';
              const isLive = match.status === 'Live' || match.status === 'Half-Time' || match.status === 'Penalty Shootout';
              const scoreA = match.score?.teamA ?? match.teamAScore ?? 0;
              const scoreB = match.score?.teamB ?? match.teamBScore ?? 0;
              const penA = match.shootout?.teamAPenaltyScore ?? 0;
              const penB = match.shootout?.teamBPenaltyScore ?? 0;
              const hasShootout = Boolean(match.shootout?.isShootout || match.shootout?.isCompleted || penA > 0 || penB > 0);

              const teamAName = match.teamA?.name || 'Team A';
              const teamBName = match.teamB?.name || 'Team B';
              const teamAId = typeof match.teamA === 'object' ? match.teamA?._id : match.teamA;
              const teamBId = typeof match.teamB === 'object' ? match.teamB?._id : match.teamB;
              const winnerId = typeof match.winner === 'object' ? match.winner?._id : match.winner;
              const shootoutWinnerId = typeof match.shootout?.shootoutWinner === 'object' ? match.shootout?.shootoutWinner?._id : match.shootout?.shootoutWinner;

              const isTeamAWinner = isCompleted && (
                (winnerId && teamAId && String(winnerId) === String(teamAId)) ||
                (shootoutWinnerId && teamAId && String(shootoutWinnerId) === String(teamAId)) ||
                (scoreA > scoreB) ||
                (hasShootout && penA > penB)
              );
              const isTeamBWinner = isCompleted && (
                (winnerId && teamBId && String(winnerId) === String(teamBId)) ||
                (shootoutWinnerId && teamBId && String(shootoutWinnerId) === String(teamBId)) ||
                (scoreB > scoreA) ||
                (hasShootout && penB > penA)
              );
              const winnerName = isTeamAWinner ? teamAName : isTeamBWinner ? teamBName : null;

              return (
                <div
                  key={match._id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-container-low transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-surface-container text-on-surface flex items-center justify-center font-bold text-xs shrink-0 border border-surface-container-high">
                      #{match.matchNumber || 1}
                    </div>
                    <div>
                      <div className="font-headline-sm text-sm font-extrabold text-on-surface flex items-center gap-2">
                        <span className={isTeamAWinner ? 'text-emerald-700 font-black flex items-center gap-1' : ''}>
                          {isTeamAWinner && <span>🏆</span>}
                          <span>{teamAName}</span>
                        </span>
                        <span className="text-on-surface-variant font-normal">vs</span>
                        <span className={isTeamBWinner ? 'text-emerald-700 font-black flex items-center gap-1' : ''}>
                          <span>{teamBName}</span>
                          {isTeamBWinner && <span>🏆</span>}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-on-surface-variant mt-1 flex-wrap">
                        <span>{formatDate(match.matchDate)} • {match.matchTime}</span>
                        <span>•</span>
                        <span>{match.venue || 'Stadium Field #1'}</span>
                        <span>•</span>
                        <span className="font-semibold text-primary-container">{match.stage}</span>
                        {isCompleted && (
                          <>
                            <span>•</span>
                            <span className={winnerName ? 'text-emerald-700 font-extrabold flex items-center gap-1' : 'text-slate-500 font-medium'}>
                              {winnerName ? `🏆 Winner: ${winnerName} ${hasShootout ? `(Pen: ${penA}-${penB})` : ''}` : 'Match Drawn (Full Time)'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold font-label-caps ${
                        isLive
                          ? 'bg-emerald-100 text-primary-container ring-1 ring-primary-container/30'
                          : isCompleted
                          ? 'bg-surface-container text-on-surface'
                          : 'bg-primary-container/10 text-primary-container'
                      }`}
                    >
                      {isCompleted ? (hasShootout ? `FINAL (Pen: ${penA}-${penB})` : 'FINAL') : match.status}
                    </span>
                    <span className="text-xs font-bold text-on-surface tabular-nums">
                      {`${scoreA} - ${scoreB}`}
                    </span>

                    {/* Edit & Delete Action Buttons */}
                    <div className="flex items-center gap-1.5 pl-2 border-l border-surface-container-high">
                      <button
                        onClick={() => handleOpenEditModal(match)}
                        className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface hover:text-primary-container transition-all flex items-center gap-1 text-xs font-bold shadow-2xs"
                        title="Edit Match"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteMatch(match._id)}
                        className="p-2 rounded-xl bg-surface-container hover:bg-error/15 text-on-surface hover:text-error transition-all flex items-center gap-1 text-xs font-bold shadow-2xs"
                        title="Delete Match"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/70 backdrop-blur-sm p-4 flex min-h-screen items-center justify-center animate-in fade-in duration-200">
          <div className="relative max-w-lg w-full bg-surface-container-lowest rounded-3xl border border-surface-container-high shadow-2xl p-6 sm:p-7 space-y-4 my-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-container" />
                <h3 className="font-headline-md text-base font-black text-on-surface">
                  Schedule New Tournament Match
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMatch} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-on-surface uppercase font-label-caps mb-1">
                    Home Team (Team A)
                  </label>
                  <select
                    value={teamA}
                    onChange={(e) => setTeamA(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                  >
                    {teams.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-on-surface uppercase font-label-caps mb-1">
                    Away Team (Team B)
                  </label>
                  <select
                    value={teamB}
                    onChange={(e) => setTeamB(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                  >
                    {teams.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-on-surface uppercase font-label-caps mb-1">
                  Match Date
                </label>
                <input
                  type="date"
                  required
                  min={getTodayDateString()}
                  value={matchDate}
                  onChange={(e) => setMatchDate(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Matches can only be scheduled for today or upcoming dates.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-on-surface uppercase font-label-caps mb-1">
                    Tournament Stage
                  </label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                  >
                    <option value="Group Stage">Group Stage</option>
                    <option value="Quarter Final">Quarter Final</option>
                    <option value="Semi Final">Semi Final</option>
                    <option value="Championship Final">Championship Final</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-on-surface uppercase font-label-caps mb-1">
                    Stadium Venue
                  </label>
                  <input
                    type="text"
                    required
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Confirm & Schedule Fixture
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

      {/* Edit Match Modal */}
      {editingMatch && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/70 backdrop-blur-sm p-4 flex min-h-screen items-center justify-center animate-in fade-in duration-200">
          <div className="relative max-w-lg w-full bg-surface-container-lowest rounded-3xl border border-surface-container-high shadow-2xl p-6 sm:p-7 space-y-4 my-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-primary-container" />
                <h3 className="font-headline-md text-base font-black text-on-surface">
                  Edit Tournament Match
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingMatch(null)}
                className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateMatch} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-on-surface uppercase font-label-caps mb-1">
                    Home Team (Team A)
                  </label>
                  <select
                    value={editTeamA}
                    onChange={(e) => setEditTeamA(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                  >
                    {teams.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-on-surface uppercase font-label-caps mb-1">
                    Away Team (Team B)
                  </label>
                  <select
                    value={editTeamB}
                    onChange={(e) => setEditTeamB(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                  >
                    {teams.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-on-surface uppercase font-label-caps mb-1">
                    Match Date
                  </label>
                  <input
                    type="date"
                    required
                    min={getTodayDateString()}
                    value={editMatchDate}
                    onChange={(e) => setEditMatchDate(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-on-surface uppercase font-label-caps mb-1">
                    Kickoff Time
                  </label>
                  <input
                    type="time"
                    required
                    value={editMatchTime}
                    onChange={(e) => setEditMatchTime(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-on-surface uppercase font-label-caps mb-1">
                    Tournament Stage
                  </label>
                  <select
                    value={editStage}
                    onChange={(e) => setEditStage(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                  >
                    <option value="Group Stage">Group Stage</option>
                    <option value="Quarter Final">Quarter Final</option>
                    <option value="Semi Final">Semi Final</option>
                    <option value="Championship Final">Championship Final</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-on-surface uppercase font-label-caps mb-1">
                    Stadium Venue
                  </label>
                  <input
                    type="text"
                    required
                    value={editVenue}
                    onChange={(e) => setEditVenue(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-on-surface uppercase font-label-caps mb-1">
                    Match Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Live">Live</option>
                    <option value="Half-Time">Half-Time</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-on-surface uppercase font-label-caps mb-1">
                    Team A Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={editScoreA}
                    onChange={(e) => setEditScoreA(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-on-surface uppercase font-label-caps mb-1">
                    Team B Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={editScoreB}
                    onChange={(e) => setEditScoreB(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Save & Update Match
                </button>
                <button
                  type="button"
                  onClick={() => setEditingMatch(null)}
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
