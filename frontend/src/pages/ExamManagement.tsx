/**
 * ExamManagement - Trang quản lý đề thi
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Pagination,
  Stack,
  TextField,
  Grid,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ListIcon from '@mui/icons-material/List';
import { API_ENDPOINTS } from '../constants/api';
import { ExamWithQuestions } from '../types/exam.types';
import apiClient from '../utils/apiClient';

const ExamManagement: React.FC = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<ExamWithQuestions[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [examToDelete, setExamToDelete] = useState<number | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false);
  const [examToView, setExamToView] = useState<ExamWithQuestions | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [nameFilter, setNameFilter] = useState<string>('');

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      // Thêm filter theo tên đề thi
      if (nameFilter.trim()) {
        params.append('name', nameFilter.trim());
      }
      
      const response = await apiClient.get(`${API_ENDPOINTS.EXAMS}?${params.toString()}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Lỗi khi lấy danh sách đề thi');
      }

      setExams(data.data || []);
      if (data.pagination) {
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      } else {
        // Nếu không có pagination, dùng length của data
        setTotal(data.data?.length || 0);
        setTotalPages(1);
      }
    } catch (err: any) {
      console.error('Fetch exams error:', err);
      setError(err.message || 'Không thể tải danh sách đề thi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!examToDelete) return;

    try {
      const response = await apiClient.delete(`${API_ENDPOINTS.EXAMS}/${examToDelete}`);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Xóa đề thi thất bại');
      }

      setExams(exams.filter(e => e.id !== examToDelete));
      setDeleteDialogOpen(false);
      setExamToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Xóa đề thi thất bại');
    }
  };

  const handleView = (exam: ExamWithQuestions) => {
    setExamToView(exam);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (examId: number) => {
    setExamToDelete(examId);
    setDeleteDialogOpen(true);
  };

  useEffect(() => {
    fetchExams();
  }, [page]);

  return (
    <Container maxWidth={false}>
      <Box>
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" component="h1" sx={{ color: '#6366f1', fontWeight: 'bold' }}>
              Quản lý đề thi
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/teacher/exams/create')}
            >
              Tạo đề thi
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
                  label="Tìm kiếm theo tên đề thi"
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  placeholder="Nhập tên đề thi..."
                  sx={{ width: '100%', '& .MuiInputBase-root': { height: '40px' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setNameFilter('')}
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
          ) : exams.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chưa có đề thi nào
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/teacher/exams/create')}
                sx={{ mt: 2 }}
              >
                Tạo đề thi đầu tiên
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Tên đề thi</TableCell>
                    <TableCell>Thời gian (phút)</TableCell>
                    <TableCell>Tổng điểm</TableCell>
                    <TableCell>Số câu hỏi</TableCell>
                    <TableCell align="right">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {exams.map((exam) => (
                    <TableRow key={exam.id} hover>
                      <TableCell>{exam.id}</TableCell>
                      <TableCell>{exam.name}</TableCell>
                      <TableCell>{exam.duration}</TableCell>
                      <TableCell>{exam.maxScore}</TableCell>
                      <TableCell>
                        <Chip label={exam.questions.length} color="primary" size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => navigate(`/teacher/exams/${exam.id}/codes`)}
                          title="Xem danh sách mã đề"
                        >
                          <ListIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleView(exam)}
                          title="Xem chi tiết"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={() => navigate(`/teacher/exams/edit/${exam.id}`)}
                          title="Chỉnh sửa"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(exam.id)}
                          title="Xóa"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

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
                  Hiển thị {exams.length} / {total} đề thi
                </Typography>
              </Stack>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Dialog xác nhận xóa */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa đề thi này? Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xem chi tiết */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chi tiết đề thi</DialogTitle>
        <DialogContent>
          {examToView && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {examToView.name}
              </Typography>
              <Box display="flex" gap={2} mb={3}>
                <Chip label={`Thời gian: ${examToView.duration} phút`} />
                <Chip label={`Tổng điểm: ${examToView.maxScore}`} />
                <Chip label={`Số câu: ${examToView.questions.length}`} />
              </Box>
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Danh sách câu hỏi:
              </Typography>
              {examToView.questions.map((eq, index) => (
                <Box key={eq.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                  <Typography variant="body2" color="text.secondary">
                    Câu {index + 1} - Điểm: {eq.score}
                  </Typography>
                  {eq.question && (
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {eq.question.content}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ExamManagement;

