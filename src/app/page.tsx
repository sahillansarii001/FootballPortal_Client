import React from 'react';
import { tournamentService } from '@/services/tournament.service';
import { matchService } from '@/services/match.service';
import { teamService } from '@/services/team.service';
import { playerService } from '@/services/player.service';
import { standingsService } from '@/services/standings.service';
import { HeroSection } from '@/components/home/HeroSection';
import { LiveMatchesSection } from '@/components/home/LiveMatchesSection';
import { UpcomingFixtures } from '@/components/home/UpcomingFixtures';
import { RecentResults } from '@/components/home/RecentResults';
import { StandingsPreview } from '@/components/home/StandingsPreview';
import { TopScorers } from '@/components/home/TopScorers';
import { FeaturedTeams } from '@/components/home/FeaturedTeams';
import { MediaFocusSection } from '@/components/home/MediaFocusSection';
import { PressPassBanner } from '@/components/home/PressPassBanner';

export const revalidate = 10; // Incremental static regeneration every 10 seconds

export default async function HomePage() {
  const [stats, liveMatches, upcomingMatches, completedMatches, teams, scorers, standings] =
    await Promise.all([
      tournamentService.getOverviewStats(),
      matchService.getLiveMatches(),
      matchService.getUpcomingMatches(),
      matchService.getCompletedMatches(),
      teamService.getAllTeams(),
      playerService.getTopScorers(5),
      standingsService.getStandings(),
    ]);

  const activeLiveMatch = liveMatches.length > 0 ? liveMatches[0] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Editorial Sports Hero Section with Atmospheric Photography */}
      <HeroSection stats={stats} />

      {/* Live Broadcast Marquee Card (if active) */}
      <LiveMatchesSection liveMatch={activeLiveMatch} />

      {/* Main Grid: Fixtures, Results, Standings & Top Scorers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12" id="fixtures-table">
        {/* Left Column (7 cols): Upcoming Fixtures & Recent Results */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          <UpcomingFixtures matches={upcomingMatches} />
          <RecentResults results={completedMatches} />
        </div>

        {/* Right Column (5 cols): League Standings Preview & Top Scorers Spotlight */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <StandingsPreview standings={standings} />
          <TopScorers scorers={scorers} />
        </div>
      </div>

      {/* Featured Championship Teams */}
      <FeaturedTeams teams={teams} />

      {/* Tournament Media & Feature Stories */}
      <MediaFocusSection />

      {/* Operator Accreditation Quick-Action Drawer */}
      <PressPassBanner />
    </div>
  );
}
