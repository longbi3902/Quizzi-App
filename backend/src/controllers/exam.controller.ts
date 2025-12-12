import { Request, Response } from 'express';
import examService from '../services/exam.service';
import { CreateExamDTO, CreateExamRandomDTO, UpdateExamDTO, UpdateExamWithQuestionsDTO } from '../types/exam.types';

export class ExamController {
  /**
   * Lấy tất cả đề thi
   */
  async getAllExams(req: Request, res: Response) {
    try {
      // Kiểm tra có query params cho pagination không
      const page = req.query.page ? Number.parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? Number.parseInt(req.query.limit as string, 10) : undefined;

      if (page !== undefined && limit !== undefined) {
        // Sử dụng pagination
        const result = await examService.findAllPaginated(page, limit);
        res.json({
          success: true,
          message: 'Lấy danh sách đề thi thành công',
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
        const exams = await examService.findAll();
        res.json({
          success: true,
          message: 'Lấy danh sách đề thi thành công',
          data: exams,
        });
      }
    } catch (error: any) {
      console.error('Get all exams error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy danh sách đề thi',
        error: error.message,
      });
    }
  }

  /**
   * Lấy đề thi theo ID
   */
  async getExamById(req: Request, res: Response) {
    try {
      const id = Number.parseInt(req.params.id, 10);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID đề thi không hợp lệ',
        });
      }

      const exam = await examService.findById(id);

      if (!exam) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đề thi',
        });
      }

      res.json({
        success: true,
        message: 'Lấy đề thi thành công',
        data: exam,
      });
    } catch (error: any) {
      console.error('Get exam by id error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy đề thi',
        error: error.message,
      });
    }
  }

  /**
   * Tạo đề thi tự chọn
   */
  async createExam(req: Request, res: Response) {
    try {
      const examData: CreateExamDTO = req.body;

      const exam = await examService.create(examData);

      res.status(201).json({
        success: true,
        message: 'Tạo đề thi thành công',
        data: exam,
      });
    } catch (error: any) {
      console.error('Create exam error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi server khi tạo đề thi',
        error: error.message,
      });
    }
  }

  /**
   * Tạo đề thi random
   */
  async createRandomExam(req: Request, res: Response) {
    try {
      const examData: CreateExamRandomDTO = req.body;

      const exam = await examService.createRandom(examData);

      res.status(201).json({
        success: true,
        message: 'Tạo đề thi random thành công',
        data: exam,
      });
    } catch (error: any) {
      console.error('Create random exam error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi server khi tạo đề thi random',
        error: error.message,
      });
    }
  }

  /**
   * Cập nhật đề thi
   */
  async updateExam(req: Request, res: Response) {
    try {
      const id = Number.parseInt(req.params.id, 10);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID đề thi không hợp lệ',
        });
      }

      const examData: UpdateExamDTO = req.body;

      const exam = await examService.update(id, examData);

      if (!exam) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đề thi',
        });
      }

      res.json({
        success: true,
        message: 'Cập nhật đề thi thành công',
        data: exam,
      });
    } catch (error: any) {
      console.error('Update exam error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi server khi cập nhật đề thi',
        error: error.message,
      });
    }
  }

  /**
   * Cập nhật đề thi kèm câu hỏi
   */
  async updateExamWithQuestions(req: Request, res: Response) {
    try {
      const id = Number.parseInt(req.params.id, 10);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID đề thi không hợp lệ',
        });
      }

      const examData: UpdateExamWithQuestionsDTO = req.body;

      const exam = await examService.updateWithQuestions(id, examData);

      if (!exam) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đề thi',
        });
      }

      res.json({
        success: true,
        message: 'Cập nhật đề thi thành công',
        data: exam,
      });
    } catch (error: any) {
      console.error('Update exam with questions error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi server khi cập nhật đề thi',
        error: error.message,
      });
    }
  }

  /**
   * Xóa đề thi
   */
  async deleteExam(req: Request, res: Response) {
    try {
      const id = Number.parseInt(req.params.id, 10);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID đề thi không hợp lệ',
        });
      }

      const deleted = await examService.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đề thi',
        });
      }

      res.json({
        success: true,
        message: 'Xóa đề thi thành công',
      });
    } catch (error: any) {
      console.error('Delete exam error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi xóa đề thi',
        error: error.message,
      });
    }
  }
}

export default new ExamController();

