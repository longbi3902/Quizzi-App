import { QuestionWithAnswers } from './question.types';

export interface Exam {
  id: number;
  name: string;
  duration: number; // Thời gian thi (phút)
  maxScore: number; // Tổng điểm tối đa
  createdAt: Date;
  updatedAt: Date;
}

export interface ExamQuestion {
  id: number;
  examId: number;
  questionId: number;
  score: number; // Điểm số của câu hỏi
  orderIndex: number; // Thứ tự trong đề thi
  createdAt: Date;
  question?: QuestionWithAnswers; // Thông tin câu hỏi (khi join)
}

export interface ExamWithQuestions extends Exam {
  questions: ExamQuestion[];
}

export interface CreateExamDTO {
  name: string;
  duration: number;
  maxScore: number;
  questions: CreateExamQuestionDTO[];
  numberOfCodes?: number; // Số mã đề cần tạo
}

export interface CreateExamQuestionDTO {
  questionId: number;
  score: number;
}

export interface CreateExamRandomDTO {
  name: string;
  duration: number;
  maxScore: number;
  totalQuestions: number;
  nhanBietCount: number; // Số câu nhận biết
  thongHieuCount: number; // Số câu thông hiểu
  vanDungCount: number; // Số câu vận dụng
  vanDungCaoCount: number; // Số câu vận dụng cao
  numberOfCodes?: number; // Số mã đề cần tạo
  grade?: number | null; // Khối lớp (1-12)
  subjectId?: number | null; // ID môn học
}

export interface UpdateExamDTO {
  name?: string;
  duration?: number;
  maxScore?: number;
}

export interface UpdateExamWithQuestionsDTO {
  name?: string;
  duration?: number;
  maxScore?: number;
  questions?: CreateExamQuestionDTO[]; // Danh sách câu hỏi mới (thay thế toàn bộ)
}

export interface ExamCode {
  id: number;
  examId: number;
  code: string; // Mã đề (ví dụ: MĐ001, MĐ002)
  questionOrder: number[]; // Thứ tự câu hỏi đã đảo (array of question IDs)
  createdAt: Date;
  exam?: ExamWithQuestions; // Thông tin đề thi (khi join)
}

export interface ExamCodeWithExam extends ExamCode {
  exam: ExamWithQuestions;
}
