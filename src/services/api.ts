/**
 * Yaswant Code LMS — API Service Client
 * Standard Fetch Wrapper & Typed Endpoints for the PHP/MySQL Backend
 *
 * Usage:
 *   import api from '@/services/api';
 *   const res = await api.auth.login({ email, password });
 */

import type { Course, Certificate } from '../types/lms';

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
// 2. COURSES
// ============================================================================
export interface CourseListParams {
  category?: string; search?: string; difficulty?: string;
  sort?: 'popular' | 'newest' | 'rating' | 'price_low' | 'price_high';
  page?: number; per_page?: number;
}
export interface CourseListResponse {
  courses: Course[]; total: number; page: number; per_page: number; total_pages: number;
}
export interface CreateCoursePayload {
  title: string; description: string; category: string; price: number;
  tagline?: string; thumbnail?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  duration_hours?: number; lessons_count?: number; language?: string;
  whatYouWillLearn?: string[]; requirements?: string[]; skills?: string[];
}

export const courseService = {
  async getAll(params?: CourseListParams): Promise<ApiResponse<CourseListResponse>> {
    return apiClient.get<CourseListResponse>('courses.php', { params: params as Record<string, unknown> });
  },
  async getById(id: string): Promise<ApiResponse<Course>> {
    return apiClient.get<Course>('courses.php', { params: { id } });
  },
  async getFeatured(): Promise<ApiResponse<Course[]>> {
    return apiClient.get<Course[]>('courses.php', { params: { action: 'featured' } });
  },
  async create(payload: CreateCoursePayload): Promise<ApiResponse<{ id: string }>> {
    return apiClient.post<{ id: string }>('courses.php', payload);
  },
  async update(id: string, payload: Partial<CreateCoursePayload>): Promise<ApiResponse<{ id: string }>> {
    return apiClient.put<{ id: string }>('courses.php', payload, { params: { id } });
  },
  async delete(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete('courses.php', { params: { id } });
  },
};

// ============================================================================
// 3. ENROLLMENTS & PROGRESS
// ============================================================================
export interface EnrollmentRecord {
  id: number; user_id: string; course_id: string; progress_percent: number;
  current_lesson_id?: string; enrolled_at: string; completed_at?: string;
  title: string; thumbnail: string; category: string; duration_hours: number;
  lessons_count: number; instructor_name: string; completed_lessons: number;
}

export const enrollmentService = {
  async getUserEnrollments(userId: string): Promise<ApiResponse<EnrollmentRecord[]>> {
    return apiClient.get<EnrollmentRecord[]>('enrollments.php', { params: { user_id: userId } });
  },
  async getEnrollment(userId: string, courseId: string): Promise<ApiResponse<EnrollmentRecord | null>> {
    return apiClient.get<EnrollmentRecord | null>('enrollments.php', { params: { user_id: userId, course_id: courseId } });
  },
  async enroll(courseId: string): Promise<ApiResponse<{ enrolled: boolean; already_enrolled: boolean }>> {
    return apiClient.post('enrollments.php', { course_id: courseId });
  },
  async completeLesson(courseId: string, lessonId: string): Promise<ApiResponse<{ progress_percent: number; course_completed: boolean }>> {
    return apiClient.post('enrollments.php', { course_id: courseId, lesson_id: lessonId }, { params: { action: 'complete_lesson' } });
  },
  async updateProgress(courseId: string, currentLessonId: string, progressPercent?: number): Promise<ApiResponse<null>> {
    return apiClient.put('enrollments.php', {
      course_id: courseId,
      current_lesson_id: currentLessonId,
      progress_percent: progressPercent,
    });
  },
};

// ============================================================================
// 4. CERTIFICATES
// ============================================================================
export interface CertificateVerifyResult extends Certificate {
  verification_code: string; issue_date: string;
  course_title: string; student_name: string; instructor_name: string;
}
export interface IssueCertificateResult {
  certificateId: string; credentialId: string; verificationCode: string;
  verificationUrl: string; already_issued: boolean;
}

export const certificateService = {
  async verify(code: string): Promise<ApiResponse<CertificateVerifyResult>> {
    return apiClient.get<CertificateVerifyResult>('certificates.php', { params: { code } });
  },
  async getUserCertificates(userId: string): Promise<ApiResponse<Certificate[]>> {
    return apiClient.get<Certificate[]>('certificates.php', { params: { user_id: userId } });
  },
  async issue(courseId: string, userId?: string): Promise<ApiResponse<IssueCertificateResult>> {
    return apiClient.post<IssueCertificateResult>('certificates.php', { course_id: courseId, user_id: userId });
  },
};

// ============================================================================
// 5. QUIZZES
// ============================================================================
export interface QuizQuestion {
  id: string; question: string; options: string[]; order_index: number;
}
export interface QuizData {
  id: string; title: string; duration_minutes: number; passing_score: number;
  questions: QuizQuestion[];
}
export interface QuizSubmitResult {
  score: number; passed: boolean; passing_score: number;
  correct: number; total: number;
  results: Array<{
    question_id: string; question: string; options: string[];
    your_answer: string | null; correct_answer: string | null;
    is_correct: boolean; explanation: string;
  }>;
}
export interface QuizAnswerPayload {
  question_id: string;
  selected_index: number;
}

export const quizService = {
  async getQuiz(quizId: string): Promise<ApiResponse<QuizData>> {
    return apiClient.get<QuizData>('quizzes.php', { params: { quiz_id: quizId } });
  },
  async getCourseQuizzes(courseId: string): Promise<ApiResponse<Array<{ id: string; title: string; duration_minutes: number; passing_score: number }>>> {
    return apiClient.get('quizzes.php', { params: { course_id: courseId } });
  },
  async submit(quizId: string, answers: QuizAnswerPayload[]): Promise<ApiResponse<QuizSubmitResult>> {
    return apiClient.post<QuizSubmitResult>('quizzes.php', { quiz_id: quizId, answers }, { params: { action: 'submit' } });
  },
  async getHistory(userId: string): Promise<ApiResponse<unknown[]>> {
    return apiClient.get('quizzes.php', { params: { action: 'history', user_id: userId } });
  },
};

// ============================================================================
// 6. ASSIGNMENTS
// ============================================================================
export interface AssignmentSubmission {
  id: number; assignment_id: string; user_id: string;
  status: string; github_url?: string; submitted_file?: string;
  grade?: string; feedback?: string;
  submitted_at: string; reviewed_at?: string;
}

export const assignmentService = {
  async getCourseAssignments(courseId: string, userId?: string): Promise<ApiResponse<unknown[]>> {
    return apiClient.get('assignments.php', { params: { course_id: courseId, user_id: userId } });
  },
  async getUserAssignments(userId: string): Promise<ApiResponse<unknown[]>> {
    return apiClient.get('assignments.php', { params: { user_id: userId } });
  },
  async submit(assignmentId: string, payload: { github_url?: string; submitted_file?: string; notes?: string }): Promise<ApiResponse<{ submission_id: number }>> {
    return apiClient.post('assignments.php', { assignment_id: assignmentId, ...payload }, { params: { action: 'submit' } });
  },
  async grade(submissionId: number, grade: string, feedback: string, status?: string): Promise<ApiResponse<null>> {
    return apiClient.put('assignments.php', { submission_id: submissionId, grade, feedback, status }, { params: { action: 'grade' } });
  },
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
  async unsubscribe(email: string): Promise<ApiResponse<unknown>> {
    return apiClient.delete('newsletter.php', { params: { email } });
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
  courses:      courseService,
  enrollments:  enrollmentService,
  certificates: certificateService,
  quizzes:      quizService,
  assignments:  assignmentService,
  discussions:  discussionService,
  notifications:notificationService,
  contact:      contactService,
  newsletter:   newsletterService,
  health:       healthService,
  tokenStorage,
};

export default api;
