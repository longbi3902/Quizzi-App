/**
 * ExamTaking - Trang làm bài thi
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  FormGroup,
  FormControl,
  FormLabel,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Alert,
  Divider,
  Chip,
} from '@mui/material';
import { StartExamResponse, ExamQuestionForTaking, StudentAnswer, SubmitExamDTO } from '../types/examResult.types';
import { API_ENDPOINTS } from '../constants/api';
import apiClient from '../utils/apiClient';

const ExamTaking: React.FC = () => {
  const navigate = useNavigate();
  const [examData, setExamData] = useState<StartExamResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [answers, setAnswers] = useState<{ [questionId: number]: number[] }>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    // Lấy thông tin bài thi từ localStorage
    const examDataStr = localStorage.getItem('currentExam');
    if (examDataStr) {
      try {
        const data: StartExamResponse = JSON.parse(examDataStr);
        setExamData(data);
        setTimeRemaining(data.duration * 60); // Convert phút sang giây
      } catch (error) {
        console.error('Error parsing exam data:', error);
        navigate('/home');
      }
    } else {
      navigate('/home');
    }
    setLoading(false);
  }, [navigate]);

  // Đếm ngược thời gian
  useEffect(() => {
    if (!examData || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Tự động nộp bài khi hết thời gian
          const answersArray: StudentAnswer[] = Object.keys(answers).map((questionIdStr) => ({
            questionId: Number.parseInt(questionIdStr, 10),
            answerIds: answers[Number.parseInt(questionIdStr, 10)],
          }));

          const submitData: SubmitExamDTO = {
            examRoomId: examData.examRoomId,
            examCodeId: examData.examCodeId,
            answers: answersArray,
          };

          setSubmitting(true);
          setShowResultDialog(true);

          apiClient
            .post(API_ENDPOINTS.EXAM_RESULTS_SUBMIT, submitData)
            .then((response) => response.json())
            .then((data) => {
              if (data.success) {
                setResult(data.data);
                localStorage.removeItem('currentExam');
              } else {
                setResult({ error: data.message || 'Không thể nộp bài thi' });
              }
            })
            .catch((error: any) => {
              console.error('Error submitting exam:', error);
              setResult({ error: error.message || 'Không thể nộp bài thi' });
            })
            .finally(() => {
              setSubmitting(false);
            });

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examData, timeRemaining, answers]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: number, answerId: number, isMultiple: boolean) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      if (isMultiple) {
        // Multiple choice: toggle
        const newAnswers = current.includes(answerId)
          ? current.filter((id) => id !== answerId)
          : [...current, answerId];
        return { ...prev, [questionId]: newAnswers };
      } else {
        // Single choice: replace
        return { ...prev, [questionId]: [answerId] };
      }
    });
  };

  const handleSubmitExam = async () => {
    if (!examData) return;

    // Chuyển đổi answers từ object sang array
    const answersArray: StudentAnswer[] = Object.keys(answers).map((questionIdStr) => ({
      questionId: Number.parseInt(questionIdStr, 10),
      answerIds: answers[Number.parseInt(questionIdStr, 10)],
    }));

    const submitData: SubmitExamDTO = {
      examRoomId: examData.examRoomId,
      examCodeId: examData.examCodeId,
      answers: answersArray,
    };

    setSubmitting(true);
    setShowResultDialog(true);

    try {
      const response = await apiClient.post(API_ENDPOINTS.EXAM_RESULTS_SUBMIT, submitData);
      const data = await response.json();

      if (response.ok && data.success) {
        setResult(data.data);
        // Xóa currentExam khỏi localStorage
        localStorage.removeItem('currentExam');
      } else {
        setResult({ error: data.message || 'Không thể nộp bài thi' });
      }
    } catch (error: any) {
      console.error('Error submitting exam:', error);
      setResult({ error: error.message || 'Không thể nộp bài thi' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseResultDialog = () => {
    setShowResultDialog(false);
    if (result && !result.error) {
      // Chuyển đến trang xem kết quả
      navigate('/exam-result', { state: { examRoomId: examData?.examRoomId } });
    }
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

  if (!examData) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">Không tìm thấy thông tin bài thi</Alert>
          <Button variant="contained" onClick={() => navigate('/home')} sx={{ mt: 2 }}>
            Về trang chủ
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ padding: 4 }}>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" component="h1" sx={{ color: '#6366f1', fontWeight: 'bold' }}>
              Làm bài thi
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              {examData.examCode && (
                <Chip label={`Mã đề: ${examData.examCode}`} color="primary" />
              )}
              <Chip
                label={`Thời gian: ${formatTime(timeRemaining)}`}
                color={timeRemaining < 300 ? 'error' : 'default'}
                sx={{ minWidth: 120 }}
              />
            </Box>
          </Box>

          {/* Danh sách câu hỏi */}
          <Box>
            {examData.questions.map((examQuestion, index) => {
              const question = examQuestion.question;
              const isMultiple = question.type === 'multiple';
              const selectedAnswers = answers[question.id] || [];

              return (
                <Paper key={examQuestion.id} elevation={1} sx={{ p: 3, mb: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Typography variant="h6" component="h3">
                      Câu {index + 1}: {question.content}
                    </Typography>
                    <Chip label={`${examQuestion.score} điểm`} color="primary" size="small" />
                  </Box>

                  <FormControl component="fieldset" fullWidth>
                    {isMultiple ? (
                      <FormGroup>
                        {question.answers.map((answer) => (
                          <FormControlLabel
                            key={answer.id}
                            control={
                              <Checkbox
                                checked={selectedAnswers.includes(answer.id)}
                                onChange={() => handleAnswerChange(question.id, answer.id, true)}
                              />
                            }
                            label={answer.content}
                          />
                        ))}
                      </FormGroup>
                    ) : (
                      <RadioGroup
                        value={selectedAnswers[0] || ''}
                        onChange={(e) =>
                          handleAnswerChange(question.id, Number.parseInt(e.target.value, 10), false)
                        }
                      >
                        {question.answers.map((answer) => (
                          <FormControlLabel
                            key={answer.id}
                            value={answer.id.toString()}
                            control={<Radio />}
                            label={answer.content}
                          />
                        ))}
                      </RadioGroup>
                    )}
                  </FormControl>
                </Paper>
              );
            })}
          </Box>

          {/* Nút nộp bài */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmitExam}
              disabled={submitting}
              sx={{ minWidth: 200, py: 1.5 }}
            >
              {submitting ? 'Đang nộp bài...' : 'Nộp bài'}
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Dialog hiển thị kết quả */}
      <Dialog open={showResultDialog} onClose={handleCloseResultDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Kết quả bài thi</DialogTitle>
        <DialogContent>
          {submitting ? (
            <Box textAlign="center" py={4}>
              <CircularProgress />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Đang chấm bài...
              </Typography>
            </Box>
          ) : result ? (
            result.error ? (
              <Alert severity="error">{result.error}</Alert>
            ) : (
              <Box>
                <Alert severity="success" sx={{ mb: 2 }}>
                  Nộp bài thành công!
                </Alert>
                <Typography variant="h5" textAlign="center" gutterBottom>
                  Điểm số: {result.score} / {result.maxScore}
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleCloseResultDialog}
                  sx={{ mt: 2 }}
                >
                  Xem kết quả chi tiết
                </Button>
              </Box>
            )
          ) : null}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default ExamTaking;

