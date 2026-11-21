'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Users, Search, Radio } from 'lucide-react';
import { Team } from '@/types';
import { teamService } from '@/services/team.service';
import { tournamentService } from '@/services/tournament.service';
import { TeamCard } from '@/components/teams/TeamCard';
import { SearchBar } from '@/components/common/SearchBar';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { getCaptainDisplayName } from '@/utils/formatters';
import { useSocket } from '@/hooks/useSocket';
import { cn } from '@/utils/cn';

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tournamentName, setTournamentName] = useState<string>('Alliance Premier League - Season 9');

  const { socket, isConnected } = useSocket();

  const loadTeams = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const [data, tournaments] = await Promise.all([
        teamService.getAllTeams(),
        tournamentService.getTournaments().catch(() => [])
      ]);
      setTeams(data);
      if (tournaments && tournaments.length > 0 && tournaments[0]?.name) {
        setTournamentName(tournaments[0].name);
      }
    } catch (err) {
      console.error('Failed to load teams:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeams(true);

    // Periodic live sync fallback (10 seconds)
    const interval = setInterval(() => {
      loadTeams(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [loadTeams]);

  // Real-time live socket listener
  useEffect(() => {
    if (!socket) return;

    const handleRealtimeUpdate = () => {
      loadTeams(false);
    };

    socket.on('teams:update', handleRealtimeUpdate);
    socket.on('team:created', handleRealtimeUpdate);
    socket.on('team:updated', handleRealtimeUpdate);
    socket.on('team:deleted', handleRealtimeUpdate);
    socket.on('player:created', handleRealtimeUpdate);
    socket.on('player:updated', handleRealtimeUpdate);
    socket.on('player:deleted', handleRealtimeUpdate);
    socket.on('match:completed', handleRealtimeUpdate);
    socket.on('score:update', handleRealtimeUpdate);
    socket.on('score:updated', handleRealtimeUpdate);
    socket.on('standings:update', handleRealtimeUpdate);
    socket.on('leaderboard:update', handleRealtimeUpdate);

    return () => {
      socket.off('teams:update', handleRealtimeUpdate);
      socket.off('team:created', handleRealtimeUpdate);
      socket.off('team:updated', handleRealtimeUpdate);
      socket.off('team:deleted', handleRealtimeUpdate);
      socket.off('player:created', handleRealtimeUpdate);
      socket.off('player:updated', handleRealtimeUpdate);
      socket.off('player:deleted', handleRealtimeUpdate);
      socket.off('match:completed', handleRealtimeUpdate);
      socket.off('score:update', handleRealtimeUpdate);
      socket.off('score:updated', handleRealtimeUpdate);
      socket.off('standings:update', handleRealtimeUpdate);
      socket.off('leaderboard:update', handleRealtimeUpdate);
    };
  }, [socket, loadTeams]);

  const filteredTeams = teams.filter((t) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const captainName = getCaptainDisplayName(t.captain || (t as any).captainName);
      const match = `${t.name} ${captainName}`.toLowerCase();
      if (!match.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 select-none animate-in fade-in duration-200">
      {/* Header matching Reference Screen 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Teams
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            All participating teams
          </p>
        </div>

        {/* Search */}
        <div className="w-full sm:w-72">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search teams..."
          />
        </div>
      </div>

      {/* Teams Grid (Matching Screen 5 3-column Layout) */}
      {loading ? (
        <LoadingState message="Loading team rosters..." />
      ) : filteredTeams.length === 0 ? (
        <EmptyState
          title="No Teams Found"
          description="No participating teams match your current search query."
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredTeams.map((team, index) => (
            <TeamCard key={team._id} team={team} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
