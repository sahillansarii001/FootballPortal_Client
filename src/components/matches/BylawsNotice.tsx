import React from 'react';
import { Gavel } from 'lucide-react';

export const BylawsNotice: React.FC = () => {
  return (
    <div className="bg-surface-container-high/60 p-4 rounded-xl flex items-start gap-3.5 border border-surface-container-high mb-6">
      <Gavel className="w-5 h-5 text-primary-container shrink-0 mt-0.5" />
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-headline-sm text-headline-sm text-on-surface font-extrabold">
            10-Minute Tournament Format & Bylaws
          </span>
          <span className="font-label-caps text-label-caps bg-primary-container text-on-primary px-2 py-0.5 rounded font-bold">
            TIMING PROTOCOL
          </span>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
          Standard match format: <strong>4-minute First Half</strong>, followed by a mandatory <strong>20-second Whistle Delay</strong> (allowing referee whistle signaling and athletes to assemble in corners/benches), an official <strong>2-minute Half-Time Break</strong>, and a <strong>4-minute Second Half</strong>. If both teams score equally and end in a draw (e.g. 1-1), <strong>2 additional minutes Extra Time</strong> are added to the timer before penalty shootouts.
        </p>
      </div>
    </div>
  );
};
