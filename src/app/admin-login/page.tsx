'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, ArrowLeft, Info } from 'lucide-react';

export default function AdminLoginPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-surface-container-lowest p-8 rounded-2xl border border-surface-container-high shadow-lg">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-14 h-14 bg-surface-container rounded-2xl flex items-center justify-center border border-surface-container-high text-primary-container shadow-inner mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <span className="font-label-caps text-label-caps uppercase bg-surface-container px-3 py-1 rounded-full text-on-surface font-extrabold border border-surface-container-high text-xs">
            Restricted Access
          </span>
          <h2 className="mt-3 font-headline-md text-2xl font-black text-on-surface tracking-tight">
            Official Portal Gate
          </h2>
          <p className="mt-2 text-xs text-on-surface-variant font-medium">
            Dedicated authentication portal for Tournament Match Operators, Referees, and Super Administrators.
          </p>
        </div>

        {/* Notice Card */}
        <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 leading-relaxed">
            <strong className="font-bold block mb-1">Public Phase Notice:</strong>
            The administrative operator console is being provisioned in the dedicated Admin Panel development phase. Public users may explore all real-time broadcasts and tournament fixtures freely.
          </div>
        </div>

        {/* Dummy/Disabled Form for UI preview */}
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-xs font-bold text-on-surface uppercase font-label-caps mb-1.5">
              Official Email
            </label>
            <input
              type="email"
              disabled
              placeholder="operator@varsitykick.edu"
              className="w-full bg-surface-container-low border border-surface-container-high rounded-xl px-4 py-3 text-xs text-on-surface cursor-not-allowed opacity-75"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface uppercase font-label-caps mb-1.5">
              Security Token / Password
            </label>
            <input
              type="password"
              disabled
              placeholder="••••••••••••"
              className="w-full bg-surface-container-low border border-surface-container-high rounded-xl px-4 py-3 text-xs text-on-surface cursor-not-allowed opacity-75"
            />
          </div>

          <button
            type="button"
            disabled
            className="w-full py-3 px-4 rounded-xl bg-surface-container text-on-surface-variant font-bold text-xs uppercase tracking-wider cursor-not-allowed border border-surface-container-high flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            Portal Offline (Public Mode Active)
          </button>
        </form>

        {/* Back Link */}
        <div className="text-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-container hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Tournament Public Home
          </Link>
        </div>
      </div>
    </div>
  );
}
