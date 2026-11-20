/**
 * Dynamic Environment Configuration Helper
 * Resolves URLs cleanly across:
 * 1. Localhost development (Node SSR & Browser)
 * 2. Remote production website (https://football.mediaiofficial.in)
 */

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // 1. Explicitly defined custom production URL in environment that is NOT localhost
    if (
      process.env.NEXT_PUBLIC_API_URL &&
      !process.env.NEXT_PUBLIC_API_URL.includes('localhost') &&
      !process.env.NEXT_PUBLIC_API_URL.includes('127.0.0.1')
    ) {
      return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
    }

    // 2. In browser on production domain (football.mediaiofficial.in):
    // Authoritative backend API is served on https://api.football.mediaiofficial.in/api
    if (window.location.hostname.includes('mediaiofficial.in')) {
      return 'https://api.football.mediaiofficial.in/api';
    }

    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return '/api';
    }

    // 3. Localhost in browser: use relative '/api' or process.env.NEXT_PUBLIC_API_URL
    return process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '') : '/api';
  }

  // 4. Server-side rendering (SSR / ISR):
  // Next.js server can reach backend via localhost or internal container URL
  if (process.env.BACKEND_INTERNAL_URL) {
    return process.env.BACKEND_INTERNAL_URL.replace(/\/+$/, '');
  }
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return `${process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/+$/, '')}/api`;
  }
  return process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '')
    : 'http://localhost:5000/api';
}

export function getSocketUrl(): string {
  if (typeof window !== 'undefined') {
    // 1. Explicit production socket URL if configured
    if (
      process.env.NEXT_PUBLIC_SOCKET_URL &&
      !process.env.NEXT_PUBLIC_SOCKET_URL.includes('localhost') &&
      !process.env.NEXT_PUBLIC_SOCKET_URL.includes('127.0.0.1')
    ) {
      return process.env.NEXT_PUBLIC_SOCKET_URL.replace(/\/+$/, '');
    }

    // 2. On production domain in browser, connect to authoritative Socket.IO host
    if (window.location.hostname.includes('mediaiofficial.in')) {
      return 'https://api.football.mediaiofficial.in';
    }

    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return window.location.origin;
    }

    return process.env.NEXT_PUBLIC_SOCKET_URL
      ? process.env.NEXT_PUBLIC_SOCKET_URL.replace(/\/+$/, '')
      : 'http://localhost:5000';
  }

  return process.env.NEXT_PUBLIC_SOCKET_URL
    ? process.env.NEXT_PUBLIC_SOCKET_URL.replace(/\/+$/, '')
    : 'http://localhost:5000';
}
