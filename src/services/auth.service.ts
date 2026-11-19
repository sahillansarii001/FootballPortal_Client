const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface AuthUser {
  _id: string;
  username: string;
  email: string;
  fullName?: string;
  role: 'Super Admin' | 'Match Operator' | 'Public User' | string;
  isActive: boolean;
  lastLogin?: string;
}

export interface LoginResult {
  success: boolean;
  message?: string;
  user?: AuthUser;
  token?: string;
  error?: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResult> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        return {
          success: false,
          error: json.message || 'Invalid email or password.',
        };
      }

      const { user, token } = json.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
      }

      return {
        success: true,
        message: json.message || 'Logged in successfully',
        user,
        token,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to connect to the authentication server.',
      };
    }
  },

  getCurrentUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  },

  logout(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },
};
