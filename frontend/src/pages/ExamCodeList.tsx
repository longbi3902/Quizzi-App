/**
 * ExamCodeList - Trang danh sách mã đề của một đề thi
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { API_ENDPOINTS } from '../constants/api';
import { ExamCode } from '../types/exam.types';

const ExamCodeList: React.FC = () => {
  const navigate = useNavigate();
  const { examId } = useParams<{ examId: string }>();
  const [examCodes, setExamCodes] = useState<ExamCode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetchExamCodes = async () => {
    if (!examId) return;

    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_ENDPOINTS.EXAM_CODES}/exam/${examId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Lỗi khi lấy danh sách mã đề');
      }

      setExamCodes(data.data || []);
    } catch (err: any) {
      console.error('Fetch exam codes error:', err);
      setError(err.message || 'Không thể tải danh sách mã đề');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamCodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <IconButton onClick={() => navigate('/teacher/exams')}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1" sx={{ color: '#6366f1', fontWeight: 'bold' }}>
              Danh sách mã đề
            </Typography>
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
          ) : examCodes.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chưa có mã đề nào
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Mã đề</TableCell>
                    <TableCell>Số câu hỏi</TableCell>
                    <TableCell>Ngày tạo</TableCell>
                    <TableCell align="right">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {examCodes.map((examCode) => (
                    <TableRow key={examCode.id} hover>
                      <TableCell>{examCode.id}</TableCell>
                      <TableCell>
                        <Chip label={examCode.code} color="primary" />
                      </TableCell>
                      <TableCell>{examCode.questionOrder.length}</TableCell>
                      <TableCell>
                        {new Date(examCode.createdAt).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/teacher/exam-codes/${examCode.id}`)}
                          title="Xem chi tiết"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ExamCodeList;

