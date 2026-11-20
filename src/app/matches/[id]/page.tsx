'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLiveMatch } from '@/hooks/useLiveMatch';
import { ScoreboardHero } from '@/components/matches/ScoreboardHero';
import { MatchTimeline } from '@/components/matches/MatchTimeline';
import { PenaltyShootoutView } from '@/components/matches/PenaltyShootoutView';
import { TacticalPitch } from '@/components/matches/TacticalPitch';
import { BylawsNotice } from '@/components/matches/BylawsNotice';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { ArrowLeft, MapPin, Users, Calendar, Radio } from 'lucide-react';
import { formatDate } from '@/utils/formatters';

export default function MatchDetailPage() {
  const params = useParams();
  const matchId = (params?.id as string) || '';
  const { match, timeline, isConnected, lastEvent, loading } = useLiveMatch(matchId);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'tactics'>('overview');

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Breadcrumb & Stage Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">
            <Link href="/" className="hover:text-primary-container transition-colors">Home</Link>
            <span>/</span>
            <Link href="/live" className="hover:text-primary-container transition-colors">Live Matches</Link>
            <span>/</span>
            <span className="text-on-surface font-extrabold">{match.teamA?.name || 'Team A'} vs {match.teamB?.name || 'Team B'}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-1">
            <Link
              href="/live"
              className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface mr-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Link>
            <h1 className="font-headline-md text-headline-md text-on-surface font-black tracking-tight">
              {match.stage || 'Grand Inter-College Championship'}
            </h1>
            <span className="bg-primary-container text-white font-label-caps text-label-caps px-2.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold">
              Official Tournament Match
            </span>
            {lastEvent && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-container/40 text-on-secondary-container text-xs font-bold">
                <Radio className="w-3 h-3 text-secondary animate-pulse" />
                {lastEvent}
              </span>
            )}
          </div>
        </div>

        {/* Stadium & Attendance Pill */}
        <div className="flex items-center gap-4 text-xs font-semibold text-on-surface-variant bg-surface-container-lowest px-4 py-2.5 rounded-xl border border-surface-container-high shadow-xs">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-primary-container shrink-0" />
            <span>{match.venue || 'State Memorial Stadium • Grass Turf'}</span>
          </div>
          <div className="h-3 w-px bg-surface-container-high" />
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-primary-container shrink-0" />
            <span>Att: <strong className="text-on-surface">{match.attendance || '4,820'}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Scoreboard Hero with Real-Time Countdown & Sockets */}
      <ScoreboardHero match={match} isConnected={isConnected} />

      {/* Penalty Shootout section (if applicable) */}
      <PenaltyShootoutView
        penalties={match.penalties}
        teamAName={match.teamA.name}
        teamBName={match.teamB.name}
      />

      {/* Navigation Tabs for Match Center */}
      <div className="flex items-center gap-2 border-b border-surface-container-high mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-4 font-headline-sm text-sm border-b-2 font-bold transition-all ${activeTab === 'overview'
            ? 'text-primary-container border-primary-container'
            : 'text-on-surface-variant border-transparent hover:text-on-surface'
            }`}
        >
          Match Center Overview
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`py-3 px-4 font-headline-sm text-sm border-b-2 font-bold transition-all ${activeTab === 'timeline'
            ? 'text-primary-container border-primary-container'
            : 'text-on-surface-variant border-transparent hover:text-on-surface'
            }`}
        >
          Event Log & Timeline ({timeline.length})
        </button>
        <button
          onClick={() => setActiveTab('tactics')}
          className={`py-3 px-4 font-headline-sm text-sm border-b-2 font-bold transition-all ${activeTab === 'tactics'
            ? 'text-primary-container border-primary-container'
            : 'text-on-surface-variant border-transparent hover:text-on-surface'
            }`}
        >
          Tactical Formations & Bench
        </button>
      </div>

      {/* Content depending on selected tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (7 cols): Tactical pitch & bylaws */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <TacticalPitch teamAName={match.teamA.name} teamBName={match.teamB.name} />
            <BylawsNotice />
          </div>

          {/* Right Column (5 cols): Live Timeline */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <MatchTimeline timeline={timeline} />
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="max-w-3xl mx-auto">
          <MatchTimeline timeline={timeline} />
        </div>
      )}

      {activeTab === 'tactics' && (
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          <TacticalPitch teamAName={match.teamA.name} teamBName={match.teamB.name} />
          <BylawsNotice />
        </div>
      )}
    </div>
  );
}
