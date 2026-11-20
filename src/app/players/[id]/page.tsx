'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { playerService } from '@/services/player.service';
import { Player } from '@/types';
import { PlayerProfileHeader } from '@/components/players/PlayerProfileHeader';
import { PlayerStatsSummary } from '@/components/players/PlayerStatsSummary';
import { PlayerGoalHistory } from '@/components/players/PlayerGoalHistory';
import { LoadingState } from '@/components/common/LoadingState';
import { ArrowLeft } from 'lucide-react';

export default function PlayerProfilePage() {
  const params = useParams();
  const playerId = (params?.id as string) || '';

  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlayerData() {
      setLoading(true);
      const data = await playerService.getPlayerById(playerId);
      setPlayer(data);
      setLoading(false);
    }
    loadPlayerData();
  }, [playerId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <LoadingState message="Loading athlete profile & stats..." />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-xl font-bold text-on-surface">Player Not Found</h2>
        <p className="text-xs text-on-surface-variant mt-2">The requested athlete record does not exist or has been removed.</p>
        <Link href="/players" className="mt-4 inline-block px-4 py-2 bg-primary-container text-on-primary rounded-xl text-xs font-bold">
          Back to Players Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Link */}
      <div className="mb-6">
        <Link
          href="/players"
          className="inline-flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-primary-container transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Players Directory</span>
        </Link>
      </div>

      {/* Header Profile Banner */}
      <PlayerProfileHeader player={player} />

      {/* Career & Season Stats */}
      <PlayerStatsSummary player={player} />

      {/* Goal History Breakdown */}
      <PlayerGoalHistory player={player} />
    </div>
  );
}
