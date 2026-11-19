import React from 'react';
import { Gavel } from 'lucide-react';

export const BylawsNotice: React.FC = () => {
  return (
    <div className="bg-surface-container-high/60 p-4 rounded-xl flex items-start gap-3.5 border border-surface-container-high mb-6">
      <Gavel className="w-5 h-5 text-primary-container shrink-0 mt-0.5" />
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-headline-sm text-headline-sm text-on-surface font-extrabold">
            Tie-Break Bylaws Protocol
          </span>
          <span className="font-label-caps text-label-caps bg-primary-container text-on-primary px-2 py-0.5 rounded font-bold">
            KNOCKOUT RULE
          </span>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
          If scores stand deadlocked at the expiration of regular match time, a 5-kick sudden death penalty shootout activates immediately on Pitch South Net to declare the official winner.
        </p>
      </div>
    </div>
  );
};
