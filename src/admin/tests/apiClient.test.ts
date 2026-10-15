import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  apiClient,
  AUTH_TOKEN_KEY,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  getApiErrorMessage,
} from '@/admin/lib/api-client';

describe('API Client & Token Management', () => {
  beforeEach(() => {
    localStorage.clear();
    removeAuthToken();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    removeAuthToken();
  });

  describe('Token Helpers (Cookie-based)', () => {
    it('đọc, ghi và xóa token từ Cookie một cách chính xác', () => {
      expect(getAuthToken()).toBeNull();

      setAuthToken('mock-jwt-token-123');
      expect(getAuthToken()).toBe('mock-jwt-token-123');
      expect(document.cookie).toContain('cms_admin_token=mock-jwt-token-123');

      removeAuthToken();
      expect(getAuthToken()).toBeNull();
      expect(document.cookie).not.toContain('cms_admin_token=mock-jwt-token-123');
    });

    it('tự động migrate token từ localStorage sang Cookie nếu tìm thấy legacy token', () => {
      localStorage.setItem(AUTH_TOKEN_KEY, 'legacy-storage-token-999');

      // Khi gọi getAuthToken, hàm sẽ tự nhận diện và chuyển sang Cookie
      expect(getAuthToken()).toBe('legacy-storage-token-999');
      expect(document.cookie).toContain('cms_admin_token=legacy-storage-token-999');
      // Đã tự dọn sạch localStorage
      expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    });
  });

  describe('Request Interceptor', () => {
    it('tự động đính kèm Authorization header nếu có token trong storage', async () => {
      setAuthToken('test-token-xyz');

      // Lấy interceptor đã đăng ký
      const interceptor = (apiClient.interceptors.request as any).handlers[0];
      expect(interceptor).toBeDefined();

      const config: InternalAxiosRequestConfig = {
        headers: new axios.AxiosHeaders(),
      } as InternalAxiosRequestConfig;

      const modifiedConfig = await interceptor.fulfilled(config);
      expect(modifiedConfig.headers.Authorization).toBe('Bearer test-token-xyz');
    });

    it('không ghi đè Authorization header nếu request đã chủ động cấu hình', async () => {
      setAuthToken('test-token-xyz');

      const interceptor = (apiClient.interceptors.request as any).handlers[0];

      const config: InternalAxiosRequestConfig = {
        headers: new axios.AxiosHeaders({
          Authorization: 'CustomCustomToken 999',
        }),
      } as InternalAxiosRequestConfig;

      const modifiedConfig = await interceptor.fulfilled(config);
      expect(modifiedConfig.headers.Authorization).toBe('CustomCustomToken 999');
    });

    it('không đính kèm Authorization header nếu chưa có token trong storage', async () => {
      removeAuthToken();

      const interceptor = (apiClient.interceptors.request as any).handlers[0];

      const config: InternalAxiosRequestConfig = {
        headers: new axios.AxiosHeaders(),
      } as InternalAxiosRequestConfig;

      const modifiedConfig = await interceptor.fulfilled(config);
      expect(modifiedConfig.headers.Authorization).toBeUndefined();
    });
  });

  describe('Response Interceptor & 401 Auto-Logout', () => {
    it('tự động xóa token và dispatch sự kiện auth:unauthorized khi gặp 401 trên route bình thường', async () => {
      setAuthToken('expired-token');
      const unauthorizedListener = vi.fn();
      window.addEventListener('auth:unauthorized', unauthorizedListener);

      const interceptor = (apiClient.interceptors.response as any).handlers[0];

      const mockError = {
        response: { status: 401 },
        config: { url: '/api/articles' },
      } as AxiosError;

      await expect(interceptor.rejected(mockError)).rejects.toBe(mockError);

      expect(getAuthToken()).toBeNull();
      expect(unauthorizedListener).toHaveBeenCalledTimes(1);

      window.removeEventListener('auth:unauthorized', unauthorizedListener);
    });

    it('KHÔNG xóa token hay phát sự kiện khi nhận 401 từ endpoint /users/login', async () => {
      setAuthToken('some-token');
      const unauthorizedListener = vi.fn();
      window.addEventListener('auth:unauthorized', unauthorizedListener);

      const interceptor = (apiClient.interceptors.response as any).handlers[0];

      const mockLoginError = {
        response: { status: 401 },
        config: { url: '/api/users/login' },
      } as AxiosError;

      await expect(interceptor.rejected(mockLoginError)).rejects.toBe(mockLoginError);

      // Token vẫn còn và sự kiện không được kích hoạt
      expect(getAuthToken()).toBe('some-token');
      expect(unauthorizedListener).not.toHaveBeenCalled();

      window.removeEventListener('auth:unauthorized', unauthorizedListener);
    });

    it('cho phép response thành công 200 đi qua bình thường', async () => {
      const interceptor = (apiClient.interceptors.response as any).handlers[0];
      const mockResponse = { data: { success: true }, status: 200 };

      const result = await interceptor.fulfilled(mockResponse);
      expect(result).toBe(mockResponse);
    });
  });

  describe('getApiErrorMessage Helper', () => {
    it('trích xuất message từ chuẩn phong bì envelope { error: { message: ... } }', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 404,
          data: {
            success: false,
            error: {
              code: 'ROUTE_NOT_FOUND',
              message: 'Không tìm thấy dữ liệu tuyến đường',
            },
          },
        },
      } as unknown as AxiosError;

      expect(getApiErrorMessage(error)).toBe('Không tìm thấy dữ liệu tuyến đường');
    });

    it('trích xuất message từ Payload collection validation errors: { errors: [ { message } ] }', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 422,
          data: {
            errors: [{ message: 'Email đã được sử dụng bởi tài khoản khác.' }],
          },
        },
      } as unknown as AxiosError;

      expect(getApiErrorMessage(error)).toBe('Email đã được sử dụng bởi tài khoản khác.');
    });

    it('trích xuất message đơn { message: "..." }', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 400,
          data: {
            message: 'Mật khẩu phải có tối thiểu 8 ký tự.',
          },
        },
      } as unknown as AxiosError;

      expect(getApiErrorMessage(error)).toBe('Mật khẩu phải có tối thiểu 8 ký tự.');
    });

    it('trả về thông báo tiếng Việt theo mã HTTP khi data không có message', () => {
      const error401 = {
        isAxiosError: true,
        response: { status: 401, data: {} },
      } as unknown as AxiosError;
      expect(getApiErrorMessage(error401)).toBe(
        'Phiên đăng nhập đã hết hạn hoặc tài khoản/mật khẩu không chính xác.'
      );

      const error403 = {
        isAxiosError: true,
        response: { status: 403, data: {} },
      } as unknown as AxiosError;
      expect(getApiErrorMessage(error403)).toBe(
        'Bạn không có quyền truy cập hoặc thực hiện thao tác này.'
      );

      const error404 = {
        isAxiosError: true,
        response: { status: 404, data: {} },
      } as unknown as AxiosError;
      expect(getApiErrorMessage(error404)).toBe('Không tìm thấy dữ liệu yêu cầu.');

      const error429 = {
        isAxiosError: true,
        response: { status: 429, data: {} },
      } as unknown as AxiosError;
      expect(getApiErrorMessage(error429)).toBe(
        'Quá nhiều yêu cầu. Vui lòng đợi trong giây lát và thử lại.'
      );

      const error500 = {
        isAxiosError: true,
        response: { status: 500, data: {} },
      } as unknown as AxiosError;
      expect(getApiErrorMessage(error500)).toBe(
        'Hệ thống máy chủ gặp sự cố. Vui lòng thử lại sau ít phút.'
      );
    });

    it('xử lý lỗi mất kết nối mạng ERR_NETWORK', () => {
      const networkError = {
        isAxiosError: true,
        code: 'ERR_NETWORK',
        message: 'Network Error',
      } as unknown as AxiosError;

      expect(getApiErrorMessage(networkError)).toBe(
        'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.'
      );
    });

    it('xử lý lỗi quá hạn kết nối ECONNABORTED', () => {
      const timeoutError = {
        isAxiosError: true,
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded',
      } as unknown as AxiosError;

      expect(getApiErrorMessage(timeoutError)).toBe(
        'Yêu cầu kết nối quá hạn thời gian. Vui lòng thử lại.'
      );
    });

    it('xử lý lỗi do request bị chủ động hủy (CanceledError / ERR_CANCELED)', () => {
      const canceledError = {
        isAxiosError: true,
        code: 'ERR_CANCELED',
        name: 'CanceledError',
        message: 'canceled',
      } as unknown as AxiosError;

      expect(getApiErrorMessage(canceledError)).toBe('');
    });

    it('xử lý Error thuần và chuỗi string', () => {
      expect(getApiErrorMessage(new Error('Lỗi tùy biến'))).toBe('Lỗi tùy biến');
      expect(getApiErrorMessage('Lỗi chuỗi')).toBe('Lỗi chuỗi');
      expect(getApiErrorMessage(null)).toBe('Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
    });
  });
});
