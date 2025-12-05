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

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User } from '../types/user.types';
import { API_ENDPOINTS } from '../constants/api';

// Định nghĩa kiểu dữ liệu cho Context
// Interface này mô tả những gì có sẵn trong AuthContext
interface AuthContextType {
  user: User | null; // Thông tin user hiện tại (null nếu chưa đăng nhập)
  token: string | null; // JWT token để xác thực (null nếu chưa đăng nhập)
  login: (email: string, password: string) => Promise<void>; // Hàm đăng nhập
  register: (userData: RegisterData) => Promise<void>; // Hàm đăng ký
  logout: () => void; // Hàm đăng xuất
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
  
  // token: JWT token để xác thực API requests
  const [token, setToken] = useState<string | null>(null);

  // useEffect: Hook để thực hiện side effects (tác dụng phụ)
  // Chạy 1 lần khi component được mount (render lần đầu)
  useEffect(() => {
    // Kiểm tra xem có thông tin đăng nhập đã lưu trong localStorage không
    // localStorage: Lưu trữ dữ liệu trong trình duyệt, không mất khi refresh trang
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    // Nếu có thông tin đã lưu, khôi phục lại state
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser)); // Parse JSON string thành object
      setToken(savedToken);
    }
  }, []); // Mảng rỗng [] nghĩa là chỉ chạy 1 lần khi component mount

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

      // Lưu thông tin user và token vào state
      setUser(data.data.user);
      setToken(data.data.token);
      
      // Lưu vào localStorage để giữ đăng nhập khi refresh trang
      localStorage.setItem('user', JSON.stringify(data.data.user));
      localStorage.setItem('token', data.data.token);
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

      // Lưu thông tin user và token
      setUser(data.data.user);
      setToken(data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      localStorage.setItem('token', data.data.token);
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
   * Xóa thông tin user và token khỏi state và localStorage
   */
  const logout = () => {
    // Xóa khỏi state
    setUser(null);
    setToken(null);
    
    // Xóa khỏi localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // useMemo: Hook để tối ưu performance
  // Chỉ tạo lại object value khi user hoặc token thay đổi
  // Tránh re-render không cần thiết cho các component con
  const value = useMemo(
    () => ({ user, token, login, register, logout }),
    [user, token]
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

