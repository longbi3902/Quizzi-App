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
  examRoomId: number;
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
  examRoomId: number;
  examId: number;
  examCodeId: number | null;
  examCode: string | null;
  questions: ExamQuestionForTaking[];
  duration: number;
  maxScore: number;
  startTime: string;
}

export interface SubmitExamDTO {
  examRoomId: number;
  examCodeId: number | null;
  answers: StudentAnswer[];
}

