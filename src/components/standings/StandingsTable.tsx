import React from 'react';
import Link from 'next/link';
import { TournamentStandingRow } from '@/types';

interface StandingsTableProps {
  standings: TournamentStandingRow[];
}

export const StandingsTable: React.FC<StandingsTableProps> = ({ standings }) => {
  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container-high overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[700px] text-left border-collapse font-body-md text-body-md">
          <thead>
            <tr className="bg-surface-container-low font-label-caps text-label-caps text-on-surface-variant tracking-wider uppercase border-b border-surface-container-high select-none">
              <th className="py-4 pl-4 pr-2 text-center w-14 font-black">POS</th>
              <th className="py-4 px-4 min-w-[200px] font-black">TEAM</th>
              <th className="py-4 px-3 text-center font-black">MP</th>
              <th className="py-4 px-3 text-center font-black">W</th>
              <th className="py-4 px-3 text-center font-black">D</th>
              <th className="py-4 px-3 text-center font-black">L</th>
              <th className="py-4 px-3 text-center font-black">GF</th>
              <th className="py-4 px-3 text-center font-black">GA</th>
              <th className="py-4 px-3 text-center font-black">GD</th>
              <th className="py-4 px-4 text-center bg-primary-container/10 text-primary-container font-headline-sm font-black w-20">
                PTS
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {standings.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-on-surface-variant font-medium">
                  No tournament standings recorded yet. Standings will appear automatically as matches are completed.
                </td>
              </tr>
            ) : (
              standings.map((row, idx) => {
                const isLeader = idx === 0;
                const isTop2 = idx < 2;
                const teamId =
                  typeof row.team === 'object' && row.team?._id
                    ? row.team._id
                    : typeof row.team === 'string'
                    ? row.team
                    : '';
                const teamName = typeof row.team === 'object' && row.team?.name ? row.team.name : 'Team';
                const teamLogo = typeof row.team === 'object' && row.team?.logo ? row.team.logo : null;

                const mp = row.matchesPlayed ?? 0;
                const w = row.matchesWon ?? (row as any).won ?? 0;
                const d = row.matchesDrawn ?? (row as any).drawn ?? 0;
                const l = row.matchesLost ?? (row as any).lost ?? 0;
                const gf = row.goalsScored ?? (row as any).goalsFor ?? 0;
                const ga = row.goalsConceded ?? (row as any).goalsAgainst ?? 0;
                const gd = row.goalDifference ?? gf - ga;
                const pts = row.totalPoints ?? (row as any).points ?? 0;

                return (
                  <tr
                    key={row._id || teamId || idx}
                    className={`hover:bg-surface-container-low transition-colors relative group ${
                      isLeader
                        ? 'bg-amber-500/[0.04]'
                        : isTop2
                        ? 'bg-primary-container/[0.02]'
                        : ''
                    }`}
                  >
                    {/* POS */}
                    <td className="py-4 pl-4 pr-2 text-center relative">
                      <span
                        className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                          isLeader
                            ? 'bg-amber-500'
                            : isTop2
                            ? 'bg-primary-container'
                            : 'bg-transparent'
                        }`}
                      />
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black shadow-xs ${
                          isLeader
                            ? 'bg-amber-400 text-slate-900 ring-2 ring-amber-300'
                            : isTop2
                            ? 'bg-primary-container text-on-primary ring-2 ring-primary-fixed/40'
                            : 'bg-surface-container text-on-surface'
                        }`}
                      >
                        {row.position || idx + 1}
                      </span>
                    </td>

                    {/* TEAM */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-on-surface font-black shadow-xs text-sm border border-surface-container-high overflow-hidden shrink-0">
                          {teamLogo ? (
                            <img src={teamLogo} alt={teamName} className="w-full h-full object-cover" />
                          ) : (
                            <span>{teamName.slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-headline-sm text-base text-on-surface font-black flex items-center gap-2">
                            {teamId ? (
                              <Link
                                href={`/teams/${teamId}`}
                                className="hover:text-primary-container transition-colors truncate"
                              >
                                {teamName}
                              </Link>
                            ) : (
                              <span className="truncate">{teamName}</span>
                            )}
                            {isLeader && (
                              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300/60 shrink-0">
                                Leader
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* MP */}
                    <td className="py-4 px-3 text-center text-on-surface font-semibold tabular-nums">{mp}</td>

                    {/* W */}
                    <td className="py-4 px-3 text-center text-on-surface font-bold tabular-nums">{w}</td>

                    {/* D */}
                    <td className="py-4 px-3 text-center text-on-surface-variant font-medium tabular-nums">{d}</td>

                    {/* L */}
                    <td className="py-4 px-3 text-center text-on-surface-variant font-medium tabular-nums">{l}</td>

                    {/* GF */}
                    <td className="py-4 px-3 text-center text-on-surface font-medium tabular-nums">{gf}</td>

                    {/* GA */}
                    <td className="py-4 px-3 text-center text-on-surface font-medium tabular-nums">{ga}</td>

                    {/* GD */}
                    <td
                      className={`py-4 px-3 text-center font-headline-sm text-base font-extrabold tabular-nums ${
                        gd > 0
                          ? 'text-emerald-600'
                          : gd < 0
                          ? 'text-rose-600'
                          : 'text-on-surface-variant'
                      }`}
                    >
                      {gd > 0 ? `+${gd}` : gd}
                    </td>

                    {/* PTS */}
                    <td className="py-4 px-4 text-center bg-primary-container/10 font-stat-numeral text-lg text-primary-container font-black tabular-nums">
                      {pts}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
