'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Shield,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Activity,
  UserCheck
} from 'lucide-react';
import { authService, AuthUser } from '@/services/auth.service';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please provide both email address and password.');
      return;
    }

    setLoading(true);
    const result = await authService.login(email.trim(), password);
    setLoading(false);

    if (result.success && result.user) {
      setCurrentUser(result.user);
    } else {
      setError(result.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex items-center justify-center p-3 sm:p-6 bg-surface">
      <div className="max-w-4xl w-full max-h-[92vh] bg-surface-container-lowest rounded-3xl border border-surface-container-high shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Hero Panel (Hidden on small mobile, Col 5 on Desktop) */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-emerald-950 via-slate-900 to-black text-white p-7 flex-col justify-between relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-52 h-52 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Brand */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-emerald-300 font-label-caps text-[11px] font-bold uppercase tracking-wider mb-4">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Official Tournament Gate</span>
            </div>

            <h1 className="font-display-hero text-2xl font-black text-white tracking-tight leading-tight">
              VarsityKick League Portal
            </h1>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed font-body-sm">
              Secured access for match operators, tournament directors, and athletic officials.
            </p>
          </div>

          {/* Compact Feature Highlights */}
          <div className="relative z-10 space-y-2.5 my-4">
            <div className="flex items-start gap-2.5 bg-white/5 border border-white/10 rounded-xl p-2.5 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[11px] font-bold text-white uppercase font-label-caps">
                  Live Match Telemetry
                </h4>
                <p className="text-[10px] text-slate-300">
                  Authoritative timer control and penalty shootout management.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-white/5 border border-white/10 rounded-xl p-2.5 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[11px] font-bold text-white uppercase font-label-caps">
                  Role-Based Authority
                </h4>
                <p className="text-[10px] text-slate-300">
                  Cryptographically verified JSON Web Token sessions.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Accreditation */}
          <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
            <span>Inter-College Athletics 2026</span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Server Active
            </span>
          </div>
        </div>

        {/* Right Form Card (Col 7) */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between overflow-hidden">
          {/* Top Bar with Back Link */}
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-bold text-on-surface-variant hover:text-primary-container transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Website</span>
            </Link>
            <span className="font-label-caps text-[10px] uppercase tracking-wider bg-surface-container px-2.5 py-0.5 rounded-full text-on-surface-variant font-bold border border-surface-container-high">
              Restricted Terminal
            </span>
          </div>

          {currentUser ? (
            /* Logged in state */
            <div className="space-y-4 my-auto">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-primary-container flex items-center justify-center shadow-inner">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-label-caps text-label-caps uppercase bg-emerald-100 text-primary-container px-2 py-0.5 rounded-full font-extrabold text-[10px]">
                    Active Session
                  </span>
                  <h2 className="font-headline-md text-xl font-black text-on-surface">
                    Welcome, {currentUser.fullName || currentUser.username}!
                  </h2>
                </div>
              </div>

              <div className="bg-surface-container-low rounded-xl p-4 border border-surface-container space-y-2.5 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-surface-container">
                  <span className="text-on-surface-variant font-medium">Assigned Role</span>
                  <span className="font-bold text-primary-container bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    {currentUser.role}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-surface-container">
                  <span className="text-on-surface-variant font-medium">Registered Email</span>
                  <strong className="text-on-surface">{currentUser.email}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant font-medium">Terminal Status</span>
                  <span className="flex items-center gap-1 text-primary-container font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified & Active
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <Link
                  href="/"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-bold text-xs uppercase tracking-wider text-center transition-all shadow-sm"
                >
                  Return to Tournament Home
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="py-2.5 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            /* Login Form */
            <div className="space-y-4 my-auto">
              <div>
                <h2 className="font-display-score text-2xl font-black text-on-surface tracking-tight">
                  Sign in to your account
                </h2>
                <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                  Enter your official credentials below to access tournament management controls.
                </p>
              </div>

              {/* Error banner */}
              {error && (
                <div className="bg-error/10 border border-error/30 text-error rounded-xl p-2.5 flex items-start gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-3">
                {/* Email field */}
                <div>
                  <label className="block text-[11px] font-bold text-on-surface uppercase font-label-caps mb-1">
                    Official Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@footballportal.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-on-surface uppercase font-label-caps">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => alert('Please contact system administrator to recover access credentials.')}
                      className="text-[10px] font-semibold text-primary-container hover:underline"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-9 py-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-on-surface transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-surface-container-high text-primary-container focus:ring-primary-container accent-primary-container"
                    />
                    <span className="text-[11px] text-on-surface-variant font-medium">
                      Remember this terminal
                    </span>
                  </label>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Authorize & Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Security notice footer */}
          <div className="pt-3 border-t border-surface-container-high flex items-center justify-between text-[10px] text-on-surface-variant font-medium">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-primary-container" />
              256-bit Encrypted Session
            </span>
            <span className="text-outline">VarsityKick Auth v1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
