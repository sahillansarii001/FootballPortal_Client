import React from 'react';
import Link from 'next/link';
import { TournamentStandingRow } from '@/types';
import { getCaptainDisplayName } from '@/utils/formatters';

interface StandingsTableProps {
  standings: TournamentStandingRow[];
}

export const StandingsTable: React.FC<StandingsTableProps> = ({ standings }) => {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-md border border-surface-container-high overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-body-md text-body-md">
          <thead>
            <tr className="bg-surface-container-low font-label-caps text-label-caps text-on-surface-variant tracking-wider uppercase border-b border-surface-container-high">
              <th className="py-4 pl-4 pr-2 text-center w-12">POS</th>
              <th className="py-4 px-4 min-w-[240px]">TEAM</th>
              <th className="py-4 px-2 text-center">MP</th>
              <th className="py-4 px-2 text-center">W</th>
              <th className="py-4 px-2 text-center">L</th>
              <th className="py-4 px-2 text-center">GF</th>
              <th className="py-4 px-2 text-center">GA</th>
              <th className="py-4 px-2 text-center">GD</th>
              <th className="py-4 px-4 text-center bg-surface-container font-headline-sm text-on-surface font-extrabold">
                PTS
              </th>
              <th className="py-4 px-4 text-center min-w-[130px]">FORM (LAST 3)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {standings.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-on-surface-variant font-medium">
                  No tournament standings recorded yet. Standings will appear automatically as matches are played.
                </td>
              </tr>
            ) : (
              standings.map((row, idx) => {
                const isTop2 = idx < 2;
                const isWildcard = idx >= 2 && idx < 4;
                const isRelegation = idx >= standings.length - 2;
                const teamId = typeof row.team === 'object' && row.team?._id ? row.team._id : (typeof row.team === 'string' ? row.team : '');
                const teamName = typeof row.team === 'object' && row.team?.name ? row.team.name : 'Team';
                const captainName = typeof row.team === 'object' && row.team?.captain ? getCaptainDisplayName(row.team.captain) : 'Team';

                return (
                  <tr
                    key={row._id || teamId || idx}
                    className={`hover:bg-surface-container-low transition-colors relative group ${
                      idx === 0
                        ? 'bg-gradient-to-r from-on-tertiary-container/30 via-surface-container-lowest to-surface-container-lowest'
                        : ''
                    }`}
                  >
                    {/* Position with left border indicator */}
                    <td className="py-4 pl-4 pr-2 text-center font-headline-sm text-headline-sm relative">
                      <span
                        className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                          isTop2
                            ? 'bg-primary-container'
                            : isWildcard
                            ? 'bg-tertiary-container'
                            : isRelegation
                            ? 'bg-error'
                            : 'bg-transparent'
                        }`}
                      />
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black shadow-xs ${
                          isTop2
                            ? 'bg-primary-container text-on-primary ring-2 ring-primary-fixed/40'
                            : isWildcard
                            ? 'bg-tertiary-container text-white'
                            : 'bg-surface-container text-on-surface'
                        }`}
                      >
                        {row.position || idx + 1}
                      </span>
                    </td>

                    {/* Team */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-on-surface font-black shadow-xs text-sm border border-surface-container-high">
                          {teamName.slice(0, 1)}
                        </div>
                        <div>
                          <div className="font-headline-sm text-headline-sm text-on-surface font-black flex items-center gap-2">
                            {teamId ? (
                              <Link href={`/teams/${teamId}`} className="hover:text-primary-container transition-colors">
                                {teamName}
                              </Link>
                            ) : (
                              <span>{teamName}</span>
                            )}
                          </div>
                          <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
                            Captain: {captainName}
                          </span>
                        </div>
                      </div>
                    </td>

                  {/* MP, W, L, GF, GA, GD */}
                  <td className="py-4 px-2 text-center text-on-surface font-medium tabular-nums">{row.matchesPlayed ?? 0}</td>
                  <td className="py-4 px-2 text-center text-on-surface font-bold tabular-nums">{row.matchesWon ?? (row as any).won ?? 0}</td>
                  <td className="py-4 px-2 text-center text-on-surface-variant tabular-nums">{row.matchesLost ?? (row as any).lost ?? 0}</td>
                  <td className="py-4 px-2 text-center text-on-surface font-medium tabular-nums">{row.goalsScored ?? (row as any).goalsFor ?? 0}</td>
                  <td className="py-4 px-2 text-center text-on-surface font-medium tabular-nums">{row.goalsConceded ?? (row as any).goalsAgainst ?? 0}</td>
                  <td
                    className={`py-4 px-2 text-center font-headline-sm text-headline-sm font-extrabold tabular-nums ${
                      row.goalDifference > 0
                        ? 'text-primary-container'
                        : row.goalDifference < 0
                        ? 'text-error'
                        : 'text-on-surface-variant'
                    }`}
                  >
                    {row.goalDifference > 0 ? `+${row.goalDifference}` : (row.goalDifference ?? 0)}
                  </td>

                  {/* PTS */}
                  <td className="py-4 px-4 text-center bg-surface-container/60 font-stat-numeral text-headline-md text-primary-container font-black tabular-nums">
                    {row.totalPoints ?? (row as any).points ?? 0}
                  </td>

                  {/* Form (Last 3) */}
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      {(row.form && row.form.length > 0 ? row.form : ['W', 'L', 'W'])
                        .slice(-3)
                        .map((f, i) => {
                          const outcome = f === 'L' ? 'L' : 'W';
                          return (
                            <span
                              key={i}
                              className={`w-6 h-6 rounded-full font-label-caps text-label-caps text-center flex items-center justify-center font-black text-[10px] shadow-xs ${
                                outcome === 'W'
                                  ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-400/40'
                                  : 'bg-rose-100 text-rose-800 ring-1 ring-rose-400/40'
                              }`}
                            >
                              {outcome}
                            </span>
                          );
                        })}
                    </div>
                  </td>
                </tr>
              );
            }))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
