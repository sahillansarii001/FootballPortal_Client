import React from 'react';
import Link from 'next/link';
import { ListOrdered, ArrowRight } from 'lucide-react';
import { TournamentStandingRow } from '@/types';

interface StandingsPreviewProps {
  standings: TournamentStandingRow[];
}

export const StandingsPreview: React.FC<StandingsPreviewProps> = ({ standings }) => {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-surface-container" id="standings-preview">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-surface-container">
        <div className="flex items-center gap-2">
          <ListOrdered className="w-5 h-5 text-primary-container" />
          <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
            League Standings Preview
          </h3>
        </div>
        <Link
          href="/standings"
          className="font-label-caps text-label-caps text-primary-container hover:underline uppercase font-bold flex items-center gap-1"
        >
          <span>View Full Standings</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-body-sm text-body-sm">
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant font-label-caps text-label-caps uppercase">
              <th className="py-2 px-2 text-center">POS</th>
              <th className="py-2 px-2">TEAM</th>
              <th className="py-2 px-1 text-center">MP</th>
              <th className="py-2 px-1 text-center">W</th>
              <th className="py-2 px-1 text-center">L</th>
              <th className="py-2 px-1 text-center">GF</th>
              <th className="py-2 px-1 text-center">GA</th>
              <th className="py-2 px-1 text-center">GD</th>
              <th className="py-2 px-2 text-right">PTS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {!standings || standings.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-on-surface-variant font-medium">
                  No tournament standings recorded yet.
                </td>
              </tr>
            ) : (
              standings.slice(0, 5).map((row, idx) => {
                const teamId = typeof row.team === 'object' && row.team?._id ? row.team._id : (typeof row.team === 'string' ? row.team : '');
                const teamName = typeof row.team === 'object' && row.team?.name ? row.team.name : 'Team';

                return (
                  <tr
                    key={row._id || teamId || idx}
                    className={`hover:bg-surface-container-low/40 transition-colors ${
                      idx === 0 ? 'bg-secondary-container/20' : ''
                    }`}
                  >
                    <td className="py-2.5 px-2 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                          idx < 2
                            ? 'bg-secondary-container/60 text-on-secondary-container ring-1 ring-secondary-container'
                            : 'bg-surface-container text-on-surface'
                        }`}
                      >
                        {row.position || idx + 1}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 font-headline-sm text-headline-sm text-on-surface font-bold">
                      {teamId ? (
                        <Link href={`/teams/${teamId}`} className="hover:text-primary-container transition-colors truncate block">
                          {teamName}
                        </Link>
                      ) : (
                        <span className="truncate block">{teamName}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-1 text-center text-on-surface-variant font-medium tabular-nums">{row.matchesPlayed || 0}</td>
                    <td className="py-2.5 px-1 text-center text-on-surface-variant font-medium tabular-nums">{row.matchesWon ?? (row as any).won ?? 0}</td>
                    <td className="py-2.5 px-1 text-center text-on-surface-variant font-medium tabular-nums">{row.matchesLost ?? (row as any).lost ?? 0}</td>
                    <td className="py-2.5 px-1 text-center text-on-surface-variant font-medium tabular-nums">{row.goalsScored ?? (row as any).goalsFor ?? 0}</td>
                    <td className="py-2.5 px-1 text-center text-on-surface-variant font-medium tabular-nums">{row.goalsConceded ?? (row as any).goalsAgainst ?? 0}</td>
                    <td className="py-2.5 px-1 text-center font-bold tabular-nums">
                      {(row.goalDifference || 0) > 0 ? `+${row.goalDifference}` : (row.goalDifference || 0)}
                    </td>
                    <td className="py-2.5 px-2 text-right font-headline-sm text-headline-sm text-primary-container font-extrabold tabular-nums">
                      {row.totalPoints ?? (row as any).points ?? 0}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Promotion note */}
      <div className="mt-3 pt-2 text-center border-t border-surface-container flex items-center justify-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">
          Top 2 advance to championship playoffs
        </span>
      </div>
    </div>
  );
};
