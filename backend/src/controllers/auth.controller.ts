import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import userService from '../services/user.service';
import refreshTokenService from '../services/refreshToken.service';
import { RegisterDTO, LoginDTO } from '../types/user.types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';
const ACCESS_TOKEN_EXPIRES_IN = '15m'; // Access token hết hạn sau 15 phút
const REFRESH_TOKEN_EXPIRES_IN = '30d'; // Refresh token hết hạn sau 30 ngày

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const userData: RegisterDTO = req.body;

      // Validation
      if (!userData.name || !userData.email || !userData.password || !userData.school || !userData.role) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền đầy đủ các trường bắt buộc: Tên, Email, Mật khẩu, Trường, Vai trò'
        });
      }

      // Check if email already exists
      const existingUser = await userService.findByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email đã được sử dụng'
        });
      }

      // Validate role
      if (userData.role !== 'teacher' && userData.role !== 'student') {
        return res.status(400).json({
          success: false,
          message: 'Vai trò không hợp lệ. Chọn teacher hoặc student'
        });
      }

      // Create user
      const user = await userService.create(userData);

      // Generate access token (ngắn hạn)
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
      );

      // Generate refresh token (dài hạn)
      const refreshToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_REFRESH_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
      );

      // Lưu refresh token vào database
      const refreshTokenExpiresAt = new Date();
      refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 30); // 30 ngày
      await refreshTokenService.create(user.id, refreshToken, refreshTokenExpiresAt);

      // Return user data (without password)
      const { password, ...userWithoutPassword } = user;

      res.status(201).json({
        success: true,
        message: 'Đăng ký thành công',
        data: {
          user: userWithoutPassword,
          accessToken,
          refreshToken
        }
      });
    } catch (error: any) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi đăng ký',
        error: error.message
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const loginData: LoginDTO = req.body;
      console.log('Login attempt:', { email: loginData.email });

      // Validation
      if (!loginData.email || !loginData.password) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập email và mật khẩu'
        });
      }

      // Find user by email
      const user = await userService.findByEmail(loginData.email);
      if (!user) {
        console.log('User not found:', loginData.email);
        return res.status(401).json({
          success: false,
          message: 'Email hoặc mật khẩu không đúng'
        });
      }

      // Verify password
      const isPasswordValid = await userService.verifyPassword(loginData.password, user.password);
      console.log('Password valid:', isPasswordValid);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Email hoặc mật khẩu không đúng'
        });
      }

      // Generate access token (ngắn hạn)
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
      );

      // Generate refresh token (dài hạn)
      const refreshToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_REFRESH_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
      );

      // Lưu refresh token vào database
      const refreshTokenExpiresAt = new Date();
      refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 30); // 30 ngày
      await refreshTokenService.create(user.id, refreshToken, refreshTokenExpiresAt);

      // Return user data (without password)
      const { password, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: 'Đăng nhập thành công',
        data: {
          user: userWithoutPassword,
          accessToken,
          refreshToken
        }
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi đăng nhập',
        error: error.message
      });
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken: token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token là bắt buộc',
        });
      }

      // Verify refresh token
      let decoded: any;
      try {
        decoded = jwt.verify(token, JWT_REFRESH_SECRET);
      } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
          // Xóa refresh token đã hết hạn
          await refreshTokenService.delete(token);
          return res.status(401).json({
            success: false,
            message: 'Refresh token đã hết hạn. Vui lòng đăng nhập lại',
          });
        }
        return res.status(401).json({
          success: false,
          message: 'Refresh token không hợp lệ',
        });
      }

      // Kiểm tra refresh token có trong database không
      const storedToken = await refreshTokenService.findByToken(token);
      if (!storedToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token không tồn tại',
        });
      }

      // Kiểm tra token đã hết hạn chưa (theo database)
      if (new Date(storedToken.expires_at) < new Date()) {
        await refreshTokenService.delete(token);
        return res.status(401).json({
          success: false,
          message: 'Refresh token đã hết hạn. Vui lòng đăng nhập lại',
        });
      }

      // Lấy thông tin user
      const user = await userService.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User không tồn tại',
        });
      }

      // Tạo access token mới
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
      );

      res.json({
        success: true,
        message: 'Refresh token thành công',
        data: {
          accessToken,
        },
      });
    } catch (error: any) {
      console.error('Refresh token error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi refresh token',
        error: error.message,
      });
    }
  }

  /**
   * Logout - Xóa refresh token
   */
  async logout(req: Request, res: Response) {
    try {
      const { refreshToken: token } = req.body;

      if (token) {
        await refreshTokenService.delete(token);
      }

      res.json({
        success: true,
        message: 'Đăng xuất thành công',
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi đăng xuất',
        error: error.message,
      });
    }
  }
}

export default new AuthController();

