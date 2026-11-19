'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Users, Search } from 'lucide-react';
import { Team } from '@/types';
import { teamService } from '@/services/team.service';
import { TeamCard } from '@/components/teams/TeamCard';
import { SearchBar } from '@/components/common/SearchBar';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { getCaptainDisplayName } from '@/utils/formatters';

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConference, setSelectedConference] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadTeams() {
      setLoading(true);
      const data = await teamService.getAllTeams();
      setTeams(data);
      setLoading(false);
    }
    loadTeams();
  }, []);

  const conferences = ['all', 'Pacific Division', 'Ivy Collegiate', 'Atlantic Athletic'];

  const filteredTeams = teams.filter((t) => {
    if (selectedConference !== 'all' && t.conference?.toLowerCase() !== selectedConference.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const captainName = getCaptainDisplayName(t.captain);
      const match = `${t.name} ${t.coach || ''} ${captainName}`.toLowerCase();
      if (!match.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <PageHeader
        badge="2024–25 Sanctioned Collegiate Roster Registry"
        badgeIcon={<Shield className="w-4 h-4 text-primary-container" />}
        title="Inter-College Teams & University Rosters"
        description="Official athletic registration database, player eligibility charts, tactical formations, and tournament standings across tier-1 varsity football programs."
        action={
          <div className="inline-flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-xl text-xs font-bold text-on-surface border border-surface-container">
            <span className="w-2 h-2 rounded-full bg-primary-container"></span>
            <span>{teams.length} Active Rosters</span>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Conference Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {conferences.map((conf) => (
            <button
              key={conf}
              onClick={() => setSelectedConference(conf)}
              className={`px-4 py-2 rounded-full font-label-ui text-label-ui text-xs font-bold transition-all shrink-0 ${
                selectedConference === conf
                  ? 'bg-primary-container text-white shadow-xs'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
              }`}
            >
              {conf === 'all' ? `All Conferences (${teams.length})` : conf}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-full md:w-80">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search team, coach, captain..."
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTeams.map((team) => (
            <TeamCard key={team._id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}
