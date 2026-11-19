import React from 'react';
import Link from 'next/link';
import { TournamentStandingRow } from '@/types';

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
              <th className="py-4 px-2 text-center">D</th>
              <th className="py-4 px-2 text-center">L</th>
              <th className="py-4 px-2 text-center">GF</th>
              <th className="py-4 px-2 text-center">GA</th>
              <th className="py-4 px-2 text-center">GD</th>
              <th className="py-4 px-4 text-center bg-surface-container font-headline-sm text-on-surface font-extrabold">
                PTS
              </th>
              <th className="py-4 px-4 text-center min-w-[170px]">FORM (LAST 5)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {standings.map((row, idx) => {
              const isTop2 = idx < 2;
              const isWildcard = idx >= 2 && idx < 4;
              const isRelegation = idx >= standings.length - 2;

              return (
                <tr
                  key={row._id || row.team._id || idx}
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
                      {row.position}
                    </span>
                  </td>

                  {/* Team */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-on-surface font-black shadow-xs text-sm border border-surface-container-high">
                        {row.team.name.slice(0, 1)}
                      </div>
                      <div>
                        <div className="font-headline-sm text-headline-sm text-on-surface font-black flex items-center gap-2">
                          <Link href={`/teams/${row.team._id}`} className="hover:text-primary-container transition-colors">
                            {row.team.name}
                          </Link>
                          {isTop2 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-label-caps bg-on-tertiary-container text-primary-container font-extrabold uppercase">
                              SEMIS
                            </span>
                          )}
                          {isWildcard && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-label-caps bg-surface-container-high text-tertiary font-bold uppercase">
                              WILDCARD
                            </span>
                          )}
                          {isRelegation && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-label-caps bg-error-container text-error font-bold uppercase">
                              PLAYDOWN
                            </span>
                          )}
                        </div>
                        <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
                          {row.team.conference || 'Pac-West Collegiate Conference'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* MP, W, D, L, GF, GA, GD */}
                  <td className="py-4 px-2 text-center text-on-surface font-medium tabular-nums">{row.matchesPlayed}</td>
                  <td className="py-4 px-2 text-center text-on-surface font-bold tabular-nums">{row.matchesWon}</td>
                  <td className="py-4 px-2 text-center text-on-surface-variant tabular-nums">{row.matchesDrawn ?? 0}</td>
                  <td className="py-4 px-2 text-center text-on-surface-variant tabular-nums">{row.matchesLost}</td>
                  <td className="py-4 px-2 text-center text-on-surface font-medium tabular-nums">{row.goalsScored}</td>
                  <td className="py-4 px-2 text-center text-on-surface font-medium tabular-nums">{row.goalsConceded}</td>
                  <td
                    className={`py-4 px-2 text-center font-headline-sm text-headline-sm font-extrabold tabular-nums ${
                      row.goalDifference > 0
                        ? 'text-primary-container'
                        : row.goalDifference < 0
                        ? 'text-error'
                        : 'text-on-surface-variant'
                    }`}
                  >
                    {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                  </td>

                  {/* PTS */}
                  <td className="py-4 px-4 text-center bg-surface-container/60 font-stat-numeral text-headline-md text-primary-container font-black tabular-nums">
                    {row.totalPoints}
                  </td>

                  {/* Form */}
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-1">
                      {(row.form || ['W', 'W', 'D', 'W', 'L']).map((f, i) => (
                        <span
                          key={i}
                          className={`w-6 h-6 rounded-full font-label-caps text-label-caps text-center flex items-center justify-center font-bold ${
                            f === 'W'
                              ? 'bg-on-tertiary-container text-primary-container shadow-xs'
                              : f === 'D'
                              ? 'bg-surface-container text-on-surface-variant'
                              : 'bg-error-container text-error'
                          }`}
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
