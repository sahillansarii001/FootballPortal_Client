'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trophy, Shield, MapPin, Clock, CheckCircle2, AlertCircle, Pencil, Trash2 } from 'lucide-react';
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

  // Create Form State
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [matchDate, setMatchDate] = useState('2026-03-24');
  const [matchTime, setMatchTime] = useState('14:00');
  const [venue, setVenue] = useState('Varsity National Field #1');
  const [stage, setStage] = useState('Group Stage');

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

    const res = await adminService.scheduleMatch({
      tournament: tId,
      tournamentId: tId,
      teamA,
      teamB,
      matchDate: cleanDate,
      matchTime,
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
    setSuccessMsg(`Fixture scheduled: ${teamAObj?.name || 'Team A'} vs ${teamBObj?.name || 'Team B'} on ${cleanDate} at ${matchTime}!`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Open Edit Modal with selected match details
  const handleOpenEditModal = (match: Match) => {
    setEditingMatch(match);
    setEditTeamA(match.teamA?._id || '');
    setEditTeamB(match.teamB?._id || '');
    setEditMatchDate(match.matchDate ? match.matchDate.substring(0, 10) : '2026-03-24');
    setEditMatchTime(match.matchTime || '14:00');
    setEditVenue(match.venue || 'Varsity Field #1');
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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col gap-4 sm:gap-6 select-none animate-slide-up">
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
          onClick={() => setShowModal(true)}
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
                onClick={() => setShowModal(true)}
                className="mt-2 flex items-center gap-2 bg-primary-container hover:bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule New Match</span>
              </button>
            </div>
          ) : (
            matches.map((match) => (
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
                      <span>{match.teamA?.name || 'Team A'}</span>
                      <span className="text-on-surface-variant font-normal">vs</span>
                      <span>{match.teamB?.name || 'Team B'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-on-surface-variant mt-1">
                      <span>{formatDate(match.matchDate)} • {match.matchTime}</span>
                      <span>•</span>
                      <span>{match.venue || 'Stadium Field #1'}</span>
                      <span>•</span>
                      <span className="font-semibold text-primary-container">{match.stage}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold font-label-caps ${
                      match.status === 'Live'
                        ? 'bg-emerald-100 text-primary-container ring-1 ring-primary-container/30'
                        : match.status === 'Completed'
                        ? 'bg-surface-container text-on-surface'
                        : 'bg-primary-container/10 text-primary-container'
                    }`}
                  >
                    {match.status}
                  </span>
                  <span className="text-xs font-bold text-on-surface tabular-nums">
                    {match.score ? `${match.score.teamA} - ${match.score.teamB}` : '0 - 0'}
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
            ))
          )}
        </div>
      </div>

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-surface-container-lowest rounded-2xl border border-surface-container-high shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
              <h3 className="font-headline-md text-base font-black text-on-surface">
                Schedule New Tournament Match
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-on-surface-variant hover:text-on-surface text-lg font-bold"
              >
                ✕
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-on-surface uppercase font-label-caps mb-1">
                    Match Date
                  </label>
                  <input
                    type="date"
                    required
                    value={matchDate}
                    onChange={(e) => setMatchDate(e.target.value)}
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
                    value={matchTime}
                    onChange={(e) => setMatchTime(e.target.value)}
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-surface-container-lowest rounded-2xl border border-surface-container-high shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-primary-container" />
                <h3 className="font-headline-md text-base font-black text-on-surface">
                  Edit Tournament Match
                </h3>
              </div>
              <button
                onClick={() => setEditingMatch(null)}
                className="text-on-surface-variant hover:text-on-surface text-lg font-bold"
              >
                ✕
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
