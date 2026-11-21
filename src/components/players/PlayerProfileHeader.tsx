'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Player } from '@/types';
import { Shield } from 'lucide-react';

interface PlayerProfileHeaderProps {
  player: Player;
}

export const PlayerProfileHeader: React.FC<PlayerProfileHeaderProps> = ({ player }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'matches' | 'stats'>('overview');

  const teamId = typeof player.team === 'object' && player.team ? player.team._id : '';
  const teamName = typeof player.team === 'object' && player.team ? player.team.name : 'Alliance FC';

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-8 select-none">
      {/* 1. Header Profile Banner (Matching Screen 6 in Reference) */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-slate-100">
        {/* Athlete Portrait Avatar */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden shadow-xs flex items-center justify-center shrink-0 text-3xl font-black text-slate-800">
          {player.avatar ? (
            <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
          ) : (
            <span>👤</span>
          )}
        </div>

        {/* Bio Info */}
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {player.name}
          </h1>

          <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
            {teamId ? (
              <Link href={`/teams/${teamId}`} className="text-sm font-bold text-blue-600 hover:underline">
                {teamName}
              </Link>
            ) : (
              <span className="text-sm font-bold text-slate-700">{teamName}</span>
            )}
          </div>

          <div className="text-xs font-semibold text-slate-500 mt-0.5">
            #{player.jerseyNumber} • {player.position || 'Forward'}
          </div>
        </div>
      </div>

      {/* 2. Quick Stat Badges Strip (Matches, Goals, Assists, Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-6 border-b border-slate-100">
        <div className="bg-slate-50 rounded-xl p-3.5 text-center border border-slate-100">
          <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Matches</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block tabular-nums">
            {player.matchesPlayed ?? 0}
          </span>
        </div>

        <div className="bg-blue-50/60 rounded-xl p-3.5 text-center border border-blue-100">
          <span className="text-xs font-bold text-blue-600 block uppercase tracking-wider">Goals</span>
          <span className="text-xl sm:text-2xl font-black text-blue-700 mt-0.5 block tabular-nums">
            {player.goals ?? 0}
          </span>
        </div>

        <div className="bg-slate-50 rounded-xl p-3.5 text-center border border-slate-100">
          <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Assists</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block tabular-nums">
            {player.assists ?? 0}
          </span>
        </div>

        <div className="bg-amber-50/60 rounded-xl p-3.5 text-center border border-amber-100">
          <span className="text-xs font-bold text-amber-700 block uppercase tracking-wider">Cards</span>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <span className="w-3.5 h-4.5 bg-amber-400 rounded-xs inline-block shadow-2xs border border-amber-500/40" />
            <span className="text-xl sm:text-2xl font-black text-amber-900 tabular-nums">
              {(player as any).yellowCards ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs (Overview, Matches, Stats) */}
      <div className="flex items-center gap-2 pt-6 pb-5">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-xs ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-blue-500/20'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('matches')}
          className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-xs ${
            activeTab === 'matches'
              ? 'bg-blue-600 text-white shadow-blue-500/20'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Matches
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-xs ${
            activeTab === 'stats'
              ? 'bg-blue-600 text-white shadow-blue-500/20'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Stats
        </button>
      </div>

      {/* 4. Tab Content: Key-Value Information Table */}
      {activeTab === 'overview' && (
        <div className="divide-y divide-slate-100 text-xs sm:text-sm">
          <div className="py-3 flex justify-between items-center">
            <span className="text-slate-500 font-semibold">Full Name</span>
            <span className="font-bold text-slate-900">{player.name}</span>
          </div>
          <div className="py-3 flex justify-between items-center">
            <span className="text-slate-500 font-semibold">Team</span>
            <span className="font-bold text-blue-600">{teamName}</span>
          </div>
          <div className="py-3 flex justify-between items-center">
            <span className="text-slate-500 font-semibold">Position</span>
            <span className="font-bold text-slate-900">{player.position}</span>
          </div>
          <div className="py-3 flex justify-between items-center">
            <span className="text-slate-500 font-semibold">Jersey Number</span>
            <span className="font-bold text-slate-900">{player.jerseyNumber}</span>
          </div>
          <div className="py-3 flex justify-between items-center">
            <span className="text-slate-500 font-semibold">Youth / Origin Club</span>
            <span className="font-bold text-slate-900">{player.club || 'Independent Athletic Club'}</span>
          </div>
        </div>
      )}

      {activeTab === 'matches' && (
        <div className="py-4 text-center text-xs text-slate-500 font-medium">
          Participated in {player.matchesPlayed ?? 0} official championship matches.
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="divide-y divide-slate-100 text-xs sm:text-sm">
          <div className="py-3 flex justify-between items-center">
            <span className="text-slate-500 font-semibold">Penalties Scored</span>
            <span className="font-bold text-slate-900">{player.penaltiesScored ?? 0}</span>
          </div>
          <div className="py-3 flex justify-between items-center">
            <span className="text-slate-500 font-semibold">Penalties Saved</span>
            <span className="font-bold text-slate-900">{player.penaltiesSaved ?? 0}</span>
          </div>
          <div className="py-3 flex justify-between items-center">
            <span className="text-slate-500 font-semibold">Match Win Record</span>
            <span className="font-bold text-emerald-600">{player.wins ?? 0}W - {player.losses ?? 0}L</span>
          </div>
        </div>
      )}
    </div>
  );
};
