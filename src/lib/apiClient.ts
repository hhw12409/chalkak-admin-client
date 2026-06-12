const BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL ?? 'http://localhost:8081/admin';

export const TOKEN_KEY = 'admin_access_token';
export const ADMIN_INFO_KEY = 'admin_info';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

// ADM-C-SEC-001 (부분): SameSite=Strict + Secure(프로덕션)로 강화.
// HttpOnly 전면 전환은 서버 측 Set-Cookie 기반 재설계가 필요하므로 본 세션 미적용.
function buildCookieAttrs(): string {
  const isProd = process.env.NODE_ENV === 'production';
  return `path=/; SameSite=Strict${isProd ? '; Secure' : ''}`;
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `admin_token=${token}; ${buildCookieAttrs()}`;
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ADMIN_INFO_KEY);
  document.cookie = `admin_token=; ${buildCookieAttrs()}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

function buildParams(params: Record<string, string | number | boolean | undefined | null>): string {
  const entries = Object.entries(params).filter(([, v]) => v != null && v !== '');
  if (entries.length === 0) return '';
  return new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
  skipAuth = false,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers ?? {}) as Record<string, string>),
  };

  if (!skipAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && typeof window !== 'undefined') {
    removeToken();
    window.location.href = '/admin/auth/signin';
    throw new Error('Unauthorized');
  }

  // ADM-C-SEC-003: 403 / 419 에러를 401과 구분해 사용자에게 명확히 안내
  if (res.status === 403) {
    throw new Error('이 작업을 수행할 권한이 없습니다.');
  }
  if (res.status === 419) {
    throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
  }

  const body = await res.json();

  if (!res.ok || body?.success === false) {
    throw new Error(body?.message ?? `API error ${res.status}`);
  }

  return body.data as T;
}

export { buildParams };
