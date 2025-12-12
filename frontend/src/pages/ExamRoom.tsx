/**
 * ExamRoom - Trang phòng thi (sau khi học sinh tham gia thành công)
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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ExamRoomWithExam } from '../types/examRoom.types';
import { ExamResult } from '../types/examResult.types';
import { API_ENDPOINTS } from '../constants/api';
import apiClient from '../utils/apiClient';

const ExamRoom: React.FC = () => {
  const navigate = useNavigate();
  const [examRoom, setExamRoom] = useState<ExamRoomWithExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingResult, setCheckingResult] = useState(true);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);

  useEffect(() => {
    // Lấy thông tin phòng thi từ localStorage
    const roomData = localStorage.getItem('currentExamRoom');
    if (roomData) {
      try {
        const room: ExamRoomWithExam = JSON.parse(roomData);
        setExamRoom(room);
        
        // Kiểm tra đã làm bài chưa
        checkExamResult(room.id);
      } catch (error) {
        console.error('Error parsing exam room data:', error);
        navigate('/join-exam-room');
      }
    } else {
      navigate('/join-exam-room');
    }
    setLoading(false);
  }, [navigate]);

  const checkExamResult = async (examRoomId: number) => {
    try {
      setCheckingResult(true);
      const response = await apiClient.get(API_ENDPOINTS.EXAM_RESULTS_BY_ROOM(examRoomId));
      const data = await response.json();

      if (response.ok && data.success && data.data) {
        setExamResult(data.data);
      }
    } catch (error) {
      // Không có kết quả hoặc chưa làm bài
      console.log('No exam result found or not started yet');
    } finally {
      setCheckingResult(false);
    }
  };

  const getExamStatus = () => {
    if (!examRoom) return null;

    const now = new Date();
    const startDate = new Date(examRoom.startDate);
    const endDate = new Date(examRoom.endDate);

    if (now < startDate) {
      return 'not_started'; // Chưa đến thời gian bắt đầu
    } else if (now >= startDate && now <= endDate) {
      return 'in_progress'; // Đang trong thời gian cho phép
    } else {
      return 'ended'; // Đã hết thời gian
    }
  };

  const handleStartExam = async () => {
    if (!examRoom) return;

    try {
      const response = await apiClient.post(API_ENDPOINTS.EXAM_RESULTS_START(examRoom.id), {});
      const data = await response.json();

      if (response.ok && data.success) {
        // Lưu thông tin bài thi vào localStorage
        localStorage.setItem('currentExam', JSON.stringify(data.data));
        // Chuyển đến trang làm bài
        navigate('/exam-taking');
      } else {
        alert(data.message || 'Không thể bắt đầu làm bài thi');
      }
    } catch (error: any) {
      console.error('Error starting exam:', error);
      alert(error.message || 'Không thể bắt đầu làm bài thi');
    }
  };

  const handleViewResult = () => {
    if (!examRoom) return;
    navigate('/exam-result', { state: { examRoomId: examRoom.id } });
  };

  const examStatus = getExamStatus();

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!examRoom) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">
            Không tìm thấy thông tin phòng thi. Vui lòng tham gia lại.
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate('/join-exam-room')}
            sx={{ mt: 2 }}
          >
            Tham gia phòng thi
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
              Phòng thi: {examRoom.name}
            </Typography>
          </Box>

          {examRoom.exam && (
            <Box>
              <Box display="flex" flexDirection="row" gap={4} mb={4} flexWrap="wrap">
                <Box flex={1} minWidth={200}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Mã phòng thi:</strong> {examRoom.code}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Đề thi:</strong> {examRoom.exam.name}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Thời gian làm bài:</strong> {examRoom.exam.duration} phút
                  </Typography>
                </Box>
                <Box flex={1} minWidth={200}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Tổng điểm:</strong> {examRoom.exam.maxScore}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Số câu hỏi:</strong> {examRoom.exam.questions.length}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Thời gian diễn ra:</strong> từ {new Date(examRoom.startDate).toLocaleString('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })} đến {new Date(examRoom.endDate).toLocaleString('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 4, textAlign: 'center' }}>
                {checkingResult ? (
                  <CircularProgress />
                ) : examResult ? (
                  // Đã làm bài rồi
                  <Box>
                    <Alert severity="success" sx={{ mb: 2 }}>
                      Bạn đã hoàn thành bài thi này
                    </Alert>
                    <Typography variant="h6" gutterBottom>
                      Điểm số: {examResult.score} / {examResult.maxScore}
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleViewResult}
                      sx={{ minWidth: 200, py: 1.5, mt: 2 }}
                    >
                      Xem kết quả chi tiết
                    </Button>
                  </Box>
                ) : (
                  // Chưa làm bài
                  <>
                    {examStatus === 'not_started' && (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        Chưa đến thời gian bắt đầu thi
                      </Alert>
                    )}
                    {examStatus === 'ended' && (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        Đã hết thời gian thi
                      </Alert>
                    )}
                    {examStatus === 'in_progress' && (
                      <Button
                        variant="contained"
                        size="large"
                        onClick={handleStartExam}
                        sx={{ minWidth: 200, py: 1.5 }}
                      >
                        Bắt đầu thi
                      </Button>
                    )}
                  </>
                )}
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ExamRoom;

