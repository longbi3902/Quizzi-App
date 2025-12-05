import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import userService from '../services/user.service';
import { RegisterDTO, LoginDTO } from '../types/user.types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Return user data (without password)
      const { password, ...userWithoutPassword } = user;

      res.status(201).json({
        success: true,
        message: 'Đăng ký thành công',
        data: {
          user: userWithoutPassword,
          token
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

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Return user data (without password)
      const { password, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: 'Đăng nhập thành công',
        data: {
          user: userWithoutPassword,
          token
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
}

export default new AuthController();

