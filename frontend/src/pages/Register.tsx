/**
 * Register Page - Trang đăng ký
 * 
 * Component này hiển thị form đăng ký với đầy đủ thông tin:
 * - Tên, Email, Mật khẩu (bắt buộc)
 * - Vai trò: Teacher hoặc Student (bắt buộc)
 * - Trường (bắt buộc)
 * - Năm sinh, Lớp, Số điện thoại (không bắt buộc)
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
  MenuItem,
  Grid,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { isValidPassword, doPasswordsMatch } from '../utils/validation';

// Định nghĩa kiểu dữ liệu cho form đăng ký
interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'teacher' | 'student';
  birthYear: string; // Dùng string vì từ input number
  className: string;
  school: string;
  phone: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  // State quản lý dữ liệu form
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student', // Mặc định là học sinh
    birthYear: '',
    className: '',
    school: '',
    phone: '',
  });

  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * Xử lý khi user thay đổi giá trị trong input
   * @param e - Event từ input change
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Cập nhật state với giá trị mới
    // Spread operator (...) giữ lại các giá trị cũ, chỉ thay đổi field được update
    setFormData({
      ...formData,
      [e.target.name]: e.target.value, // Dynamic property name
    });
  };

  /**
   * Validate form trước khi submit
   * @returns true nếu hợp lệ, false nếu không
   */
  const validateForm = (): boolean => {
    // Kiểm tra các trường bắt buộc
    if (!formData.name || !formData.email || !formData.password || !formData.school) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc');
      return false;
    }

    // Kiểm tra mật khẩu có đủ dài không
    if (!isValidPassword(formData.password)) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }

    // Kiểm tra mật khẩu xác nhận có khớp không
    if (!doPasswordsMatch(formData.password, formData.confirmPassword)) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }

    return true;
  };

  /**
   * Xử lý khi user submit form đăng ký
   * @param e - Event từ form submit
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!validateForm()) {
      return; // Dừng lại nếu validation thất bại
    }

    setLoading(true);

    try {
      // Gọi hàm register từ AuthContext
      // Chuyển đổi dữ liệu từ form sang format mà API cần
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        // Chỉ gửi birthYear nếu có giá trị
        birthYear: formData.birthYear ? Number.parseInt(formData.birthYear, 10) : undefined,
        className: formData.className || undefined,
        school: formData.school,
        phone: formData.phone || undefined,
      });
      
      // Chuyển đến trang Home nếu đăng ký thành công
      navigate('/home');
    } catch (err: any) {
      // Hiển thị lỗi nếu có
      setError(err.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
          marginBottom: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%', borderRadius: '12px' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom sx={{ color: '#6366f1', fontWeight: 'bold', letterSpacing: '0.5px' }}>
            QUIZZI
          </Typography>
          <Typography component="h2" variant="h6" align="center" gutterBottom sx={{ opacity: 0.7, fontSize: '0.9rem' }}>
            ĐĂNG KÝ
          </Typography>

          {/* Hiển thị lỗi */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {/* Form đăng ký */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            {/* Grid layout: Responsive, tự động điều chỉnh theo màn hình */}
            <Grid container spacing={2}>
              {/* Tên - Bắt buộc */}
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="name"
                  label="Tên"
                  name="name"
                  autoComplete="name"
                  autoFocus
                  value={formData.name}
                  onChange={handleChange}
                />
              </Grid>

              {/* Email - Bắt buộc */}
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email"
                  name="email"
                  autoComplete="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Grid>

              {/* Mật khẩu - Bắt buộc */}
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Mật khẩu"
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </Grid>

              {/* Xác nhận mật khẩu - Bắt buộc */}
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Xác nhận mật khẩu"
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </Grid>

              {/* Vai trò - Bắt buộc */}
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  select
                  id="role"
                  label="Vai trò"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <MenuItem value="teacher">Giáo viên</MenuItem>
                  <MenuItem value="student">Học sinh</MenuItem>
                </TextField>
              </Grid>

              {/* Năm sinh - Không bắt buộc */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="birthYear"
                  label="Năm sinh"
                  name="birthYear"
                  type="number"
                  value={formData.birthYear}
                  onChange={handleChange}
                  inputProps={{ min: 1950, max: new Date().getFullYear() }}
                />
              </Grid>

              {/* Lớp - Không bắt buộc */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="className"
                  label="Lớp"
                  name="className"
                  value={formData.className}
                  onChange={handleChange}
                />
              </Grid>

              {/* Trường - Bắt buộc */}
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="school"
                  label="Trường"
                  name="school"
                  value={formData.school}
                  onChange={handleChange}
                />
              </Grid>

              {/* Số điện thoại - Không bắt buộc */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="phone"
                  label="Số điện thoại"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            {/* Button Submit */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Đăng Ký'}
            </Button>

            {/* Link chuyển đến trang đăng nhập */}
            <Box textAlign="center">
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  Đã có tài khoản? Đăng nhập ngay
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
