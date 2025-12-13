/**
 * CreateClass - Trang tạo lớp học
 * Lớp học có thể có nhiều đề thi
 */

import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { API_ENDPOINTS } from '../constants/api';
import { CreateClassDTO } from '../types/class.types';
import apiClient from '../utils/apiClient';
import { useToast } from '../contexts/ToastContext';

const CreateClass: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [className, setClassName] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!className || !password) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);

    try {
      const classData: CreateClassDTO = {
        name: className,
        password,
        examIds: [], // Đề thi sẽ được thêm sau trong ClassDetail với start/end date riêng
      };

      const response = await apiClient.post(API_ENDPOINTS.CLASSES, classData);
      const data = await response.json();

      if (response.ok && data.success) {
        showSuccess('Tạo lớp học thành công!');
        navigate('/teacher/classes');
      } else {
        showError(data.message || 'Tạo lớp học thất bại');
        setError(data.message || 'Tạo lớp học thất bại');
      }
    } catch (err: any) {
      console.error('Error creating class:', err);
      const errorMessage = err.message || 'Tạo lớp học thất bại';
      showError(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth={false}>
      <Box>
        <Paper sx={{ p: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" component="h1">
              Tạo Lớp Học Mới
            </Typography>
          </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Tên lớp học"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Mật khẩu lớp học"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />

            <Alert severity="info">
              Sau khi tạo lớp, bạn có thể vào chi tiết lớp để thêm đề thi với thời gian bắt đầu và kết thúc riêng cho từng đề thi.
            </Alert>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/teacher/classes')}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Tạo Lớp Học'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
      </Box>
    </Container>
  );
};

export default CreateClass;


