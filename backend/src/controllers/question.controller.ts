import { Request, Response } from 'express';
import questionService from '../services/question.service';
import { CreateQuestionDTO, UpdateQuestionDTO, UpdateAnswerDTO } from '../types/question.types';

export class QuestionController {
  /**
   * Lấy tất cả câu hỏi
   */
  async getAllQuestions(req: Request, res: Response) {
    try {
      const questions = await questionService.findAll();
      res.json({
        success: true,
        message: 'Lấy danh sách câu hỏi thành công',
        data: questions
      });
    } catch (error: any) {
      console.error('Get all questions error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy danh sách câu hỏi',
        error: error.message
      });
    }
  }

  /**
   * Lấy câu hỏi theo ID
   */
  async getQuestionById(req: Request, res: Response) {
    try {
      const id = Number.parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID câu hỏi không hợp lệ'
        });
      }

      const question = await questionService.findById(id);
      
      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy câu hỏi'
        });
      }

      res.json({
        success: true,
        message: 'Lấy câu hỏi thành công',
        data: question
      });
    } catch (error: any) {
      console.error('Get question by id error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy câu hỏi',
        error: error.message
      });
    }
  }

  /**
   * Tạo câu hỏi mới
   */
  async createQuestion(req: Request, res: Response) {
    try {
      const questionData: CreateQuestionDTO = req.body;

      // Validation
      if (!questionData.content || questionData.content.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Nội dung câu hỏi là bắt buộc'
        });
      }

      if (!questionData.answers || questionData.answers.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Câu hỏi phải có ít nhất 2 đáp án'
        });
      }

      const hasCorrectAnswer = questionData.answers.some(answer => answer.isTrue);
      if (!hasCorrectAnswer) {
        return res.status(400).json({
          success: false,
          message: 'Câu hỏi phải có ít nhất 1 đáp án đúng'
        });
      }

      // Validate từng đáp án
      for (let i = 0; i < questionData.answers.length; i++) {
        const answer = questionData.answers[i];
        if (!answer.content || answer.content.trim() === '') {
          return res.status(400).json({
            success: false,
            message: `Đáp án thứ ${i + 1} không được để trống`
          });
        }
      }

      const question = await questionService.create(questionData);

      res.status(201).json({
        success: true,
        message: 'Tạo câu hỏi thành công',
        data: question
      });
    } catch (error: any) {
      console.error('Create question error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi server khi tạo câu hỏi',
        error: error.message
      });
    }
  }

  /**
   * Cập nhật câu hỏi
   */
  async updateQuestion(req: Request, res: Response) {
    try {
      const id = Number.parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID câu hỏi không hợp lệ'
        });
      }

      const questionData: UpdateQuestionDTO = req.body;

      const question = await questionService.update(id, questionData);
      
      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy câu hỏi'
        });
      }

      res.json({
        success: true,
        message: 'Cập nhật câu hỏi thành công',
        data: question
      });
    } catch (error: any) {
      console.error('Update question error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi cập nhật câu hỏi',
        error: error.message
      });
    }
  }

  /**
   * Xóa câu hỏi
   */
  async deleteQuestion(req: Request, res: Response) {
    try {
      const id = Number.parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID câu hỏi không hợp lệ'
        });
      }

      const deleted = await questionService.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy câu hỏi'
        });
      }

      res.json({
        success: true,
        message: 'Xóa câu hỏi thành công'
      });
    } catch (error: any) {
      console.error('Delete question error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi xóa câu hỏi',
        error: error.message
      });
    }
  }

  /**
   * Cập nhật đáp án
   */
  async updateAnswer(req: Request, res: Response) {
    try {
      const answerId = Number.parseInt(req.params.answerId, 10);
      
      if (isNaN(answerId)) {
        return res.status(400).json({
          success: false,
          message: 'ID đáp án không hợp lệ'
        });
      }

      const answerData: UpdateAnswerDTO = req.body;

      const answer = await questionService.updateAnswer(answerId, answerData);
      
      if (!answer) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đáp án'
        });
      }

      res.json({
        success: true,
        message: 'Cập nhật đáp án thành công',
        data: answer
      });
    } catch (error: any) {
      console.error('Update answer error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi cập nhật đáp án',
        error: error.message
      });
    }
  }

  /**
   * Xóa đáp án
   */
  async deleteAnswer(req: Request, res: Response) {
    try {
      const answerId = Number.parseInt(req.params.answerId, 10);
      
      if (isNaN(answerId)) {
        return res.status(400).json({
          success: false,
          message: 'ID đáp án không hợp lệ'
        });
      }

      const deleted = await questionService.deleteAnswer(answerId);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đáp án'
        });
      }

      res.json({
        success: true,
        message: 'Xóa đáp án thành công'
      });
    } catch (error: any) {
      console.error('Delete answer error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi xóa đáp án',
        error: error.message
      });
    }
  }
}

export default new QuestionController();

