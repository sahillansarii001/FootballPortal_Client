import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Trophy } from 'lucide-react';

export const PressPassBanner: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-primary-container to-secondary rounded-2xl p-6 sm:p-8 text-on-primary flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg border border-primary/30 relative overflow-hidden mb-8">
      <div className="flex items-center gap-4 z-10">
        <div className="w-12 h-12 rounded-xl bg-surface/20 border border-surface/20 flex items-center justify-center shrink-0 shadow-inner">
          <Trophy className="w-6 h-6 text-white" />
        </div>
        <div>
          <h4 className="font-headline-md text-headline-md text-on-primary font-bold tracking-tight">
            Official Team Accreditation & Press Pass
          </h4>
          <p className="font-body-md text-body-md text-on-primary-container font-medium mt-1">
            Are you a university athletic director or accredited collegiate broadcaster? Access real-time match data exports and media assets.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0 z-10">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-surface text-primary-container font-headline-sm text-headline-sm px-6 py-3 rounded-xl hover:bg-surface-container transition-all shadow-md active:scale-95 group font-bold"
        >
          <ShieldCheck className="w-5 h-5 text-primary-container" />
          <span>Tournament Admin</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </section>
  );
};
