import { getApiBaseUrl } from '@/utils/envConfig';

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
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

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
