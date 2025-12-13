/**
 * EditClass - Trang chỉnh sửa lớp học
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { ClassWithExams, UpdateClassDTO } from '../types/class.types';
import apiClient from '../utils/apiClient';
import { useToast } from '../contexts/ToastContext';

const EditClass: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showSuccess, showError } = useToast();
  const classId = id ? Number.parseInt(id, 10) : null;

  const [className, setClassName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  // Load dữ liệu lớp học
  useEffect(() => {
    if (!classId || isNaN(classId)) {
      setError('ID lớp học không hợp lệ');
      setLoadingData(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoadingData(true);

        // Load lớp học
        const classResponse = await apiClient.get(`${API_ENDPOINTS.CLASSES}/${classId}`);
        const classData = await classResponse.json();
        if (!classResponse.ok || !classData.success) {
          throw new Error(classData.message || 'Không tìm thấy lớp học');
        }

        const classInfo: ClassWithExams = classData.data;
        setClassName(classInfo.name);
        setPassword(classInfo.password);
      } catch (err: any) {
        setError(err.message || 'Không thể tải dữ liệu lớp học');
        showError(err.message || 'Không thể tải dữ liệu lớp học');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [classId]);

  const handleSubmit = async () => {
    setError('');
    if (!className.trim()) {
      setError('Tên lớp học là bắt buộc');
      return;
    }
    if (!password.trim()) {
      setError('Mật khẩu lớp học là bắt buộc');
      return;
    }

    setLoading(true);
    try {
      const updateData: UpdateClassDTO = {
        name: className.trim(),
        password: password.trim(),
      };

      const response = await apiClient.put(`${API_ENDPOINTS.CLASSES}/${classId}`, updateData);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Cập nhật lớp học thất bại');
      }

      showSuccess('Cập nhật lớp học thành công!');
      navigate('/teacher/classes');
    } catch (err: any) {
      const errorMessage = err.message || 'Cập nhật lớp học thất bại';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Container maxWidth={false}>
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth={false}>
      <Box>
        <Paper sx={{ p: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" component="h1">
              Chỉnh Sửa Lớp Học
            </Typography>
          </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

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
            Để quản lý đề thi và thời gian bắt đầu/kết thúc cho từng đề thi, vui lòng vào trang chi tiết lớp học.
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/teacher/classes')}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Cập Nhật'}
            </Button>
          </Box>
        </Box>
      </Paper>
      </Box>
    </Container>
  );
};

export default EditClass;


