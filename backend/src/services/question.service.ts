import {
  Question,
  Answer,
  QuestionWithAnswers,
  CreateQuestionDTO,
  CreateAnswerDTO,
  UpdateQuestionDTO,
  UpdateAnswerDTO,
} from '../types/question.types';
import { query } from '../config/database';

interface QuestionRow {
  id: number;
  content: string;
  image: string | null;
  difficulty: number;
  created_at: Date;
}

interface AnswerRow {
  id: number;
  question_id: number;
  content: string;
  is_true: number; // MySQL boolean trả về 0 hoặc 1
  created_at: Date;
}

export class QuestionService {
  /**
   * Lấy tất cả câu hỏi kèm đáp án
   */
  async findAll(): Promise<QuestionWithAnswers[]> {
    try {
      const questionRows = await query<QuestionRow[]>(
        'SELECT * FROM questions ORDER BY created_at DESC'
      );

      const questionsWithAnswers: QuestionWithAnswers[] = [];

      for (const questionRow of questionRows) {
        const answers = await this.getAnswersByQuestionId(questionRow.id);
        questionsWithAnswers.push({
          ...this.mapRowToQuestion(questionRow),
          answers,
        });
      }

      return questionsWithAnswers;
    } catch (error) {
      console.error('Error finding all questions:', error);
      throw error;
    }
  }

  /**
   * Lấy câu hỏi theo ID kèm đáp án
   */
  async findById(id: number): Promise<QuestionWithAnswers | null> {
    try {
      const results = await query<QuestionRow[]>(
        'SELECT * FROM questions WHERE id = ?',
        [id]
      );

      if (results.length === 0) {
        return null;
      }

      const questionRow = results[0];
      const answers = await this.getAnswersByQuestionId(id);

      return {
        ...this.mapRowToQuestion(questionRow),
        answers,
      };
    } catch (error) {
      console.error('Error finding question by id:', error);
      throw error;
    }
  }

  /**
   * Tạo câu hỏi mới kèm đáp án
   */
  async create(questionData: CreateQuestionDTO): Promise<QuestionWithAnswers> {
    // Validate: Phải có ít nhất 2 đáp án
    if (!questionData.answers || questionData.answers.length < 2) {
      throw new Error('Câu hỏi phải có ít nhất 2 đáp án');
    }

    // Validate: Phải có ít nhất 1 đáp án đúng
    const hasCorrectAnswer = questionData.answers.some((answer) => answer.isTrue);
    if (!hasCorrectAnswer) {
      throw new Error('Câu hỏi phải có ít nhất 1 đáp án đúng');
    }

    // Validate: Content là bắt buộc
    if (!questionData.content || questionData.content.trim() === '') {
      throw new Error('Nội dung câu hỏi là bắt buộc');
    }

    // Validate: Mỗi đáp án phải có content
    for (const answer of questionData.answers) {
      if (!answer.content || answer.content.trim() === '') {
        throw new Error('Nội dung đáp án không được để trống');
      }
    }

    try {
      // Validate difficulty
      if (!questionData.difficulty || questionData.difficulty < 1 || questionData.difficulty > 4) {
        throw new Error('Độ khó phải từ 1 đến 4');
      }

      // Insert câu hỏi
      const questionResult = await query<{ insertId: number }>(
        'INSERT INTO questions (content, image, difficulty) VALUES (?, ?, ?)',
        [questionData.content.trim(), questionData.image?.trim() || null, questionData.difficulty]
      );

      const questionId = questionResult.insertId;

      // Insert các đáp án
      const createdAnswers: Answer[] = [];
      for (const answerData of questionData.answers) {
        const answerResult = await query<{ insertId: number }>(
          'INSERT INTO answers (question_id, content, is_true) VALUES (?, ?, ?)',
          [questionId, answerData.content.trim(), answerData.isTrue ? 1 : 0]
        );

        createdAnswers.push({
          id: answerResult.insertId,
          content: answerData.content.trim(),
          isTrue: answerData.isTrue,
          questionId: questionId,
          createdAt: new Date(),
        });
      }

      // Lấy lại câu hỏi vừa tạo
      const question = await this.findById(questionId);
      if (!question) {
        throw new Error('Không thể tạo câu hỏi');
      }

      return question;
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  }

  /**
   * Cập nhật câu hỏi
   */
  async update(
    id: number,
    questionData: UpdateQuestionDTO
  ): Promise<QuestionWithAnswers | null> {
    try {
      // Xây dựng query động dựa trên các field có giá trị
      const updates: string[] = [];
      const values: any[] = [];

      if (questionData.content !== undefined) {
        updates.push('content = ?');
        values.push(questionData.content.trim());
      }

      if (questionData.image !== undefined) {
        updates.push('image = ?');
        values.push(questionData.image.trim() || null);
      }

      if (questionData.difficulty !== undefined) {
        if (questionData.difficulty < 1 || questionData.difficulty > 4) {
          throw new Error('Độ khó phải từ 1 đến 4');
        }
        updates.push('difficulty = ?');
        values.push(questionData.difficulty);
      }

      if (updates.length === 0) {
        // Không có gì để cập nhật
        return await this.findById(id);
      }

      values.push(id);

      await query(
        `UPDATE questions SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      return await this.findById(id);
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  }

  /**
   * Xóa câu hỏi và tất cả đáp án liên quan (CASCADE sẽ tự động xóa answers)
   */
  async delete(id: number): Promise<boolean> {
    try {
      const result = await query<{ affectedRows: number }>(
        'DELETE FROM questions WHERE id = ?',
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  }

  /**
   * Cập nhật đáp án
   */
  async updateAnswer(
    answerId: number,
    answerData: UpdateAnswerDTO
  ): Promise<Answer | null> {
    try {
      const updates: string[] = [];
      const values: any[] = [];

      if (answerData.content !== undefined) {
        updates.push('content = ?');
        values.push(answerData.content.trim());
      }

      if (answerData.isTrue !== undefined) {
        updates.push('is_true = ?');
        values.push(answerData.isTrue ? 1 : 0);
      }

      if (updates.length === 0) {
        // Không có gì để cập nhật, lấy lại answer
        const results = await query<AnswerRow[]>(
          'SELECT * FROM answers WHERE id = ?',
          [answerId]
        );
        if (results.length === 0) {
          return null;
        }
        return this.mapRowToAnswer(results[0]);
      }

      values.push(answerId);

      await query(`UPDATE answers SET ${updates.join(', ')} WHERE id = ?`, values);

      // Lấy lại answer đã cập nhật
      const results = await query<AnswerRow[]>(
        'SELECT * FROM answers WHERE id = ?',
        [answerId]
      );

      if (results.length === 0) {
        return null;
      }

      return this.mapRowToAnswer(results[0]);
    } catch (error) {
      console.error('Error updating answer:', error);
      throw error;
    }
  }

  /**
   * Xóa đáp án
   */
  async deleteAnswer(answerId: number): Promise<boolean> {
    try {
      const result = await query<{ affectedRows: number }>(
        'DELETE FROM answers WHERE id = ?',
        [answerId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting answer:', error);
      throw error;
    }
  }

  /**
   * Lấy tất cả đáp án của một câu hỏi
   */
  private async getAnswersByQuestionId(questionId: number): Promise<Answer[]> {
    try {
      const answerRows = await query<AnswerRow[]>(
        'SELECT * FROM answers WHERE question_id = ? ORDER BY id',
        [questionId]
      );

      return answerRows.map((row) => this.mapRowToAnswer(row));
    } catch (error) {
      console.error('Error getting answers by question id:', error);
      throw error;
    }
  }

  /**
   * Map database row sang Question object
   */
  private mapRowToQuestion(row: QuestionRow): Question {
    return {
      id: row.id,
      content: row.content,
      image: row.image || undefined,
      difficulty: row.difficulty,
      createdAt: row.created_at,
    };
  }

  /**
   * Map database row sang Answer object
   */
  private mapRowToAnswer(row: AnswerRow): Answer {
    return {
      id: row.id,
      content: row.content,
      isTrue: row.is_true === 1, // Convert 0/1 sang boolean
      questionId: row.question_id,
      createdAt: row.created_at,
    };
  }
}

export default new QuestionService();
