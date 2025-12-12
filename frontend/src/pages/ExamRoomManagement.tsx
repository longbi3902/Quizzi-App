/**
 * ExamRoomManagement - Trang quản lý phòng thi
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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HistoryIcon from '@mui/icons-material/History';
import { API_ENDPOINTS } from '../constants/api';
import { ExamRoomWithExam } from '../types/examRoom.types';
import apiClient from '../utils/apiClient';

const ExamRoomManagement: React.FC = () => {
  const navigate = useNavigate();
  const [examRooms, setExamRooms] = useState<ExamRoomWithExam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [roomToDelete, setRoomToDelete] = useState<number | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false);
  const [roomToView, setRoomToView] = useState<ExamRoomWithExam | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchExamRooms = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      const response = await apiClient.get(`${API_ENDPOINTS.EXAM_ROOMS}?${params.toString()}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Lỗi khi lấy danh sách phòng thi');
      }

      setExamRooms(data.data || []);
      if (data.pagination) {
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      } else {
        // Nếu không có pagination, dùng length của data
        setTotal(data.data?.length || 0);
        setTotalPages(1);
      }
    } catch (err: any) {
      console.error('Fetch exam rooms error:', err);
      setError(err.message || 'Không thể tải danh sách phòng thi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!roomToDelete) return;

    try {
      const response = await apiClient.delete(`${API_ENDPOINTS.EXAM_ROOMS}/${roomToDelete}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Xóa phòng thi thất bại');
      }

      setExamRooms(examRooms.filter(r => r.id !== roomToDelete));
      setDeleteDialogOpen(false);
      setRoomToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Xóa phòng thi thất bại');
    }
  };

  const handleView = (room: ExamRoomWithExam) => {
    setRoomToView(room);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (roomId: number) => {
    setRoomToDelete(roomId);
    setDeleteDialogOpen(true);
  };

  useEffect(() => {
    fetchExamRooms();
  }, [page]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <IconButton onClick={() => navigate('/teacher/dashboard')}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h4" component="h1" sx={{ color: '#6366f1', fontWeight: 'bold' }}>
                Quản lý phòng thi
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/teacher/exam-rooms/create')}
            >
              Tạo phòng thi
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : examRooms.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chưa có phòng thi nào
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/teacher/exam-rooms/create')}
                sx={{ mt: 2 }}
              >
                Tạo phòng thi đầu tiên
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Mã phòng thi</TableCell>
                    <TableCell>Tên phòng thi</TableCell>
                    <TableCell>Mật khẩu</TableCell>
                    <TableCell>Đề thi</TableCell>
                    <TableCell align="right">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {examRooms.map((room) => (
                    <TableRow key={room.id} hover>
                      <TableCell>{room.id}</TableCell>
                      <TableCell>
                        <Chip label={room.code} color="primary" size="small" />
                      </TableCell>
                      <TableCell>{room.name}</TableCell>
                      <TableCell>{room.password}</TableCell>
                      <TableCell>{room.exam?.name || 'N/A'}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => navigate(`/teacher/exam-rooms/history/${room.id}`)}
                          title="Xem lịch sử thi"
                        >
                          <HistoryIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleView(room)}
                          title="Xem chi tiết"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={() => navigate(`/teacher/exam-rooms/edit/${room.id}`)}
                          title="Chỉnh sửa"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(room.id)}
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
                  Hiển thị {examRooms.length} / {total} phòng thi
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
            Bạn có chắc chắn muốn xóa phòng thi này? Hành động này không thể hoàn tác.
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
        <DialogTitle>Chi tiết phòng thi</DialogTitle>
        <DialogContent>
          {roomToView && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {roomToView.name}
              </Typography>
              <Box display="flex" flexDirection="row" gap={4} mb={3} flexWrap="wrap">
                <Box flex={1} minWidth={200}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Mã phòng thi:</strong> <Chip label={roomToView.code} color="primary" size="small" />
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Mật khẩu:</strong> {roomToView.password}
                  </Typography>
                  {roomToView.exam && (
                    <>
                      <Typography variant="body1" gutterBottom>
                        <strong>Đề thi:</strong> {roomToView.exam.name}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Thời gian:</strong> {roomToView.exam.duration} phút
                      </Typography>
                    </>
                  )}
                </Box>
                {roomToView.exam && (
                  <Box flex={1} minWidth={200}>
                    <Typography variant="body1" gutterBottom>
                      <strong>Tổng điểm:</strong> {roomToView.exam.maxScore}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Số câu hỏi:</strong> {roomToView.exam.questions.length}
                    </Typography>
                  </Box>
                )}
              </Box>
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

export default ExamRoomManagement;

