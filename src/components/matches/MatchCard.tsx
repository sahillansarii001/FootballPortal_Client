import React from 'react';
import Link from 'next/link';
import { Clock, MapPin, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Match } from '@/types';
import { formatTime, formatShortDate } from '@/utils/formatters';

interface MatchCardProps {
  match: Match;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const isLive = match.status === 'Live' || match.status === 'Half-Time' || match.status === 'Penalty Shootout';
  const isCompleted = match.status === 'Completed';

  const teamAName = (typeof match.teamA === 'object' && match.teamA?.name) ? match.teamA.name : 'Team A';
  const teamBName = (typeof match.teamB === 'object' && match.teamB?.name) ? match.teamB.name : 'Team B';
  const teamALogo = (typeof match.teamA === 'object' && match.teamA?.logo) ? match.teamA.logo : null;
  const teamBLogo = (typeof match.teamB === 'object' && match.teamB?.logo) ? match.teamB.logo : null;

  const scoreA = match.score?.teamA ?? match.teamAScore ?? 0;
  const scoreB = match.score?.teamB ?? match.teamBScore ?? 0;

  const shootoutState: any = match.shootout || match.penalties?.shootoutState;
  const penA = shootoutState?.teamAPenaltyScore ?? 0;
  const penB = shootoutState?.teamBPenaltyScore ?? 0;
  const showPenalties = Boolean(
    shootoutState?.isShootout || shootoutState?.isCompleted || penA > 0 || penB > 0
  );

  const dateStr = formatShortDate(match.matchDate) || 'Upcoming';
  const timeStr = match.matchTime || '04:00 PM';

  return (
    <Link
      href={`/matches/${match._id}`}
      className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-400/60 transition-all flex flex-col justify-between group relative overflow-hidden"
    >
      {/* Top Strip: Date/Time Badge & Live/Status Pill */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <span className="text-xs font-bold text-slate-800">
          {dateStr}, {timeStr}
        </span>

        {isLive ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500 text-white font-extrabold text-[10px] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </span>
        ) : isCompleted ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            FT: {scoreA} - {scoreB}
          </span>
        ) : (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold text-[10px] uppercase tracking-wider">
            {match.stage || 'Fixture'}
          </span>
        )}
      </div>

      {/* Main Clash Row (Matching Reference Screen 4) */}
      <div className="flex items-center justify-between py-4 gap-2">
        {/* Team A */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-800 text-xs overflow-hidden shrink-0 shadow-xs group-hover:scale-105 transition-transform">
            {teamALogo ? (
              <img src={teamALogo} alt={teamAName} className="w-full h-full object-cover" />
            ) : (
              <span>{teamAName.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <span className="font-bold text-sm text-slate-900 truncate group-hover:text-blue-600 transition-colors">
            {teamAName}
          </span>
        </div>

        {/* Center: vs or Score */}
        <div className="flex flex-col items-center justify-center px-2 shrink-0">
          {isLive || isCompleted ? (
            <div className="flex items-center gap-1.5 font-black text-lg text-slate-900 tabular-nums">
              <span>{scoreA}</span>
              <span className="text-slate-300">-</span>
              <span>{scoreB}</span>
            </div>
          ) : (
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
              vs
            </span>
          )}
        </div>

        {/* Team B */}
        <div className="flex items-center justify-end gap-3 flex-1 min-w-0 text-right">
          <span className="font-bold text-sm text-slate-900 truncate group-hover:text-blue-600 transition-colors">
            {teamBName}
          </span>
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-800 text-xs overflow-hidden shrink-0 shadow-xs group-hover:scale-105 transition-transform">
            {teamBLogo ? (
              <img src={teamBLogo} alt={teamBName} className="w-full h-full object-cover" />
            ) : (
              <span>{teamBName.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
        </div>

        {/* Chevron > */}
        <div className="w-7 h-7 rounded-full bg-slate-50 group-hover:bg-blue-600 group-hover:text-white text-slate-400 flex items-center justify-center shrink-0 ml-1 transition-all">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      {/* Bottom Venue Strip */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2.5 border-t border-slate-100">
        <span className="flex items-center gap-1.5 truncate">
          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="truncate">{match.venue || 'Main Ground'}</span>
        </span>
        {showPenalties && (
          <span className="font-bold text-purple-700 text-[11px]">
            Penalties: {penA} - {penB}
          </span>
        )}
      </div>
    </Link>
  );
};
