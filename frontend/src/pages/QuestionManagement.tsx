/**
 * QuestionManagement - Trang quản lý câu hỏi
 * 
 * Component này hiển thị:
 * - Danh sách tất cả câu hỏi
 * - Chức năng thêm, sửa, xóa câu hỏi
 * - Xem chi tiết câu hỏi và đáp án
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
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { API_ENDPOINTS } from '../constants/api';
import { QuestionWithAnswers } from '../types/question.types';
import { getDifficultyName, getDifficultyColor } from '../utils/questionUtils';

const QuestionManagement: React.FC = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false);
  const [questionToView, setQuestionToView] = useState<QuestionWithAnswers | null>(null);

  /**
   * Lấy danh sách câu hỏi từ API
   */
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(API_ENDPOINTS.QUESTIONS);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Lỗi khi lấy danh sách câu hỏi');
      }

      setQuestions(data.data || []);
    } catch (err: any) {
      console.error('Fetch questions error:', err);
      setError(err.message || 'Không thể tải danh sách câu hỏi');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xóa câu hỏi
   */
  const handleDelete = async () => {
    if (!questionToDelete) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.QUESTIONS}/${questionToDelete}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Xóa câu hỏi thất bại');
      }

      // Xóa khỏi danh sách
      setQuestions(questions.filter(q => q.id !== questionToDelete));
      setDeleteDialogOpen(false);
      setQuestionToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Xóa câu hỏi thất bại');
    }
  };

  /**
   * Mở dialog xem chi tiết
   */
  const handleView = (question: QuestionWithAnswers) => {
    setQuestionToView(question);
    setViewDialogOpen(true);
  };

  /**
   * Mở dialog xác nhận xóa
   */
  const handleDeleteClick = (questionId: number) => {
    setQuestionToDelete(questionId);
    setDeleteDialogOpen(true);
  };

  // Load danh sách câu hỏi khi component mount
  useEffect(() => {
    fetchQuestions();
  }, []);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ padding: 4 }}>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <IconButton onClick={() => navigate('/teacher/dashboard')}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h4" component="h1" sx={{ color: '#6366f1', fontWeight: 'bold' }}>
                Quản lý câu hỏi
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/add-question')}
            >
              Thêm câu hỏi
            </Button>
          </Box>

          {/* Hiển thị lỗi */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Loading */}
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : questions.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chưa có câu hỏi nào
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/add-question')}
                sx={{ mt: 2 }}
              >
                Thêm câu hỏi đầu tiên
              </Button>
            </Box>
          ) : (
            /* Bảng danh sách câu hỏi */
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Nội dung câu hỏi</TableCell>
                    <TableCell>Độ khó</TableCell>
                    <TableCell>Số đáp án</TableCell>
                    <TableCell>Đáp án đúng</TableCell>
                    <TableCell>Hình ảnh</TableCell>
                    <TableCell align="right">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {questions.map((question) => {
                    const correctAnswers = question.answers.filter(a => a.isTrue);
                    return (
                      <TableRow key={question.id} hover>
                        <TableCell>{question.id}</TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 400,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {question.content}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getDifficultyName(question.difficulty || 1)}
                            size="small"
                            sx={{
                              backgroundColor: getDifficultyColor(question.difficulty || 1),
                              color: '#fff',
                              fontWeight: 500,
                            }}
                          />
                        </TableCell>
                        <TableCell>{question.answers.length}</TableCell>
                        <TableCell>
                          <Chip
                            label={`${correctAnswers.length} đáp án đúng`}
                            color="success"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {question.image ? (
                            <Chip label="Có" color="primary" size="small" />
                          ) : (
                            <Chip label="Không" size="small" />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleView(question)}
                            title="Xem chi tiết"
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => navigate(`/edit-question/${question.id}`)}
                            title="Chỉnh sửa"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(question.id)}
                            title="Xóa"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>

      {/* Dialog xác nhận xóa */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa câu hỏi này? Hành động này không thể hoàn tác.
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
        <DialogTitle>Chi tiết câu hỏi</DialogTitle>
        <DialogContent>
          {questionToView && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" gutterBottom>
                  Câu hỏi #{questionToView.id}
                </Typography>
                <Chip
                  label={getDifficultyName(questionToView.difficulty || 1)}
                  sx={{
                    backgroundColor: getDifficultyColor(questionToView.difficulty || 1),
                    color: '#fff',
                    fontWeight: 500,
                  }}
                />
              </Box>
              <Typography variant="body1" sx={{ mb: 3, fontWeight: 500 }}>
                {questionToView.content}
              </Typography>

              {questionToView.image && (
                <Box sx={{ mb: 3 }}>
                  <img
                    src={questionToView.image}
                    alt="Câu hỏi"
                    style={{ maxWidth: '100%', borderRadius: '8px' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </Box>
              )}

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Đáp án:
              </Typography>
              <Grid container spacing={2}>
                {questionToView.answers.map((answer, index) => (
                  <Grid item xs={12} key={answer.id}>
                    <Card
                      variant="outlined"
                      sx={{
                        backgroundColor: answer.isTrue ? '#e8f5e9' : '#fafafa',
                        borderColor: answer.isTrue ? '#4caf50' : '#e0e0e0',
                      }}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="center" gap={2}>
                          {answer.isTrue ? (
                            <CheckCircleIcon color="success" />
                          ) : (
                            <CancelIcon color="disabled" />
                          )}
                          <Typography variant="body1">
                            {index + 1}. {answer.content}
                          </Typography>
                          {answer.isTrue && (
                            <Chip label="Đáp án đúng" color="success" size="small" />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
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

export default QuestionManagement;

