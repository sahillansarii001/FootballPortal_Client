import React from 'react';
import { Shield } from 'lucide-react';

interface TacticalPitchProps {
  teamAName: string;
  teamBName: string;
}

export const TacticalPitch: React.FC<TacticalPitchProps> = ({ teamAName, teamBName }) => {
  return (
    <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-surface-container-high">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-surface-container-high">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary-container" />
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-extrabold">
            Tactical Dispositions
          </h3>
        </div>
        <div className="flex items-center gap-2 font-label-caps text-label-caps">
          <span className="bg-primary-container/15 text-primary-container font-extrabold px-2.5 py-1 rounded-md">
            4-3-3 ATTACK
          </span>
          <span className="text-outline font-semibold">vs</span>
          <span className="bg-secondary/15 text-secondary font-extrabold px-2.5 py-1 rounded-md">
            4-2-3-1 BLOCK
          </span>
        </div>
      </div>

      {/* Styled Football Pitch */}
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-md select-none border-2 border-emerald-900 bg-[#1e6f3b]">
        {/* Pitch Stripes */}
        <div className="absolute inset-0 flex flex-col pointer-events-none opacity-40">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-[#1a6234]' : 'bg-[#1e6f3b]'}`} />
          ))}
        </div>

        {/* Pitch Markings */}
        <div className="absolute inset-2.5 border-2 border-white/60 rounded pointer-events-none" />
        <div className="absolute left-2.5 right-2.5 top-1/2 -translate-y-1/2 border-t-2 border-white/60 pointer-events-none" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-2 border-white/60 pointer-events-none" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white pointer-events-none" />

        {/* Penalty boxes */}
        <div className="absolute left-1/2 top-2.5 -translate-x-1/2 w-28 h-12 border-2 border-t-0 border-white/60 pointer-events-none" />
        <div className="absolute left-1/2 bottom-2.5 -translate-x-1/2 w-28 h-12 border-2 border-b-0 border-white/60 pointer-events-none" />

        {/* Tactical Positions */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-3">
          {/* Team A Formation */}
          <div className="flex flex-col gap-2 w-full">
            <div className="flex justify-center">
              <span className="w-6 h-6 rounded-full bg-red-700 text-white font-label-caps text-[10px] flex items-center justify-center font-bold ring-2 ring-white shadow">
                GK
              </span>
            </div>
            <div className="flex justify-around px-4">
              <span className="w-5 h-5 rounded-full bg-red-700 text-white text-[9px] flex items-center justify-center font-bold ring-1 ring-white">2</span>
              <span className="w-5 h-5 rounded-full bg-red-700 text-white text-[9px] flex items-center justify-center font-bold ring-1 ring-white">4</span>
              <span className="w-5 h-5 rounded-full bg-red-700 text-white text-[9px] flex items-center justify-center font-bold ring-1 ring-white">5</span>
              <span className="w-5 h-5 rounded-full bg-red-700 text-white text-[9px] flex items-center justify-center font-bold ring-1 ring-white">3</span>
            </div>
            <div className="flex justify-around px-8">
              <span className="w-5 h-5 rounded-full bg-red-700 text-white text-[9px] flex items-center justify-center font-bold ring-1 ring-white">8</span>
              <span className="w-5 h-5 rounded-full bg-red-700 text-white text-[9px] flex items-center justify-center font-bold ring-1 ring-white">6</span>
              <span className="w-5 h-5 rounded-full bg-red-700 text-white text-[9px] flex items-center justify-center font-bold ring-1 ring-white">10</span>
            </div>
            <div className="flex justify-around px-6">
              <span className="w-5 h-5 rounded-full bg-red-700 text-white text-[9px] flex items-center justify-center font-bold ring-1 ring-white">7</span>
              <span className="w-6 h-6 rounded-full bg-red-700 text-white text-[10px] flex items-center justify-center font-extrabold ring-2 ring-amber-300 animate-pulse">9★</span>
              <span className="w-5 h-5 rounded-full bg-red-700 text-white text-[9px] flex items-center justify-center font-bold ring-1 ring-white">11</span>
            </div>
          </div>

          {/* Team B Formation */}
          <div className="flex flex-col gap-2 w-full">
            <div className="flex justify-around px-6">
              <span className="w-5 h-5 rounded-full bg-blue-700 text-white text-[9px] flex items-center justify-center font-bold ring-1 ring-white">7</span>
              <span className="w-6 h-6 rounded-full bg-blue-700 text-white text-[10px] flex items-center justify-center font-extrabold ring-2 ring-amber-300">9★</span>
              <span className="w-5 h-5 rounded-full bg-blue-700 text-white text-[9px] flex items-center justify-center font-bold ring-1 ring-white">11</span>
            </div>
            <div className="flex justify-around px-10">
              <span className="w-5 h-5 rounded-full bg-blue-700 text-white text-[9px] flex items-center justify-center font-bold ring-1 ring-white">6</span>
              <span className="w-5 h-5 rounded-full bg-blue-700 text-white text-[9px] flex items-center justify-center font-bold ring-1 ring-white">8</span>
            </div>
            <div className="flex justify-around px-4">
              <span className="w-5 h-5 rounded-full bg-blue-700 text-white text-[9px] flex items-center justify-center font-bold ring-1 ring-white">2</span>
              <span className="w-5 h-5 rounded-full bg-blue-700 text-white text-[9px] flex items-center justify-center font-bold ring-1 ring-white">4</span>
              <span className="w-5 h-5 rounded-full bg-blue-700 text-white text-[9px] flex items-center justify-center font-bold ring-1 ring-white">5</span>
              <span className="w-5 h-5 rounded-full bg-blue-700 text-white text-[9px] flex items-center justify-center font-bold ring-1 ring-white">3</span>
            </div>
            <div className="flex justify-center">
              <span className="w-6 h-6 rounded-full bg-blue-700 text-white font-label-caps text-[10px] flex items-center justify-center font-bold ring-2 ring-white shadow">
                GK
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bench details */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-on-surface-variant font-medium">
        <div className="p-3 bg-surface-container-low rounded-lg border border-surface-container-high">
          <div className="font-label-caps text-[10px] text-primary-container font-extrabold mb-1 uppercase">
            {teamAName} Bench (5 Subs Avail)
          </div>
          <span>B. Hughes (GK), 14 R. Evans (78&apos; ⇥), 17 L. Morales, 19 D. Kim, 22 J. Smith</span>
        </div>
        <div className="p-3 bg-surface-container-low rounded-lg border border-surface-container-high">
          <div className="font-label-caps text-[10px] text-secondary font-extrabold mb-1 uppercase">
            {teamBName} Bench (4 Subs Avail)
          </div>
          <span>M. Keller (GK), 15 J. Alvarez (81&apos; ⇥), 18 P. Rossi, 20 K. Brooks, 23 C. Zhao</span>
        </div>
      </div>
    </div>
  );
};
