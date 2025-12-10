/**
 * TeacherDashboard - Dashboard dành cho giáo viên
 * 
 * Component này hiển thị:
 * - Menu điều hướng các chức năng
 * - Quản lý câu hỏi
 * - Các tính năng khác (sẽ phát triển sau)
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import ListIcon from '@mui/icons-material/List';
import { useAuth } from '../contexts/AuthContext';

const TeacherDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ padding: 4 }}>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant="h4" component="h1" sx={{ color: '#6366f1', fontWeight: 'bold', letterSpacing: '0.5px' }}>
              Dashboard Giáo Viên
            </Typography>
            <Button variant="outlined" color="error" onClick={handleLogout}>
              Đăng Xuất
            </Button>
          </Box>

          {/* Thông tin giáo viên */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Chào mừng, {user?.name}!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: {user?.email} | Trường: {user?.school}
              </Typography>
            </CardContent>
          </Card>

          {/* Menu chức năng */}
          <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            Quản lý
          </Typography>

          <Grid container spacing={3}>
            {/* Quản lý câu hỏi */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
                onClick={() => navigate('/teacher/questions')}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <QuizIcon sx={{ fontSize: 40, color: '#6366f1', mr: 2 }} />
                    <Typography variant="h6" component="h2">
                      Quản lý câu hỏi
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Xem, thêm, sửa, xóa câu hỏi và đáp án
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => navigate('/teacher/questions')}>
                    Xem chi tiết
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            {/* Quản lý đề thi */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
                onClick={() => navigate('/teacher/exams')}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <ListIcon sx={{ fontSize: 40, color: '#ff9800', mr: 2 }} />
                    <Typography variant="h6" component="h2">
                      Quản lý đề thi
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Tạo và quản lý đề thi, tự chọn hoặc random câu hỏi
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => navigate('/teacher/exams')}>
                    Xem chi tiết
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default TeacherDashboard;

