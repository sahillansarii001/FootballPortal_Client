'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Plus, Users, Award, CheckCircle2 } from 'lucide-react';
import { teamService } from '@/services/team.service';
import { getCaptainDisplayName } from '@/utils/formatters';
import { Team } from '@/types';

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [conference, setConference] = useState('Pacific Division');
  const [coach, setCoach] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadTeams() {
      setLoading(true);
      const data = await teamService.getAllTeams();
      setTeams(data);
      setLoading(false);
    }
    loadTeams();
  }, []);

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newTeam: Team = {
      _id: `team-${Date.now()}`,
      name,
      conference,
      coach: coach || 'Head Coach',
      captain: 'Team Captain (#10)',
      players: [],
      stats: {
        matchesPlayed: 0,
        matchesWon: 0,
        matchesLost: 0,
        goalsScored: 0,
        goalsConceded: 0,
        goalDifference: 0,
        totalPoints: 0,
      },
    };

    setTeams((prev) => [newTeam, ...prev]);
    setShowModal(false);
    setName('');
    setCoach('');
    setSuccessMsg(`Team "${name}" registered in ${conference}!`);
    setTimeout(() => setSuccessMsg(null), 4000);
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
            Manage certified university athletic franchises, active squads, and player eligibility.
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
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-3.5 flex items-center gap-2 text-xs font-bold shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-primary-container shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Teams Grid */}
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
              className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-primary-container flex items-center justify-center font-black text-lg border border-emerald-200 shadow-inner">
                    {team.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="font-label-caps text-[10px] text-primary-container bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold">
                    {team.conference || 'Pac-West'}
                  </span>
                </div>

                <h2 className="font-headline-sm text-base font-black text-on-surface leading-tight mb-1">
                  {team.name}
                </h2>
                <div className="text-xs text-on-surface-variant space-y-1 mb-3">
                  <div>Coach: <strong className="text-on-surface">{team.coach || 'Head Coach'}</strong></div>
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
                  {Array.isArray(team.players) ? `${team.players.length} Athletes` : '24 Athletes'}
                </span>
                <span className="text-primary-container font-bold">Certified Eligible</span>
              </div>
            </div>
          );
        })}
      </div>

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
                  University Team Name
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
                  Conference Division
                </label>
                <select
                  value={conference}
                  onChange={(e) => setConference(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                >
                  <option value="Pacific Division">Pacific Division</option>
                  <option value="Ivy Collegiate">Ivy Collegiate</option>
                  <option value="Atlantic Athletic">Atlantic Athletic</option>
                  <option value="Midwest Conference">Midwest Conference</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-on-surface uppercase font-label-caps mb-1">
                  Head Coach
                </label>
                <input
                  type="text"
                  value={coach}
                  onChange={(e) => setCoach(e.target.value)}
                  placeholder="e.g. Jeremy Gunn"
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
