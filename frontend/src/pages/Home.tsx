/**
 * Home Page - Trang chủ sau khi đăng nhập
 * 
 * Component này:
 * 1. Hiển thị thông tin user hiện tại
 * 2. Có nút đăng xuất
 * 3. Chỉ hiển thị khi user đã đăng nhập (được bảo vệ bởi ProtectedRoute)
 */

import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { API_ENDPOINTS } from '../constants/api';
import { ClassWithExams } from '../types/class.types';
import apiClient from '../utils/apiClient';

const Home: React.FC = () => {
  // Lấy thông tin user và hàm logout từ AuthContext
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [participatedClasses, setParticipatedClasses] = useState<ClassWithExams[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [error, setError] = useState('');

  /**
   * Load danh sách lớp học đã tham gia
   */
  useEffect(() => {
    if (user?.role === 'student') {
      const fetchParticipatedClasses = async () => {
        try {
          setLoadingClasses(true);
          setError('');
          const response = await apiClient.get(API_ENDPOINTS.CLASSES_PARTICIPATED);
          const data = await response.json();

          if (response.ok && data.success) {
            setParticipatedClasses(data.data || []);
          } else {
            setError(data.message || 'Không thể tải danh sách lớp học');
          }
        } catch (err: any) {
          console.error('Error fetching participated classes:', err);
          setError(err.message || 'Không thể tải danh sách lớp học');
        } finally {
          setLoadingClasses(false);
        }
      };

      fetchParticipatedClasses();
    }
  }, [user]);

  /**
   * Xử lý khi user click nút đăng xuất
   */
  const handleLogout = () => {
    logout(); // Xóa thông tin đăng nhập
    navigate('/login'); // Chuyển về trang đăng nhập
  };

  /**
   * Xử lý khi click vào lớp học đã tham gia
   */
  const handleClassClick = (classData: ClassWithExams) => {
    // Lưu thông tin lớp học vào localStorage
    localStorage.setItem('currentClass', JSON.stringify(classData));
    // Chuyển đến trang lớp học
    navigate('/class-room');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ padding: 4 }}>
          {/* Header với nút đăng xuất */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" component="h1" sx={{ color: '#6366f1', fontWeight: 'bold', letterSpacing: '0.5px' }}>
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
            Chào mừng đến với <span style={{ color: '#6366f1', fontWeight: 'bold', letterSpacing: '0.5px' }}>Quizzi App</span>!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Đây là trang chủ của ứng dụng thi trắc nghiệm. Các tính năng sẽ được phát triển tiếp theo.
          </Typography>

          {/* Nút Tham gia lớp học - chỉ hiển thị cho học sinh */}
          {user?.role === 'student' && (
            <Box>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/join-class')}
                sx={{ minWidth: 200, mb: 3 }}
              >
                Tham gia lớp học
              </Button>

              {/* Danh sách lớp học đã tham gia */}
              <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
                Lớp học đã tham gia
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              {loadingClasses ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : participatedClasses.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Bạn chưa tham gia lớp học nào
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {participatedClasses.map((classData) => (
                    <Grid item xs={12} sm={6} md={4} key={classData.id}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 6,
                          },
                        }}
                        onClick={() => handleClassClick(classData)}
                      >
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                            <Typography variant="h6" component="h3" sx={{ flex: 1 }}>
                              {classData.name}
                            </Typography>
                            <Chip label={classData.code} color="primary" size="small" />
                          </Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Số đề thi: {classData.exams?.length || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Mỗi đề thi có thời gian bắt đầu và kết thúc riêng
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Home;
