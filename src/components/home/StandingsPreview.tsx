'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ListOrdered, ArrowRight } from 'lucide-react';
import { TournamentStandingRow } from '@/types';
import { useSocket } from '@/hooks/useSocket';
import { standingsService } from '@/services/standings.service';

interface StandingsPreviewProps {
  standings: TournamentStandingRow[];
}

export const StandingsPreview: React.FC<StandingsPreviewProps> = ({ standings: initialStandings }) => {
  const [standings, setStandings] = useState<TournamentStandingRow[]>(initialStandings || []);
  const { socket } = useSocket();

  useEffect(() => {
    if (initialStandings && initialStandings.length > 0) {
      setStandings(initialStandings);
    }
  }, [initialStandings]);

  useEffect(() => {
    if (!socket) return;

    const handleRealtimeUpdate = (data: any) => {
      if (Array.isArray(data)) {
        setStandings(data);
      } else if (data?.standings && Array.isArray(data.standings)) {
        setStandings(data.standings);
      } else {
        standingsService.getStandings().then((res) => {
          if (res && res.length > 0) setStandings(res);
        });
      }
    };

    const handleMatchCompleted = () => {
      standingsService.getStandings().then((res) => {
        if (res && res.length > 0) setStandings(res);
      });
    };

    socket.on('standings:update', handleRealtimeUpdate);
    socket.on('match:completed', handleMatchCompleted);

    return () => {
      socket.off('standings:update', handleRealtimeUpdate);
      socket.off('match:completed', handleMatchCompleted);
    };
  }, [socket]);

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

      {/* Table: Exact columns: POS | TEAM | MP | W | D | L | GF | GA | GD | PTS */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[620px] text-left font-body-sm text-body-sm">
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant font-label-caps text-label-caps uppercase select-none">
              <th className="py-2.5 px-2 text-center w-12 font-black">POS</th>
              <th className="py-2.5 px-3 font-black min-w-[150px]">TEAM</th>
              <th className="py-2.5 px-2 text-center font-black">MP</th>
              <th className="py-2.5 px-2 text-center font-black">W</th>
              <th className="py-2.5 px-2 text-center font-black">D</th>
              <th className="py-2.5 px-2 text-center font-black">L</th>
              <th className="py-2.5 px-2 text-center font-black">GF</th>
              <th className="py-2.5 px-2 text-center font-black">GA</th>
              <th className="py-2.5 px-2 text-center font-black">GD</th>
              <th className="py-2.5 px-3 text-center bg-primary-container/10 text-primary-container font-black w-16">PTS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {!standings || standings.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-on-surface-variant font-medium">
                  No tournament standings recorded yet.
                </td>
              </tr>
            ) : (
              standings.slice(0, 5).map((row, idx) => {
                const isLeader = idx === 0;
                const teamId = typeof row.team === 'object' && row.team?._id ? row.team._id : (typeof row.team === 'string' ? row.team : '');
                const teamName = typeof row.team === 'object' && row.team?.name ? row.team.name : 'Team';
                const teamLogo = typeof row.team === 'object' && row.team?.logo ? row.team.logo : null;

                const mp = row.matchesPlayed ?? 0;
                const w = row.matchesWon ?? (row as any).won ?? 0;
                const d = row.matchesDrawn ?? (row as any).drawn ?? 0;
                const l = row.matchesLost ?? (row as any).lost ?? 0;
                const gf = row.goalsScored ?? (row as any).goalsFor ?? 0;
                const ga = row.goalsConceded ?? (row as any).goalsAgainst ?? 0;
                const gd = row.goalDifference ?? (gf - ga);
                const pts = row.totalPoints ?? (row as any).points ?? 0;

                return (
                  <tr
                    key={row._id || teamId || idx}
                    className={`hover:bg-surface-container-low/40 transition-colors ${
                      isLeader ? 'bg-amber-500/[0.04]' : idx < 2 ? 'bg-primary-container/[0.02]' : ''
                    }`}
                  >
                    <td className="py-2.5 px-2 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                          isLeader
                            ? 'bg-amber-400 text-slate-900 ring-2 ring-amber-300'
                            : idx < 2
                            ? 'bg-secondary-container/60 text-on-secondary-container ring-1 ring-secondary-container'
                            : 'bg-surface-container text-on-surface'
                        }`}
                      >
                        {row.position || idx + 1}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-headline-sm text-sm text-on-surface font-bold">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-surface-container flex items-center justify-center text-xs font-black overflow-hidden shrink-0">
                          {teamLogo ? (
                            <img src={teamLogo} alt={teamName} className="w-full h-full object-cover" />
                          ) : (
                            <span>{teamName.slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        {teamId ? (
                          <Link href={`/teams/${teamId}`} className="hover:text-primary-container transition-colors truncate block">
                            {teamName}
                          </Link>
                        ) : (
                          <span className="truncate block">{teamName}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center text-on-surface font-semibold tabular-nums">{mp}</td>
                    <td className="py-2.5 px-2 text-center text-on-surface font-bold tabular-nums">{w}</td>
                    <td className="py-2.5 px-2 text-center text-on-surface-variant font-medium tabular-nums">{d}</td>
                    <td className="py-2.5 px-2 text-center text-on-surface-variant font-medium tabular-nums">{l}</td>
                    <td className="py-2.5 px-2 text-center text-on-surface font-medium tabular-nums">{gf}</td>
                    <td className="py-2.5 px-2 text-center text-on-surface font-medium tabular-nums">{ga}</td>
                    <td
                      className={`py-2.5 px-2 text-center font-extrabold tabular-nums ${
                        gd > 0 ? 'text-emerald-600' : gd < 0 ? 'text-rose-600' : 'text-on-surface-variant'
                      }`}
                    >
                      {gd > 0 ? `+${gd}` : gd}
                    </td>
                    <td className="py-2.5 px-3 text-center bg-primary-container/10 font-headline-sm text-base text-primary-container font-black tabular-nums">
                      {pts}
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
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold text-xs">
          Top 2 advance to championship playoffs • Win = 2 Pts, Draw = 0 Pts, Loss = 0 Pts
        </span>
      </div>
    </div>
  );
};
