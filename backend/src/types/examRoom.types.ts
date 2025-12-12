import { Exam, ExamWithQuestions } from './exam.types';

export interface ExamRoom {
  id: number;
  code: string; // Mã phòng thi (tự động sinh)
  name: string;
  password: string;
  startDate: Date; // Ngày giờ bắt đầu cho phép thi
  endDate: Date; // Ngày giờ kết thúc cho phép thi
  examId: number;
  createdAt: Date;
  updatedAt: Date;
  exam?: ExamWithQuestions; // Thông tin đề thi (khi join)
}

export interface ExamRoomWithExam extends ExamRoom {
  exam: ExamWithQuestions;
}

export interface CreateExamRoomDTO {
  name: string;
  password: string;
  startDate: Date | string; // ISO string hoặc Date
  endDate: Date | string; // ISO string hoặc Date
  examId: number;
}

export interface UpdateExamRoomDTO {
  name?: string;
  password?: string;
  startDate?: Date | string; // ISO string hoặc Date
  endDate?: Date | string; // ISO string hoặc Date
  examId?: number;
}

