'use client';

import React, { useState, useEffect } from 'react';
import { Medal, Users, FilterX } from 'lucide-react';
import { Player } from '@/types';
import { playerService } from '@/services/player.service';
import { PlayerCard } from '@/components/players/PlayerCard';
import { SearchBar } from '@/components/common/SearchBar';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('all');

  useEffect(() => {
    async function loadPlayers() {
      setLoading(true);
      const data = await playerService.getAllPlayers();
      setPlayers(data);
      setLoading(false);
    }
    loadPlayers();
  }, []);

  const positions = ['all', 'Forward', 'Midfielder', 'Defender', 'Goalkeeper'];

  const filteredPlayers = players.filter((p) => {
    if (selectedPosition !== 'all' && p.position?.toLowerCase() !== selectedPosition.toLowerCase()) {
      return false;
    }
    if (selectedTeam !== 'all') {
      const tName = typeof p.team === 'object' && p.team ? p.team.name.toLowerCase() : '';
      if (!tName.includes(selectedTeam.toLowerCase())) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const tName = typeof p.team === 'object' && p.team ? p.team.name.toLowerCase() : '';
      if (!p.name.toLowerCase().includes(q) && !tName.includes(q)) return false;
    }
    return true;
  });

  const totalGoals = players.reduce((sum, p) => sum + (p.goals || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <PageHeader
        badge="Official Collegiate Athlete Registry"
        badgeIcon={<Medal className="w-4 h-4 text-primary-container" />}
        title="Varsity Players & Top Scorers"
        description="Verified athlete rosters, goal tallies, assists, shot statistics, and collegiate career records across all participating universities."
        action={
          <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-xl text-xs font-bold text-on-surface border border-surface-container">
            <span className="w-2 h-2 rounded-full bg-primary-container"></span>
            <span>{players.length} Athletes • {totalGoals} Goals Logged</span>
          </div>
        }
      />

      {/* Filter Bar */}
      <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Position Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {positions.map((pos) => (
            <button
              key={pos}
              onClick={() => setSelectedPosition(pos)}
              className={`px-3.5 py-1.5 rounded-full font-label-ui text-label-ui text-xs font-bold transition-all shrink-0 ${
                selectedPosition === pos
                  ? 'bg-primary-container text-white shadow-xs'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
              }`}
            >
              {pos === 'all' ? 'All Positions' : `${pos}s`}
            </button>
          ))}
        </div>

        {/* Search & Team dropdown */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-full md:w-64">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search athlete by name..."
            />
          </div>

          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedPosition('all');
              setSelectedTeam('all');
            }}
            className="p-2.5 bg-surface text-on-surface-variant hover:text-on-surface rounded-xl border border-surface-container-high shadow-xs shrink-0"
            title="Reset Filters"
          >
            <FilterX className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Players Grid */}
      {loading ? (
        <LoadingState message="Loading varsity player records..." />
      ) : filteredPlayers.length === 0 ? (
        <EmptyState
          title="No Players Found"
          description="No athletes match your selected search or position filter."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPlayers.map((player) => (
            <PlayerCard key={player._id} player={player} />
          ))}
        </div>
      )}
    </div>
  );
}
