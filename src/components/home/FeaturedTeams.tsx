import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Team } from '@/types';

interface FeaturedTeamsProps {
  teams: Team[];
}

export const FeaturedTeams: React.FC<FeaturedTeamsProps> = ({ teams }) => {
  return (
    <section className="mb-12" id="featured-teams">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-2 border-b border-surface-container">
        <div>
          <span className="font-label-caps text-label-caps text-primary-container uppercase tracking-wider font-extrabold">
            Varsity Franchises
          </span>
          <h3 className="font-headline-lg text-headline-lg text-on-surface mt-1 font-bold tracking-tight">
            Featured Championship Teams
          </h3>
        </div>
        <Link
          href="/teams"
          className="font-headline-sm text-headline-sm text-primary-container hover:underline flex items-center gap-1 font-bold group"
        >
          <span>View All 16 Teams</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {teams.slice(0, 4).map((team) => (
          <Link
            key={team._id}
            href={`/teams/${team._id}`}
            className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-primary-container/15 text-primary-container flex items-center justify-center font-headline-md font-black text-xl border border-primary-container/20 shadow-xs">
                  {team.name.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <h4 className="font-headline-sm text-headline-sm text-on-surface font-extrabold truncate group-hover:text-primary-container transition-colors">
                    {team.name}
                  </h4>
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">
                    {team.seed || 'Rank #1'} • {team.stats?.totalPoints || 0} PTS
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-surface-container">
                <span className="font-body-sm text-body-sm text-on-surface-variant font-medium truncate">
                  Coach: {team.coach || 'Head Coach'}
                </span>
                <span className="px-2 py-0.5 rounded bg-secondary-container/40 text-on-secondary-container font-label-caps text-[10px] font-bold">
                  {team.form ? `Form: ${team.form.join('-')}` : 'Ready'}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
