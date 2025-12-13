/**
 * ExamResult - Trang xem kết quả bài thi
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { ExamResult as ExamResultType, CorrectAnswer, StudentAnswer, ExamQuestionForTaking } from '../types/examResult.types';
import { ClassWithExams } from '../types/class.types';
import { API_ENDPOINTS } from '../constants/api';
import apiClient from '../utils/apiClient';

const ExamResult: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const classId = location.state?.classId;
  const examId = location.state?.examId;
  
  const [examResult, setExamResult] = useState<ExamResultType | null>(null);
  const [classData, setClassData] = useState<ClassWithExams | null>(null);
  const [loading, setLoading] = useState(true);
  const [canViewCorrectAnswers, setCanViewCorrectAnswers] = useState(false);
  const [questions, setQuestions] = useState<ExamQuestionForTaking[]>([]);

  useEffect(() => {
    // Lấy classId và examId từ state hoặc localStorage
    let finalClassId = classId;
    let finalExamId = examId;
    
    if (!finalClassId || !finalExamId) {
      // Thử lấy từ localStorage
      const classDataStr = localStorage.getItem('currentClass');
      const examDataStr = localStorage.getItem('currentExam');
      
      if (classDataStr && examDataStr) {
        try {
          const classInfo = JSON.parse(classDataStr);
          const examInfo = JSON.parse(examDataStr);
          finalClassId = classInfo.id;
          finalExamId = examInfo.examId || examInfo.id;
        } catch (error) {
          console.error('Error parsing data:', error);
          navigate('/home');
          return;
        }
      } else if (classDataStr) {
        try {
          const classInfo = JSON.parse(classDataStr);
          finalClassId = classInfo.id;
          // Nếu có examId trong location state
          if (examId) {
            finalExamId = examId;
          } else {
            navigate('/home');
            return;
          }
        } catch (error) {
          console.error('Error parsing class data:', error);
          navigate('/home');
          return;
        }
      } else {
        navigate('/home');
        return;
      }
    }
    
    if (finalClassId && finalExamId) {
      loadExamResultByClassAndExam(finalClassId, finalExamId);
    }
  }, [classId, examId, navigate]);

  const loadExamResultByClassAndExam = async (classId: number, examId: number) => {
    try {
      setLoading(true);
      
      // Lấy kết quả bài thi
      const resultResponse = await apiClient.get(API_ENDPOINTS.EXAM_RESULTS_BY_CLASS_EXAM(classId, examId));
      const resultData = await resultResponse.json();

      if (resultResponse.ok && resultData.success && resultData.data) {
        setExamResult(resultData.data);
      } else {
        navigate('/home');
        return;
      }

      // Lấy thông tin lớp học
      const classDataStr = localStorage.getItem('currentClass');
      if (classDataStr) {
        try {
          const classInfo: ClassWithExams = JSON.parse(classDataStr);
          setClassData(classInfo);
          
          // Lấy đề thi từ danh sách đề thi trong lớp
          const exam = classInfo.exams?.find((e: any) => e.id === examId);
          
          // Kiểm tra xem đã hết thời gian thi chưa (lấy từ exam)
          if (exam && exam.endDate) {
            const now = new Date();
            const endDate = new Date(exam.endDate);
            setCanViewCorrectAnswers(now > endDate);
          }
          if (exam) {
            const questionsList: ExamQuestionForTaking[] = exam.questions.map((eq: any) => {
              if (!eq.question) {
                return {
                  id: eq.id,
                  questionId: eq.questionId,
                  score: eq.score,
                  orderIndex: eq.orderIndex,
                  question: {
                    id: 0,
                    content: '',
                    type: 'single' as const,
                    answers: [],
                  },
                };
              }
              
              const correctAnswersCount = eq.question.answers.filter((a: any) => a.isTrue).length;
              const questionType = correctAnswersCount > 1 ? 'multiple' : 'single';
              
              return {
                id: eq.id,
                questionId: eq.question.id,
                score: eq.score,
                orderIndex: eq.orderIndex,
                question: {
                  id: eq.question.id,
                  content: eq.question.content,
                  type: questionType,
                  answers: eq.question.answers.map((answer: any) => ({
                    id: answer.id,
                    content: answer.content,
                    isCorrect: canViewCorrectAnswers ? answer.isTrue : false,
                  })),
                },
              };
            });
            setQuestions(questionsList);
          }
        } catch (error) {
          console.error('Error parsing class data:', error);
        }
      }
    } catch (error: any) {
      console.error('Error loading exam result:', error);
      navigate('/home');
    } finally {
      setLoading(false);
    }
  };


  const isAnswerCorrect = (questionId: number, studentAnswers: number[]): boolean => {
    if (!examResult?.correctAnswers || !canViewCorrectAnswers) {
      return false;
    }

    const correctAnswer = examResult.correctAnswers.find((ca) => ca.questionId === questionId);
    if (!correctAnswer) return false;

    const sortedStudent = [...studentAnswers].sort((a, b) => a - b);
    const sortedCorrect = [...correctAnswer.answerIds].sort((a, b) => a - b);

    return (
      sortedStudent.length === sortedCorrect.length &&
      sortedStudent.every((id, index) => id === sortedCorrect[index])
    );
  };

  const getStudentAnswer = (questionId: number): number[] => {
    const answer = examResult?.answers.find((a) => a.questionId === questionId);
    return answer?.answerIds || [];
  };

  const getCorrectAnswer = (questionId: number): number[] => {
    if (!examResult?.correctAnswers || !canViewCorrectAnswers) {
      return [];
    }
    const correctAnswer = examResult.correctAnswers.find((ca) => ca.questionId === questionId);
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

  if (!examResult || !classData) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">Không tìm thấy kết quả bài thi</Alert>
          <Button variant="contained" onClick={() => navigate('/home')} sx={{ mt: 2 }}>
            Về trang chủ
          </Button>
        </Box>
      </Container>
    );
  }

  const exam = classData.exams?.find(e => e.id === examId);
  if (!exam) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">Không tìm thấy đề thi</Alert>
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
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <IconButton onClick={() => navigate('/home')}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1" sx={{ color: '#6366f1', fontWeight: 'bold' }}>
              Kết quả bài thi
            </Typography>
          </Box>

          {/* Thông tin tổng quan */}
          <Box sx={{ mb: 4, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
              {exam.name}
            </Typography>
            <Typography variant="h3" color="primary" gutterBottom>
              Điểm: {examResult.score} / {examResult.maxScore}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Thời gian làm bài: {new Date(examResult.startedAt).toLocaleString('vi-VN')} -{' '}
              {examResult.submittedAt
                ? new Date(examResult.submittedAt).toLocaleString('vi-VN')
                : 'Chưa nộp bài'}
            </Typography>
            {examResult.examCode && (
              <Chip label={`Mã đề: ${examResult.examCode}`} color="primary" sx={{ mt: 1 }} />
            )}
          </Box>

          {!canViewCorrectAnswers && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Phòng thi chưa hết thời gian. Bạn chỉ có thể xem đáp án mình đã chọn.
            </Alert>
          )}

          {/* Chi tiết từng câu hỏi */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Chi tiết bài làm
            </Typography>
            {questions.map((examQuestion, index) => {
              const question = examQuestion.question;
              if (!question || question.id === 0) return null;

              const studentAnswerIds = getStudentAnswer(question.id);
              const correctAnswerIds = getCorrectAnswer(question.id);
              const isCorrect = canViewCorrectAnswers
                ? isAnswerCorrect(question.id, studentAnswerIds)
                : null;

              return (
                <Paper key={examQuestion.id} elevation={1} sx={{ p: 3, mb: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="h6" component="h3">
                        Câu {index + 1}: {question.content}
                      </Typography>
                      {canViewCorrectAnswers && isCorrect !== null && (
                        isCorrect ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <CancelIcon color="error" />
                        )
                      )}
                    </Box>
                    <Chip label={`${examQuestion.score} điểm`} color="primary" size="small" />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Đáp án học sinh chọn */}
                  <Box mb={2}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Đáp án bạn chọn:
                    </Typography>
                    {studentAnswerIds.length > 0 ? (
                      <Box>
                        {question.answers
                          .filter((answer) => studentAnswerIds.includes(answer.id))
                          .map((answer) => (
                            <Chip
                              key={answer.id}
                              label={answer.content}
                              color={canViewCorrectAnswers && isCorrect ? 'success' : 'default'}
                              sx={{ mr: 1, mb: 1 }}
                            />
                          ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        (Bạn chưa chọn đáp án)
                      </Typography>
                    )}
                  </Box>

                  {/* Đáp án đúng (chỉ hiện khi đã hết thời gian thi) */}
                  {canViewCorrectAnswers && correctAnswerIds.length > 0 && (
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

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button variant="contained" onClick={() => navigate('/home')}>
              Về trang chủ
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ExamResult;

