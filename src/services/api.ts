const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: any;
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T> | null> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      cache: 'no-store', // Always fresh data for matches
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[API] ${res.status} from ${endpoint}`);
      return null;
    }

    const data: ApiResponse<T> = await res.json();
    return data;
  } catch (error: any) {
    // Graceful offline fallback
    console.warn(`[API Offline Fallback] Failed connecting to ${url}: ${error?.message || error}`);
    return null;
  }
}
