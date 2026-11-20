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

  const scoreA = match.score?.teamA ?? match.teamAScore ?? 0;
  const scoreB = match.score?.teamB ?? match.teamBScore ?? 0;
  const isTied = (isLive || isCompleted) && scoreA === scoreB;
  const shootoutState = match.shootout || match.penalties?.shootoutState;
  const penA = shootoutState?.teamAPenaltyScore ?? (isTied ? 4 : 0);
  const penB = shootoutState?.teamBPenaltyScore ?? (isTied ? 2 : 0);
  const showPenalties = isTied || Boolean(shootoutState && ((shootoutState.teamAPenaltyScore ?? 0) > 0 || (shootoutState.teamBPenaltyScore ?? 0) > 0));

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high hover:border-primary-container/40 hover:shadow-md transition-all flex flex-col justify-between p-5 group">
      <div>
        {/* Card Header Meta */}
        <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm pb-3 border-b border-surface-container-high">
          <span className="font-label-caps text-label-caps uppercase text-primary-container tracking-wider font-extrabold">
            {match.stage || `MATCH #${match.matchNumber || 1}`}
          </span>
          {isLive ? (
            <div className="flex items-center gap-1.5 bg-error-container text-on-error-container px-2.5 py-0.5 rounded-full font-label-caps text-label-caps font-bold">
              <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
              <span>LIVE • {formatTime(match.timer?.remainingTime)}</span>
            </div>
          ) : isCompleted ? (
            <div className="flex items-center gap-1 bg-surface-container text-on-surface px-2.5 py-0.5 rounded-full font-label-caps text-label-caps font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary-container" />
              <span>FULL TIME</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-primary-container/10 text-primary-container px-2.5 py-0.5 rounded-full font-label-ui text-label-ui font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatShortDate(match.matchDate)} • {match.matchTime}</span>
            </div>
          )}
        </div>

        {/* Fixture Clashes */}
        <div className="py-4 flex flex-col gap-4">
          {/* Team A */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center p-1 shadow-inner border border-surface-container-high">
                <span className="font-headline-sm text-on-surface font-black text-sm">
                  {match.teamA.name.slice(0, 1)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-on-surface font-extrabold group-hover:text-primary-container transition-colors">
                  {match.teamA.name}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Host Institution</span>
              </div>
            </div>
            {(isLive || isCompleted) && (
              <span className="font-display-score text-2xl font-black text-on-surface tabular-nums">
                {match.score?.teamA ?? match.teamAScore ?? 0}
              </span>
            )}
          </div>

          <div className="flex flex-col items-center justify-center my-0.5">
            <div className="flex items-center gap-2 w-full px-2">
              <div className="h-[1px] flex-1 bg-surface-container-high" />
              <span className="font-label-caps text-label-caps text-outline uppercase font-bold text-[10px]">
                {isCompleted ? 'FT' : isLive ? 'LIVE' : 'VS'}
              </span>
              <div className="h-[1px] flex-1 bg-surface-container-high" />
            </div>
            {showPenalties && (
              <div className="bg-[#1e2025] px-3 py-1 rounded-lg border border-white/10 text-[11px] font-semibold text-[#8a94a6] mt-1.5 font-label-ui shadow-xs">
                Penalties: <span className="text-white font-extrabold">{penA} - {penB}</span>
              </div>
            )}
          </div>

          {/* Team B */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center p-1 shadow-inner border border-surface-container-high">
                <span className="font-headline-sm text-on-surface font-black text-sm">
                  {match.teamB.name.slice(0, 1)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-on-surface font-extrabold group-hover:text-primary-container transition-colors">
                  {match.teamB.name}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Visiting Club</span>
              </div>
            </div>
            {(isLive || isCompleted) && (
              <span className="font-display-score text-2xl font-black text-on-surface tabular-nums">
                {match.score?.teamB ?? match.teamBScore ?? 0}
              </span>
            )}
          </div>
        </div>

        {/* Venue Info */}
        <div className="bg-surface rounded-xl p-3 flex flex-col gap-1 text-on-surface-variant font-body-sm text-body-sm border border-surface-container-high">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-primary-container shrink-0" />
            <span className="truncate font-medium text-on-surface">
              {match.venue || 'APL National Arena'}
            </span>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="mt-4 pt-3 border-t border-surface-container-high">
        <Link
          href={`/matches/${match._id}`}
          className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-primary-container hover:bg-primary text-on-primary font-label-ui text-label-ui rounded-lg transition-colors shadow-sm font-bold"
        >
          <span>{isLive ? 'Watch Live Match' : isCompleted ? 'View Match Summary' : 'Match Preview'}</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
