/**
 * ClassDetail - Trang chi tiết lớp học với 3 tabs: Tổng quan, Học sinh, Đề thi
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import AddIcon from '@mui/icons-material/Add';
import { ClassWithExams } from '../types/class.types';
import { ExamWithQuestions } from '../types/exam.types';
import { QuestionWithAnswers } from '../types/question.types';
import { API_ENDPOINTS } from '../constants/api';
import apiClient from '../utils/apiClient';
import { useToast } from '../contexts/ToastContext';
import { getDifficultyName, getDifficultyColor } from '../utils/questionUtils';
import { CreateExamDTO } from '../types/exam.types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`class-tabpanel-${index}`}
      aria-labelledby={`class-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface Participant {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  joinedAt: Date;
}

const ClassDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [classData, setClassData] = useState<ClassWithExams | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [availableExams, setAvailableExams] = useState<ExamWithQuestions[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [loadingExams, setLoadingExams] = useState(false);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  // Form state cho tab Tổng quan
  const [className, setClassName] = useState('');
  const [password, setPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Dialog state cho tab Đề thi
  const [addExamDialogOpen, setAddExamDialogOpen] = useState(false);
  const [createExamDialogOpen, setCreateExamDialogOpen] = useState(false);
  const [selectedExamIds, setSelectedExamIds] = useState<number[]>([]);
  const [examStartDate, setExamStartDate] = useState('');
  const [examEndDate, setExamEndDate] = useState('');
  
  // State cho editing exam dates
  const [editingExamId, setEditingExamId] = useState<number | null>(null);
  const [editingStartDate, setEditingStartDate] = useState('');
  const [editingEndDate, setEditingEndDate] = useState('');
  
  // State cho tạo đề thi (dùng chung cho cả 2 tab)
  const [createExamTabValue, setCreateExamTabValue] = useState(0);
  const [examName, setExamName] = useState('');
  const [duration, setDuration] = useState<number>(60);
  const [maxScore, setMaxScore] = useState<number>(100);
  const [numberOfCodes, setNumberOfCodes] = useState<number>(0);
  const [loadingCreateExam, setLoadingCreateExam] = useState(false);
  
  // State cho tab Random
  const [totalQuestions, setTotalQuestions] = useState<number>(10);
  const [nhanBietCount, setNhanBietCount] = useState<number>(0);
  const [thongHieuCount, setThongHieuCount] = useState<number>(0);
  const [vanDungCount, setVanDungCount] = useState<number>(0);
  const [vanDungCaoCount, setVanDungCaoCount] = useState<number>(0);
  const [randomGrade, setRandomGrade] = useState<number | ''>('');
  const [randomSubjectId, setRandomSubjectId] = useState<number | ''>('');
  
  // State cho tab Tự chọn
  const [selectedQuestions, setSelectedQuestions] = useState<
    Array<{ question: QuestionWithAnswers; score: number }>
  >([]);
  const [availableQuestions, setAvailableQuestions] = useState<QuestionWithAnswers[]>([]);
  const [filterName, setFilterName] = useState('');
  const [filterSubjectId, setFilterSubjectId] = useState<number | ''>('');
  const [filterGrade, setFilterGrade] = useState<number | ''>('');
  const [filterDifficulty, setFilterDifficulty] = useState<number | ''>('');
  const [questionPage, setQuestionPage] = useState(1);
  const [questionLimit] = useState(10);
  const [questionTotal, setQuestionTotal] = useState(0);
  const [questionTotalPages, setQuestionTotalPages] = useState(0);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      loadClassData();
    }
  }, [id]);

  useEffect(() => {
    if (classData && tabValue === 1) {
      loadParticipants();
    }
    if (tabValue === 2) {
      loadAvailableExams();
    }
  }, [classData, tabValue]);

  // Load subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.SUBJECTS);
        const data = await response.json();
        if (response.ok && data.success) {
          setSubjects(data.data || []);
        }
      } catch (err) {
        console.error('Error fetching subjects:', err);
      }
    };
    fetchSubjects();
  }, []);

  // Load questions khi mở dialog và filter thay đổi
  useEffect(() => {
    if (createExamDialogOpen && createExamTabValue === 0) {
      fetchQuestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createExamDialogOpen, createExamTabValue, questionPage, filterName, filterSubjectId, filterGrade, filterDifficulty]);

  const fetchQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const params = new URLSearchParams();
      params.append('page', questionPage.toString());
      params.append('limit', questionLimit.toString());
      if (filterName.trim()) {
        params.append('name', filterName.trim());
      }
      if (filterSubjectId !== '') {
        params.append('subjectId', filterSubjectId.toString());
      }
      if (filterGrade !== '') {
        params.append('grade', filterGrade.toString());
      }
      if (filterDifficulty !== '') {
        params.append('difficulty', filterDifficulty.toString());
      }

      const response = await apiClient.get(`${API_ENDPOINTS.QUESTIONS}?${params.toString()}`);
      const data = await response.json();
      if (response.ok && data.success) {
        setAvailableQuestions(data.data || []);
        if (data.pagination) {
          setQuestionTotal(data.pagination.total);
          setQuestionTotalPages(data.pagination.totalPages);
        } else {
          setQuestionTotal(data.data?.length || 0);
          setQuestionTotalPages(1);
        }
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleAddQuestion = (question: QuestionWithAnswers) => {
    if (selectedQuestions.find((sq) => sq.question.id === question.id)) {
      showError('Câu hỏi này đã được thêm vào đề thi');
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

  const loadClassData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`${API_ENDPOINTS.CLASSES}/${id}`);
      const data = await response.json();

      if (response.ok && data.success) {
        const classInfo: ClassWithExams = data.data;
        setClassData(classInfo);
        setClassName(classInfo.name);
        setPassword(classInfo.password);
      } else {
        throw new Error(data.message || 'Không tìm thấy lớp học');
      }
    } catch (err: any) {
      console.error('Load class error:', err);
      setError(err.message || 'Không thể tải thông tin lớp học');
      showError(err.message || 'Không thể tải thông tin lớp học');
    } finally {
      setLoading(false);
    }
  };

  const loadParticipants = async () => {
    try {
      setLoadingParticipants(true);
      const response = await apiClient.get(API_ENDPOINTS.CLASSES_PARTICIPANTS(Number.parseInt(id!, 10)));
      const data = await response.json();

      if (response.ok && data.success) {
        setParticipants(data.data || []);
      }
    } catch (err: any) {
      console.error('Load participants error:', err);
      showError('Không thể tải danh sách học sinh');
    } finally {
      setLoadingParticipants(false);
    }
  };

  const loadAvailableExams = async () => {
    try {
      setLoadingExams(true);
      const response = await apiClient.get(API_ENDPOINTS.EXAMS);
      const data = await response.json();

      if (response.ok && data.success) {
        setAvailableExams(data.data || []);
        // Set selected exam IDs từ classData
        if (classData?.exams) {
          setSelectedExamIds(classData.exams.map(e => e.id));
        }
      }
    } catch (err: any) {
      console.error('Load exams error:', err);
      showError('Không thể tải danh sách đề thi');
    } finally {
      setLoadingExams(false);
    }
  };

  const handleSaveClassInfo = async () => {
    try {
      setError('');
      const response = await apiClient.put(`${API_ENDPOINTS.CLASSES}/${id}`, {
        name: className,
        password,
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setClassData(data.data);
        setIsEditing(false);
        showSuccess('Cập nhật thông tin lớp học thành công!');
      } else {
        throw new Error(data.message || 'Cập nhật thất bại');
      }
    } catch (err: any) {
      setError(err.message || 'Cập nhật thất bại');
      showError(err.message || 'Cập nhật thất bại');
    }
  };

  const handleAddExams = async () => {
    try {
      setError('');
      if (!examStartDate || !examEndDate) {
        showError('Vui lòng nhập thời gian bắt đầu và kết thúc cho đề thi');
        return;
      }
      
      // Lấy danh sách đề thi hiện tại trong lớp
      const currentExamIds = classData?.exams?.map(e => e.id) || [];
      // Tìm các đề thi cần thêm (có trong selectedExamIds nhưng chưa có trong lớp)
      const examsToAdd = selectedExamIds.filter(id => !currentExamIds.includes(id));

      // Thêm từng đề thi với startDate và endDate
      for (const examId of examsToAdd) {
        const response = await apiClient.post(API_ENDPOINTS.CLASSES_ADD_EXAM(Number.parseInt(id!, 10)), {
          examId,
          startDate: examStartDate,
          endDate: examEndDate,
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || `Không thể thêm đề thi ${examId}`);
        }
      }

      // Tìm các đề thi cần xóa (có trong lớp nhưng không có trong selectedExamIds)
      const examsToRemove = currentExamIds.filter(id => !selectedExamIds.includes(id));

      // Xóa từng đề thi
      for (const examId of examsToRemove) {
        const response = await apiClient.delete(
          API_ENDPOINTS.CLASSES_REMOVE_EXAM(Number.parseInt(id!, 10), examId)
        );
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || `Không thể xóa đề thi ${examId}`);
        }
      }

      // Reload class data
      await loadClassData();
      setAddExamDialogOpen(false);
      showSuccess('Cập nhật đề thi thành công!');
    } catch (err: any) {
      setError(err.message || 'Cập nhật đề thi thất bại');
      showError(err.message || 'Cập nhật đề thi thất bại');
    }
  };

  const handleRemoveExam = async (examId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đề thi này khỏi lớp học?')) {
      return;
    }

    try {
      const response = await apiClient.delete(
        API_ENDPOINTS.CLASSES_REMOVE_EXAM(Number.parseInt(id!, 10), examId)
      );
      const data = await response.json();

      if (response.ok && data.success) {
        await loadClassData();
        showSuccess('Xóa đề thi thành công!');
      } else {
        throw new Error(data.message || 'Xóa đề thi thất bại');
      }
    } catch (err: any) {
      showError(err.message || 'Xóa đề thi thất bại');
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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

  if (!classData) {
    return (
      <Container maxWidth={false}>
        <Box>
          <Alert severity="error">Không tìm thấy lớp học</Alert>
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
        <Paper elevation={3}>
          {/* Header */}
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Typography variant="h4" component="h1" sx={{ color: '#6366f1', fontWeight: 'bold' }}>
                {classData.name}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Mã lớp: <Chip label={classData.code} color="primary" size="small" sx={{ ml: 1 }} />
            </Typography>
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="class detail tabs">
              <Tab label="Tổng quan" />
              <Tab label="Học sinh" />
              <Tab label="Đề thi" />
            </Tabs>
          </Box>

          {error && (
            <Alert severity="error" sx={{ m: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Tab 1: Tổng quan */}
          <TabPanel value={tabValue} index={0}>
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">Thông tin lớp học</Typography>
                {!isEditing ? (
                  <Button variant="outlined" onClick={() => setIsEditing(true)}>
                    Chỉnh sửa
                  </Button>
                ) : (
                  <Box gap={1} display="flex">
                    <Button variant="outlined" onClick={() => setIsEditing(false)}>
                      Hủy
                    </Button>
                    <Button variant="contained" onClick={handleSaveClassInfo}>
                      Lưu
                    </Button>
                  </Box>
                )}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 600 }}>
                <TextField
                  label="Tên lớp học"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  disabled={!isEditing}
                  fullWidth
                  required
                />
                <TextField
                  label="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!isEditing}
                  fullWidth
                  required
                />
              </Box>
            </Box>
          </TabPanel>

          {/* Tab 2: Học sinh */}
          <TabPanel value={tabValue} index={1}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Danh sách học sinh đã tham gia ({participants.length})
              </Typography>
              {loadingParticipants ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : participants.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Chưa có học sinh nào tham gia lớp học này
                </Typography>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Họ tên</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Thời gian tham gia</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {participants.map((participant) => (
                        <TableRow key={participant.id}>
                          <TableCell>{participant.userName}</TableCell>
                          <TableCell>{participant.userEmail}</TableCell>
                          <TableCell>
                            {new Date(participant.joinedAt).toLocaleString('vi-VN')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </TabPanel>

          {/* Tab 3: Đề thi */}
          <TabPanel value={tabValue} index={2}>
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">
                  Đề thi trong lớp ({classData.exams?.length || 0})
                </Typography>
                <Box gap={1} display="flex">
                  <Button variant="outlined" onClick={() => setCreateExamDialogOpen(true)}>
                    Tạo đề thi mới
                  </Button>
                  <Button variant="contained" onClick={() => setAddExamDialogOpen(true)}>
                    Thêm đề thi có sẵn
                  </Button>
                </Box>
              </Box>

              {classData.exams && classData.exams.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Tên đề thi</TableCell>
                        <TableCell>Thời gian thi</TableCell>
                        <TableCell>Tổng điểm</TableCell>
                        <TableCell>Số câu hỏi</TableCell>
                        <TableCell>Bắt đầu</TableCell>
                        <TableCell>Kết thúc</TableCell>
                        <TableCell align="right">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {classData.exams.map((exam) => (
                        <TableRow key={exam.id}>
                          <TableCell>{exam.id}</TableCell>
                          <TableCell>{exam.name}</TableCell>
                          <TableCell>{exam.duration} phút</TableCell>
                          <TableCell>{exam.maxScore}</TableCell>
                          <TableCell>{exam.questions?.length || 0}</TableCell>
                          <TableCell>
                            {editingExamId === exam.id ? (
                              <TextField
                                type="datetime-local"
                                value={editingStartDate}
                                onChange={(e) => setEditingStartDate(e.target.value)}
                                size="small"
                                InputLabelProps={{ shrink: true }}
                              />
                            ) : (
                              new Date(exam.startDate).toLocaleString('vi-VN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            )}
                          </TableCell>
                          <TableCell>
                            {editingExamId === exam.id ? (
                              <TextField
                                type="datetime-local"
                                value={editingEndDate}
                                onChange={(e) => setEditingEndDate(e.target.value)}
                                size="small"
                                InputLabelProps={{ shrink: true }}
                              />
                            ) : (
                              new Date(exam.endDate).toLocaleString('vi-VN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {editingExamId === exam.id ? (
                              <>
                                <Button
                                  size="small"
                                  onClick={async () => {
                                    try {
                                      const response = await apiClient.put(
                                        API_ENDPOINTS.CLASSES_UPDATE_EXAM_DATES(
                                          Number.parseInt(id!, 10),
                                          exam.id
                                        ),
                                        {
                                          startDate: editingStartDate,
                                          endDate: editingEndDate,
                                        }
                                      );
                                      const data = await response.json();
                                      if (response.ok && data.success) {
                                        await loadClassData();
                                        setEditingExamId(null);
                                        showSuccess('Cập nhật thời gian thành công!');
                                      } else {
                                        throw new Error(data.message || 'Cập nhật thất bại');
                                      }
                                    } catch (err: any) {
                                      showError(err.message || 'Cập nhật thất bại');
                                    }
                                  }}
                                >
                                  Lưu
                                </Button>
                                <Button
                                  size="small"
                                  onClick={() => {
                                    setEditingExamId(null);
                                    setEditingStartDate('');
                                    setEditingEndDate('');
                                  }}
                                >
                                  Hủy
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="small"
                                  onClick={() => {
                                    setEditingExamId(exam.id);
                                    setEditingStartDate(new Date(exam.startDate).toISOString().slice(0, 16));
                                    setEditingEndDate(new Date(exam.endDate).toISOString().slice(0, 16));
                                  }}
                                >
                                  Sửa
                                </Button>
                                <IconButton
                                  size="small"
                                  color="info"
                                  onClick={() =>
                                    navigate(`/teacher/classes/history/${classData.id}/exam/${exam.id}`)
                                  }
                                  title="Xem lịch sử thi"
                                >
                                  <HistoryIcon />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveExam(exam.id)}
                                  title="Xóa khỏi lớp"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Chưa có đề thi nào trong lớp này
                </Typography>
              )}
            </Box>
          </TabPanel>
        </Paper>
      </Box>

      {/* Dialog thêm/sửa đề thi */}
      <Dialog
        open={addExamDialogOpen}
        onClose={() => setAddExamDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chọn đề thi cho lớp học</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, mt: 2 }}>
            <TextField
              label="Thời gian bắt đầu"
              type="datetime-local"
              value={examStartDate}
              onChange={(e) => setExamStartDate(e.target.value)}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Thời gian kết thúc"
              type="datetime-local"
              value={examEndDate}
              onChange={(e) => setExamEndDate(e.target.value)}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          {loadingExams ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <FormGroup>
              {availableExams.map((exam) => (
                <FormControlLabel
                  key={exam.id}
                  control={
                    <Checkbox
                      checked={selectedExamIds.includes(exam.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedExamIds([...selectedExamIds, exam.id]);
                        } else {
                          setSelectedExamIds(selectedExamIds.filter((id) => id !== exam.id));
                        }
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">{exam.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {exam.duration} phút • {exam.maxScore} điểm • {exam.questions?.length || 0} câu hỏi
                      </Typography>
                    </Box>
                  }
                />
              ))}
              {availableExams.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Chưa có đề thi nào. Vui lòng tạo đề thi trước.
                </Typography>
              )}
            </FormGroup>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddExamDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleAddExams} variant="contained" disabled={loadingExams}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog tạo đề thi */}
      <Dialog
        open={createExamDialogOpen}
        onClose={() => {
          setCreateExamDialogOpen(false);
          // Reset form
          setExamName('');
          setDuration(60);
          setMaxScore(100);
          setNumberOfCodes(0);
          setTotalQuestions(10);
          setNhanBietCount(0);
          setThongHieuCount(0);
          setVanDungCount(0);
          setVanDungCaoCount(0);
          setRandomGrade('');
          setRandomSubjectId('');
          setExamStartDate('');
          setExamEndDate('');
          setSelectedQuestions([]);
          setCreateExamTabValue(0);
        }}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Tạo đề thi mới và thêm vào lớp</DialogTitle>
        <DialogContent>
          {/* Form chung */}
          <Box sx={{ mb: 3, mt: 2 }}>
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
            <TextField
              label="Thời gian bắt đầu"
              type="datetime-local"
              value={examStartDate}
              onChange={(e) => setExamStartDate(e.target.value)}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Thời gian kết thúc"
              type="datetime-local"
              value={examEndDate}
              onChange={(e) => setExamEndDate(e.target.value)}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={createExamTabValue} onChange={(e, newValue) => setCreateExamTabValue(newValue)}>
              <Tab label="Tự chọn câu hỏi" />
              <Tab label="Random câu hỏi" />
            </Tabs>
          </Box>

          {/* Tab 1: Tự chọn câu hỏi */}
          {createExamTabValue === 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Chọn câu hỏi
              </Typography>

              {/* Bộ lọc */}
              <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  label="Tìm theo tên"
                  variant="outlined"
                  size="small"
                  value={filterName}
                  onChange={(e) => {
                    setFilterName(e.target.value);
                    setQuestionPage(1);
                  }}
                  sx={{ minWidth: 200 }}
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Môn học</InputLabel>
                  <Select
                    value={filterSubjectId}
                    label="Môn học"
                    onChange={(e) => {
                      setFilterSubjectId(e.target.value === '' ? '' : Number(e.target.value));
                      setQuestionPage(1);
                    }}
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    {subjects.map((subject) => (
                      <MenuItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Khối</InputLabel>
                  <Select
                    value={filterGrade}
                    label="Khối"
                    onChange={(e) => {
                      setFilterGrade(e.target.value === '' ? '' : Number(e.target.value));
                      setQuestionPage(1);
                    }}
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                      <MenuItem key={g} value={g}>
                        Khối {g}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Độ khó</InputLabel>
                  <Select
                    value={filterDifficulty}
                    label="Độ khó"
                    onChange={(e) => {
                      setFilterDifficulty(e.target.value === '' ? '' : Number(e.target.value));
                      setQuestionPage(1);
                    }}
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    <MenuItem value={1}>Nhận biết</MenuItem>
                    <MenuItem value={2}>Thông hiểu</MenuItem>
                    <MenuItem value={3}>Vận dụng</MenuItem>
                    <MenuItem value={4}>Vận dụng cao</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {loadingQuestions ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Nội dung</TableCell>
                          <TableCell>Khối</TableCell>
                          <TableCell>Môn</TableCell>
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
                              <TableCell>{q.grade ? `Khối ${q.grade}` : 'N/A'}</TableCell>
                              <TableCell>
                                {q.subjectId
                                  ? subjects.find((s) => s.id === q.subjectId)?.name || 'N/A'
                                  : 'N/A'}
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

                  {/* Phân trang */}
                  {questionTotalPages > 1 && (
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                      <Stack spacing={2}>
                        <Pagination
                          count={questionTotalPages}
                          page={questionPage}
                          onChange={(event, value) => setQuestionPage(value)}
                          color="primary"
                          showFirstButton
                          showLastButton
                        />
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                          Hiển thị {availableQuestions.length} / {questionTotal} câu hỏi
                        </Typography>
                      </Stack>
                    </Box>
                  )}
                </>
              )}

              <Box sx={{ mt: 3, mb: 3 }}>
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

          {/* Tab 2: Random câu hỏi */}
          {createExamTabValue === 1 && (
            <Box sx={{ mt: 3 }}>
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
                Điểm mỗi câu hỏi: {totalQuestions > 0 ? (maxScore / totalQuestions).toFixed(2) : 0}
              </Typography>
              <Box display="flex" gap={2} sx={{ mb: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Khối lớp (tùy chọn)</InputLabel>
                  <Select
                    value={randomGrade}
                    label="Khối lớp (tùy chọn)"
                    onChange={(e) => setRandomGrade(e.target.value === '' ? '' : Number(e.target.value))}
                  >
                    <MenuItem value="">Tất cả khối</MenuItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                      <MenuItem key={g} value={g}>
                        Khối {g}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Môn học (tùy chọn)</InputLabel>
                  <Select
                    value={randomSubjectId}
                    label="Môn học (tùy chọn)"
                    onChange={(e) => setRandomSubjectId(e.target.value === '' ? '' : Number(e.target.value))}
                  >
                    <MenuItem value="">Tất cả môn</MenuItem>
                    {subjects.map((subject) => (
                      <MenuItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Typography variant="h6" gutterBottom>
                Số lượng câu hỏi theo mức độ
              </Typography>
              <TextField
                type="number"
                label="Số câu hỏi mức Nhận biết"
                value={nhanBietCount}
                onChange={(e) => setNhanBietCount(Number.parseInt(e.target.value, 10) || 0)}
                inputProps={{ min: 0 }}
                sx={{ mb: 2 }}
              />
              <TextField
                type="number"
                label="Số câu hỏi mức Thông hiểu"
                value={thongHieuCount}
                onChange={(e) => setThongHieuCount(Number.parseInt(e.target.value, 10) || 0)}
                inputProps={{ min: 0 }}
                sx={{ mb: 2 }}
              />
              <TextField
                type="number"
                label="Số câu hỏi mức Vận dụng"
                value={vanDungCount}
                onChange={(e) => setVanDungCount(Number.parseInt(e.target.value, 10) || 0)}
                inputProps={{ min: 0 }}
                sx={{ mb: 2 }}
              />
              <TextField
                type="number"
                label="Số câu hỏi mức Vận dụng cao"
                value={vanDungCaoCount}
                onChange={(e) => setVanDungCaoCount(Number.parseInt(e.target.value, 10) || 0)}
                inputProps={{ min: 0 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Tổng: {nhanBietCount + thongHieuCount + vanDungCount + vanDungCaoCount} / {totalQuestions}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCreateExamDialogOpen(false);
              // Reset form
              setExamName('');
              setDuration(60);
              setMaxScore(100);
              setNumberOfCodes(0);
              setTotalQuestions(10);
              setNhanBietCount(0);
              setThongHieuCount(0);
              setVanDungCount(0);
              setVanDungCaoCount(0);
              setRandomGrade('');
              setRandomSubjectId('');
              setExamStartDate('');
              setExamEndDate('');
              setSelectedQuestions([]);
              setCreateExamTabValue(0);
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              try {
                setError('');
                if (!examName.trim()) {
                  showError('Tên đề thi là bắt buộc');
                  return;
                }
                if (!examStartDate || !examEndDate) {
                  showError('Vui lòng nhập thời gian bắt đầu và kết thúc');
                  return;
                }

                setLoadingCreateExam(true);

                let newExamId: number;

                if (createExamTabValue === 0) {
                  // Tab tự chọn
                  if (selectedQuestions.length === 0) {
                    showError('Phải chọn ít nhất 1 câu hỏi');
                    setLoadingCreateExam(false);
                    return;
                  }
                  const totalScore = selectedQuestions.reduce((sum, sq) => sum + sq.score, 0);
                  if (totalScore > maxScore) {
                    showError(`Tổng điểm các câu hỏi (${totalScore}) không được vượt quá tổng điểm đề thi (${maxScore})`);
                    setLoadingCreateExam(false);
                    return;
                  }
                  for (const sq of selectedQuestions) {
                    if (sq.score <= 0) {
                      showError('Mỗi câu hỏi phải có điểm lớn hơn 0');
                      setLoadingCreateExam(false);
                      return;
                    }
                  }

                  // Tạo đề thi manual
                  const examData: CreateExamDTO = {
                    name: examName.trim(),
                    duration,
                    maxScore,
                    questions: selectedQuestions.map((sq) => ({
                      questionId: sq.question.id,
                      score: sq.score,
                    })),
                    numberOfCodes: numberOfCodes > 0 ? numberOfCodes : undefined,
                  };

                  const createResponse = await apiClient.post(API_ENDPOINTS.EXAMS, examData);
                  const createData = await createResponse.json();

                  if (!createResponse.ok || !createData.success) {
                    throw new Error(createData.message || 'Tạo đề thi thất bại');
                  }

                  newExamId = createData.data.id;
                } else {
                  // Tab random
                  const total = nhanBietCount + thongHieuCount + vanDungCaoCount + vanDungCount;
                  if (total !== totalQuestions) {
                    showError(`Tổng số câu hỏi các mức độ (${total}) phải bằng tổng số câu hỏi (${totalQuestions})`);
                    setLoadingCreateExam(false);
                    return;
                  }
                  if (totalQuestions === 0) {
                    showError('Phải có ít nhất 1 câu hỏi');
                    setLoadingCreateExam(false);
                    return;
                  }

                  // Tạo đề thi random
                  const examData = {
                    name: examName.trim(),
                    duration,
                    maxScore,
                    totalQuestions,
                    nhanBietCount,
                    thongHieuCount,
                    vanDungCount,
                    vanDungCaoCount,
                    grade: randomGrade === '' ? null : Number(randomGrade),
                    subjectId: randomSubjectId === '' ? null : Number(randomSubjectId),
                    numberOfCodes: numberOfCodes > 0 ? numberOfCodes : undefined,
                  };

                  const createResponse = await apiClient.post(`${API_ENDPOINTS.EXAMS}/random`, examData);
                  const createData = await createResponse.json();

                  if (!createResponse.ok || !createData.success) {
                    throw new Error(createData.message || 'Tạo đề thi random thất bại');
                  }

                  newExamId = createData.data.id;
                }

                // Tự động thêm vào lớp với startDate và endDate
                const addResponse = await apiClient.post(API_ENDPOINTS.CLASSES_ADD_EXAM(Number.parseInt(id!, 10)), {
                  examId: newExamId,
                  startDate: examStartDate,
                  endDate: examEndDate,
                });
                const addData = await addResponse.json();

                if (!addResponse.ok || !addData.success) {
                  throw new Error(addData.message || 'Thêm đề thi vào lớp thất bại');
                }

                // Reload class data
                await loadClassData();
                setCreateExamDialogOpen(false);
                
                // Reset form
                setExamName('');
                setDuration(60);
                setMaxScore(100);
                setNumberOfCodes(0);
                setTotalQuestions(10);
                setNhanBietCount(0);
                setThongHieuCount(0);
                setVanDungCount(0);
                setVanDungCaoCount(0);
                setRandomGrade('');
                setRandomSubjectId('');
                setExamStartDate('');
                setExamEndDate('');
                setSelectedQuestions([]);
                setCreateExamTabValue(0);

                showSuccess('Tạo đề thi và thêm vào lớp thành công!');
              } catch (err: any) {
                showError(err.message || 'Tạo đề thi thất bại');
              } finally {
                setLoadingCreateExam(false);
              }
            }}
            disabled={loadingCreateExam}
          >
            {loadingCreateExam ? <CircularProgress size={24} /> : 'Tạo và thêm vào lớp'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ClassDetail;

