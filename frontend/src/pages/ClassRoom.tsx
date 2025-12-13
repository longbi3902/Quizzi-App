/**
 * ClassRoom - Trang lớp học (sau khi học sinh tham gia thành công)
 * Logic mới: Lớp có nhiều đề thi, học sinh chọn đề thi để thi
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import { ClassWithExams } from '../types/class.types';
import { ExamResult } from '../types/examResult.types';
import { API_ENDPOINTS } from '../constants/api';
import { useToast } from '../contexts/ToastContext';
import apiClient from '../utils/apiClient';

const ClassRoom: React.FC = () => {
  const navigate = useNavigate();
  const { showError } = useToast();
  const [classData, setClassData] = useState<ClassWithExams | null>(null);
  const [loading, setLoading] = useState(true);
  const [examResults, setExamResults] = useState<Map<number, ExamResult>>(new Map());

  useEffect(() => {
    loadClassData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadClassData = async () => {
    try {
      setLoading(true);
      // Lấy thông tin lớp học từ localStorage để lấy classId
      const classDataStr = localStorage.getItem('currentClass');
      if (!classDataStr) {
        navigate('/join-class');
        return;
      }

      try {
        const classInfo: ClassWithExams = JSON.parse(classDataStr);
        const classId = classInfo.id;

        // Load dữ liệu mới nhất từ backend
        const response = await apiClient.get(`${API_ENDPOINTS.CLASSES}/${classId}`);
        const data = await response.json();

        if (response.ok && data.success) {
          const updatedClassData: ClassWithExams = data.data;
          setClassData(updatedClassData);
          // Cập nhật localStorage với dữ liệu mới
          localStorage.setItem('currentClass', JSON.stringify(updatedClassData));
          
          // Kiểm tra kết quả thi cho từng đề thi
          if (updatedClassData.exams && updatedClassData.exams.length > 0) {
            checkExamResults(updatedClassData.id, updatedClassData.exams.map(e => e.id));
          }
        } else {
          throw new Error(data.message || 'Không thể tải thông tin lớp học');
        }
      } catch (parseError) {
        console.error('Error parsing class data:', parseError);
        navigate('/join-class');
      }
    } catch (error: any) {
      console.error('Error loading class data:', error);
      showError(error.message || 'Không thể tải thông tin lớp học');
      navigate('/join-class');
    } finally {
      setLoading(false);
    }
  };

  const checkExamResults = async (classId: number, examIds: number[]) => {
    try {
      const results = new Map<number, ExamResult>();
      
      for (const examId of examIds) {
        try {
          const response = await apiClient.get(API_ENDPOINTS.EXAM_RESULTS_BY_CLASS_EXAM(classId, examId));
          const data = await response.json();
          
          if (response.ok && data.success && data.data) {
            results.set(examId, data.data);
          }
        } catch (error) {
          // Không có kết quả hoặc chưa làm bài
          console.log(`No exam result found for exam ${examId}`);
        }
      }
      
      setExamResults(results);
    } catch (error) {
      console.error('Error checking exam results:', error);
    }
  };

  const getExamStatus = (examId: number) => {
    if (!classData) return null;

    const exam = classData.exams?.find(e => e.id === examId);
    if (!exam) return null;

    const now = new Date();
    const startDate = new Date(exam.startDate);
    const endDate = new Date(exam.endDate);

    if (now < startDate) {
      return 'not_started'; // Chưa đến thời gian bắt đầu
    } else if (now >= startDate && now <= endDate) {
      return 'in_progress'; // Đang trong thời gian cho phép
    } else {
      return 'ended'; // Đã hết thời gian
    }
  };

  const handleStartExam = async (examId: number) => {
    if (!classData) return;

    try {
      const response = await apiClient.post(API_ENDPOINTS.EXAM_RESULTS_START(classData.id, examId), {});
      const data = await response.json();

      if (response.ok && data.success) {
        // Lưu thông tin bài thi vào localStorage
        localStorage.setItem('currentExam', JSON.stringify(data.data));
        // Chuyển đến trang làm bài
        navigate('/exam-taking');
      } else {
        showError(data.message || 'Không thể bắt đầu làm bài thi');
      }
    } catch (error: any) {
      console.error('Error starting exam:', error);
      showError(error.message || 'Không thể bắt đầu làm bài thi');
    }
  };

  const handleViewResult = (examId: number) => {
    if (!classData) return;
    navigate('/exam-result', { state: { classId: classData.id, examId } });
  };

  const handleRefresh = () => {
    loadClassData();
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

  if (!classData) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">
            Không tìm thấy thông tin lớp học. Vui lòng tham gia lại.
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate('/join-class')}
            sx={{ mt: 2 }}
          >
            Tham gia lớp học
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
              {classData.name}
            </Typography>
            <Chip label={classData.code} color="primary" />
            <Box sx={{ flex: 1 }} />
            <IconButton onClick={handleRefresh} title="Làm mới">
              <RefreshIcon />
            </IconButton>
          </Box>


          <Typography variant="h5" gutterBottom sx={{ mt: 3, mb: 2 }}>
            Danh sách đề thi ({classData.exams?.length || 0})
          </Typography>

          {classData.exams && classData.exams.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Tên đề thi</TableCell>
                      <TableCell>Thời gian</TableCell>
                      <TableCell>Tổng điểm</TableCell>
                      <TableCell>Số câu hỏi</TableCell>
                      <TableCell>Bắt đầu</TableCell>
                      <TableCell>Kết thúc</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell align="right">Thao tác</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                  {classData.exams.map((exam) => {
                    const result = examResults.get(exam.id);
                    const examStatusForThis = getExamStatus(exam.id);
                    const canStart = examStatusForThis === 'in_progress' && !result;
                    const hasResult = !!result;

                    return (
                      <TableRow key={exam.id} hover>
                        <TableCell>{exam.id}</TableCell>
                        <TableCell>{exam.name}</TableCell>
                        <TableCell>{exam.duration} phút</TableCell>
                        <TableCell>{exam.maxScore}</TableCell>
                        <TableCell>{exam.questions?.length || 0}</TableCell>
                        <TableCell>
                          {new Date(exam.startDate).toLocaleString('vi-VN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                        <TableCell>
                          {new Date(exam.endDate).toLocaleString('vi-VN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                        <TableCell>
                          {hasResult ? (
                            <Chip label="Đã thi" color="success" size="small" />
                          ) : examStatusForThis === 'in_progress' ? (
                            <Chip label="Chưa thi" color="warning" size="small" />
                          ) : examStatusForThis === 'not_started' ? (
                            <Chip label="Chưa đến giờ" color="default" size="small" />
                          ) : (
                            <Chip label="Đã hết hạn" color="error" size="small" />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {hasResult ? (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleViewResult(exam.id)}
                            >
                              Xem kết quả
                            </Button>
                          ) : canStart ? (
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleStartExam(exam.id)}
                            >
                              Bắt đầu thi
                            </Button>
                          ) : (
                            <Button variant="outlined" size="small" disabled>
                              Chưa đến giờ
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">
              Lớp học này chưa có đề thi nào
            </Alert>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ClassRoom;


