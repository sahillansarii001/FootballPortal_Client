'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Medal, Users, FilterX, Search, Shield, ChevronDown } from 'lucide-react';
import { Player, Team } from '@/types';
import { playerService } from '@/services/player.service';
import { teamService } from '@/services/team.service';
import { PlayerCard } from '@/components/players/PlayerCard';
import { SearchBar } from '@/components/common/SearchBar';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { useSocket } from '@/hooks/useSocket';

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('all');

  const { socket } = useSocket();

  const loadData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const [allPlayers, allTeams] = await Promise.all([
        playerService.getAllPlayers().catch(() => []),
        teamService.getAllTeams().catch(() => [])
      ]);

      setTeams(allTeams);

      // Merge players from direct players endpoint and team rosters to ensure 100% connection
      const playerMap = new Map<string, Player>();

      if (Array.isArray(allPlayers)) {
        allPlayers.forEach((p) => {
          if (p && p._id) playerMap.set(p._id, p);
        });
      }

      if (Array.isArray(allTeams)) {
        allTeams.forEach((t) => {
          if (Array.isArray(t.players)) {
            t.players.forEach((p: any) => {
              if (p && typeof p === 'object' && p._id) {
                if (!playerMap.has(p._id)) {
                  playerMap.set(p._id, {
                    ...p,
                    team: p.team || { _id: t._id, name: t.name, logo: t.logo }
                  });
                }
              }
            });
          }
        });
      }

      const merged = Array.from(playerMap.values()).sort(
        (a, b) => (b.goals || 0) - (a.goals || 0) || (b.matchesPlayed || 0) - (a.matchesPlayed || 0)
      );

      setPlayers(merged);
    } catch (err) {
      console.error('Failed to load players registry:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);

    // 10-second periodic live polling fallback
    const interval = setInterval(() => {
      loadData(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [loadData]);

  // Real-time socket sync
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      loadData(false);
    };

    socket.on('player:created', handleUpdate);
    socket.on('player:updated', handleUpdate);
    socket.on('player:deleted', handleUpdate);
    socket.on('teams:update', handleUpdate);
    socket.on('team:created', handleUpdate);
    socket.on('team:updated', handleUpdate);
    socket.on('team:deleted', handleUpdate);
    socket.on('match:completed', handleUpdate);
    socket.on('score:updated', handleUpdate);
    socket.on('leaderboard:update', handleUpdate);

    return () => {
      socket.off('player:created', handleUpdate);
      socket.off('player:updated', handleUpdate);
      socket.off('player:deleted', handleUpdate);
      socket.off('teams:update', handleUpdate);
      socket.off('team:created', handleUpdate);
      socket.off('team:updated', handleUpdate);
      socket.off('team:deleted', handleUpdate);
      socket.off('match:completed', handleUpdate);
      socket.off('score:updated', handleUpdate);
      socket.off('leaderboard:update', handleUpdate);
    };
  }, [socket, loadData]);

  const positions = ['all', 'Forward', 'Midfielder', 'Defender', 'Goalkeeper'];

  const filteredPlayers = players.filter((p) => {
    if (selectedPosition !== 'all' && p.position?.toLowerCase() !== selectedPosition.toLowerCase()) {
      return false;
    }
    if (selectedTeam !== 'all') {
      const pTeamId = typeof p.team === 'object' && p.team ? p.team._id : String(p.team || '');
      const pTeamName = typeof p.team === 'object' && p.team ? p.team.name?.toLowerCase() : '';
      if (pTeamId !== selectedTeam && !pTeamName?.includes(selectedTeam.toLowerCase())) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const tName = typeof p.team === 'object' && p.team ? p.team.name.toLowerCase() : '';
      const cName = p.club ? p.club.toLowerCase() : '';
      if (!p.name.toLowerCase().includes(q) && !tName.includes(q) && !cName.includes(q)) return false;
    }
    return true;
  });

  const totalGoals = players.reduce((sum, p) => sum + (p.goals || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 select-none animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Players & Top Scorers
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Official collegiate athlete registry and player performance statistics
          </p>
        </div>

        {/* Live sync pill */}
        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 border border-slate-200/80 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{players.length} Athletes Enrolled • {totalGoals} Goals</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Position Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {positions.map((pos) => (
            <button
              key={pos}
              onClick={() => setSelectedPosition(pos)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedPosition === pos
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
              }`}
            >
              {pos === 'all' ? 'All Positions' : `${pos}s`}
            </button>
          ))}
        </div>

        {/* Search & Team Filter dropdown */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full md:w-auto">
          {/* Team Dropdown Filter */}
          <div className="relative w-full sm:w-44">
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              aria-label="Filter by team"
              className="w-full appearance-none px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer pr-8"
            >
              <option value="all">All Teams ({teams.length})</option>
              {teams.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Search Box */}
          <div className="w-full sm:w-60">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search athlete by name..."
            />
          </div>

          {/* Reset Button */}
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedPosition('all');
              setSelectedTeam('all');
            }}
            className="p-2.5 bg-slate-50 text-slate-500 hover:text-slate-900 rounded-xl border border-slate-200/80 shadow-2xs shrink-0 cursor-pointer transition-colors"
            title="Reset Filters"
          >
            <FilterX className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Players Grid */}
      {loading ? (
        <LoadingState message="Connecting to athlete registry..." />
      ) : filteredPlayers.length === 0 ? (
        <EmptyState
          title="No Players Found"
          description="No athletes match your selected search or filter criteria."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredPlayers.map((player) => (
            <PlayerCard key={player._id} player={player} />
          ))}
        </div>
      )}
    </div>
  );
}
