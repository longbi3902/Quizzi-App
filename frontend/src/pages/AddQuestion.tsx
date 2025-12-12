/**
 * AddQuestion Page - Trang thêm câu hỏi
 * 
 * Component này hiển thị form để thêm câu hỏi mới với:
 * - Nội dung câu hỏi (bắt buộc)
 * - Tải ảnh (không bắt buộc)
 * - Thêm/xóa đáp án
 * - Checkbox để đánh dấu đáp án đúng
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
  IconButton,
  Checkbox,
  FormControlLabel,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { API_ENDPOINTS } from '../constants/api';
import { CreateQuestionDTO, CreateAnswerDTO, QuestionDifficulty } from '../types/question.types';
import { Subject } from '../types/subject.types';
import { difficultyOptions } from '../utils/questionUtils';

interface AnswerFormData {
  content: string;
  isTrue: boolean;
}

const AddQuestion: React.FC = () => {
  const navigate = useNavigate();

  // State quản lý dữ liệu form
  const [questionContent, setQuestionContent] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [difficulty, setDifficulty] = useState<number>(QuestionDifficulty.NHAN_BIET);
  const [grade, setGrade] = useState<number | ''>('');
  const [subjectId, setSubjectId] = useState<number | ''>('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [answers, setAnswers] = useState<AnswerFormData[]>([
    { content: '', isTrue: false },
    { content: '', isTrue: false },
  ]);

  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingSubjects, setLoadingSubjects] = useState<boolean>(false);

  /**
   * Thêm đáp án mới
   */
  const handleAddAnswer = () => {
    setAnswers([...answers, { content: '', isTrue: false }]);
  };

  /**
   * Xóa đáp án
   */
  const handleRemoveAnswer = (index: number) => {
    if (answers.length <= 2) {
      setError('Câu hỏi phải có ít nhất 2 đáp án');
      return;
    }
    setAnswers(answers.filter((_, i) => i !== index));
    setError('');
  };

  /**
   * Cập nhật nội dung đáp án
   */
  const handleAnswerContentChange = (index: number, content: string) => {
    const newAnswers = [...answers];
    newAnswers[index].content = content;
    setAnswers(newAnswers);
  };

  /**
   * Toggle đáp án đúng/sai
   */
  const handleAnswerIsTrueChange = (index: number) => {
    const newAnswers = [...answers];
    newAnswers[index].isTrue = !newAnswers[index].isTrue;
    setAnswers(newAnswers);
  };

  /**
   * Validate form trước khi submit
   */
  const validateForm = (): boolean => {
    // Kiểm tra nội dung câu hỏi
    if (!questionContent || questionContent.trim() === '') {
      setError('Nội dung câu hỏi là bắt buộc');
      return false;
    }

    // Kiểm tra số lượng đáp án
    if (answers.length < 2) {
      setError('Câu hỏi phải có ít nhất 2 đáp án');
      return false;
    }

    // Kiểm tra mỗi đáp án có nội dung
    for (let i = 0; i < answers.length; i++) {
      if (!answers[i].content || answers[i].content.trim() === '') {
        setError(`Đáp án thứ ${i + 1} không được để trống`);
        return false;
      }
    }

    // Kiểm tra có ít nhất 1 đáp án đúng
    const hasCorrectAnswer = answers.some(answer => answer.isTrue);
    if (!hasCorrectAnswer) {
      setError('Câu hỏi phải có ít nhất 1 đáp án đúng');
      return false;
    }

    return true;
  };

  /**
   * Load danh sách môn học
   */
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoadingSubjects(true);
        const response = await fetch(API_ENDPOINTS.SUBJECTS);
        const data = await response.json();

        if (response.ok && data.success) {
          setSubjects(data.data || []);
        }
      } catch (err) {
        console.error('Error fetching subjects:', err);
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, []);

  /**
   * Xử lý khi submit form
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Chuẩn bị dữ liệu để gửi
      const questionData: CreateQuestionDTO = {
        content: questionContent.trim(),
        image: imageUrl.trim() || undefined,
        difficulty: difficulty,
        grade: grade === '' ? null : Number(grade),
        subjectId: subjectId === '' ? null : Number(subjectId),
        answers: answers.map(answer => ({
          content: answer.content.trim(),
          isTrue: answer.isTrue,
        })) as CreateAnswerDTO[],
      };

      // Gọi API tạo câu hỏi
      const response = await fetch(API_ENDPOINTS.QUESTIONS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Tạo câu hỏi thất bại');
      }

      // Thành công - chuyển về trang quản lý câu hỏi
      alert('Tạo câu hỏi thành công!');
      navigate('/teacher/questions');
    } catch (err: any) {
      setError(err.message || 'Tạo câu hỏi thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
          marginBottom: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%', borderRadius: '12px' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom sx={{ color: '#6366f1', fontWeight: 'bold', letterSpacing: '0.5px' }}>
            THÊM CÂU HỎI
          </Typography>

          {/* Hiển thị lỗi */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {/* Form thêm câu hỏi */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            {/* Nội dung câu hỏi - Bắt buộc */}
            <TextField
              required
              fullWidth
              id="questionContent"
              label="Nội dung câu hỏi"
              name="questionContent"
              multiline
              rows={3}
              value={questionContent}
              onChange={(e) => setQuestionContent(e.target.value)}
              sx={{ mb: 3 }}
            />

            {/* Tải ảnh - Không bắt buộc */}
            <TextField
              fullWidth
              id="imageUrl"
              label="URL ảnh (không bắt buộc)"
              name="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              sx={{ mb: 3 }}
              placeholder="https://example.com/image.jpg"
            />

            {/* Độ khó - Bắt buộc */}
            <TextField
              required
              fullWidth
              select
              id="difficulty"
              label="Độ khó"
              name="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(Number.parseInt(e.target.value, 10))}
              sx={{ mb: 3 }}
            >
              {difficultyOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            {/* Khối lớp */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Khối lớp</InputLabel>
              <Select
                value={grade}
                label="Khối lớp"
                onChange={(e) => setGrade(e.target.value === '' ? '' : Number(e.target.value))}
              >
                <MenuItem value="">Không chọn</MenuItem>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                  <MenuItem key={g} value={g}>
                    Khối {g}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Môn học */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Môn học</InputLabel>
              <Select
                value={subjectId}
                label="Môn học"
                onChange={(e) => setSubjectId(e.target.value === '' ? '' : Number(e.target.value))}
                disabled={loadingSubjects}
              >
                <MenuItem value="">Không chọn</MenuItem>
                {subjects.map((subject) => (
                  <MenuItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Danh sách đáp án */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Đáp án
            </Typography>

            {answers.map((answer, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  mb: 2,
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  backgroundColor: '#fafafa',
                }}
              >
                <TextField
                  fullWidth
                  required
                  id={`answer-${index}`}
                  label={`Đáp án ${index + 1}`}
                  value={answer.content}
                  onChange={(e) => handleAnswerContentChange(index, e.target.value)}
                  sx={{ flex: 1 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={answer.isTrue}
                      onChange={() => handleAnswerIsTrueChange(index)}
                      color="primary"
                    />
                  }
                  label="Đáp án đúng"
                  sx={{ minWidth: '140px' }}
                />
                {answers.length > 2 && (
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveAnswer(index)}
                    sx={{ mt: 1 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            ))}

            {/* Nút thêm đáp án */}
            <Button
              type="button"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddAnswer}
              sx={{ mb: 3 }}
            >
              Thêm đáp án
            </Button>

            {/* Button Submit */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Tạo câu hỏi'}
            </Button>

            {/* Button quay lại */}
            <Button
              type="button"
              fullWidth
              variant="outlined"
              onClick={() => navigate('/teacher/questions')}
              sx={{ mb: 2 }}
            >
              Quay lại
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AddQuestion;

