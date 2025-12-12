/**
 * CreateExamRoom - Trang tạo phòng thi
 * Có 2 cách: Thêm đề thi (chọn từ danh sách) hoặc Tạo đề thi mới
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
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
import { CreateExamDTO, CreateExamRandomDTO, ExamWithQuestions } from '../types/exam.types';
import { CreateExamRoomDTO } from '../types/examRoom.types';
import { QuestionWithAnswers } from '../types/question.types';
import { getDifficultyName, getDifficultyColor } from '../utils/questionUtils';
import apiClient from '../utils/apiClient';
import { useToast } from '../contexts/ToastContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const CreateExamRoom: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableExams, setAvailableExams] = useState<ExamWithQuestions[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<QuestionWithAnswers[]>([]);

  // Form data chung cho phòng thi
  const [roomName, setRoomName] = useState('');
  const [password, setPassword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Tab 1: Thêm đề thi
  const [selectedExamId, setSelectedExamId] = useState<number | ''>('');

  // Tab 2: Tạo đề thi mới
  const [examName, setExamName] = useState('');
  const [duration, setDuration] = useState<number>(60);
  const [maxScore, setMaxScore] = useState<number>(100);
  const [numberOfCodes, setNumberOfCodes] = useState<number>(0);
  const [selectedQuestions, setSelectedQuestions] = useState<
    Array<{ question: QuestionWithAnswers; score: number }>
  >([]);
  const [totalQuestions, setTotalQuestions] = useState<number>(10);
  const [nhanBietCount, setNhanBietCount] = useState<number>(0);
  const [thongHieuCount, setThongHieuCount] = useState<number>(0);
  const [vanDungCount, setVanDungCount] = useState<number>(0);
  const [vanDungCaoCount, setVanDungCaoCount] = useState<number>(0);
  const [createExamTab, setCreateExamTab] = useState(0); // Tab con cho tạo đề thi (0: tự chọn, 1: random)

  // Load danh sách đề thi
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.EXAMS);
        const data = await response.json();
        if (response.ok && data.success) {
          setAvailableExams(data.data || []);
        }
      } catch (err) {
        console.error('Error fetching exams:', err);
      }
    };
    fetchExams();
  }, []);

  // Load danh sách câu hỏi (cho tab tạo đề thi)
  useEffect(() => {
    if (tabValue === 1) {
      const fetchQuestions = async () => {
        try {
          const response = await apiClient.get(API_ENDPOINTS.QUESTIONS);
          const data = await response.json();
          if (response.ok && data.success) {
            setAvailableQuestions(data.data || []);
          }
        } catch (err) {
          console.error('Error fetching questions:', err);
        }
      };
      fetchQuestions();
    }
  }, [tabValue]);

  // Tab 1: Thêm đề thi
  const handleSubmitAddExam = async () => {
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
      const roomData: CreateExamRoomDTO = {
        name: roomName.trim(),
        password: password.trim(),
        startDate: startDate,
        endDate: endDate,
        examId: selectedExamId as number,
      };

      const response = await apiClient.post(API_ENDPOINTS.EXAM_ROOMS, roomData);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Tạo phòng thi thất bại');
      }

      showSuccess('Tạo phòng thi thành công!');
      navigate('/teacher/exam-rooms');
    } catch (err: any) {
      const errorMessage = err.message || 'Tạo phòng thi thất bại';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Tab 2: Tạo đề thi mới
  const handleAddQuestion = (question: QuestionWithAnswers) => {
    if (selectedQuestions.find((sq) => sq.question.id === question.id)) {
      setError('Câu hỏi này đã được thêm vào đề thi');
      return;
    }
    setSelectedQuestions([
      ...selectedQuestions,
      { question, score: 0 },
    ]);
  };

  const handleRemoveQuestion = (questionId: number) => {
    setSelectedQuestions(selectedQuestions.filter((sq) => sq.question.id !== questionId));
  };

  const handleScoreChange = (questionId: number, score: number) => {
    setSelectedQuestions(
      selectedQuestions.map((sq) =>
        sq.question.id === questionId ? { ...sq, score } : sq
      )
    );
  };

  const validateManualSelection = (): boolean => {
    if (!examName.trim()) {
      setError('Tên đề thi là bắt buộc');
      return false;
    }
    if (selectedQuestions.length === 0) {
      setError('Phải chọn ít nhất 1 câu hỏi');
      return false;
    }
    const totalScore = selectedQuestions.reduce((sum, sq) => sum + sq.score, 0);
    if (totalScore > maxScore) {
      setError(`Tổng điểm các câu hỏi (${totalScore}) không được vượt quá tổng điểm đề thi (${maxScore})`);
      return false;
    }
    for (const sq of selectedQuestions) {
      if (sq.score <= 0) {
        setError('Mỗi câu hỏi phải có điểm lớn hơn 0');
        return false;
      }
    }
    return true;
  };

  const validateRandom = (): boolean => {
    if (!examName.trim()) {
      setError('Tên đề thi là bắt buộc');
      return false;
    }
    const total = nhanBietCount + thongHieuCount + vanDungCount + vanDungCaoCount;
    if (total !== totalQuestions) {
      setError(`Tổng số câu hỏi các mức độ (${total}) phải bằng tổng số câu hỏi (${totalQuestions})`);
      return false;
    }
    if (totalQuestions === 0) {
      setError('Phải có ít nhất 1 câu hỏi');
      return false;
    }
    return true;
  };

  const handleSubmitCreateExam = async () => {
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

    // Validate đề thi
    if (createExamTab === 0) {
      if (!validateManualSelection()) return;
    } else {
      if (!validateRandom()) return;
    }

    setLoading(true);
    try {
      let examData: CreateExamDTO | CreateExamRandomDTO;
      let endpoint: string;

      if (createExamTab === 0) {
        examData = {
          name: examName.trim(),
          duration,
          maxScore,
          questions: selectedQuestions.map((sq) => ({
            questionId: sq.question.id,
            score: sq.score,
          })),
          numberOfCodes: numberOfCodes > 0 ? numberOfCodes : undefined,
        };
        endpoint = API_ENDPOINTS.EXAMS;
      } else {
        examData = {
          name: examName.trim(),
          duration,
          maxScore,
          totalQuestions,
          nhanBietCount,
          thongHieuCount,
          vanDungCount,
          vanDungCaoCount,
          numberOfCodes: numberOfCodes > 0 ? numberOfCodes : undefined,
        };
        endpoint = `${API_ENDPOINTS.EXAMS}/random`;
      }

      // Tạo đề thi
      const examResponse = await apiClient.post(endpoint, examData);
      const examResult = await examResponse.json();

      if (!examResponse.ok || !examResult.success) {
        throw new Error(examResult.message || 'Tạo đề thi thất bại');
      }

      const newExamId = examResult.data.id;

      // Tạo phòng thi với đề thi vừa tạo
      const roomData: CreateExamRoomDTO = {
        name: roomName.trim(),
        password: password.trim(),
        startDate: startDate,
        endDate: endDate,
        examId: newExamId,
      };

      const roomResponse = await apiClient.post(API_ENDPOINTS.EXAM_ROOMS, roomData);
      const roomResult = await roomResponse.json();

      if (!roomResponse.ok || !roomResult.success) {
        throw new Error(roomResult.message || 'Tạo phòng thi thất bại');
      }

      showSuccess('Tạo phòng thi và đề thi thành công!');
      navigate('/teacher/exam-rooms');
    } catch (err: any) {
      const errorMessage = err.message || 'Tạo phòng thi thất bại';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const scorePerQuestion = totalQuestions > 0 ? maxScore / totalQuestions : 0;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <IconButton onClick={() => navigate('/teacher/exam-rooms')}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1" sx={{ color: '#6366f1', fontWeight: 'bold' }}>
              TẠO PHÒNG THI
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Form chung cho phòng thi */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin phòng thi
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" gap={2}>
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
              </Box>
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
            </Box>
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Thêm đề thi" />
              <Tab label="Tạo đề thi mới" />
            </Tabs>
          </Box>

          {/* Tab 1: Thêm đề thi */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mb: 3 }}>
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
            </Box>

            <Button
              variant="contained"
              onClick={handleSubmitAddExam}
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Tạo phòng thi'}
            </Button>
          </TabPanel>

          {/* Tab 2: Tạo đề thi mới */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Thông tin đề thi
              </Typography>
              <TextField
                required
                fullWidth
                label="Tên đề thi"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Box display="flex" gap={2} sx={{ mb: 2 }}>
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
                <TextField
                  type="number"
                  label="Số mã đề"
                  value={numberOfCodes}
                  onChange={(e) => setNumberOfCodes(Math.max(0, Number.parseInt(e.target.value, 10) || 0))}
                  helperText="Nhập số mã đề cần tạo (0 = không tạo mã đề)"
                  sx={{ flex: 1 }}
                />
              </Box>
            </Box>

            {/* Tabs con cho tạo đề thi */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={createExamTab} onChange={(e, newValue) => setCreateExamTab(newValue)}>
                <Tab label="Tự chọn câu hỏi" />
                <Tab label="Random câu hỏi" />
              </Tabs>
            </Box>

            {/* Tab con 1: Tự chọn */}
            {createExamTab === 0 && (
              <Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Chọn câu hỏi
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Nội dung</TableCell>
                          <TableCell>Độ khó</TableCell>
                          <TableCell>Điểm</TableCell>
                          <TableCell align="right">Thao tác</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {availableQuestions.map((q) => {
                          const isSelected = selectedQuestions.some((sq) => sq.question.id === q.id);
                          return (
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
                              <TableCell>
                                {isSelected ? (
                                  <TextField
                                    type="number"
                                    size="small"
                                    value={selectedQuestions.find((sq) => sq.question.id === q.id)?.score || 0}
                                    onChange={(e) => handleScoreChange(q.id, Number.parseFloat(e.target.value) || 0)}
                                    inputProps={{ min: 0, step: 0.5 }}
                                    sx={{ width: 100 }}
                                  />
                                ) : (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<AddIcon />}
                                    onClick={() => handleAddQuestion(q)}
                                  >
                                    Thêm
                                  </Button>
                                )}
                              </TableCell>
                              <TableCell align="right">
                                {isSelected && (
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleRemoveQuestion(q.id)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Câu hỏi đã chọn ({selectedQuestions.length})
                  </Typography>
                  {selectedQuestions.length > 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Tổng điểm: {selectedQuestions.reduce((sum, sq) => sum + sq.score, 0)} / {maxScore}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {/* Tab con 2: Random */}
            {createExamTab === 1 && (
              <Box>
                <Box sx={{ mb: 3 }}>
                  <TextField
                    required
                    type="number"
                    fullWidth
                    label="Tổng số câu hỏi"
                    value={totalQuestions}
                    onChange={(e) => setTotalQuestions(Number.parseInt(e.target.value, 10) || 0)}
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Điểm mỗi câu hỏi: {scorePerQuestion.toFixed(2)}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Số lượng câu hỏi theo mức độ
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <TextField
                      type="number"
                      label="Số câu hỏi mức Nhận biết"
                      value={nhanBietCount}
                      onChange={(e) => setNhanBietCount(Number.parseInt(e.target.value, 10) || 0)}
                      inputProps={{ min: 0 }}
                    />
                    <TextField
                      type="number"
                      label="Số câu hỏi mức Thông hiểu"
                      value={thongHieuCount}
                      onChange={(e) => setThongHieuCount(Number.parseInt(e.target.value, 10) || 0)}
                      inputProps={{ min: 0 }}
                    />
                    <TextField
                      type="number"
                      label="Số câu hỏi mức Vận dụng"
                      value={vanDungCount}
                      onChange={(e) => setVanDungCount(Number.parseInt(e.target.value, 10) || 0)}
                      inputProps={{ min: 0 }}
                    />
                    <TextField
                      type="number"
                      label="Số câu hỏi mức Vận dụng cao"
                      value={vanDungCaoCount}
                      onChange={(e) => setVanDungCaoCount(Number.parseInt(e.target.value, 10) || 0)}
                      inputProps={{ min: 0 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Tổng: {nhanBietCount + thongHieuCount + vanDungCount + vanDungCaoCount} / {totalQuestions}
                  </Typography>
                </Box>
              </Box>
            )}

            <Button
              variant="contained"
              onClick={handleSubmitCreateExam}
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Tạo phòng thi và đề thi'}
            </Button>
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreateExamRoom;

