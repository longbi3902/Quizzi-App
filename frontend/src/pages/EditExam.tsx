/**
 * EditExam - Trang chỉnh sửa đề thi
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { API_ENDPOINTS } from '../constants/api';
import { ExamWithQuestions, UpdateExamWithQuestionsDTO } from '../types/exam.types';
import { QuestionWithAnswers } from '../types/question.types';
import { useToast } from '../contexts/ToastContext';
import { getDifficultyName, getDifficultyColor } from '../utils/questionUtils';

const EditExam: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const examId = id ? Number.parseInt(id, 10) : null;
  const { showSuccess, showError } = useToast();

  const [examName, setExamName] = useState('');
  const [duration, setDuration] = useState<number>(60);
  const [maxScore, setMaxScore] = useState<number>(100);
  const [examQuestions, setExamQuestions] = useState<
    Array<{ examQuestionId?: number; question: QuestionWithAnswers; score: number }>
  >([]);
  const [availableQuestions, setAvailableQuestions] = useState<QuestionWithAnswers[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  // Load dữ liệu đề thi
  useEffect(() => {
    if (!examId || isNaN(examId)) {
      setError('ID đề thi không hợp lệ');
      setLoadingData(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoadingData(true);
        
        // Load đề thi
        const examResponse = await fetch(`${API_ENDPOINTS.EXAMS}/${examId}`);
        const examData = await examResponse.json();
        if (!examResponse.ok || !examData.success) {
          throw new Error(examData.message || 'Không tìm thấy đề thi');
        }

        const exam: ExamWithQuestions = examData.data;
        setExamName(exam.name);
        setDuration(exam.duration);
        setMaxScore(exam.maxScore);
        setExamQuestions(
          exam.questions.map((eq) => ({
            examQuestionId: eq.id,
            question: eq.question!,
            score: eq.score,
          }))
        );

        // Load danh sách câu hỏi
        const questionsResponse = await fetch(API_ENDPOINTS.QUESTIONS);
        const questionsData = await questionsResponse.json();
        if (questionsResponse.ok && questionsData.success) {
          setAvailableQuestions(questionsData.data || []);
        }
      } catch (err: any) {
        setError(err.message || 'Không thể tải dữ liệu đề thi');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [examId]);

  const handleAddQuestion = (question: QuestionWithAnswers) => {
    if (examQuestions.find((eq) => eq.question.id === question.id)) {
      setError('Câu hỏi này đã có trong đề thi');
      return;
    }
    setExamQuestions([...examQuestions, { question, score: 0 }]);
    setError('');
  };

  const handleRemoveQuestion = (questionId: number) => {
    setExamQuestions(examQuestions.filter((eq) => eq.question.id !== questionId));
  };

  const handleScoreChange = (questionId: number, score: number) => {
    setExamQuestions(
      examQuestions.map((eq) =>
        eq.question.id === questionId ? { ...eq, score } : eq
      )
    );
  };

  const validateForm = (): boolean => {
    if (!examName.trim()) {
      setError('Tên đề thi là bắt buộc');
      return false;
    }
    if (examQuestions.length === 0) {
      setError('Phải có ít nhất 1 câu hỏi');
      return false;
    }
    const totalScore = examQuestions.reduce((sum, eq) => sum + eq.score, 0);
    if (totalScore > maxScore) {
      setError(`Tổng điểm các câu hỏi (${totalScore}) không được vượt quá tổng điểm đề thi (${maxScore})`);
      return false;
    }
    for (const eq of examQuestions) {
      if (eq.score <= 0) {
        setError('Mỗi câu hỏi phải có điểm lớn hơn 0');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    if (!validateForm() || !examId) {
      return;
    }

    setLoading(true);
    try {
      const examData: UpdateExamWithQuestionsDTO = {
        name: examName.trim(),
        duration,
        maxScore,
        questions: examQuestions.map((eq) => ({
          questionId: eq.question.id,
          score: eq.score,
        })),
      };

      const response = await fetch(`${API_ENDPOINTS.EXAMS}/${examId}/questions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examData),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Cập nhật đề thi thất bại');
      }

      showSuccess('Cập nhật đề thi thành công!');
      navigate('/teacher/exams');
    } catch (err: any) {
      const errorMessage = err.message || 'Cập nhật đề thi thất bại';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const totalScore = examQuestions.reduce((sum, eq) => sum + eq.score, 0);
  const availableQuestionsToAdd = availableQuestions.filter(
    (q) => !examQuestions.some((eq) => eq.question.id === q.id)
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <IconButton onClick={() => navigate('/teacher/exams')}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1" sx={{ color: '#6366f1', fontWeight: 'bold' }}>
              CHỈNH SỬA ĐỀ THI
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Form thông tin đề thi */}
          <Box sx={{ mb: 3 }}>
            <TextField
              required
              fullWidth
              label="Tên đề thi"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Box display="flex" gap={2}>
              <TextField
                required
                type="number"
                label="Thời gian thi (phút)"
                value={duration}
                onChange={(e) => setDuration(Number.parseInt(e.target.value, 10) || 0)}
                sx={{ flex: 1 }}
              />
              <TextField
                required
                type="number"
                label="Tổng điểm đề thi"
                value={maxScore}
                onChange={(e) => setMaxScore(Number.parseFloat(e.target.value) || 0)}
                sx={{ flex: 1 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Tổng điểm các câu hỏi: {totalScore.toFixed(2)} / {maxScore}
            </Typography>
          </Box>

          {/* Danh sách câu hỏi trong đề thi */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Câu hỏi trong đề thi ({examQuestions.length})
            </Typography>
            {examQuestions.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>STT</TableCell>
                      <TableCell>Nội dung</TableCell>
                      <TableCell>Độ khó</TableCell>
                      <TableCell>Điểm</TableCell>
                      <TableCell align="right">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {examQuestions.map((eq, index) => (
                      <TableRow key={eq.question.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {eq.question.content}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getDifficultyName(eq.question.difficulty || 1)}
                            size="small"
                            sx={{
                              backgroundColor: getDifficultyColor(eq.question.difficulty || 1),
                              color: '#fff',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            value={eq.score}
                            onChange={(e) => handleScoreChange(eq.question.id, Number.parseFloat(e.target.value) || 0)}
                            inputProps={{ min: 0, step: 0.5 }}
                            sx={{ width: 100 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveQuestion(eq.question.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Chưa có câu hỏi nào
              </Typography>
            )}
          </Box>

          {/* Danh sách câu hỏi có thể thêm */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Thêm câu hỏi mới
            </Typography>
            {availableQuestionsToAdd.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nội dung</TableCell>
                      <TableCell>Độ khó</TableCell>
                      <TableCell align="right">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {availableQuestionsToAdd.map((q) => (
                      <TableRow key={q.id}>
                        <TableCell>{q.id}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {q.content}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getDifficultyName(q.difficulty || 1)}
                            size="small"
                            sx={{
                              backgroundColor: getDifficultyColor(q.difficulty || 1),
                              color: '#fff',
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={() => handleAddQuestion(q)}
                          >
                            Thêm
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Không còn câu hỏi nào để thêm
              </Typography>
            )}
          </Box>

          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Cập nhật đề thi'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/teacher/exams')}
              fullWidth
            >
              Hủy
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default EditExam;

