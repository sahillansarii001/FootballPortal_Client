'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Plus, Calendar, Shield, CheckCircle2, Award, Clock } from 'lucide-react';
import { tournamentService } from '@/services/tournament.service';
import { adminService } from '@/services/admin.service';
import { formatDate } from '@/utils/formatters';
import { Tournament } from '@/types';

export default function AdminTournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('2026-03-01');
  const [endDate, setEndDate] = useState('2026-05-30');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadTournaments() {
      setLoading(true);
      const data = await tournamentService.getTournaments();
      // Ensure at least sample cups are present
      if (data.length <= 1) {
        setTournaments([
          ...data,
          {
            _id: 'tourn-ivy-2026',
            name: '2026 Ivy League Invitational Cup',
            description: 'Exclusive collegiate invitational championship with round-robin group stages.',
            startDate: '2026-04-10',
            endDate: '2026-06-15',
            status: 'Upcoming',
            rules: {
              halfDurationSeconds: 2700,
              transitionDurationSeconds: 20,
              halfTimeDurationSeconds: 900,
              initialPenaltyKicks: 5,
              pointsForWin: 3,
              pointsForLoss: 0,
            },
          },
          {
            _id: 'tourn-fall-2025',
            name: '2025 Autumn All-Star Trophy',
            description: 'Archived fall varsity championship. Stanford Cardinal crowned champions.',
            startDate: '2025-09-01',
            endDate: '2025-11-28',
            status: 'Completed',
            rules: {
              halfDurationSeconds: 2700,
              transitionDurationSeconds: 20,
              halfTimeDurationSeconds: 900,
              initialPenaltyKicks: 5,
              pointsForWin: 3,
              pointsForLoss: 0,
            },
          },
        ]);
      } else {
        setTournaments(data);
      }
      setLoading(false);
    }
    loadTournaments();
  }, []);

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await adminService.createTournament({
      name,
      description,
      startDate,
      endDate,
    });

    const created: Tournament = {
      _id: `tourn-${Date.now()}`,
      name,
      description,
      startDate,
      endDate,
      status: 'Active',
      rules: {
        halfDurationSeconds: 2700,
        transitionDurationSeconds: 20,
        halfTimeDurationSeconds: 900,
        initialPenaltyKicks: 5,
        pointsForWin: 3,
        pointsForLoss: 0,
      },
    };

    setTournaments((prev) => [created, ...prev]);
    setShowModal(false);
    setName('');
    setDescription('');
    setSuccessMsg(`Tournament "${name}" successfully launched and active!`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-container-high">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary-container" />
            <h1 className="font-headline-lg text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
              Tournaments Management
            </h1>
          </div>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            Configure collegiate leagues, competition rules, point standards, and seasonal status.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary-container hover:bg-primary text-on-primary px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create Tournament</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-3.5 flex items-center gap-2 text-xs font-bold shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-primary-container shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tournaments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map((tourn) => (
          <div
            key={tourn._id}
            className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-primary-container flex items-center justify-center font-black text-xl shadow-inner border border-emerald-200 shrink-0">
                  <Trophy className="w-6 h-6" />
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold font-label-caps uppercase ${
                    tourn.status === 'Active'
                      ? 'bg-emerald-100 text-primary-container ring-1 ring-primary-container/30'
                      : tourn.status === 'Completed'
                      ? 'bg-surface-container text-on-surface-variant'
                      : 'bg-primary-container/10 text-primary-container'
                  }`}
                >
                  {tourn.status || 'Active'}
                </span>
              </div>

              <h2 className="font-headline-md text-lg font-black text-on-surface leading-tight mb-2">
                {tourn.name}
              </h2>
              <p className="text-xs text-on-surface-variant line-clamp-2 mb-4 font-medium">
                {tourn.description || 'Official sanctioned collegiate varsity tournament.'}
              </p>

              {/* Specs */}
              <div className="bg-surface-container-low p-3.5 rounded-xl border border-surface-container space-y-2 text-xs mb-4">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Timeline:</span>
                  <strong className="text-on-surface">
                    {formatDate(tourn.startDate)} - {formatDate(tourn.endDate)}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Format:</span>
                  <strong className="text-on-surface">45m Halves • 3pts Win</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Shootout:</span>
                  <strong className="text-on-surface">5 Kicks + Sudden Death</strong>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-surface-container-high flex items-center justify-between">
              <span className="text-[11px] text-on-surface-variant font-bold">16 Certified Teams</span>
              <button
                onClick={() => alert(`Rules and brackets for ${tourn.name} are locked by Super Admin.`)}
                className="text-xs font-bold text-primary-container hover:underline"
              >
                Inspect Bracket →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-surface-container-lowest rounded-2xl border border-surface-container-high shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
              <h3 className="font-headline-md text-base font-black text-on-surface">
                Create New Tournament
              </h3>
              <button onClick={() => setShowModal(false)} className="text-on-surface-variant font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTournament} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-on-surface uppercase font-label-caps mb-1">
                  Tournament Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 2026 National University Shield"
                  className="w-full px-3.5 py-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-on-surface uppercase font-label-caps mb-1">
                  Tournament Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of eligibility and conference scope..."
                  className="w-full px-3.5 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-on-surface uppercase font-label-caps mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-on-surface uppercase font-label-caps mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Create & Launch Tournament
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
