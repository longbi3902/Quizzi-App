/**
 * ClassManagement - Trang quản lý lớp học (hiển thị dạng card)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Pagination,
  Stack,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { API_ENDPOINTS } from '../constants/api';
import { ClassWithExams } from '../types/class.types';
import apiClient from '../utils/apiClient';
import { useToast } from '../contexts/ToastContext';

const ClassManagement: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [classes, setClasses] = useState<ClassWithExams[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [classToDelete, setClassToDelete] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      
      const response = await apiClient.get(`${API_ENDPOINTS.CLASSES}?${params.toString()}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Lỗi khi lấy danh sách lớp học');
      }

      setClasses(data.data || []);
      if (data.pagination) {
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      } else {
        setTotal(data.data?.length || 0);
        setTotalPages(1);
      }
    } catch (err: any) {
      console.error('Fetch classes error:', err);
      setError(err.message || 'Không thể tải danh sách lớp học');
      showError(err.message || 'Không thể tải danh sách lớp học');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!classToDelete) return;

    try {
      const response = await apiClient.delete(`${API_ENDPOINTS.CLASSES}/${classToDelete}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Xóa lớp học thất bại');
      }

      setClasses(classes.filter(c => c.id !== classToDelete));
      setDeleteDialogOpen(false);
      setClassToDelete(null);
      showSuccess('Xóa lớp học thành công!');
    } catch (err: any) {
      const errorMessage = err.message || 'Xóa lớp học thất bại';
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  const handleDeleteClick = (classId: number) => {
    setClassToDelete(classId);
    setDeleteDialogOpen(true);
  };

  const handleViewDetail = (classId: number) => {
    navigate(`/teacher/classes/${classId}`);
  };

  useEffect(() => {
    fetchClasses();
  }, [page, searchTerm]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1); // Reset về trang 1 khi search
  };

  return (
    <Container maxWidth={false}>
      <Box>
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" component="h1" sx={{ color: '#6366f1', fontWeight: 'bold' }}>
              Quản lý lớp học
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/teacher/classes/create')}
            >
              Tạo lớp học
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Search Section */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  size="small"
                  label="Tìm kiếm theo tên lớp hoặc mã lớp"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Nhập tên lớp hoặc mã lớp..."
                  sx={{ width: '100%', '& .MuiInputBase-root': { height: '40px' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setSearchTerm('');
                    setPage(1);
                  }}
                  sx={{ height: '40px' }}
                >
                  Xóa bộ lọc
                </Button>
              </Grid>
            </Grid>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : classes.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chưa có lớp học nào
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/teacher/classes/create')}
                sx={{ mt: 2 }}
              >
                Tạo lớp học đầu tiên
              </Button>
            </Box>
          ) : (
            <>
              <Grid container spacing={3}>
                {classes.map((classData) => (
                  <Grid item xs={12} sm={6} md={4} key={classData.id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                        },
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                          <Typography variant="h6" component="h3" sx={{ flex: 1 }}>
                            {classData.name}
                          </Typography>
                          <Chip label={classData.code} color="primary" size="small" />
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Mật khẩu: {classData.password}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Số đề thi: {classData.exams?.length || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Mỗi đề thi có thời gian bắt đầu và kết thúc riêng
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2, gap: 0.5 }}>
                        <Button
                          size="small"
                          onClick={() => handleViewDetail(classData.id)}
                          sx={{
                            color: '#ff9800',
                            minWidth: 'auto',
                            px: 0.5,
                            '&:hover': {
                              backgroundColor: 'rgba(255, 152, 0, 0.08)',
                            },
                          }}
                        >
                          Chi tiết
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleDeleteClick(classData.id)}
                          sx={{
                            color: '#f44336',
                            minWidth: 'auto',
                            px: 0.5,
                            '&:hover': {
                              backgroundColor: 'rgba(244, 67, 54, 0.08)',
                            },
                          }}
                        >
                          Xóa
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Phân trang */}
              {total > 0 && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                  <Stack spacing={2}>
                    {totalPages > 1 && (
                      <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(event, value) => setPage(value)}
                        color="primary"
                        showFirstButton
                        showLastButton
                      />
                    )}
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      Hiển thị {classes.length} / {total} lớp học
                    </Typography>
                  </Stack>
                </Box>
              )}
            </>
          )}
        </Paper>
      </Box>

      {/* Dialog xác nhận xóa */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa lớp học này? Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ClassManagement;
