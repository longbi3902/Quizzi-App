/**
 * ExamCodeDetail - Trang chi tiết mã đề
 * Hiển thị đề thi với thứ tự câu hỏi đã đảo
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { API_ENDPOINTS } from '../constants/api';
import { ExamCodeWithExam } from '../types/exam.types';
import { getDifficultyName, getDifficultyColor } from '../utils/questionUtils';

const ExamCodeDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [examCode, setExamCode] = useState<ExamCodeWithExam | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetchExamCode = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_ENDPOINTS.EXAM_CODES}/${id}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Lỗi khi lấy chi tiết mã đề');
      }

      setExamCode(data.data);
    } catch (err: any) {
      console.error('Fetch exam code error:', err);
      setError(err.message || 'Không thể tải chi tiết mã đề');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Sắp xếp câu hỏi theo thứ tự đã đảo
  const getOrderedQuestions = () => {
    if (!examCode || !examCode.exam) {
      return [];
    }

    // Tạo map từ questionId -> ExamQuestion
    const questionMap = new Map(
      examCode.exam.questions.map((eq) => [eq.questionId, eq])
    );

    // Sắp xếp theo thứ tự trong questionOrder
    const orderedQuestions = examCode.questionOrder
      .map((questionId) => questionMap.get(questionId))
      .filter((eq): eq is NonNullable<typeof eq> => eq !== undefined);

    return orderedQuestions;
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !examCode || !examCode.exam) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Paper elevation={3} sx={{ padding: 4 }}>
            <Alert severity="error">{error || 'Không tìm thấy mã đề'}</Alert>
            <Box mt={2}>
              <IconButton onClick={() => navigate(-1)}>
                <ArrowBackIcon />
              </IconButton>
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

  const orderedQuestions = getOrderedQuestions();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <IconButton onClick={() => navigate(-1)}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1" sx={{ color: '#6366f1', fontWeight: 'bold' }}>
              Chi tiết mã đề: {examCode.code}
            </Typography>
          </Box>

          {/* Thông tin đề thi */}
          <Box mb={4}>
            <Typography variant="h5" gutterBottom>
              {examCode.exam.name}
            </Typography>
            <Box display="flex" gap={2} mt={2}>
              <Chip label={`Thời gian: ${examCode.exam.duration} phút`} />
              <Chip label={`Tổng điểm: ${examCode.exam.maxScore}`} />
              <Chip label={`Số câu: ${orderedQuestions.length}`} />
            </Box>
          </Box>

          {/* Danh sách câu hỏi theo thứ tự đã đảo */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
            Danh sách câu hỏi (theo thứ tự mã đề):
          </Typography>

          {orderedQuestions.length === 0 ? (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Không có câu hỏi nào trong mã đề này. Vui lòng kiểm tra lại dữ liệu.
            </Alert>
          ) : (
            orderedQuestions.map((eq, index) => (
            <Card key={eq.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Typography variant="h6" component="div">
                    Câu {index + 1}
                  </Typography>
                  <Box display="flex" gap={1}>
                    <Chip label={`Điểm: ${eq.score}`} size="small" color="primary" />
                    {eq.question && (
                      <Chip
                        label={getDifficultyName(eq.question.difficulty)}
                        size="small"
                        sx={{
                          backgroundColor: getDifficultyColor(eq.question.difficulty),
                          color: 'white',
                        }}
                      />
                    )}
                  </Box>
                </Box>

                {eq.question ? (
                  <>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {eq.question.content}
                    </Typography>

                    {eq.question.image && (
                      <Box mb={2}>
                        <img
                          src={eq.question.image}
                          alt="Câu hỏi"
                          style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                        />
                      </Box>
                    )}

                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                      Đáp án:
                    </Typography>
                    <Box>
                      {eq.question.answers && eq.question.answers.length > 0 ? (
                        eq.question.answers.map((answer, ansIndex) => (
                          <Box
                            key={answer.id}
                            sx={{
                              p: 1.5,
                              mb: 1,
                              borderRadius: '4px',
                              backgroundColor: answer.isTrue ? '#e8f5e9' : '#f5f5f5',
                              border: answer.isTrue ? '2px solid #4caf50' : '1px solid #e0e0e0',
                            }}
                          >
                            <Typography variant="body2">
                              {String.fromCharCode(65 + ansIndex)}. {answer.content}
                              {answer.isTrue && (
                                <Chip
                                  label="Đúng"
                                  size="small"
                                  color="success"
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Typography>
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Chưa có đáp án
                        </Typography>
                      )}
                    </Box>
                  </>
                ) : (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Không tìm thấy thông tin câu hỏi (ID: {eq.questionId}). Vui lòng kiểm tra lại dữ liệu.
                  </Alert>
                )}
              </CardContent>
            </Card>
            ))
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ExamCodeDetail;

