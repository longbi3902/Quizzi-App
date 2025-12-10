/**
 * Login Page - Trang đăng nhập
 * 
 * Component này hiển thị form đăng nhập và xử lý logic đăng nhập
 * 
 * Các bước hoạt động:
 * 1. User nhập email và password
 * 2. Khi submit form, gọi hàm login từ AuthContext
 * 3. Nếu thành công, chuyển đến trang Home
 * 4. Nếu thất bại, hiển thị thông báo lỗi
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  // useNavigate: Hook từ react-router-dom để điều hướng (chuyển trang)
  const navigate = useNavigate();
  
  // useAuth: Custom hook để lấy hàm login từ AuthContext
  const { login } = useAuth();

  // useState: Quản lý state của form
  // State là dữ liệu có thể thay đổi trong component
  const [email, setEmail] = useState<string>(''); // Email người dùng nhập
  const [password, setPassword] = useState<string>(''); // Mật khẩu người dùng nhập
  const [error, setError] = useState<string>(''); // Thông báo lỗi (nếu có)
  const [loading, setLoading] = useState<boolean>(false); // Trạng thái đang xử lý (loading)

  /**
   * Xử lý khi user submit form đăng nhập
   * @param e - Event object từ form submit
   */
  const handleSubmit = async (e: React.FormEvent) => {
    // preventDefault: Ngăn form submit theo cách mặc định (reload trang)
    e.preventDefault();
    
    // Reset error message
    setError('');
    
    // Bắt đầu loading
    setLoading(true);

    try {
      // Gọi hàm login từ AuthContext
      // async/await: Đợi kết quả trả về trước khi tiếp tục
      await login(email, password);
      
      // Nếu đăng nhập thành công, chuyển đến trang Home
      navigate('/home');
    } catch (err: any) {
      // Nếu có lỗi, hiển thị thông báo lỗi
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      // Luôn tắt loading, dù thành công hay thất bại
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Paper: Component từ MUI để tạo card/container có shadow */}
        <Paper elevation={3} sx={{ padding: 4, width: '100%', borderRadius: '12px' }}>
          {/* Header */}
          <Typography component="h1" variant="h4" align="center" gutterBottom sx={{ color: '#6366f1', fontWeight: 'bold', letterSpacing: '0.5px' }}>
            QUIZZI
          </Typography>
          <Typography component="h2" variant="h6" align="center" gutterBottom sx={{ opacity: 0.7, fontSize: '0.9rem' }}>
            ĐĂNG NHẬP
          </Typography>

          {/* Hiển thị thông báo lỗi nếu có */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {/* Form đăng nhập */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            {/* Input Email */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus // Tự động focus vào input này khi trang load
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Cập nhật state khi user nhập
              size="small"
              variant="outlined"
            />
            
            {/* Input Password */}
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mật khẩu"
              type="password" // Ẩn ký tự khi nhập
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="small"
              variant="outlined"
            />
            
            {/* Button Submit */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading} // Disable button khi đang loading
            >
              {/* Hiển thị loading spinner hoặc text */}
              {loading ? <CircularProgress size={24} /> : 'Đăng Nhập'}
            </Button>
            
            {/* Link chuyển đến trang đăng ký */}
            <Box textAlign="center">
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  Chưa có tài khoản? Đăng ký ngay
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
