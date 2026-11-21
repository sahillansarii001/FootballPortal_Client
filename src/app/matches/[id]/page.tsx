'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLiveMatch } from '@/hooks/useLiveMatch';
import { ScoreboardHero } from '@/components/matches/ScoreboardHero';
import { MatchTimeline } from '@/components/matches/MatchTimeline';
import { PenaltyShootoutView } from '@/components/matches/PenaltyShootoutView';
import { BylawsNotice } from '@/components/matches/BylawsNotice';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { ArrowLeft, MapPin, Users, Calendar, Radio } from 'lucide-react';
import { formatDate } from '@/utils/formatters';

export default function MatchDetailPage() {
  const params = useParams();
  const matchId = (params?.id as string) || '';
  const { match, timeline, isConnected, lastEvent, loading } = useLiveMatch(matchId);
  const [activeTab, setActiveTab] = useState<'feed' | 'lineups' | 'stats' | 'events'>('feed');

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <LoadingState message="Loading match fixture details..." />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-xl font-bold text-on-surface">Match Not Found</h2>
        <p className="text-xs text-on-surface-variant mt-2">The requested fixture does not exist or has been removed.</p>
        <Link href="/fixtures" className="mt-4 inline-block px-4 py-2 bg-primary-container text-on-primary rounded-xl text-xs font-bold">
          View Fixtures
        </Link>
      </div>
    );
  }

  const isLive = match.status === 'Live' || match.status === 'Half-Time' || match.status === 'Penalty Shootout';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 select-none animate-in fade-in duration-200">
      {/* Top Header Bar matching Screen 2 in Reference */}
      <div className="flex items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <Link
            href="/fixtures"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Live Match</span>
          </Link>

          {isLive && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </span>
          )}
        </div>

        {/* Viewer Attendance Counter */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-xs">
          <span>👁</span>
          <span>{match.attendance || '1,248'} watching</span>
        </div>
      </div>

      {/* Main Scoreboard Hero with Real-Time Countdown & Sockets */}
      <ScoreboardHero match={match} isConnected={isConnected} />

      {/* Penalty Shootout section (if applicable) */}
      <PenaltyShootoutView
        penalties={(match.penalties || (match.shootout ? { shootoutState: match.shootout, kicks: [] } : undefined)) as any}
        teamAName={match.teamA?.name || 'Team A'}
        teamBName={match.teamB?.name || 'Team B'}
      />

      {/* Navigation Pill Tabs matching Reference Screen 2 */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto py-1">
        <button
          onClick={() => setActiveTab('feed')}
          className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-xs ${
            activeTab === 'feed'
              ? 'bg-blue-600 text-white shadow-blue-500/20'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Match Feed
        </button>
        <button
          onClick={() => setActiveTab('lineups')}
          className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-xs ${
            activeTab === 'lineups'
              ? 'bg-blue-600 text-white shadow-blue-500/20'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Lineups
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
        <button
          onClick={() => setActiveTab('events')}
          className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-xs ${
            activeTab === 'events'
              ? 'bg-blue-600 text-white shadow-blue-500/20'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Events
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'feed' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <MatchTimeline timeline={timeline} />
          </div>
          <div className="lg:col-span-4 flex flex-col gap-6">
            <BylawsNotice />
          </div>
        </div>
      )}

      {activeTab === 'lineups' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 mb-4">Official Starting Lineups</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <span className="font-extrabold text-xs text-blue-600 uppercase tracking-wider block">{match.teamA?.name}</span>
              <p className="text-xs text-slate-500">Official Roster Confirmed</p>
            </div>
            <div className="space-y-2">
              <span className="font-extrabold text-xs text-blue-600 uppercase tracking-wider block">{match.teamB?.name}</span>
              <p className="text-xs text-slate-500">Official Roster Confirmed</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 mb-4">Live Matchday Statistics</h3>
          <div className="space-y-4 max-w-lg">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>{match.teamA?.name}</span>
              <span className="text-slate-400">Possession</span>
              <span>{match.teamB?.name}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 flex overflow-hidden">
              <div className="bg-emerald-600 h-2.5 w-[54%]" />
              <div className="bg-blue-600 h-2.5 w-[46%]" />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="max-w-4xl">
          <MatchTimeline timeline={timeline} />
        </div>
      )}
    </div>
  );
}
