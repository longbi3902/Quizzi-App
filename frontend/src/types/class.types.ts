import { ExamWithQuestions } from './exam.types';

export interface Class {
  id: number;
  code: string; // Mã lớp học (tự động sinh)
  name: string;
  password: string;
  createdBy: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  exams?: ClassExamWithDates[]; // Danh sách đề thi trong lớp (khi join)
}

export interface ClassWithExams extends Class {
  exams: ClassExamWithDates[];
}

// Exam trong class với thông tin thời gian từ class_exams
export interface ClassExamWithDates extends ExamWithQuestions {
  startDate: Date | string; // Ngày giờ bắt đầu cho phép thi (từ class_exams)
  endDate: Date | string; // Ngày giờ kết thúc cho phép thi (từ class_exams)
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


