import React from 'react';
import Link from 'next/link';
import { Calendar, Info, MapPin } from 'lucide-react';
import { Match } from '@/types';
import { formatShortDate } from '@/utils/formatters';

interface UpcomingFixturesProps {
  matches: Match[];
}

export const UpcomingFixtures: React.FC<UpcomingFixturesProps> = ({ matches }) => {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-surface-container">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-container" />
          <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
            Upcoming Fixtures
          </h3>
        </div>
        <span className="px-2 py-0.5 rounded bg-surface-container-low font-label-caps text-label-caps text-on-surface-variant font-semibold tracking-wider">
          GROUP STAGE
        </span>
      </div>

      {/* Fixtures List */}
      <div className="space-y-3">
        {matches.slice(0, 3).map((match) => (
          <div
            key={match._id}
            className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-surface-container/60 shadow-xs"
          >
            <div className="flex items-center gap-4">
              {/* Date Box */}
              <div className="flex flex-col text-center w-14 shrink-0 py-1.5 bg-surface-container-lowest rounded-lg shadow-xs border border-surface-container">
                <span className="font-label-caps text-[10px] text-primary-container uppercase font-extrabold">
                  {formatShortDate(match.matchDate) || 'OCT 24'}
                </span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-black">
                  {match.matchTime ? match.matchTime.split(' ')[0] : '16:30'}
                </span>
              </div>

              {/* Match Teams & Venue */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-extrabold">
                    {match.teamA.name}
                  </span>
                  <span className="text-on-surface-variant font-body-sm font-medium">vs</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-extrabold">
                    {match.teamB.name}
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant font-medium flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-primary-container shrink-0" />
                  {match.venue || 'Central Stadium • Pitch 1 • Derby Clash'}
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <Link
                href={`/matches/${match._id}`}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-primary-container hover:text-on-primary text-primary-container font-label-ui text-label-ui border border-surface-container font-semibold transition-colors"
              >
                <Info className="w-3.5 h-3.5" />
                <span>View Details</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
