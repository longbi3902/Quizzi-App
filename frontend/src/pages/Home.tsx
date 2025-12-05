/**
 * Home Page - Trang chủ sau khi đăng nhập
 * 
 * Component này:
 * 1. Hiển thị thông tin user hiện tại
 * 2. Có nút đăng xuất
 * 3. Chỉ hiển thị khi user đã đăng nhập (được bảo vệ bởi ProtectedRoute)
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  // Lấy thông tin user và hàm logout từ AuthContext
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  /**
   * Xử lý khi user click nút đăng xuất
   */
  const handleLogout = () => {
    logout(); // Xóa thông tin đăng nhập
    navigate('/login'); // Chuyển về trang đăng nhập
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ padding: 4 }}>
          {/* Header với nút đăng xuất */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" component="h1">
              Quizzi App
            </Typography>
            <Button variant="outlined" color="error" onClick={handleLogout}>
              Đăng Xuất
            </Button>
          </Box>

          {/* Card hiển thị thông tin user */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thông tin tài khoản
              </Typography>
              
              {/* Grid layout để hiển thị thông tin */}
              <Grid container spacing={2}>
                {/* Tên */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Tên:
                  </Typography>
                  <Typography variant="body1">{user?.name}</Typography>
                </Grid>

                {/* Email */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Email:
                  </Typography>
                  <Typography variant="body1">{user?.email}</Typography>
                </Grid>

                {/* Vai trò */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Vai trò:
                  </Typography>
                  <Typography variant="body1">
                    {user?.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}
                  </Typography>
                </Grid>

                {/* Trường */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Trường:
                  </Typography>
                  <Typography variant="body1">{user?.school}</Typography>
                </Grid>

                {/* Năm sinh - Chỉ hiển thị nếu có */}
                {user?.birthYear && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Năm sinh:
                    </Typography>
                    <Typography variant="body1">{user.birthYear}</Typography>
                  </Grid>
                )}

                {/* Lớp - Chỉ hiển thị nếu có */}
                {user?.className && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Lớp:
                    </Typography>
                    <Typography variant="body1">{user.className}</Typography>
                  </Grid>
                )}

                {/* Số điện thoại - Chỉ hiển thị nếu có */}
                {user?.phone && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Số điện thoại:
                    </Typography>
                    <Typography variant="body1">{user.phone}</Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Thông báo chào mừng */}
          <Typography variant="h6" gutterBottom>
            Chào mừng đến với Quizzi App!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Đây là trang chủ của ứng dụng thi trắc nghiệm. Các tính năng sẽ được phát triển tiếp theo.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Home;
