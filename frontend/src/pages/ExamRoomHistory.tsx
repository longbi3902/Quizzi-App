/**
 * ExamRoomHistory - Trang xem lịch sử thi của học sinh trong phòng thi (cho giáo viên)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Pagination,
  Stack,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { API_ENDPOINTS } from '../constants/api';
import apiClient from '../utils/apiClient';

interface ExamResult {
  id: number;
  student: {
    id: number;
    name: string;
    email: string;
  };
  score: number;
  maxScore: number;
  startedAt: string;
  submittedAt: string | null;
  duration: number | null; // Thời gian làm bài (giây)
  examCode: string | null;
  answers: Array<{
    questionId: number;
    answerIds: number[];
  }>;
  correctAnswers: Array<{
    questionId: number;
    answerIds: number[];
  }> | null;
}

interface ResultDetail extends ExamResult {
  exam: {
    id: number;
    name: string;
    duration: number;
    maxScore: number;
  };
  examRoom: {
    id: number;
    name: string;
    code: string;
  };
  questions: Array<{
    id: number;
    questionId: number;
    score: number;
    orderIndex: number;
    question?: {
      id: number;
      content: string;
      answers: Array<{
        id: number;
        content: string;
        isTrue: boolean;
      }>;
    };
  }>;
}

const ExamRoomHistory: React.FC = () => {
  const navigate = useNavigate();
  const { examRoomId } = useParams<{ examRoomId: string }>();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ResultDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Bộ lọc và phân trang
  const [studentNameFilter, setStudentNameFilter] = useState('');
  const [scoreSort, setScoreSort] = useState<'none' | 'asc' | 'desc'>('none');
  const [durationSort, setDurationSort] = useState<'none' | 'asc' | 'desc'>('none');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (examRoomId) {
      fetchResults();
    }
  }, [examRoomId, studentNameFilter, scoreSort, durationSort, page]);

  const fetchResults = async () => {
    if (!examRoomId) return;

    try {
      setLoading(true);
      setError('');
      
      // Xây dựng query params
      const params = new URLSearchParams();
      if (studentNameFilter.trim()) {
        params.append('studentName', studentNameFilter.trim());
      }
      if (scoreSort !== 'none') {
        params.append('scoreSort', scoreSort);
      }
      if (durationSort !== 'none') {
        params.append('durationSort', durationSort);
      }
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const url = `${API_ENDPOINTS.EXAM_RESULTS_BY_ROOM_TEACHER(Number.parseInt(examRoomId, 10))}?${params.toString()}`;
      const response = await apiClient.get(url);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Lỗi khi lấy lịch sử thi');
      }

      setResults(data.data || []);
      if (data.pagination) {
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err: any) {
      console.error('Fetch results error:', err);
      setError(err.message || 'Không thể tải lịch sử thi');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = () => {
    setPage(1); // Reset về trang đầu khi thay đổi filter
  };

  const handleViewDetail = async (resultId: number) => {
    try {
      setLoadingDetail(true);
      const response = await apiClient.get(API_ENDPOINTS.EXAM_RESULTS_DETAIL(resultId));
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Lỗi khi lấy chi tiết bài làm');
      }

      setSelectedResult(data.data);
      setDetailDialogOpen(true);
    } catch (err: any) {
      console.error('Fetch detail error:', err);
      setError(err.message || 'Không thể tải chi tiết bài làm');
    } finally {
      setLoadingDetail(false);
    }
  };

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} phút ${secs} giây`;
  };

  const isAnswerCorrect = (questionId: number, studentAnswerIds: number[]): boolean => {
    if (!selectedResult?.correctAnswers) return false;
    const correctAnswer = selectedResult.correctAnswers.find((ca) => ca.questionId === questionId);
    if (!correctAnswer) return false;

    const sortedStudent = [...studentAnswerIds].sort((a, b) => a - b);
    const sortedCorrect = [...correctAnswer.answerIds].sort((a, b) => a - b);

    return (
      sortedStudent.length === sortedCorrect.length &&
      sortedStudent.every((id, index) => id === sortedCorrect[index])
    );
  };

  const getStudentAnswer = (questionId: number): number[] => {
    const answer = selectedResult?.answers.find((a) => a.questionId === questionId);
    return answer?.answerIds || [];
  };

  const getCorrectAnswer = (questionId: number): number[] => {
    const correctAnswer = selectedResult?.correctAnswers?.find((ca) => ca.questionId === questionId);
    return correctAnswer?.answerIds || [];
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <IconButton onClick={() => navigate('/teacher/exam-rooms')}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1" sx={{ color: '#6366f1', fontWeight: 'bold' }}>
              Lịch sử thi
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Bộ lọc */}
          <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Tìm theo tên học sinh"
              variant="outlined"
              size="small"
              value={studentNameFilter}
              onChange={(e) => {
                setStudentNameFilter(e.target.value);
                handleFilterChange();
              }}
              sx={{ minWidth: 200 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Sắp xếp theo điểm</InputLabel>
              <Select
                value={scoreSort}
                label="Sắp xếp theo điểm"
                onChange={(e) => {
                  setScoreSort(e.target.value as 'none' | 'asc' | 'desc');
                  handleFilterChange();
                }}
              >
                <MenuItem value="none">Không sắp xếp</MenuItem>
                <MenuItem value="asc">Tăng dần</MenuItem>
                <MenuItem value="desc">Giảm dần</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Sắp xếp theo thời gian làm bài</InputLabel>
              <Select
                value={durationSort}
                label="Sắp xếp theo thời gian làm bài"
                onChange={(e) => {
                  setDurationSort(e.target.value as 'none' | 'asc' | 'desc');
                  handleFilterChange();
                }}
              >
                <MenuItem value="none">Không sắp xếp</MenuItem>
                <MenuItem value="asc">Tăng dần</MenuItem>
                <MenuItem value="desc">Giảm dần</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Bảng kết quả */}
          {results.length === 0 ? (
            <Alert severity="info">Không có kết quả thi nào</Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>STT</TableCell>
                      <TableCell>Tên học sinh</TableCell>
                      <TableCell>Điểm số</TableCell>
                      <TableCell>Thời gian làm bài</TableCell>
                      <TableCell>Thời gian hoàn thành</TableCell>
                      <TableCell>Mã đề</TableCell>
                      <TableCell align="right">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.map((result, index) => (
                      <TableRow key={result.id} hover>
                        <TableCell>{(page - 1) * limit + index + 1}</TableCell>
                        <TableCell>{result.student.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={`${result.score} / ${result.maxScore}`}
                            color={result.score === result.maxScore ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDuration(result.duration)}</TableCell>
                        <TableCell>
                          {result.submittedAt
                            ? new Date(result.submittedAt).toLocaleString('vi-VN')
                            : 'Chưa nộp bài'}
                        </TableCell>
                        <TableCell>{result.examCode || 'N/A'}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewDetail(result.id)}
                            disabled={loadingDetail}
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

              {/* Phân trang */}
              {totalPages > 1 && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                  <Stack spacing={2}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(event, value) => setPage(value)}
                      color="primary"
                      showFirstButton
                      showLastButton
                    />
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      Hiển thị {results.length} / {total} kết quả
                    </Typography>
                  </Stack>
                </Box>
              )}
            </>
          )}
        </Paper>
      </Box>

      {/* Dialog chi tiết bài làm */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chi tiết bài làm</DialogTitle>
        <DialogContent>
          {loadingDetail ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : selectedResult ? (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Thông tin học sinh
                </Typography>
                <Box display="flex" flexDirection="row" gap={4} flexWrap="wrap">
                  <Box flex={1} minWidth={200}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Tên:</strong> {selectedResult.student.name}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Email:</strong> {selectedResult.student.email}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Điểm số:</strong> {selectedResult.score} / {selectedResult.maxScore}
                    </Typography>
                  </Box>
                  <Box flex={1} minWidth={200}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Thời gian làm bài:</strong> {formatDuration(selectedResult.duration)}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Thời gian bắt đầu:</strong>{' '}
                      {new Date(selectedResult.startedAt).toLocaleString('vi-VN')}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Thời gian nộp bài:</strong>{' '}
                      {selectedResult.submittedAt
                        ? new Date(selectedResult.submittedAt).toLocaleString('vi-VN')
                        : 'Chưa nộp bài'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Chi tiết từng câu hỏi
              </Typography>
              {selectedResult.questions.map((examQuestion, index) => {
                const question = examQuestion.question;
                if (!question) return null;

                const studentAnswerIds = getStudentAnswer(question.id);
                const correctAnswerIds = getCorrectAnswer(question.id);
                const isCorrect = isAnswerCorrect(question.id, studentAnswerIds);

                return (
                  <Paper key={examQuestion.id} elevation={1} sx={{ p: 2, mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="h6" component="h3">
                          Câu {index + 1}: {question.content}
                        </Typography>
                        {isCorrect ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <CancelIcon color="error" />
                        )}
                      </Box>
                      <Chip label={`${examQuestion.score} điểm`} color="primary" size="small" />
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    {/* Đáp án học sinh chọn */}
                    <Box mb={2}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Đáp án học sinh chọn:
                      </Typography>
                      {studentAnswerIds.length > 0 ? (
                        <Box>
                          {question.answers
                            .filter((answer) => studentAnswerIds.includes(answer.id))
                            .map((answer) => (
                              <Chip
                                key={answer.id}
                                label={answer.content}
                                color={isCorrect ? 'success' : 'error'}
                                sx={{ mr: 1, mb: 1 }}
                              />
                            ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          (Học sinh chưa chọn đáp án)
                        </Typography>
                      )}
                    </Box>

                    {/* Đáp án đúng */}
                    {!isCorrect && correctAnswerIds.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Đáp án đúng:
                        </Typography>
                        <Box>
                          {question.answers
                            .filter((answer) => correctAnswerIds.includes(answer.id))
                            .map((answer) => (
                              <Chip
                                key={answer.id}
                                label={answer.content}
                                color="success"
                                sx={{ mr: 1, mb: 1 }}
                              />
                            ))}
                        </Box>
                      </Box>
                    )}
                  </Paper>
                );
              })}
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ExamRoomHistory;

