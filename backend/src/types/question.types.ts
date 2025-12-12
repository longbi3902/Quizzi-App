export interface Answer {
  id: number;
  content: string;
  isTrue: boolean;
  questionId: number;
  createdAt: Date;
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
  grade: number | null; // Khối lớp (1-12)
  subjectId: number | null; // ID môn học
  createdAt: Date;
}

export interface QuestionWithAnswers extends Question {
  answers: Answer[];
}

export interface CreateQuestionDTO {
  content: string;
  image?: string;
  difficulty: number; // 1-4
  grade?: number | null; // Khối lớp (1-12)
  subjectId?: number | null; // ID môn học
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
  grade?: number | null; // Khối lớp (1-12)
  subjectId?: number | null; // ID môn học
}

export interface UpdateAnswerDTO {
  content?: string;
  isTrue?: boolean;
}

