import { Request, Response } from 'express';
import questionService from '../services/question.service';
import { CreateQuestionDTO, UpdateQuestionDTO, UpdateAnswerDTO } from '../types/question.types';
import { getUserIdFromToken } from '../utils/auth';

export class QuestionController {
  /**
   * Lấy tất cả câu hỏi
   */
  async getAllQuestions(req: Request, res: Response) {
    try {
      // Kiểm tra có query params cho pagination không
      const page = req.query.page ? Number.parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? Number.parseInt(req.query.limit as string, 10) : undefined;

      if (page !== undefined && limit !== undefined) {
        // Sử dụng pagination với filter
        const filters = {
          name: (req.query.content || req.query.name) as string | undefined, // Support both 'content' and 'name' for backward compatibility
          subjectId: req.query.subjectId
            ? Number.parseInt(req.query.subjectId as string, 10)
            : undefined,
          grade: req.query.grade
            ? Number.parseInt(req.query.grade as string, 10)
            : undefined,
          difficulty: req.query.difficulty
            ? Number.parseInt(req.query.difficulty as string, 10)
            : undefined,
        };

        const userId = getUserIdFromToken(req);
        if (!userId) {
          return res.status(401).json({
            success: false,
            message: 'Bạn cần đăng nhập để xem danh sách câu hỏi',
          });
        }
        const result = await questionService.findAllPaginated(page, limit, userId, filters);
        res.json({
          success: true,
          message: 'Lấy danh sách câu hỏi thành công',
          data: result.data,
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
          },
        });
      } else {
        // Lấy tất cả (backward compatibility)
        const userId = getUserIdFromToken(req);
        if (!userId) {
          return res.status(401).json({
            success: false,
            message: 'Bạn cần đăng nhập để xem danh sách câu hỏi',
          });
        }
        const questions = await questionService.findAll(userId);
        res.json({
          success: true,
          message: 'Lấy danh sách câu hỏi thành công',
          data: questions
        });
      }
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

      const userId = getUserIdFromToken(req);
      const question = await questionService.findById(id, userId);
      
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

      const userId = getUserIdFromToken(req);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Bạn cần đăng nhập để tạo câu hỏi',
        });
      }
      const question = await questionService.create(questionData, userId);

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

      const userId = getUserIdFromToken(req);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Bạn cần đăng nhập để cập nhật câu hỏi',
        });
      }
      const question = await questionService.update(id, questionData, userId);
      
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

      const userId = getUserIdFromToken(req);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Bạn cần đăng nhập để xóa câu hỏi',
        });
      }
      const deleted = await questionService.delete(id, userId);
      
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




