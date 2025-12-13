export interface StudentAnswer {
  questionId: number;
  answerIds: number[];
}

export interface CorrectAnswer {
  questionId: number;
  answerIds: number[];
}

export interface ExamResult {
  id: number;
  userId: number;
  classId: number | null; // ID lớp học
  examCodeId: number | null;
  examCode: string | null;
  examId: number;
  startedAt: string;
  submittedAt: string | null;
  score: number;
  maxScore: number;
  answers: StudentAnswer[];
  correctAnswers: CorrectAnswer[] | null;
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
      isCorrect: boolean;
    }[];
  };
}

export interface StartExamResponse {
  classId: number;
  examId: number;
  examCodeId: number | null;
  examCode: string | null;
  questions: ExamQuestionForTaking[];
  duration: number;
  maxScore: number;
  startTime: string;
}

export interface SubmitExamDTO {
  classId: number;
  examId: number;
  examCodeId: number | null;
  answers: StudentAnswer[];
}

