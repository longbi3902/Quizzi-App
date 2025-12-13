/**
 * ExamRoomHistory - Trang xem lịch sử thi của học sinh trong lớp và đề thi (dùng tên cũ để không phá vỡ routes)
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  TextField,
  MenuItem,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Pagination,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { API_ENDPOINTS } from '../constants/api';
import apiClient from '../utils/apiClient';
import { useToast } from '../contexts/ToastContext';

interface ExamResultListItem {
  id: number;
  student: {
    id: number;
    name: string;
    email: string;
  };
  score: number;
  maxScore: number;
  examCode: string | null;
  duration: number | null;
  startedAt: Date;
  submittedAt: Date | null;
  classId: number | null;
  examId: number;
}

const ExamRoomHistory: React.FC = () => {
  const { classId, examId } = useParams<{ classId: string; examId: string }>();
  const navigate = useNavigate();
  const { showError } = useToast();

  const [results, setResults] = useState<ExamResultListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('');
  const [scoreSort, setScoreSort] = useState<'none' | 'asc' | 'desc'>('none');
  const [durationSort, setDurationSort] = useState<'none' | 'asc' | 'desc'>('none');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const loadResults = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(studentName && { studentName }),
        ...(scoreSort !== 'none' && { scoreSort }),
        ...(durationSort !== 'none' && { durationSort }),
      });

      const response = await apiClient.get(
        `${API_ENDPOINTS.EXAM_RESULTS_BY_CLASS_EXAM_TEACHER(
          Number.parseInt(classId!, 10),
          Number.parseInt(examId!, 10)
        )}?${params.toString()}`
      );
      const data = await response.json();

      if (response.ok && data.success) {
        setResults(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || 0);
      } else {
        showError(data.message || 'Không thể tải lịch sử thi');
      }
    } catch (error: any) {
      console.error('Error loading exam history:', error);
      showError('Có lỗi xảy ra khi tải lịch sử thi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classId && examId) {
      loadResults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, examId, studentName, scoreSort, durationSort, page]);

  const handleViewDetail = (resultId: number) => {
    navigate(`/teacher/exam-results/detail/${resultId}`);
  };

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDateTime = (date: Date | string | null): string => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('vi-VN');
  };

  return (
    <Container maxWidth={false}>
      <Box>
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Typography variant="h4" component="h1" sx={{ color: '#6366f1', fontWeight: 'bold' }}>
              Lịch sử thi
            </Typography>
          </Box>

          {/* Bộ lọc */}
          <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Tìm theo tên học sinh"
              value={studentName}
              onChange={(e) => {
                setStudentName(e.target.value);
                setPage(1);
              }}
              size="small"
              sx={{ minWidth: 200 }}
            />
            <TextField
              select
              label="Sắp xếp theo điểm"
              value={scoreSort}
              onChange={(e) => {
                setScoreSort(e.target.value as 'none' | 'asc' | 'desc');
                setPage(1);
              }}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="none">Không sắp xếp</MenuItem>
              <MenuItem value="desc">Điểm cao → thấp</MenuItem>
              <MenuItem value="asc">Điểm thấp → cao</MenuItem>
            </TextField>
            <TextField
              select
              label="Sắp xếp theo thời gian làm bài"
              value={durationSort}
              onChange={(e) => {
                setDurationSort(e.target.value as 'none' | 'asc' | 'desc');
                setPage(1);
              }}
              size="small"
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="none">Không sắp xếp</MenuItem>
              <MenuItem value="asc">Nhanh → chậm</MenuItem>
              <MenuItem value="desc">Chậm → nhanh</MenuItem>
            </TextField>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : results.length === 0 ? (
            <Alert severity="info">Chưa có học sinh nào làm bài thi này</Alert>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Tổng số: {total} học sinh
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Họ tên</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Điểm</TableCell>
                      <TableCell>Thời gian làm bài</TableCell>
                      <TableCell>Bắt đầu</TableCell>
                      <TableCell>Nộp bài</TableCell>
                      <TableCell>Mã đề</TableCell>
                      <TableCell align="right">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell>{result.student.name}</TableCell>
                        <TableCell>{result.student.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={`${result.score}/${result.maxScore}`}
                            color={result.score === result.maxScore ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDuration(result.duration)}</TableCell>
                        <TableCell>{formatDateTime(result.startedAt)}</TableCell>
                        <TableCell>{formatDateTime(result.submittedAt)}</TableCell>
                        <TableCell>
                          {result.examCode ? (
                            <Chip label={result.examCode} size="small" />
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewDetail(result.id)}
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

              {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={3}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ExamRoomHistory;

