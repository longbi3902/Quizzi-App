/**
 * EditExamRoom - Trang chỉnh sửa phòng thi
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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { API_ENDPOINTS } from '../constants/api';
import { ExamWithQuestions } from '../types/exam.types';
import { ExamRoomWithExam, UpdateExamRoomDTO } from '../types/examRoom.types';
import apiClient from '../utils/apiClient';

const EditExamRoom: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const roomId = id ? Number.parseInt(id, 10) : null;

  const [roomName, setRoomName] = useState('');
  const [password, setPassword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedExamId, setSelectedExamId] = useState<number | ''>('');
  const [availableExams, setAvailableExams] = useState<ExamWithQuestions[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  // Load dữ liệu phòng thi
  useEffect(() => {
    if (!roomId || isNaN(roomId)) {
      setError('ID phòng thi không hợp lệ');
      setLoadingData(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoadingData(true);

        // Load phòng thi
        const roomResponse = await apiClient.get(`${API_ENDPOINTS.EXAM_ROOMS}/${roomId}`);
        const roomData = await roomResponse.json();
        if (!roomResponse.ok || !roomData.success) {
          throw new Error(roomData.message || 'Không tìm thấy phòng thi');
        }

        const room: ExamRoomWithExam = roomData.data;
        setRoomName(room.name);
        setPassword(room.password);
        setSelectedExamId(room.examId);
        // Format dates for datetime-local input (YYYY-MM-DDTHH:mm)
        const start = new Date(room.startDate);
        const end = new Date(room.endDate);
        setStartDate(start.toISOString().slice(0, 16));
        setEndDate(end.toISOString().slice(0, 16));

        // Load danh sách đề thi
        const examsResponse = await apiClient.get(API_ENDPOINTS.EXAMS);
        const examsData = await examsResponse.json();
        if (examsResponse.ok && examsData.success) {
          setAvailableExams(examsData.data || []);
        }
      } catch (err: any) {
        setError(err.message || 'Không thể tải dữ liệu phòng thi');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [roomId]);

  const handleSubmit = async () => {
    setError('');
    if (!roomName.trim()) {
      setError('Tên phòng thi là bắt buộc');
      return;
    }
    if (!password.trim()) {
      setError('Mật khẩu phòng thi là bắt buộc');
      return;
    }
    if (!startDate) {
      setError('Ngày bắt đầu là bắt buộc');
      return;
    }
    if (!endDate) {
      setError('Ngày kết thúc là bắt buộc');
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      setError('Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }
    if (!selectedExamId) {
      setError('Vui lòng chọn đề thi');
      return;
    }

    setLoading(true);
    try {
      const updateData: UpdateExamRoomDTO = {
        name: roomName.trim(),
        password: password.trim(),
        startDate: startDate,
        endDate: endDate,
        examId: selectedExamId as number,
      };

      const response = await apiClient.put(`${API_ENDPOINTS.EXAM_ROOMS}/${roomId}`, updateData);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Cập nhật phòng thi thất bại');
      }

      alert('Cập nhật phòng thi thành công!');
      navigate('/teacher/exam-rooms');
    } catch (err: any) {
      setError(err.message || 'Cập nhật phòng thi thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
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
              CHỈNH SỬA PHÒNG THI
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              required
              fullWidth
              label="Tên phòng thi"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
            <TextField
              required
              fullWidth
              label="Mật khẩu phòng thi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
            />
            <Box display="flex" gap={2}>
              <TextField
                required
                fullWidth
                label="Ngày bắt đầu"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                required
                fullWidth
                label="Ngày kết thúc"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>
            <FormControl fullWidth>
              <InputLabel>Chọn đề thi</InputLabel>
              <Select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value as number | '')}
                label="Chọn đề thi"
              >
                {availableExams.map((exam) => (
                  <MenuItem key={exam.id} value={exam.id}>
                    {exam.name} ({exam.duration} phút, {exam.maxScore} điểm, {exam.questions.length} câu)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate('/teacher/exam-rooms')}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Cập nhật'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default EditExamRoom;

