/**
 * JoinExamRoom - Trang nhập mã phòng thi và mật khẩu
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { API_ENDPOINTS } from '../constants/api';
import apiClient from '../utils/apiClient';

const JoinExamRoom: React.FC = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code.trim()) {
      setError('Vui lòng nhập mã phòng thi');
      return;
    }

    if (!password.trim()) {
      setError('Vui lòng nhập mật khẩu phòng thi');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post(API_ENDPOINTS.EXAM_ROOMS_VERIFY, {
        code: code.trim().toUpperCase(),
        password: password.trim(),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Mã phòng thi hoặc mật khẩu không đúng');
      }

      // Lưu thông tin phòng thi vào localStorage để sử dụng ở trang ExamRoom
      localStorage.setItem('currentExamRoom', JSON.stringify(data.data));

      // Chuyển đến trang phòng thi
      navigate('/exam-room');
    } catch (err: any) {
      setError(err.message || 'Không thể tham gia phòng thi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <IconButton onClick={() => navigate('/home')}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1" sx={{ color: '#6366f1', fontWeight: 'bold' }}>
              Tham gia phòng thi
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              required
              fullWidth
              label="Mã phòng thi"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="VD: ABC123"
              sx={{ mb: 3 }}
              inputProps={{
                maxLength: 20,
                style: { textTransform: 'uppercase' },
              }}
            />
            <TextField
              required
              fullWidth
              label="Mật khẩu phòng thi"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate('/home')}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Tham gia'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default JoinExamRoom;



