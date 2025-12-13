import { Exam, ExamWithQuestions } from './exam.types';

export interface Class {
  id: number;
  code: string; // Mã lớp học (tự động sinh)
  name: string;
  password: string;
  createdBy: number | null; // ID người tạo (giáo viên)
  createdAt: Date;
  updatedAt: Date;
  exams?: ClassExamWithDates[]; // Danh sách đề thi trong lớp (khi join)
}

export interface ClassWithExams extends Class {
  exams: ClassExamWithDates[];
}

export interface CreateClassDTO {
  name: string;
  password: string;
  examIds: number[]; // Danh sách ID đề thi để thêm vào lớp
}

export interface UpdateClassDTO {
  name?: string;
  password?: string;
  examIds?: number[]; // Danh sách ID đề thi để cập nhật
}

export interface ClassExam {
  id: number;
  classId: number;
  examId: number;
  startDate: Date; // Ngày giờ bắt đầu cho phép thi
  endDate: Date; // Ngày giờ kết thúc cho phép thi
  createdAt: Date;
  exam?: ExamWithQuestions; // Thông tin đề thi (khi join)
}

// Exam trong class với thông tin thời gian từ class_exams
export interface ClassExamWithDates extends ExamWithQuestions {
  startDate: Date; // Ngày giờ bắt đầu cho phép thi (từ class_exams)
  endDate: Date; // Ngày giờ kết thúc cho phép thi (từ class_exams)
}

export interface ClassParticipant {
  id: number;
  userId: number;
  classId: number;
  joinedAt: Date;
}


