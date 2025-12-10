export interface Answer {
  id: number;
  content: string;
  isTrue: boolean;
  questionId: number;
  createdAt: string;
}

export enum QuestionDifficulty {
  NHAN_BIET = 1,      // Nhận biết
  THONG_HIEU = 2,     // Thông hiểu
  VAN_DUNG = 3,        // Vận dụng
  VAN_DUNG_CAO = 4    // Vận dụng cao
}

export interface Question {
  id: number;
  content: string;
  image?: string;
  difficulty: number; // 1-4
  createdAt: string;
}

export interface QuestionWithAnswers extends Question {
  answers: Answer[];
}

export interface CreateQuestionDTO {
  content: string;
  image?: string;
  difficulty: number; // 1-4
  answers: CreateAnswerDTO[];
}

export interface CreateAnswerDTO {
  content: string;
  isTrue: boolean;
}

export interface UpdateQuestionDTO {
  content?: string;
  image?: string;
  difficulty?: number; // 1-4
}

export interface UpdateAnswerDTO {
  content?: string;
  isTrue?: boolean;
}

