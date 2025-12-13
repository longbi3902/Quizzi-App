/**
 * StudentProfile - Trang thông tin cá nhân cho học sinh
 */

import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAuth } from '../contexts/AuthContext';
import { API_ENDPOINTS } from '../constants/api';
import apiClient from '../utils/apiClient';
import { isValidPhoneNumber } from '../utils/validation';
import { useToast } from '../contexts/ToastContext';

const StudentProfile: React.FC = () => {
  const { user, setUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Form data state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    school: user?.school || '',
    className: user?.className || '',
    birthYear: user?.birthYear?.toString() || '',
    phone: user?.phone || '',
  });

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        school: user.school || '',
        className: user.className || '',
        birthYear: user.birthYear?.toString() || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setError('');
    
    // Validate phone number if provided
    if (formData.phone && formData.phone.trim()) {
      if (!isValidPhoneNumber(formData.phone.trim())) {
        setError('Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (10 số, bắt đầu bằng 03, 05, 07, 08, hoặc 09)');
        return;
      }
    }

    setLoading(true);
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.UPDATE_PROFILE(user!.id),
        {
          name: formData.name,
          school: formData.school,
          className: formData.className.trim() || null,
          birthYear: formData.birthYear ? Number.parseInt(formData.birthYear, 10) : null,
          phone: formData.phone.trim() || null,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Cập nhật thông tin thất bại');
      }

      // Update user in context
      if (data.data?.user) {
        setUser(data.data.user);
      }

      setIsEditing(false);
      showSuccess('Cập nhật thông tin thành công!');
    } catch (err: any) {
      const errorMessage = err.message || 'Cập nhật thông tin thất bại';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data
    if (user) {
      setFormData({
        name: user.name || '',
        school: user.school || '',
        className: user.className || '',
        birthYear: user.birthYear?.toString() || '',
        phone: user.phone || '',
      });
    }
    setIsEditing(false);
    setError('');
  };

  return (
    <Container maxWidth={false}>
      <Box>
        <Paper elevation={3} sx={{ padding: 4 }}>
          {/* Header */}
          <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" component="h1" sx={{ color: '#6366f1', fontWeight: 'bold', letterSpacing: '0.5px' }}>
              Thông tin cá nhân
            </Typography>
            {!isEditing && (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setIsEditing(true)}
              >
                Chỉnh sửa
              </Button>
            )}
            {isEditing && (
              <Box display="flex" gap={2}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Hủy
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={20} /> : 'Lưu'}
                </Button>
              </Box>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

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
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Tên:
                  </Typography>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      size="small"
                    />
                  ) : (
                    <Typography variant="body1">{user?.name}</Typography>
                  )}
                </Grid>

                {/* Email - Không thể chỉnh sửa */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Email:
                  </Typography>
                  <Typography variant="body1">{user?.email}</Typography>
                </Grid>

                {/* Vai trò - Không thể chỉnh sửa */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Vai trò:
                  </Typography>
                  <Typography variant="body1">Học sinh</Typography>
                </Grid>

                {/* Trường */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Trường:
                  </Typography>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      name="school"
                      value={formData.school}
                      onChange={handleChange}
                      required
                      size="small"
                    />
                  ) : (
                    <Typography variant="body1">{user?.school}</Typography>
                  )}
                </Grid>

                {/* Lớp */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Lớp:
                  </Typography>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      name="className"
                      value={formData.className}
                      onChange={handleChange}
                      size="small"
                    />
                  ) : (
                    <Typography variant="body1">{user?.className || 'Chưa cập nhật'}</Typography>
                  )}
                </Grid>

                {/* Năm sinh */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Năm sinh:
                  </Typography>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      name="birthYear"
                      type="number"
                      value={formData.birthYear}
                      onChange={handleChange}
                      size="small"
                      inputProps={{ min: 1950, max: new Date().getFullYear() }}
                    />
                  ) : (
                    <Typography variant="body1">{user?.birthYear || 'Chưa cập nhật'}</Typography>
                  )}
                </Grid>

                {/* Số điện thoại */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Số điện thoại:
                  </Typography>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      size="small"
                      placeholder="03xxxxxxxxx"
                      helperText="Nhập số điện thoại 10 số (bắt đầu bằng 03, 05, 07, 08, hoặc 09)"
                    />
                  ) : (
                    <Typography variant="body1">{user?.phone || 'Chưa cập nhật'}</Typography>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Paper>
      </Box>
    </Container>
  );
};

export default StudentProfile;

