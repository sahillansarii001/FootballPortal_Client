import React from 'react';
import Link from 'next/link';
import { Calendar, Radio, Users, Shield, Trophy, Target, ArrowRight } from 'lucide-react';
import { TournamentOverviewStats, Match } from '@/types';
import { formatTime } from '@/utils/formatters';

interface HeroSectionProps {
  stats: TournamentOverviewStats;
  tournamentName?: string;
  liveMatch?: Match | null;
  upcomingMatch?: Match | null;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  stats,
  tournamentName = '2025',
  liveMatch,
  upcomingMatch,
}) => {
  const teamsCount = stats?.totalTeams ?? 12;
  const playersCount = stats?.totalPlayers ?? 180;
  const matchesCount = stats?.totalMatches ?? 24;
  const goalsCount = stats?.totalGoals ?? 56;

  // Live match details if active
  const liveTeamA = liveMatch?.teamA?.name || 'Team A';
  const liveTeamB = liveMatch?.teamB?.name || 'Team B';
  const liveScoreA = liveMatch?.score?.teamA ?? liveMatch?.teamAScore ?? 0;
  const liveScoreB = liveMatch?.score?.teamB ?? liveMatch?.teamBScore ?? 0;
  const liveStage = liveMatch?.timer?.currentStage || liveMatch?.currentStage || 'First Half';
  const liveTime = liveMatch?.timer?.remainingTime !== undefined ? formatTime(liveMatch.timer.remainingTime) : '00:00';
  const livePenA = liveMatch?.shootout?.teamAPenaltyScore ?? 0;
  const livePenB = liveMatch?.shootout?.teamBPenaltyScore ?? 0;
  const hasLivePenalties = Boolean(
    liveMatch?.shootout?.isShootout ||
    liveMatch?.status === 'Penalty Shootout' ||
    liveStage.toLowerCase().includes('penalty') ||
    livePenA > 0 ||
    livePenB > 0
  );
  const liveWinnerName =
    typeof liveMatch?.shootout?.shootoutWinner === 'object' && liveMatch?.shootout?.shootoutWinner?.name
      ? liveMatch.shootout.shootoutWinner.name
      : typeof liveMatch?.winner === 'object' && liveMatch?.winner?.name
        ? liveMatch.winner.name
        : livePenA > livePenB
          ? liveTeamA
          : livePenB > livePenA
            ? liveTeamB
            : null;

  // Upcoming fixture if scheduled
  const upcomingTeamA = upcomingMatch?.teamA?.name || 'Team A';
  const upcomingTeamB = upcomingMatch?.teamB?.name || 'Team B';
  const upcomingTimeStr = upcomingMatch?.matchTime || 'Upcoming';

  return (
    <div className="w-full flex flex-col gap-6 mb-12 select-none animate-in fade-in duration-300">
      {/* 1. FULL-WIDTH BACKGROUND HERO BANNER WITH STADIUM & SOCCER BALL */}
      <div className="relative w-full overflow-hidden bg-gradient-to-r from-sky-100 via-emerald-50 to-blue-50 border-b border-slate-200/80">
        {/* Background Image: Stadium with soccer ball on grass turf */}
        <div
          className="absolute inset-0 bg-cover bg-right sm:bg-center opacity-90 transition-transform duration-1000"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1920&auto=format&fit=crop')`,
          }}
        />

        {/* Crisp Gradient Overlay for Legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 via-50% to-white/30" />

        {/* Content Box aligned with maximum container width */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 flex flex-col justify-center">
          {/* Headline Typography */}
          <div className="flex flex-col max-w-2xl">
            <span className="font-serif italic text-slate-800 text-2xl sm:text-3xl font-bold tracking-tight">
              Inter College
            </span>
            <h1 className="font-sans font-black text-3xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight leading-tight uppercase mt-0.5">
              Football Championship
            </h1>
            <span className="font-sans font-black text-5xl sm:text-6xl lg:text-7xl text-blue-600 tracking-tight leading-none mt-1">
              {tournamentName.includes('20') ? tournamentName : '2025'}
            </span>
          </div>

          {/* Subtitle / Value Proposition */}
          <p className="text-xs sm:text-sm text-slate-600 font-semibold tracking-wide mt-4 flex items-center flex-wrap gap-2">
            <span>Live Matches</span>
            <span className="text-slate-300">•</span>
            <span>Real-time Scores</span>
            <span className="text-slate-300">•</span>
            <span>Player Stats</span>
            <span className="text-slate-300">•</span>
            <span>Rankings</span>
          </p>

          {/* CTA Action Buttons */}
          <div className="flex items-center flex-wrap gap-3.5 mt-7">
            <Link
              href={liveMatch ? `/matches/${liveMatch._id}` : '/live'}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-full shadow-lg shadow-blue-500/25 transition-all active:scale-95 group"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Live Matches</span>
            </Link>

            <Link
              href="/fixtures"
              className="inline-flex items-center gap-2 bg-white/95 hover:bg-white text-slate-800 font-bold text-xs sm:text-sm px-5 py-3 rounded-full border border-slate-200/90 shadow-xs transition-all active:scale-95"
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>View Fixtures</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Floating Container for Stat Cards & Featured Matches */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-6 -mt-6 sm:-mt-8 relative z-20">

      {/* 2. FOUR FLOATING STAT CARDS IN A ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Teams Stat Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow group">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Shield className="w-5 h-5" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight tabular-nums">
            {teamsCount}
          </span>
          <span className="text-xs font-bold text-slate-500 mt-0.5 uppercase tracking-wider">
            Teams
          </span>
        </div>

        {/* Players Stat Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow group">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight tabular-nums">
            {playersCount}
          </span>
          <span className="text-xs font-bold text-slate-500 mt-0.5 uppercase tracking-wider">
            Players
          </span>
        </div>

        {/* Matches Stat Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow group">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight tabular-nums">
            {matchesCount}
          </span>
          <span className="text-xs font-bold text-slate-500 mt-0.5 uppercase tracking-wider">
            Matches
          </span>
        </div>

        {/* Goals Stat Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow group">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Target className="w-5 h-5" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight tabular-nums">
            {goalsCount}
          </span>
          <span className="text-xs font-bold text-slate-500 mt-0.5 uppercase tracking-wider">
            Goals
          </span>
        </div>
      </div>

      {/* 3. FEATURED MATCH CARDS ROW (LIVE MATCH NOW + UPCOMING FIXTURE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Live Match Now Card */}
        {liveMatch ? (
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-blue-400/60 transition-all">
            {/* Card Top Strip */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Live Match Now
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                LIVE
              </span>
            </div>

            {/* Teams & Score Display */}
            <div className="flex items-center justify-between py-4 px-2">
              {/* Team A */}
              <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                <div className={`w-12 h-12 rounded-xl bg-slate-100 border flex items-center justify-center font-black text-sm overflow-hidden shrink-0 shadow-xs ${
                  liveWinnerName === liveTeamA ? 'border-emerald-500 ring-2 ring-emerald-500/40 text-emerald-700' : 'border-slate-200 text-slate-800'
                }`}>
                  {liveMatch?.teamA?.logo ? (
                    <img src={liveMatch.teamA.logo} alt={liveTeamA} className="w-full h-full object-cover" />
                  ) : (
                    <span>{(liveTeamA.slice(0, 2) || 'A').toUpperCase()}</span>
                  )}
                </div>
                <span className={`text-xs sm:text-sm truncate max-w-[120px] text-center flex items-center justify-center gap-1 ${
                  liveWinnerName === liveTeamA ? 'font-black text-emerald-700' : 'font-bold text-slate-900'
                }`}>
                  {liveWinnerName === liveTeamA && <span>🏆</span>}
                  <span>{liveTeamA}</span>
                </span>
              </div>

              {/* Score & Stage Pill */}
              <div className="flex flex-col items-center justify-center px-4">
                <div className="flex items-center gap-3 font-black text-2xl sm:text-3xl text-slate-900 tracking-tight tabular-nums">
                  <span>{liveScoreA}</span>
                  <span className="text-slate-300 font-light">-</span>
                  <span>{liveScoreB}</span>
                </div>
                {hasLivePenalties && (
                  <div className="mt-1 px-3 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-[11px] font-extrabold flex items-center gap-1 shadow-2xs">
                    <span>🥅</span>
                    <span>PK: {livePenA} - {livePenB}</span>
                    {liveWinnerName && (
                      <span className="text-emerald-700 font-black ml-0.5">({liveWinnerName} Won)</span>
                    )}
                  </div>
                )}
                <div className="mt-1 px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                  {liveStage} • {liveTime}
                </div>
              </div>

              {/* Team B */}
              <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                <div className={`w-12 h-12 rounded-xl bg-slate-100 border flex items-center justify-center font-black text-sm overflow-hidden shrink-0 shadow-xs ${
                  liveWinnerName === liveTeamB ? 'border-emerald-500 ring-2 ring-emerald-500/40 text-emerald-700' : 'border-slate-200 text-slate-800'
                }`}>
                  {liveMatch?.teamB?.logo ? (
                    <img src={liveMatch.teamB.logo} alt={liveTeamB} className="w-full h-full object-cover" />
                  ) : (
                    <span>{(liveTeamB.slice(0, 2) || 'B').toUpperCase()}</span>
                  )}
                </div>
                <span className={`text-xs sm:text-sm truncate max-w-[120px] text-center flex items-center justify-center gap-1 ${
                  liveWinnerName === liveTeamB ? 'font-black text-emerald-700' : 'font-bold text-slate-900'
                }`}>
                  <span>{liveTeamB}</span>
                  {liveWinnerName === liveTeamB && <span>🏆</span>}
                </span>
              </div>
            </div>

            {/* Action Link */}
            <Link
              href={`/matches/${liveMatch._id}`}
              className="w-full mt-1 py-2 text-center text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors"
            >
              Open Live Match Center →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-blue-400/60 transition-all min-h-[190px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Live Match Desk
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">
                OFF AIR
              </span>
            </div>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-xs font-bold text-slate-700">No Live Matches Underway</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                Check upcoming fixtures or review tournament standings below.
              </p>
            </div>
            <Link
              href="/fixtures"
              className="w-full mt-1 py-2 text-center text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors"
            >
              View Tournament Fixtures →
            </Link>
          </div>
        )}

        {/* Right: Upcoming Fixture Card */}
        {upcomingMatch ? (
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-blue-400/60 transition-all">
            {/* Card Top Strip */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Upcoming Fixture
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                {upcomingTimeStr}
              </span>
            </div>

            {/* Teams vs Display */}
            <div className="flex items-center justify-between py-4 px-2">
              {/* Team A */}
              <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center font-black text-emerald-800 text-sm overflow-hidden shrink-0 shadow-xs">
                  {upcomingMatch?.teamA?.logo ? (
                    <img src={upcomingMatch.teamA.logo} alt={upcomingTeamA} className="w-full h-full object-cover" />
                  ) : (
                    <span>{(upcomingTeamA.slice(0, 2) || 'A').toUpperCase()}</span>
                  )}
                </div>
                <span className="font-bold text-xs sm:text-sm text-slate-900 truncate max-w-[120px] text-center">
                  {upcomingTeamA}
                </span>
              </div>

              {/* VS Pill */}
              <div className="flex flex-col items-center justify-center px-4">
                <span className="text-sm font-black text-slate-400 tracking-wider">VS</span>
              </div>

              {/* Team B */}
              <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center font-black text-sky-800 text-sm overflow-hidden shrink-0 shadow-xs">
                  {upcomingMatch?.teamB?.logo ? (
                    <img src={upcomingMatch.teamB.logo} alt={upcomingTeamB} className="w-full h-full object-cover" />
                  ) : (
                    <span>{(upcomingTeamB.slice(0, 2) || 'B').toUpperCase()}</span>
                  )}
                </div>
                <span className="font-bold text-xs sm:text-sm text-slate-900 truncate max-w-[120px] text-center">
                  {upcomingTeamB}
                </span>
              </div>
            </div>

            {/* Action Link */}
            <Link
              href="/fixtures"
              className="w-full mt-1 py-2 text-center text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors"
            >
              View All Upcoming Fixtures →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-blue-400/60 transition-all min-h-[190px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Upcoming Fixture
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                SCHEDULE
              </span>
            </div>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-xs font-bold text-slate-700">No Upcoming Fixtures</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                All tournament fixtures have concluded or are pending scheduling.
              </p>
            </div>
            <Link
              href="/fixtures"
              className="w-full mt-1 py-2 text-center text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors"
            >
              View Full Schedule →
            </Link>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};
