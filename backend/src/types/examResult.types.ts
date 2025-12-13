export interface ExamResult {
  id: number;
  userId: number;
  classId: number | null; // ID lớp học
  examCodeId: number | null;
  examCode: string | null; // Mã đề (ví dụ: MĐ001)
  examId: number;
  startedAt: Date;
  submittedAt: Date | null;
  score: number;
  maxScore: number;
  answers: StudentAnswer[]; // Đáp án học sinh chọn
  correctAnswers: CorrectAnswer[] | null; // Đáp án đúng (chỉ có khi đã hết thời gian thi)
}

export interface StudentAnswer {
  questionId: number;
  answerIds: number[]; // Mảng ID các đáp án học sinh chọn
}

export interface CorrectAnswer {
  questionId: number;
  answerIds: number[]; // Mảng ID các đáp án đúng
}

export interface StartExamResponse {
  classId: number;
  examId: number;
  examCodeId: number | null;
  examCode: string | null;
  questions: ExamQuestionForTaking[];
  duration: number; // Phút
  maxScore: number;
  startTime: Date;
}

export interface ExamQuestionForTaking {
  id: number;
  questionId: number;
  score: number;
  orderIndex: number;
  question: {
    id: number;
    content: string;
    type: 'single' | 'multiple';
    answers: {
      id: number;
      content: string;
      isCorrect: boolean; // Không gửi về frontend khi đang thi, chỉ khi xem kết quả
    }[];
  };
}

export interface SubmitExamDTO {
  classId: number;
  examId: number;
  examCodeId: number | null;
  answers: StudentAnswer[];
}

export interface ExamResultWithDetails extends ExamResult {
  class: {
    id: number;
    name: string;
    code: string;
    startDate: Date;
    endDate: Date;
  };
  exam: {
    id: number;
    name: string;
    duration: number;
    maxScore: number;
  };
  examCode: {
    id: number;
    code: string;
  } | null;
}

