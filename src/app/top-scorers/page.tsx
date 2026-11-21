'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, RefreshCw, Users, Shield } from 'lucide-react';
import { playerService } from '@/services/player.service';
import { Player } from '@/types';
import { useSocket } from '@/hooks/useSocket';
import { LoadingState } from '@/components/common/LoadingState';

export default function PublicTopScorersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const { socket } = useSocket();

  const loadPlayers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await playerService.getAllPlayers();
      // Sort strictly by goals descending, then penalties, then matches
      const sorted = [...data].sort((a, b) => {
        if ((b.goals || 0) !== (a.goals || 0)) {
          return (b.goals || 0) - (a.goals || 0);
        }
        if ((b.penaltiesScored || 0) !== (a.penaltiesScored || 0)) {
          return (b.penaltiesScored || 0) - (a.penaltiesScored || 0);
        }
        return (a.matchesPlayed || 0) - (b.matchesPlayed || 0);
      });
      setPlayers(sorted);
    } catch (err) {
      console.error('Failed to load top scorers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  // Real-time synchronization
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      loadPlayers();
    };
    socket.on('player:updated', handleUpdate);
    socket.on('goal:recorded', handleUpdate);
    socket.on('match:completed', handleUpdate);
    return () => {
      socket.off('player:updated', handleUpdate);
      socket.off('goal:recorded', handleUpdate);
      socket.off('match:completed', handleUpdate);
    };
  }, [socket, loadPlayers]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 select-none animate-in fade-in duration-200">
      {/* Header matching Reference Screen 7 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Top Scorers
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Players ranked by goals (match goals only)
          </p>
        </div>

        <button
          onClick={loadPlayers}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Top Scorers Leaderboard Table (Matching Reference Screen 7) */}
      {loading ? (
        <LoadingState message="Fetching top goal scorers..." />
      ) : players.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/80 shadow-xs">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Goal Scorers Yet</h3>
          <p className="text-xs text-slate-500 mt-1">Goal statistics will appear here once official matches kick off.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase font-extrabold text-slate-400 tracking-wider">
                  <th className="py-3.5 px-6 text-center w-16">#</th>
                  <th className="py-3.5 px-6">Player</th>
                  <th className="py-3.5 px-6">Team</th>
                  <th className="py-3.5 px-6 text-center">Goals</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {players.map((player, index) => {
                  const rank = index + 1;
                  const teamName = typeof player.team === 'object' ? (player.team as any)?.name : 'Team';
                  const goals = player.goals || 0;
                  const isTopRank = rank === 1;

                  return (
                    <tr
                      key={player._id}
                      className={`transition-colors border-b border-slate-100 last:border-b-0 ${
                        isTopRank
                          ? 'bg-blue-50/70 hover:bg-blue-50 font-bold'
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
                      {/* Rank # */}
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`font-mono font-black text-sm ${
                            isTopRank ? 'text-blue-700' : 'text-slate-600'
                          }`}
                        >
                          {rank}
                        </span>
                      </td>

                      {/* Player Avatar + Name */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 text-base shadow-2xs">
                            {player.avatar ? (
                              <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>👤</span>
                            )}
                          </div>
                          <div>
                            <span
                              className={`font-black text-sm block ${
                                isTopRank ? 'text-blue-950' : 'text-slate-900'
                              }`}
                            >
                              {player.name}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              #{player.jerseyNumber} • {player.position || 'Forward'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Team */}
                      <td className="py-4 px-6">
                        <span
                          className={`font-bold text-sm ${
                            isTopRank ? 'text-blue-900' : 'text-slate-700'
                          }`}
                        >
                          {teamName}
                        </span>
                      </td>

                      {/* Goals */}
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`font-black text-base tabular-nums ${
                            isTopRank ? 'text-blue-600' : 'text-slate-900'
                          }`}
                        >
                          {goals}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="bg-slate-50/60 p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Showing official tournament ranking of registered athletes</span>
            <span className="font-bold text-blue-600">Golden Boot Registry</span>
          </div>
        </div>
      )}
    </div>
  );
}
