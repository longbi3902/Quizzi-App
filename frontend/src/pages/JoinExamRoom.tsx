/**
 * JoinExamRoom - Trang tham gia lớp học (dùng tên cũ để không phá vỡ routes)
 * Học sinh nhập mã lớp học và mật khẩu để tham gia
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ClassWithExams } from '../types/class.types';
import { API_ENDPOINTS } from '../constants/api';
import { useToast } from '../contexts/ToastContext';
import apiClient from '../utils/apiClient';

const JoinExamRoom: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post(API_ENDPOINTS.CLASSES_VERIFY, {
        code,
        password,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const classData: ClassWithExams = data.data;
        
        // Lưu thông tin lớp học vào localStorage
        localStorage.setItem('currentClass', JSON.stringify(classData));
        
        showSuccess('Tham gia lớp học thành công!');
        navigate('/class-room');
      } else {
        const errorMsg = data.message || 'Mã lớp học hoặc mật khẩu không đúng';
        setError(errorMsg);
        showError(errorMsg);
      }
    } catch (err: any) {
      console.error('Join class error:', err);
      const errorMsg = err.message || 'Có lỗi xảy ra khi tham gia lớp học';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
            Tham gia lớp học
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Mã lớp học"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              disabled={loading}
              sx={{ mb: 2 }}
              inputProps={{ maxLength: 20 }}
            />

            <TextField
              fullWidth
              label="Mật khẩu lớp học"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading || !code || !password}
              sx={{ mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Tham gia'}
            </Button>

            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate('/home')}
              disabled={loading}
            >
              Quay lại
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default JoinExamRoom;

