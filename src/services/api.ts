/**
 * Yaswant Code LMS - API Service Client
 * Standard Fetch Wrapper & Typed Endpoints for the PHP/SQL Backend
 */

import type { Course, Certificate } from '../types/lms';

// Base URL configured via environment or local PHP built-in server default
export const API_BASE_URL = 
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE_URL || 
  (typeof window !== 'undefined' && window.location.port === '8000' 
    ? '/api' 
    : 'http://localhost:8000/api');

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface ApiErrorDetails {
  status: number;
  message: string;
  data?: unknown;
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
  params?: Record<string, unknown> | { [key: string]: unknown };
  timeoutMs?: number;
}

/**
 * Token Management Helper
 */
const TOKEN_STORAGE_KEY = 'yaswant_code_auth_token';
const USER_STORAGE_KEY = 'yaswant_code_auth_user';

export const tokenStorage = {
  get: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  },
  set: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch {
      // Ignore in non-browser or sandbox environments
    }
  },
  remove: (): void => {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // Ignore
    }
  },
  getUser: <T = unknown>(): T | null => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },
  setUser: (user: unknown): void => {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch {
      // Ignore
    }
  }
};

/**
 * Core Request Wrapper with URL formatting, headers, timeouts, and JSON parsing
 */
async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { params, timeoutMs = 12000, headers: customHeaders, ...fetchOptions } = options;

  // Build URL with query parameters
  let url = `${API_BASE_URL.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  // Inject Authorization and Content-Type
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  const token = tokenStorage.get();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Setup abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    let responseData: unknown = null;

    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = { message: text };
      }
    }

    if (!response.ok) {
      const errorMsg = (responseData as { error?: string; message?: string })?.error || 
                       (responseData as { error?: string; message?: string })?.message || 
                       `HTTP Error ${response.status}: ${response.statusText}`;
      throw new ApiError(errorMsg, response.status, responseData);
    }

    // Standardize PHP backend format
    if (typeof responseData === 'object' && responseData !== null && 'success' in responseData) {
      return responseData as ApiResponse<T>;
    }

    return {
      success: true,
      data: responseData as T,
    };
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    if ((error as { name?: string })?.name === 'AbortError') {
      throw new ApiError(`Request to ${endpoint} timed out after ${timeoutMs}ms`, 408);
    }

    const message = error instanceof Error ? error.message : 'Network request failed';
    throw new ApiError(message, 0);
  }
}

/**
 * Standard HTTP Method Wrappers
 */
export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) => 
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { 
      ...options, 
      method: 'POST', 
      body: body !== undefined ? JSON.stringify(body) : undefined 
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: body !== undefined ? JSON.stringify(body) : undefined 
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};

// ============================================================================
// 1. AUTHENTICATION SERVICE (`/api/auth.php`)
// ============================================================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: 'student' | 'instructor';
}

export interface AuthUserData {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  title?: string;
}

export interface AuthResponseData {
  user: AuthUserData;
  token: string;
}

export const authService = {
  /**
   * Log in user with email & password
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponseData>> {
    const res = await apiClient.post<AuthResponseData>('auth.php', credentials, {
      params: { action: 'login' }
    });
    if (res.data?.token) {
      tokenStorage.set(res.data.token);
      tokenStorage.setUser(res.data.user);
    }
    return res;
  },

  /**
   * Register a new student or instructor
   */
  async register(payload: RegisterPayload): Promise<ApiResponse<AuthUserData>> {
    return apiClient.post<AuthUserData>('auth.php', payload, {
      params: { action: 'register' }
    });
  },

  /**
   * Clears local authentication session
   */
  logout(): void {
    tokenStorage.remove();
  },

  /**
   * Checks if user is authenticated
   */
  isAuthenticated(): boolean {
    return Boolean(tokenStorage.get());
  },

  /**
   * Returns locally cached user profile
   */
  getCurrentUser(): AuthUserData | null {
    return tokenStorage.getUser<AuthUserData>();
  }
};

// ============================================================================
// 2. COURSES SERVICE (`/api/courses.php`)
// ============================================================================

export interface CourseQueryParams {
  [key: string]: unknown;
  category?: string;
  search?: string;
}

export interface CreateCoursePayload {
  instructor_id: string;
  title: string;
  tagline?: string;
  description: string;
  thumbnail?: string;
  category: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  price: number;
  duration_hours?: number;
  lessons_count?: number;
}

export const courseService = {
  /**
   * List all published courses with optional filtering
   */
  async getAll(params?: CourseQueryParams): Promise<ApiResponse<Course[]>> {
    return apiClient.get<Course[]>('courses.php', { params });
  },

  /**
   * Fetch complete course details with curriculum, modules, lessons and instructor
   */
  async getById(id: string): Promise<ApiResponse<Course>> {
    return apiClient.get<Course>('courses.php', {
      params: { id }
    });
  },

  /**
   * Create a new course curriculum
   */
  async create(payload: CreateCoursePayload): Promise<ApiResponse<{ id: string }>> {
    return apiClient.post<{ id: string }>('courses.php', payload);
  }
};

// ============================================================================
// 3. ENROLLMENTS SERVICE (`/api/enrollments.php`)
// ============================================================================

export interface EnrollmentRecord {
  id: number;
  user_id: string;
  course_id: string;
  progress_percent: number;
  current_lesson_id?: string;
  enrolled_at: string;
  title: string;
  thumbnail: string;
  category: string;
  duration_hours: number;
  lessons_count: number;
  instructor_name: string;
}

export const enrollmentService = {
  /**
   * Get enrolled courses and progress for student
   */
  async getUserEnrollments(userId: string): Promise<ApiResponse<EnrollmentRecord[]>> {
    return apiClient.get<EnrollmentRecord[]>('enrollments.php', {
      params: { user_id: userId }
    });
  },

  /**
   * Enroll the active student in a course
   */
  async enroll(userId: string, courseId: string): Promise<ApiResponse<{ enrolled: boolean }>> {
    return apiClient.post<{ enrolled: boolean }>('enrollments.php', {
      user_id: userId,
      course_id: courseId
    });
  }
};

// ============================================================================
// 4. CERTIFICATES SERVICE (`/api/certificates.php`)
// ============================================================================

export interface CertificateVerifyResult extends Certificate {
  verification_code: string;
  issue_date: string;
  course_title: string;
  student_name: string;
  instructor_name: string;
}

export const certificateService = {
  /**
   * Verify authenticity of a certificate by verification code or credential ID
   */
  async verify(codeOrId: string): Promise<ApiResponse<CertificateVerifyResult>> {
    return apiClient.get<CertificateVerifyResult>('certificates.php', {
      params: { code: codeOrId }
    });
  },

  /**
   * List all verified credentials earned by a student
   */
  async getUserCertificates(userId: string): Promise<ApiResponse<Certificate[]>> {
    return apiClient.get<Certificate[]>('certificates.php', {
      params: { user_id: userId }
    });
  },

  /**
   * Issue a newly completed course certificate
   */
  async issue(userId: string, courseId: string): Promise<ApiResponse<{
    certificateId: string;
    credentialId: string;
    verificationCode: string;
  }>> {
    return apiClient.post('certificates.php', {
      user_id: userId,
      course_id: courseId
    });
  }
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export const api = {
  client: apiClient,
  auth: authService,
  courses: courseService,
  enrollments: enrollmentService,
  certificates: certificateService,
  tokenStorage,
};

export default api;
