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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      {/* Header */}
      <PageHeader
        badge={`${tournamentName} • Official Roster Registry`}
        badgeIcon={<Shield className="w-4 h-4 text-primary-container" />}
        title="Alliance Premier League Teams & Rosters"
        description="Official club registration database, player eligibility charts, tactical formations, and tournament standings across Alliance Premier League Season 9."
        action={
          <div className="flex items-center gap-2.5">
            <div className="inline-flex items-center gap-2 bg-surface-container-low px-3.5 py-2 rounded-xl text-xs font-bold text-on-surface border border-surface-container shadow-xs">
              <span className={cn('w-2 h-2 rounded-full', isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500')}></span>
              <span className="font-mono text-[11px]">{isConnected ? 'LIVE SYNC ACTIVE' : 'CONNECTING...'}</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-xl text-xs font-bold text-on-surface border border-surface-container">
              <span className="w-2 h-2 rounded-full bg-primary-container"></span>
              <span>{teams.length} Active Rosters</span>
            </div>
          </div>
        }
      />

      {/* Search & Counter Bar */}
      <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-label-caps text-xs font-bold text-on-surface uppercase tracking-wider">
            All Registered Teams ({teams.length})
          </span>
        </div>

        {/* Search */}
        <div className="w-full md:w-80">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search team or captain..."
          />
        </div>
      </div>

      {/* Teams Grid */}
      {loading ? (
        <LoadingState message="Loading varsity team rosters..." />
      ) : filteredTeams.length === 0 ? (
        <EmptyState
          title="No Teams Found"
          description="No university teams match your current search or conference filter."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTeams.map((team, index) => (
            <TeamCard key={team._id} team={team} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
