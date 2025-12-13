/**
 * ExamResultDetail - Trang xem chi tiết bài làm của học sinh (cho giáo viên)
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Grid,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { API_ENDPOINTS } from '../constants/api';
import apiClient from '../utils/apiClient';
import { useToast } from '../contexts/ToastContext';

interface ExamResultDetail {
  id: number;
  student: {
    id: number;
    name: string;
    email: string;
  };
  exam: {
    id: number;
    name: string;
    duration: number;
    maxScore: number;
  };
  class: {
    id: number;
    name: string;
    code: string;
  };
  examCode: string | null;
  score: number;
  maxScore: number;
  startedAt: Date;
  submittedAt: Date | null;
  duration: number | null;
  answers: Array<{
    questionId: number;
    answerIds: number[];
  }>;
  correctAnswers: Array<{
    questionId: number;
    answerIds: number[];
  }> | null;
  questions: Array<{
    id: number;
    questionId: number;
    score: number;
    orderIndex: number;
    question: {
      id: number;
      content: string;
      image?: string;
      answers: Array<{
        id: number;
        content: string;
        isTrue: boolean;
      }>;
    };
  }>;
}

const ExamResultDetail: React.FC = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();
  const { showError } = useToast();

  const [result, setResult] = useState<ExamResultDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (resultId) {
      loadResultDetail();
    }
  }, [resultId]);

  const loadResultDetail = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(API_ENDPOINTS.EXAM_RESULTS_DETAIL(Number.parseInt(resultId!, 10)));
      const data = await response.json();

      if (response.ok && data.success && data.data) {
        setResult(data.data);
      } else {
        showError(data.message || 'Không thể tải chi tiết bài làm');
        navigate('/teacher/classes');
      }
    } catch (error: any) {
      console.error('Error loading result detail:', error);
      showError('Có lỗi xảy ra khi tải chi tiết bài làm');
      navigate('/teacher/classes');
    } finally {
      setLoading(false);
    }
  };

  const isAnswerCorrect = (questionId: number, studentAnswers: number[]): boolean => {
    if (!result?.correctAnswers) return false;

    const correctAnswer = result.correctAnswers.find((ca) => ca.questionId === questionId);
    if (!correctAnswer) return false;

    const sortedStudent = [...studentAnswers].sort((a, b) => a - b);
    const sortedCorrect = [...correctAnswer.answerIds].sort((a, b) => a - b);

    return (
      sortedStudent.length === sortedCorrect.length &&
      sortedStudent.every((id, index) => id === sortedCorrect[index])
    );
  };

  const getStudentAnswer = (questionId: number): number[] => {
    const answer = result?.answers.find((a) => a.questionId === questionId);
    return answer?.answerIds || [];
  };

  const getCorrectAnswer = (questionId: number): number[] => {
    if (!result?.correctAnswers) return [];
    const correctAnswer = result.correctAnswers.find((ca) => ca.questionId === questionId);
    return correctAnswer?.answerIds || [];
  };

  if (loading) {
    return (
      <Container maxWidth={false}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!result) {
    return (
      <Container maxWidth={false}>
        <Box>
          <Alert severity="error">Không tìm thấy chi tiết bài làm</Alert>
          <Button variant="contained" onClick={() => navigate('/teacher/classes')} sx={{ mt: 2 }}>
            Quay lại
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth={false}>
      <Box>
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Typography variant="h4" component="h1" sx={{ color: '#6366f1', fontWeight: 'bold' }}>
              Chi tiết bài làm
            </Typography>
          </Box>

          {/* Thông tin học sinh và đề thi */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Thông tin học sinh
                </Typography>
                <Typography variant="body1">
                  <strong>Họ tên:</strong> {result.student.name}
                </Typography>
                <Typography variant="body1">
                  <strong>Email:</strong> {result.student.email}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Thông tin đề thi
                </Typography>
                <Typography variant="body1">
                  <strong>Tên đề thi:</strong> {result.exam.name}
                </Typography>
                <Typography variant="body1">
                  <strong>Lớp học:</strong> {result.class.name} ({result.class.code})
                </Typography>
                {result.examCode && (
                  <Typography variant="body1">
                    <strong>Mã đề:</strong> {result.examCode}
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Thông tin tổng quan */}
          <Box sx={{ mb: 4, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="h3" color="primary" gutterBottom>
              Điểm: {result.score} / {result.maxScore}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Thời gian làm bài: {result.duration ? `${Math.floor(result.duration / 60)}:${(result.duration % 60).toString().padStart(2, '0')}` : 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bắt đầu: {new Date(result.startedAt).toLocaleString('vi-VN')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Nộp bài: {result.submittedAt ? new Date(result.submittedAt).toLocaleString('vi-VN') : 'Chưa nộp'}
            </Typography>
          </Box>

          {/* Chi tiết từng câu hỏi */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Chi tiết bài làm
            </Typography>
            {result.questions.map((examQuestion, index) => {
              const question = examQuestion.question;
              if (!question) return null;

              const studentAnswerIds = getStudentAnswer(question.id);
              const correctAnswerIds = getCorrectAnswer(question.id);
              const isCorrect = isAnswerCorrect(question.id, studentAnswerIds);

              return (
                <Paper key={examQuestion.id} elevation={1} sx={{ p: 3, mb: 3 }}>
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

                  {question.image && (
                    <Box sx={{ mb: 2 }}>
                      <img src={question.image} alt="Question" style={{ maxWidth: '100%', height: 'auto' }} />
                    </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

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
                </Paper>
              );
            })}
          </Box>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button variant="contained" onClick={() => navigate(-1)}>
              Quay lại
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ExamResultDetail;

