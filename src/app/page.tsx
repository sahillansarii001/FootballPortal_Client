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
import { MOCK_OVERVIEW_STATS } from '@/services/mockData';

export const revalidate = 10; // Incremental static regeneration every 10 seconds

export default async function HomePage() {
  let stats = MOCK_OVERVIEW_STATS;
  let liveMatches: any[] = [];
  let upcomingMatches: any[] = [];
  let completedMatches: any[] = [];
  let teams: any[] = [];
  let scorers: any[] = [];
  let standings: any[] = [];
  let tournamentName = '';

  try {
    const results = await Promise.allSettled([
      tournamentService.getOverviewStats(),
      matchService.getLiveMatches(),
      matchService.getUpcomingMatches(),
      matchService.getCompletedMatches(),
      teamService.getAllTeams(),
      playerService.getTopScorers(5),
      standingsService.getStandings(),
      tournamentService.getTournaments(),
    ]);

    if (results[0].status === 'fulfilled' && results[0].value) stats = results[0].value;
    if (results[1].status === 'fulfilled' && Array.isArray(results[1].value)) liveMatches = results[1].value;
    if (results[2].status === 'fulfilled' && Array.isArray(results[2].value)) upcomingMatches = results[2].value;
    if (results[3].status === 'fulfilled' && Array.isArray(results[3].value)) completedMatches = results[3].value;
    if (results[4].status === 'fulfilled' && Array.isArray(results[4].value)) teams = results[4].value;
    if (results[5].status === 'fulfilled' && Array.isArray(results[5].value)) scorers = results[5].value;
    if (results[6].status === 'fulfilled' && Array.isArray(results[6].value)) standings = results[6].value;
    if (results[7].status === 'fulfilled' && Array.isArray(results[7].value) && results[7].value.length > 0) {
      tournamentName = results[7].value[0].name;
    }
  } catch (err) {
    console.error('Error fetching home page data:', err);
  }

  const activeLiveMatch = Array.isArray(liveMatches) && liveMatches.length > 0 ? liveMatches[0] : null;
  const activeUpcomingMatch = Array.isArray(upcomingMatches) && upcomingMatches.length > 0 ? upcomingMatches[0] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Editorial Sports Hero Section with Atmospheric Photography */}
      <HeroSection
        stats={stats}
        tournamentName={tournamentName}
        liveMatch={activeLiveMatch}
        upcomingMatch={activeUpcomingMatch}
      />

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
