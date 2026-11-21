import React from 'react';
import Link from 'next/link';
import { ChevronRight, Shield, Award } from 'lucide-react';
import { Player } from '@/types';

interface PlayerCardProps {
  player: Player;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
  const teamName = typeof player.team === 'object' && player.team ? player.team.name : 'Independent Club';

  const getPositionBadge = (pos?: string) => {
    switch (pos) {
      case 'Forward':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Midfielder':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Defender':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Goalkeeper':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <article className="bg-white rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-blue-400/60 hover:-translate-y-0.5 transition-all flex flex-col justify-between border border-slate-200/80 group">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between mb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-display-score text-base font-black shadow-2xs ring-2 ring-blue-500/10">
              #{player.jerseyNumber ?? '??'}
            </div>
            <div>
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${getPositionBadge(player.position)}`}>
                {player.position || 'Forward'}
              </span>
              <h2 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight mt-0.5">
                {player.name}
              </h2>
            </div>
          </div>
        </div>

        {/* Team affiliation */}
        <div className="flex items-center justify-between text-xs text-slate-600 font-medium mb-3.5 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-1.5 truncate">
            <Shield className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="font-bold text-slate-800 truncate">{teamName}</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200 truncate shrink-0 ml-2">
            {player.club || 'Independent Club'}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl mb-4 text-center border border-slate-100">
          <div>
            <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">GOALS</div>
            <div className="text-base text-blue-600 font-black tabular-nums">
              {player.goals ?? 0}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">MATCHES</div>
            <div className="text-base text-slate-900 font-black tabular-nums">
              {player.matchesPlayed ?? 0}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">PENALTIES</div>
            <div className="text-base text-slate-900 font-black tabular-nums">
              {player.penaltiesScored ?? 0}
            </div>
          </div>
        </div>
      </div>

      {/* Button */}
      <Link
        href={`/players/${player._id}`}
        className="w-full py-2.5 bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs font-bold border border-slate-200/80 hover:border-blue-600 shadow-2xs group-hover:shadow-xs"
      >
        <span>View Player Profile</span>
        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </article>
  );
};
