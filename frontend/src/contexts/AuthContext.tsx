/**
 * AuthContext - Quản lý trạng thái đăng nhập/đăng ký
 * 
 * Context trong React là cách để chia sẻ dữ liệu giữa các component
 * mà không cần truyền props qua nhiều cấp (prop drilling)
 * 
 * File này quản lý:
 * - Thông tin user hiện tại đang đăng nhập
 * - Token để xác thực API requests
 * - Các hàm: login, register, logout
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { User } from '../types/user.types';
import { API_ENDPOINTS } from '../constants/api';
import { isTokenExpired, getTokenTimeRemaining } from '../utils/tokenUtils';

// Định nghĩa kiểu dữ liệu cho Context
// Interface này mô tả những gì có sẵn trong AuthContext
interface AuthContextType {
  user: User | null; // Thông tin user hiện tại (null nếu chưa đăng nhập)
  accessToken: string | null; // Access token để xác thực (null nếu chưa đăng nhập)
  refreshToken: string | null; // Refresh token để lấy lại access token
  isLoading: boolean; // Đang load từ localStorage
  login: (email: string, password: string) => Promise<void>; // Hàm đăng nhập
  register: (userData: RegisterData) => Promise<void>; // Hàm đăng ký
  logout: () => void; // Hàm đăng xuất
  refreshAccessToken: () => Promise<boolean>; // Hàm refresh access token
}

// Định nghĩa kiểu dữ liệu cho form đăng ký
export interface RegisterData {
  name: string; // Tên (bắt buộc)
  email: string; // Email (bắt buộc)
  password: string; // Mật khẩu (bắt buộc)
  role: 'teacher' | 'student'; // Vai trò: giáo viên hoặc học sinh
  birthYear?: number; // Năm sinh (không bắt buộc)
  className?: string; // Lớp (không bắt buộc)
  school: string; // Trường (bắt buộc)
  phone?: string; // Số điện thoại (không bắt buộc)
}

// Tạo Context với giá trị mặc định là undefined
// Context này sẽ được cung cấp bởi AuthProvider
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider - Component cung cấp AuthContext cho toàn bộ app
 * 
 * Component này:
 * 1. Quản lý state (trạng thái) của user và token
 * 2. Cung cấp các hàm để đăng nhập, đăng ký, đăng xuất
 * 3. Lưu thông tin vào localStorage để giữ đăng nhập khi refresh trang
 * 
 * @param children - Các component con sẽ được wrap bởi AuthProvider
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // useState: Hook để quản lý state trong React
  // user: Thông tin user hiện tại (null nếu chưa đăng nhập)
  const [user, setUser] = useState<User | null>(null);
  
  // accessToken: JWT access token để xác thực API requests (ngắn hạn)
  const [accessToken, setAccessToken] = useState<string | null>(null);
  
  // refreshToken: JWT refresh token để lấy lại access token (dài hạn)
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  
  // Ref để tránh refresh token nhiều lần cùng lúc
  const isRefreshing = useRef(false);
  const refreshPromise = useRef<Promise<boolean> | null>(null);
  
  // Loading state để biết đang load từ localStorage
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // useEffect: Hook để thực hiện side effects (tác dụng phụ)
  // Chạy 1 lần khi component được mount (render lần đầu)
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Kiểm tra xem có thông tin đăng nhập đã lưu trong localStorage không
        // localStorage: Lưu trữ dữ liệu trong trình duyệt, không mất khi refresh trang
        const savedUser = localStorage.getItem('user');
        const savedAccessToken = localStorage.getItem('accessToken');
        const savedRefreshToken = localStorage.getItem('refreshToken');
        
        // Nếu có thông tin đã lưu, khôi phục lại state
        if (savedUser && savedAccessToken && savedRefreshToken) {
          setUser(JSON.parse(savedUser)); // Parse JSON string thành object
          setAccessToken(savedAccessToken);
          setRefreshToken(savedRefreshToken);
          
          // Kiểm tra access token có hết hạn không, nếu có thì refresh ngay
          if (isTokenExpired(savedAccessToken)) {
            // Token đã hết hạn, refresh ngay
            const currentRefreshToken = savedRefreshToken;
            try {
              const response = await fetch(API_ENDPOINTS.REFRESH, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken: currentRefreshToken }),
              });

              const data = await response.json();
              if (response.ok && data.success) {
                const newAccessToken = data.data.accessToken;
                setAccessToken(newAccessToken);
                localStorage.setItem('accessToken', newAccessToken);
              } else {
                // Refresh token hết hạn, xóa hết
                setUser(null);
                setAccessToken(null);
                setRefreshToken(null);
                localStorage.removeItem('user');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
              }
            } catch (error) {
              console.error('Error refreshing token on init:', error);
              // Nếu refresh thất bại, giữ nguyên tokens (có thể là lỗi network)
            }
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []); // Mảng rỗng [] nghĩa là chỉ chạy 1 lần khi component mount

  /**
   * Refresh access token
   */
  const refreshAccessToken = async (): Promise<boolean> => {
    // Nếu đang refresh rồi, đợi promise hiện tại
    if (isRefreshing.current && refreshPromise.current) {
      return refreshPromise.current;
    }

    isRefreshing.current = true;

    refreshPromise.current = (async () => {
      try {
        const currentRefreshToken = refreshToken || localStorage.getItem('refreshToken');
        
        if (!currentRefreshToken) {
          throw new Error('Không có refresh token');
        }

        const response = await fetch(API_ENDPOINTS.REFRESH, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: currentRefreshToken }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Refresh token thất bại');
        }

        // Cập nhật access token mới
        const newAccessToken = data.data.accessToken;
        setAccessToken(newAccessToken);
        localStorage.setItem('accessToken', newAccessToken);

        return true;
      } catch (error: any) {
        console.error('Refresh token error:', error);
        // Nếu refresh token hết hạn, logout
        logout();
        return false;
      } finally {
        isRefreshing.current = false;
        refreshPromise.current = null;
      }
    })();

    return refreshPromise.current;
  };

  // Tự động refresh token khi sắp hết hạn
  useEffect(() => {
    if (!accessToken) return;

    let timer: NodeJS.Timeout | null = null;

    const checkAndRefresh = async () => {
      if (isTokenExpired(accessToken!)) {
        // Token đã hết hạn hoặc sắp hết hạn, refresh ngay
        await refreshAccessToken();
      } else {
        // Token còn hạn, đặt timer để refresh trước khi hết hạn
        const timeRemaining = getTokenTimeRemaining(accessToken!);
        if (timeRemaining > 0) {
          timer = setTimeout(() => {
            refreshAccessToken();
          }, timeRemaining);
        }
      }
    };

    checkAndRefresh();

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  /**
   * Hàm đăng nhập
   * Gửi request đến backend để xác thực email và password
   * 
   * @param email - Email của user
   * @param password - Mật khẩu của user
   * @throws Error nếu đăng nhập thất bại
   */
  const login = async (email: string, password: string) => {
    try {
      // fetch: API của trình duyệt để gửi HTTP requests
      // async/await: Cú pháp để xử lý bất đồng bộ (asynchronous)
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST', // Phương thức HTTP: POST để gửi dữ liệu
        headers: {
          'Content-Type': 'application/json', // Báo cho server biết gửi dữ liệu dạng JSON
        },
        body: JSON.stringify({ email, password }), // Chuyển object thành JSON string
      });

      // Kiểm tra xem response có phải JSON không
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server trả về dữ liệu không hợp lệ');
      }

      // Parse JSON response thành object
      const data = await response.json();

      // Kiểm tra xem request có thành công không
      // response.ok: true nếu status code 200-299
      // data.success: flag từ backend để báo thành công
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }

      // Lưu thông tin user và tokens vào state
      setUser(data.data.user);
      setAccessToken(data.data.accessToken);
      setRefreshToken(data.data.refreshToken);
      
      // Lưu vào localStorage để giữ đăng nhập khi refresh trang
      localStorage.setItem('user', JSON.stringify(data.data.user));
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Nếu error đã có message, throw lại
      if (error.message) {
        throw error;
      }
      
      // Xử lý lỗi network (không kết nối được đến server)
      if (error.name === 'TypeError' || error.message?.includes('fetch')) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không.');
      }
      
      // Lỗi khác
      throw new Error('Đăng nhập thất bại. Vui lòng thử lại.');
    }
  };

  /**
   * Hàm đăng ký tài khoản mới
   * Gửi thông tin đăng ký đến backend để tạo tài khoản mới
   * 
   * @param userData - Dữ liệu đăng ký (tên, email, password, ...)
   * @throws Error nếu đăng ký thất bại
   */
  const register = async (userData: RegisterData) => {
    try {
      // Gửi request đăng ký đến backend
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      // Kiểm tra kết quả
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Đăng ký thất bại');
      }

      // Lưu thông tin user và tokens
      setUser(data.data.user);
      setAccessToken(data.data.accessToken);
      setRefreshToken(data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
    } catch (error: any) {
      console.error('Register error:', error);
      if (error.message) {
        throw error;
      }
      throw new Error('Đăng ký thất bại. Vui lòng thử lại.');
    }
  };

  /**
   * Hàm đăng xuất
   * Xóa thông tin user và tokens khỏi state và localStorage
   */
  const logout = async () => {
    // Gọi API logout để xóa refresh token trên server
    const currentRefreshToken = refreshToken || localStorage.getItem('refreshToken');
    if (currentRefreshToken) {
      try {
        await fetch(API_ENDPOINTS.LOGOUT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: currentRefreshToken }),
        });
      } catch (error) {
        console.error('Logout API error:', error);
      }
    }

    // Xóa khỏi state
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    
    // Xóa khỏi localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  // useMemo: Hook để tối ưu performance
  // Chỉ tạo lại object value khi user hoặc tokens thay đổi
  // Tránh re-render không cần thiết cho các component con
  const value = useMemo(
    () => ({ user, accessToken, refreshToken, isLoading, login, register, logout, refreshAccessToken }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, accessToken, refreshToken, isLoading]
  );

  // Provider: Component cung cấp Context cho các component con
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom Hook để sử dụng AuthContext
 * 
 * Thay vì dùng useContext(AuthContext) trực tiếp,
 * dùng useAuth() sẽ:
 * 1. Dễ đọc hơn
 * 2. Đảm bảo chỉ dùng trong AuthProvider
 * 3. Có type safety tốt hơn
 * 
 * @returns AuthContextType - Object chứa user, token, login, register, logout
 * @throws Error nếu dùng ngoài AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // Kiểm tra xem có đang dùng trong AuthProvider không
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

