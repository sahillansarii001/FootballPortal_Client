'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Activity,
  UserCheck,
  Sparkles,
  Info
} from 'lucide-react';
import { authService, AuthUser } from '@/services/auth.service';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // Check if user is already logged in
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

  const handleQuickFill = (role: 'admin' | 'operator') => {
    if (role === 'admin') {
      setEmail('admin@footballportal.com');
      setPassword('AdminPassword123!');
    } else {
      setEmail('operator@footballportal.com');
      setPassword('OperatorPassword123!');
    }
    setError(null);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl w-full bg-surface-container-lowest rounded-3xl border border-surface-container-high shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Visual Hero (Col 5) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-950 via-slate-900 to-black text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Background Glow & Pitch Grid */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Top Brand */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-emerald-300 font-label-caps text-xs font-bold uppercase tracking-wider mb-6">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Official Tournament Gate</span>
            </div>

            <h1 className="font-display-hero text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              VarsityKick League Portal
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-slate-300/90 leading-relaxed font-body-sm">
              Secured access gateway for tournament directors, match operators, and inter-collegiate athletic coordinators.
            </p>
          </div>

          {/* Highlights feature list */}
          <div className="relative z-10 space-y-4 my-8">
            <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xs">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase font-label-caps">
                  Live Match Telemetry
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Authoritative timer control, goal verification, and penalty shootout administration.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xs">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase font-label-caps">
                  Role-Based Authority
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Granular administrative permissions backed by signed JSON Web Tokens.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Accreditation */}
          <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span>Inter-College Athletics 2026</span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              API v1.0 Active
            </span>
          </div>
        </div>

        {/* Right Form Card (Col 7) */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          {currentUser ? (
            /* Logged in state */
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-primary-container flex items-center justify-center shadow-inner">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-label-caps text-label-caps uppercase bg-emerald-100 text-primary-container px-2.5 py-0.5 rounded-full font-extrabold text-[10px]">
                    Active Session
                  </span>
                  <h2 className="font-headline-md text-2xl font-black text-on-surface">
                    Welcome, {currentUser.fullName || currentUser.username}!
                  </h2>
                </div>
              </div>

              <div className="bg-surface-container-low rounded-2xl p-5 border border-surface-container space-y-3">
                <div className="flex justify-between items-center text-xs pb-2 border-b border-surface-container">
                  <span className="text-on-surface-variant font-medium">Assigned Role</span>
                  <span className="font-bold text-primary-container bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    {currentUser.role}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs pb-2 border-b border-surface-container">
                  <span className="text-on-surface-variant font-medium">Registered Email</span>
                  <strong className="text-on-surface">{currentUser.email}</strong>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant font-medium">Account Status</span>
                  <span className="flex items-center gap-1 text-primary-container font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified & Active
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/"
                  className="flex-1 py-3 px-4 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-bold text-xs uppercase tracking-wider text-center transition-all shadow-sm"
                >
                  Explore Public Broadcasts
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="py-3 px-5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            /* Login Form */
            <div className="space-y-6">
              {/* Header */}
              <div>
                <span className="font-label-caps text-label-caps uppercase text-primary-container font-extrabold text-xs tracking-wider">
                  Authentication Gate
                </span>
                <h2 className="mt-1 font-display-score text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
                  Sign in to your account
                </h2>
                <p className="mt-1 text-xs text-on-surface-variant font-medium">
                  Enter your credentials below or select a demo role for one-click authentication.
                </p>
              </div>

              {/* Quick Fill Demo Accounts */}
              <div className="bg-surface-container-low rounded-2xl p-4 border border-surface-container">
                <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant uppercase font-label-caps mb-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>One-Click Demo Credentials:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('admin')}
                    className="px-3 py-1.5 rounded-xl bg-surface-container-lowest hover:bg-emerald-50 hover:border-primary-container/40 border border-surface-container-high text-xs font-bold text-on-surface flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                    Super Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('operator')}
                    className="px-3 py-1.5 rounded-xl bg-surface-container-lowest hover:bg-emerald-50 hover:border-primary-container/40 border border-surface-container-high text-xs font-bold text-on-surface flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Match Operator
                  </button>
                </div>
              </div>

              {/* Error banner */}
              {error && (
                <div className="bg-error/10 border border-error/30 text-error rounded-xl p-3.5 flex items-start gap-2.5 text-xs animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email field */}
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase font-label-caps mb-1.5">
                    Official Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@footballportal.com"
                      className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-on-surface uppercase font-label-caps">
                      Security Password
                    </label>
                    <button
                      type="button"
                      onClick={() => alert('Default passwords for demo users: AdminPassword123! or OperatorPassword123!')}
                      className="text-[11px] font-semibold text-primary-container hover:underline"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-3 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-on-surface-variant hover:text-on-surface transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-surface-container-high text-primary-container focus:ring-primary-container accent-primary-container"
                    />
                    <span className="text-xs text-on-surface-variant font-medium">
                      Remember this authorized device
                    </span>
                  </label>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Authorize & Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Security notice footer */}
              <div className="pt-4 border-t border-surface-container-high flex items-center justify-between text-[11px] text-on-surface-variant font-medium">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-primary-container" />
                  256-bit Encrypted Session
                </span>
                <Link href="/" className="hover:text-primary-container font-semibold transition-colors">
                  Return to Public Home →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
