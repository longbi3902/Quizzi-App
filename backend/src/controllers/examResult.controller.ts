import { Request, Response } from 'express';
import examResultService from '../services/examResult.service';
import { getUserIdFromToken } from '../utils/auth';
import { SubmitExamDTO } from '../types/examResult.types';

export class ExamResultController {
  /**
   * Bắt đầu làm bài thi
   */
  async startExam(req: Request, res: Response) {
    try {
      const userId = getUserIdFromToken(req);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Không xác thực được người dùng',
        });
      }

      const examRoomId = Number.parseInt(req.params.examRoomId, 10);
      if (isNaN(examRoomId)) {
        return res.status(400).json({
          success: false,
          message: 'ID phòng thi không hợp lệ',
        });
      }

      const startExamData = await examResultService.startExam(userId, examRoomId);

      res.json({
        success: true,
        message: 'Bắt đầu làm bài thi thành công',
        data: startExamData,
      });
    } catch (error: any) {
      console.error('Start exam error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi server khi bắt đầu làm bài thi',
        error: error.message,
      });
    }
  }

  /**
   * Nộp bài thi
   */
  async submitExam(req: Request, res: Response) {
    try {
      const userId = getUserIdFromToken(req);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Không xác thực được người dùng',
        });
      }

      const submitData: SubmitExamDTO = req.body;

      if (!submitData.examRoomId || !submitData.answers) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp đầy đủ thông tin',
        });
      }

      const result = await examResultService.submitExam(userId, submitData);

      res.json({
        success: true,
        message: 'Nộp bài thi thành công',
        data: result,
      });
    } catch (error: any) {
      console.error('Submit exam error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi server khi nộp bài thi',
        error: error.message,
      });
    }
  }

  /**
   * Lấy kết quả làm bài của học sinh trong phòng thi
   */
  async getResultByRoom(req: Request, res: Response) {
    try {
      const userId = getUserIdFromToken(req);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Không xác thực được người dùng',
        });
      }

      const examRoomId = Number.parseInt(req.params.examRoomId, 10);
      if (isNaN(examRoomId)) {
        return res.status(400).json({
          success: false,
          message: 'ID phòng thi không hợp lệ',
        });
      }

      const result = await examResultService.findByUserAndRoom(userId, examRoomId);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy kết quả làm bài',
        });
      }

      res.json({
        success: true,
        message: 'Lấy kết quả làm bài thành công',
        data: result,
      });
    } catch (error: any) {
      console.error('Get result error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi server khi lấy kết quả làm bài',
        error: error.message,
      });
    }
  }

  /**
   * Lấy lịch sử làm bài của học sinh
   */
  async getHistory(req: Request, res: Response) {
    try {
      const userId = getUserIdFromToken(req);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Không xác thực được người dùng',
        });
      }

      const history = await examResultService.getHistoryByUser(userId);

      res.json({
        success: true,
        message: 'Lấy lịch sử làm bài thành công',
        data: history,
      });
    } catch (error: any) {
      console.error('Get history error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi server khi lấy lịch sử làm bài',
        error: error.message,
      });
    }
  }

  /**
   * Lấy lịch sử thi của tất cả học sinh trong phòng thi (cho giáo viên)
   */
  async getResultsByRoom(req: Request, res: Response) {
    try {
      const examRoomId = Number.parseInt(req.params.examRoomId, 10);
      if (isNaN(examRoomId)) {
        return res.status(400).json({
          success: false,
          message: 'ID phòng thi không hợp lệ',
        });
      }

      // Lấy query parameters
      const studentName = (req.query.studentName as string) || '';
      const scoreSort = (req.query.scoreSort as 'asc' | 'desc' | 'none') || 'none';
      const durationSort = (req.query.durationSort as 'asc' | 'desc' | 'none') || 'none';
      const page = Number.parseInt(req.query.page as string, 10) || 1;
      const limit = Number.parseInt(req.query.limit as string, 10) || 10;

      const result = await examResultService.getResultsByRoom(examRoomId, {
        studentName,
        scoreSort,
        durationSort,
        page,
        limit,
      });

      res.json({
        success: true,
        message: 'Lấy lịch sử thi thành công',
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error: any) {
      console.error('Get results by room error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi server khi lấy lịch sử thi',
        error: error.message,
      });
    }
  }

  /**
   * Lấy chi tiết bài làm của học sinh (cho giáo viên)
   */
  async getResultDetailForTeacher(req: Request, res: Response) {
    try {
      const resultId = Number.parseInt(req.params.resultId, 10);
      if (isNaN(resultId)) {
        return res.status(400).json({
          success: false,
          message: 'ID kết quả không hợp lệ',
        });
      }

      const result = await examResultService.getResultDetailForTeacher(resultId);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy kết quả bài thi',
        });
      }

      res.json({
        success: true,
        message: 'Lấy chi tiết bài làm thành công',
        data: result,
      });
    } catch (error: any) {
      console.error('Get result detail for teacher error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi server khi lấy chi tiết bài làm',
        error: error.message,
      });
    }
  }
}

export default new ExamResultController();

