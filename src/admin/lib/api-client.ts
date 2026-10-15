import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiError, ApiResponse } from '@/admin/types/api';

export const AUTH_TOKEN_KEY = 'cms_admin_token';

export interface CookieOptions {
  days?: number;
  path?: string;
  sameSite?: 'Lax' | 'Strict' | 'None';
  secure?: boolean;
}

/**
 * Lấy token lưu trong Cookie (hỗ trợ migration fallback từ localStorage nếu có).
 */
export function getAuthToken(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  // Đọc từ Cookie
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${AUTH_TOKEN_KEY}=([^;]*)`));
  if (match) {
    try {
      return decodeURIComponent(match[1]);
    } catch {
      return match[1];
    }
  }

  // Fallback migration: nếu token cũ còn trong localStorage, đọc và chuyển vào cookie
  if (typeof window !== 'undefined' && window.localStorage) {
    const legacyToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (legacyToken) {
      setAuthToken(legacyToken);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      return legacyToken;
    }
  }

  return null;
}

/**
 * Lưu token vào Cookie với các thuộc tính bảo mật (path, SameSite=Lax, Secure khi HTTPS, expires 7 ngày).
 */
export function setAuthToken(token: string, options?: CookieOptions): void {
  if (typeof document === 'undefined') {
    return;
  }

  const days = options?.days ?? 7;
  const path = options?.path ?? '/';
  const sameSite = options?.sameSite ?? 'Lax';
  const secure = options?.secure ?? (typeof window !== 'undefined' && window.location?.protocol === 'https:');

  let cookieString = `${AUTH_TOKEN_KEY}=${encodeURIComponent(token)}; path=${path}; SameSite=${sameSite}`;

  if (days > 0) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    cookieString += `; expires=${date.toUTCString()}`;
  }

  if (secure) {
    cookieString += '; Secure';
  }

  document.cookie = cookieString;

  // Dọn dẹp legacy token trong localStorage nếu có
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

/**
 * Xóa token khỏi Cookie (và localStorage).
 */
export function removeAuthToken(path = '/'): void {
  if (typeof document !== 'undefined') {
    document.cookie = `${AUTH_TOKEN_KEY}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  }
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

/**
 * Tạo Axios instance với cấu hình mặc định cho Admin CMS.
 * Tự động kết nối tới API reverse-proxy qua /api hoặc VITE_API_URL.
 */
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

/**
 * Request Interceptor: Tự động đính kèm Bearer token nếu có.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor: Bắt lỗi 401 Unauthorized để tự động xóa token và phát sự kiện đăng xuất.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Nếu request bị hủy chủ động thì chỉ reject mà không xử lý thêm logic lỗi
    if (axios.isCancel(error) || error?.code === 'ERR_CANCELED') {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const url = error.config?.url || '';

    // Nếu gặp 401 và không phải request đăng nhập (/users/login)
    if (status === 401 && !url.includes('/users/login')) {
      removeAuthToken();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Trích xuất và chuẩn hóa thông báo lỗi thân thiện bằng tiếng Việt từ phản hồi API hoặc lỗi mạng.
 */
export function getApiErrorMessage(error: unknown): string {
  if (!error) {
    return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';
  }

  // Bỏ qua lỗi do request bị chủ động hủy (chuyển trang, unmount, search debounce)
  if (axios.isCancel(error) || (axios.isAxiosError(error) && error.code === 'ERR_CANCELED')) {
    return '';
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as ApiResponse<unknown> | Record<string, unknown> | string | undefined;

    // 1. Phản hồi định dạng Envelope: { error: { message: "..." } }
    if (data && typeof data === 'object') {
      const errObj = (data as { error?: ApiError }).error;
      if (errObj && typeof errObj.message === 'string' && errObj.message.trim()) {
        return errObj.message;
      }

      // 2. Phản hồi mảng Payload errors: { errors: [ { message: "..." } ] }
      const errorsList = (data as { errors?: Array<{ message?: string }> }).errors;
      if (Array.isArray(errorsList) && errorsList.length > 0 && errorsList[0]?.message) {
        return errorsList[0].message;
      }

      // 3. Phản hồi message đơn giản: { message: "..." }
      if ('message' in data && typeof data.message === 'string' && data.message.trim()) {
        return data.message;
      }
    }

    if (typeof data === 'string' && data.trim()) {
      return data;
    }

    // Fallback theo mã trạng thái HTTP chuẩn
    switch (status) {
      case 400:
        return 'Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
      case 401:
        return 'Phiên đăng nhập đã hết hạn hoặc tài khoản/mật khẩu không chính xác.';
      case 403:
        return 'Bạn không có quyền truy cập hoặc thực hiện thao tác này.';
      case 404:
        return 'Không tìm thấy dữ liệu yêu cầu.';
      case 409:
        return 'Dữ liệu bị xung đột hoặc trạng thái không hợp lệ.';
      case 422:
        return 'Dữ liệu gửi lên không đáp ứng điều kiện xác thực.';
      case 429:
        return 'Quá nhiều yêu cầu. Vui lòng đợi trong giây lát và thử lại.';
      case 500:
      case 502:
      case 503:
        return 'Hệ thống máy chủ gặp sự cố. Vui lòng thử lại sau ít phút.';
      default:
        break;
    }

    if (error.code === 'ERR_NETWORK') {
      return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.';
    }

    if (error.code === 'ECONNABORTED') {
      return 'Yêu cầu kết nối quá hạn thời gian. Vui lòng thử lại.';
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';
}

export default apiClient;
