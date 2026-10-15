import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import type { Role, User, LoginCredentials, AuthResponse } from '@/admin/types/auth';
import {
  apiClient,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
} from '@/admin/lib/api-client';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: ((email: string, password: string) => Promise<User>) &
    ((credentials: LoginCredentials) => Promise<User>);
  logout: () => Promise<void>;
  hasRole: (roles: Role | Role[]) => boolean;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const navigate = useNavigate();

  /**
   * Tải lại thông tin người dùng từ GET /api/users/me
   */
  const refreshUser = useCallback(async (): Promise<User | null> => {
    const currentToken = getAuthToken();
    if (!currentToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return null;
    }

    try {
      const response = await apiClient.get<{ user: User | null }>('/users/me');
      if (response.data && response.data.user) {
        setUser(response.data.user);
        setToken(currentToken);
        return response.data.user;
      } else {
        removeAuthToken();
        setUser(null);
        setToken(null);
        return null;
      }
    } catch {
      removeAuthToken();
      setUser(null);
      setToken(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Khởi tạo trạng thái xác thực khi tải trang
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Lắng nghe sự kiện 401 tự động từ api-client
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleUnauthorized = () => {
      removeAuthToken();
      setToken(null);
      setUser(null);
      navigate('/login');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [navigate]);

  /**
   * Đăng nhập: POST /api/users/login
   * Hỗ trợ gọi login(email, password) hoặc login({ email, password })
   */
  const login = useCallback(
    async (
      emailOrCredentials: string | LoginCredentials,
      maybePassword?: string
    ): Promise<User> => {
      let email = '';
      let password = '';

      if (typeof emailOrCredentials === 'object' && emailOrCredentials !== null) {
        email = emailOrCredentials.email;
        password = emailOrCredentials.password;
      } else {
        email = emailOrCredentials;
        password = maybePassword || '';
      }

      const response = await apiClient.post<AuthResponse>('/users/login', {
        email,
        password,
      });

      const data = response.data;
      if (!data.token || !data.user) {
        throw new Error('Dữ liệu phản hồi xác thực không hợp lệ từ máy chủ.');
      }

      setAuthToken(data.token);
      setToken(data.token);
      setUser(data.user);

      return data.user;
    },
    []
  ) as AuthContextType['login'];

  /**
   * Đăng xuất: gọi POST /api/users/logout (fire & forget), xóa token, reset state, navigate về /login
   */
  const logout = useCallback(async () => {
    try {
      await apiClient.post('/users/logout');
    } catch {
      // Fire and forget: lỗi mạng không chặn việc đăng xuất ở client
    } finally {
      removeAuthToken();
      setToken(null);
      setUser(null);
      navigate('/login');
    }
  }, [navigate]);

  /**
   * Kiểm tra quyền: người dùng hiện tại có thuộc danh sách vai trò cho phép hay không
   */
  const hasRole = useCallback(
    (roles: Role | Role[]): boolean => {
      if (!user) return false;
      const roleList = Array.isArray(roles) ? roles : [roles];
      return roleList.includes(user.role);
    },
    [user]
  );

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: !!user && !!token,
      login,
      logout,
      hasRole,
      refreshUser,
    }),
    [user, token, isLoading, login, logout, hasRole, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook truy xuất AuthContext với thông báo lỗi rõ ràng nếu dùng ngoài AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
