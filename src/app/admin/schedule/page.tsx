'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trophy, Shield, MapPin, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { matchService } from '@/services/match.service';
import { teamService } from '@/services/team.service';
import { adminService } from '@/services/admin.service';
import { formatDate } from '@/utils/formatters';
import { Match, Team } from '@/types';

export default function AdminSchedulePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [matchDate, setMatchDate] = useState('2026-03-24');
  const [matchTime, setMatchTime] = useState('14:00');
  const [venue, setVenue] = useState('Varsity National Field #1');
  const [stage, setStage] = useState('Group Stage');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [m, t] = await Promise.all([matchService.getAllMatches(), teamService.getAllTeams()]);
      setMatches(m);
      setTeams(t);
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

    const res = await adminService.scheduleMatch({
      tournamentId: 'tourn-2026-spring',
      teamA,
      teamB,
      matchDate,
      matchTime,
      venue,
      stage,
    });

    const teamAObj = teams.find((t) => t._id === teamA);
    const teamBObj = teams.find((t) => t._id === teamB);

    const newMatch: Match = {
      _id: `match-new-${Date.now()}`,
      tournament: 'tourn-2026-spring',
      matchNumber: matches.length + 1,
      teamA: teamAObj || { _id: teamA, name: 'Team A' },
      teamB: teamBObj || { _id: teamB, name: 'Team B' },
      matchDate,
      matchTime,
      venue,
      stage,
      status: 'Upcoming',
      score: { teamA: 0, teamB: 0 },
    };

    setMatches((prev) => [newMatch, ...prev]);
    setShowModal(false);
    setSuccessMsg(`Fixture scheduled: ${teamAObj?.name} vs ${teamBObj?.name} on ${matchDate} at ${matchTime}!`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6 select-none">
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
          {matches.map((match) => (
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
                    <span>{match.teamA?.name}</span>
                    <span className="text-on-surface-variant font-normal">vs</span>
                    <span>{match.teamB?.name}</span>
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
              </div>
            </div>
          ))}
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
    </div>
  );
}
