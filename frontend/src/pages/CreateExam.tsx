/**
 * CreateExam - Trang tạo đề thi
 * Có 2 cách: Tự chọn câu hỏi và Random
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
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Pagination,
  Stack,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { API_ENDPOINTS } from '../constants/api';
import { CreateExamDTO, CreateExamRandomDTO } from '../types/exam.types';
import { QuestionWithAnswers } from '../types/question.types';
import { Subject } from '../types/subject.types';
import { getDifficultyName, getDifficultyColor } from '../utils/questionUtils';

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

const CreateExam: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableQuestions, setAvailableQuestions] = useState<QuestionWithAnswers[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  // Bộ lọc cho tab tự chọn
  const [filterName, setFilterName] = useState('');
  const [filterSubjectId, setFilterSubjectId] = useState<number | ''>('');
  const [filterGrade, setFilterGrade] = useState<number | ''>('');
  const [filterDifficulty, setFilterDifficulty] = useState<number | ''>('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Form data chung
  const [examName, setExamName] = useState('');
  const [duration, setDuration] = useState<number>(60);
  const [maxScore, setMaxScore] = useState<number>(100);
  const [numberOfCodes, setNumberOfCodes] = useState<number>(0);

  // Tab 1: Tự chọn
  const [selectedQuestions, setSelectedQuestions] = useState<
    Array<{ question: QuestionWithAnswers; score: number }>
  >([]);

  // Tab 2: Random
  const [totalQuestions, setTotalQuestions] = useState<number>(10);
  const [nhanBietCount, setNhanBietCount] = useState<number>(0);
  const [thongHieuCount, setThongHieuCount] = useState<number>(0);
  const [vanDungCount, setVanDungCount] = useState<number>(0);
  const [vanDungCaoCount, setVanDungCaoCount] = useState<number>(0);
  const [randomGrade, setRandomGrade] = useState<number | ''>('');
  const [randomSubjectId, setRandomSubjectId] = useState<number | ''>('');

  // Load danh sách môn học
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.SUBJECTS);
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

  // Load danh sách câu hỏi với filter và pagination (chỉ cho tab tự chọn)
  useEffect(() => {
    if (tabValue === 0) {
      fetchQuestions();
    }
  }, [tabValue, page, filterName, filterSubjectId, filterGrade, filterDifficulty]);

  const fetchQuestions = async () => {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
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

      const response = await fetch(`${API_ENDPOINTS.QUESTIONS}?${params.toString()}`);
      const data = await response.json();
      if (response.ok && data.success) {
        setAvailableQuestions(data.data || []);
        if (data.pagination) {
          setTotal(data.pagination.total);
          setTotalPages(data.pagination.totalPages);
        } else {
          setTotal(data.data?.length || 0);
          setTotalPages(1);
        }
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
    }
  };

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

  const handleSubmitManual = async () => {
    setError('');
    if (!validateManualSelection()) return;

    setLoading(true);
    try {
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

      const response = await fetch(API_ENDPOINTS.EXAMS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examData),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Tạo đề thi thất bại');
      }

      alert('Tạo đề thi thành công!');
      navigate('/teacher/exams');
    } catch (err: any) {
      setError(err.message || 'Tạo đề thi thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRandom = async () => {
    setError('');
    if (!validateRandom()) return;

    setLoading(true);
    try {
      const examData: CreateExamRandomDTO = {
        name: examName.trim(),
        duration,
        maxScore,
        totalQuestions,
        nhanBietCount,
        thongHieuCount,
        vanDungCount,
        vanDungCaoCount,
        numberOfCodes: numberOfCodes > 0 ? numberOfCodes : undefined,
        grade: randomGrade === '' ? null : Number(randomGrade),
        subjectId: randomSubjectId === '' ? null : Number(randomSubjectId),
      };

      const response = await fetch(`${API_ENDPOINTS.EXAMS}/random`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examData),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Tạo đề thi random thất bại');
      }

      alert('Tạo đề thi random thành công!');
      navigate('/teacher/exams');
    } catch (err: any) {
      setError(err.message || 'Tạo đề thi random thất bại');
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
            <IconButton onClick={() => navigate('/teacher/exams')}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1" sx={{ color: '#6366f1', fontWeight: 'bold' }}>
              TẠO ĐỀ THI
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Form chung */}
          <Box sx={{ mb: 3 }}>
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

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Tự chọn câu hỏi" />
              <Tab label="Random câu hỏi" />
            </Tabs>
          </Box>

          {/* Tab 1: Tự chọn */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mb: 3 }}>
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
                    setPage(1);
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
                      setPage(1);
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
                      setPage(1);
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
                      setPage(1);
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
              {totalPages > 1 && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                  <Stack spacing={2}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(event, value) => setPage(value)}
                      color="primary"
                      showFirstButton
                      showLastButton
                    />
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      Hiển thị {availableQuestions.length} / {total} câu hỏi
                    </Typography>
                  </Stack>
                </Box>
              )}
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

            <Button
              variant="contained"
              onClick={handleSubmitManual}
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Tạo đề thi'}
            </Button>
          </TabPanel>

          {/* Tab 2: Random */}
          <TabPanel value={tabValue} index={1}>
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

              {/* Chọn khối và môn */}
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
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Nếu chọn khối và/hoặc môn, hệ thống sẽ chỉ lấy câu hỏi trong khối và môn đó
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

            <Button
              variant="contained"
              onClick={handleSubmitRandom}
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Tạo đề thi random'}
            </Button>
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreateExam;

