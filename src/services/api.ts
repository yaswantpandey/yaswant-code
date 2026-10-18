/**
 * Yaswant Code LMS — API Service Client
 * Standard Fetch Wrapper & Typed Endpoints for the PHP/MySQL Backend
 *
 * Usage:
 *   import api from '@/services/api';
 *   const res = await api.auth.login({ email, password });
 */


// ─── Base URL ────────────────────────────────────────────────────────────────
// On Hostinger (same domain), use relative path '/api'
// During local dev, point to php -S localhost:8000 -t public/
export const API_BASE_URL: string = (() => {
  const envUrl = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE_URL;
  if (envUrl) return envUrl.replace(/\/+$/, '');
  if (typeof window !== 'undefined') {
    // Same-origin: use relative path (works on Hostinger)
    return '/api';
  }
  return 'http://localhost:8000/api';
})();

// ─── Types ───────────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export class ApiError extends Error {
  status: number;
  data?: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, unknown>;
  timeoutMs?: number;
}

// ─── Token Storage ────────────────────────────────────────────────────────────
const TOKEN_KEY = 'yaswant_code_auth_token';
const USER_KEY  = 'yaswant_code_auth_user';

export const tokenStorage = {
  get: (): string | null => {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  set: (token: string): void => {
    try { localStorage.setItem(TOKEN_KEY, token); } catch { /* noop */ }
  },
  remove: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch { /* noop */ }
  },
  getUser: <T = unknown>(): T | null => {
    try {
      const s = localStorage.getItem(USER_KEY);
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  },
  setUser: (user: unknown): void => {
    try { localStorage.setItem(USER_KEY, JSON.stringify(user)); } catch { /* noop */ }
  },
};

// ─── Core Request ─────────────────────────────────────────────────────────────
async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { params, timeoutMs = 15000, headers: customHeaders, ...fetchOptions } = options;

  let url = `${API_BASE_URL}/${endpoint.replace(/^\/+/, '')}`;
  if (params) {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) sp.append(k, String(v));
    });
    const qs = sp.toString();
    if (qs) url += (url.includes('?') ? '&' : '?') + qs;
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  const token = tokenStorage.get();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...fetchOptions, headers, signal: controller.signal });
    clearTimeout(tid);

    let body: unknown = null;
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      body = await res.json();
    } else {
      const text = await res.text();
      try { body = JSON.parse(text); } catch { body = { message: text }; }
    }

    if (!res.ok) {
      const msg = (body as { error?: string; message?: string })?.error
               || (body as { error?: string; message?: string })?.message
               || `HTTP ${res.status}: ${res.statusText}`;
      throw new ApiError(msg, res.status, body);
    }

    if (typeof body === 'object' && body !== null && 'success' in body) {
      return body as ApiResponse<T>;
    }
    return { success: true, data: body as T };
  } catch (err: unknown) {
    clearTimeout(tid);
    if (err instanceof ApiError) throw err;
    if ((err as { name?: string })?.name === 'AbortError') {
      throw new ApiError(`Request timed out after ${timeoutMs}ms`, 408);
    }
    throw new ApiError(err instanceof Error ? err.message : 'Network error', 0);
  }
}

// ─── HTTP Helpers ─────────────────────────────────────────────────────────────
export const apiClient = {
  get:    <T>(ep: string, opts?: RequestOptions) => request<T>(ep, { ...opts, method: 'GET' }),
  post:   <T>(ep: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(ep, { ...opts, method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  put:    <T>(ep: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(ep, { ...opts, method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T>(ep: string, opts?: RequestOptions) => request<T>(ep, { ...opts, method: 'DELETE' }),
};

// ============================================================================
// 1. AUTHENTICATION
// ============================================================================
export interface LoginCredentials   { email: string; password: string; }
export interface RegisterPayload    { name: string; email: string; password: string; role?: 'student'; }
export interface AuthUserData       { id: string; name: string; email: string; role: 'student' | 'admin'; avatar?: string; title?: string; }
export interface AuthResponseData   { user: AuthUserData; token: string; expires_at: string; }

export const authService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponseData>> {
    const res = await apiClient.post<AuthResponseData>('auth.php', credentials, { params: { action: 'login' } });
    if (res.data?.token) {
      tokenStorage.set(res.data.token);
      tokenStorage.setUser(res.data.user);
    }
    return res;
  },
  async register(payload: RegisterPayload): Promise<ApiResponse<AuthUserData>> {
    return apiClient.post<AuthUserData>('auth.php', payload, { params: { action: 'register' } });
  },
  async logout(): Promise<void> {
    await apiClient.post('auth.php', {}, { params: { action: 'logout' } }).catch(() => {});
    tokenStorage.remove();
  },
  async getProfile(): Promise<ApiResponse<AuthUserData>> {
    return apiClient.get<AuthUserData>('auth.php', { params: { action: 'profile' } });
  },
  async updateProfile(data: Partial<AuthUserData>): Promise<ApiResponse<AuthUserData>> {
    return apiClient.put<AuthUserData>('auth.php', data, { params: { action: 'profile' } });
  },
  async changePassword(current_password: string, new_password: string): Promise<ApiResponse<null>> {
    return apiClient.post('auth.php', { current_password, new_password }, { params: { action: 'change_password' } });
  },
  isAuthenticated: (): boolean => Boolean(tokenStorage.get()),
  getCurrentUser:  <T = AuthUserData>(): T | null => tokenStorage.getUser<T>(),
};

// ============================================================================
// 7. DISCUSSIONS
// ============================================================================
export interface DiscussionListParams {
  category?: string; course_id?: string; search?: string; page?: number; per_page?: number;
}
export interface CreateDiscussionPayload {
  title: string; content: string; category?: string;
  tags?: string[]; course_id?: string;
}

export const discussionService = {
  async getAll(params?: DiscussionListParams): Promise<ApiResponse<unknown>> {
    return apiClient.get('discussions.php', { params: params as Record<string, unknown> });
  },
  async getById(id: string): Promise<ApiResponse<unknown>> {
    return apiClient.get('discussions.php', { params: { id } });
  },
  async create(payload: CreateDiscussionPayload): Promise<ApiResponse<{ discussion_id: string }>> {
    return apiClient.post('discussions.php', payload);
  },
  async reply(discussionId: string, content: string): Promise<ApiResponse<{ reply_id: string }>> {
    return apiClient.post('discussions.php', { discussion_id: discussionId, content }, { params: { action: 'reply' } });
  },
  async upvote(id: string, type: 'discussion' | 'reply'): Promise<ApiResponse<null>> {
    return apiClient.put('discussions.php', { id, type }, { params: { action: 'upvote' } });
  },
  async acceptAnswer(discussionId: string, replyId: string): Promise<ApiResponse<null>> {
    return apiClient.put('discussions.php', { discussion_id: discussionId, reply_id: replyId }, { params: { action: 'accept' } });
  },
  async delete(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete('discussions.php', { params: { id } });
  },
};

// ============================================================================
// 8. NOTIFICATIONS
// ============================================================================
export interface NotificationData {
  id: string; user_id: string; title: string; message: string;
  type: string; link?: string; is_read: boolean; created_at: string;
}
export interface NotificationListResponse {
  notifications: NotificationData[]; unread_count: number; total: number;
}

export const notificationService = {
  async getAll(params?: { limit?: number; unread?: boolean }): Promise<ApiResponse<NotificationListResponse>> {
    return apiClient.get<NotificationListResponse>('notifications.php', {
      params: { limit: params?.limit, unread: params?.unread ? '1' : undefined },
    });
  },
  async markRead(id: string): Promise<ApiResponse<null>> {
    return apiClient.put('notifications.php', null, { params: { action: 'read', id } });
  },
  async markAllRead(): Promise<ApiResponse<null>> {
    return apiClient.put('notifications.php', null, { params: { action: 'read_all' } });
  },
  async delete(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete('notifications.php', { params: { id } });
  },
};

// ============================================================================
// 9. CONTACT & NEWSLETTER
// ============================================================================
export interface ContactPayload {
  name: string; email: string; message: string;
  subject?: string; course?: string; phone?: string;
}

export const contactService = {
  async send(payload: ContactPayload): Promise<ApiResponse<unknown>> {
    return apiClient.post('contact.php', payload);
  },
};

export const newsletterService = {
  async subscribe(email: string, name?: string): Promise<ApiResponse<unknown>> {
    return apiClient.post('newsletter.php', { email, name });
  },
  async unsubscribe(email: string, token?: string): Promise<ApiResponse<unknown>> {
    return apiClient.delete('newsletter.php', { params: { email, token } });
  },
};

// ============================================================================
// HEALTH CHECK
// ============================================================================
export const healthService = {
  async check(): Promise<ApiResponse<unknown>> {
    return apiClient.get('health.php');
  },
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================
export const api = {
  client:       apiClient,
  auth:         authService,
  discussions:  discussionService,
  notifications:notificationService,
  contact:      contactService,
  newsletter:   newsletterService,
  health:       healthService,
  tokenStorage,
};

export default api;
