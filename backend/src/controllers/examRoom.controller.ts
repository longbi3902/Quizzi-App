import { Request, Response } from 'express';
import examRoomService from '../services/examRoom.service';
import examRoomParticipantService from '../services/examRoomParticipant.service';
import { getUserIdFromToken } from '../utils/auth';
import {
  CreateExamRoomDTO,
  UpdateExamRoomDTO,
} from '../types/examRoom.types';

export class ExamRoomController {
  /**
   * Lấy tất cả phòng thi
   */
  async getAllExamRooms(req: Request, res: Response) {
    try {
      // Kiểm tra có query params cho pagination không
      const page = req.query.page ? Number.parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? Number.parseInt(req.query.limit as string, 10) : undefined;

      if (page !== undefined && limit !== undefined) {
        // Sử dụng pagination
        const userId = getUserIdFromToken(req);
        if (!userId) {
          return res.status(401).json({
            success: false,
            message: 'Bạn cần đăng nhập để xem danh sách phòng thi',
          });
        }
        const result = await examRoomService.findAllPaginated(page, limit, userId);
        res.json({
          success: true,
          message: 'Lấy danh sách phòng thi thành công',
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
            message: 'Bạn cần đăng nhập để xem danh sách phòng thi',
          });
        }
        const examRooms = await examRoomService.findAll(userId);
        res.json({
          success: true,
          message: 'Lấy danh sách phòng thi thành công',
          data: examRooms,
        });
      }
    } catch (error: any) {
      console.error('Get all exam rooms error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy danh sách phòng thi',
        error: error.message,
      });
    }
  }

  /**
   * Lấy phòng thi theo ID
   */
  async getExamRoomById(req: Request, res: Response) {
    try {
      const id = Number.parseInt(req.params.id, 10);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID phòng thi không hợp lệ',
        });
      }

      const userId = getUserIdFromToken(req);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Bạn cần đăng nhập để xem phòng thi',
        });
      }
      const examRoom = await examRoomService.findById(id, userId);

      if (!examRoom) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy phòng thi',
        });
      }

      res.json({
        success: true,
        message: 'Lấy phòng thi thành công',
        data: examRoom,
      });
    } catch (error: any) {
      console.error('Get exam room by id error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy phòng thi',
        error: error.message,
      });
    }
  }

  /**
   * Tạo phòng thi mới
   */
  async createExamRoom(req: Request, res: Response) {
    try {
      const examRoomData: CreateExamRoomDTO = req.body;

      // Validation
      if (!examRoomData.name || !examRoomData.password || !examRoomData.examId) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền đầy đủ thông tin',
        });
      }

      const userId = getUserIdFromToken(req);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Bạn cần đăng nhập để tạo phòng thi',
        });
      }
      const examRoom = await examRoomService.create(examRoomData, userId);

      res.status(201).json({
        success: true,
        message: 'Tạo phòng thi thành công',
        data: examRoom,
      });
    } catch (error: any) {
      console.error('Create exam room error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi server khi tạo phòng thi',
        error: error.message,
      });
    }
  }

  /**
   * Cập nhật phòng thi
   */
  async updateExamRoom(req: Request, res: Response) {
    try {
      const id = Number.parseInt(req.params.id, 10);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID phòng thi không hợp lệ',
        });
      }

      const examRoomData: UpdateExamRoomDTO = req.body;

      const userId = getUserIdFromToken(req);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Bạn cần đăng nhập để cập nhật phòng thi',
        });
      }
      const examRoom = await examRoomService.update(id, examRoomData, userId);

      res.json({
        success: true,
        message: 'Cập nhật phòng thi thành công',
        data: examRoom,
      });
    } catch (error: any) {
      console.error('Update exam room error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi server khi cập nhật phòng thi',
        error: error.message,
      });
    }
  }

  /**
   * Xác thực mã phòng thi và mật khẩu (cho học sinh tham gia)
   */
  async verifyExamRoom(req: Request, res: Response) {
    try {
      const { code, password } = req.body;

      if (!code || !password) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập mã phòng thi và mật khẩu',
        });
      }

      const examRoom = await examRoomService.verifyRoom(code, password);

      if (!examRoom) {
        return res.status(401).json({
          success: false,
          message: 'Mã phòng thi hoặc mật khẩu không đúng',
        });
      }

      // Lưu participant nếu có userId từ token
      const userId = getUserIdFromToken(req);
      if (userId) {
        try {
          await examRoomParticipantService.createParticipant(userId, examRoom.id);
        } catch (error) {
          // Không throw error nếu lưu participant thất bại (có thể đã tham gia rồi)
          console.log('Could not save participant:', error);
        }
      }

      res.json({
        success: true,
        message: 'Xác thực thành công',
        data: examRoom,
      });
    } catch (error: any) {
      console.error('Verify exam room error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi server khi xác thực phòng thi',
        error: error.message,
      });
    }
  }

  /**
   * Lấy danh sách phòng thi đã tham gia của học sinh
   */
  async getParticipatedRooms(req: Request, res: Response) {
    try {
      const userId = getUserIdFromToken(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Không xác thực được người dùng',
        });
      }

      const examRooms = await examRoomParticipantService.getParticipatedRooms(userId);

      res.json({
        success: true,
        message: 'Lấy danh sách phòng thi đã tham gia thành công',
        data: examRooms,
      });
    } catch (error: any) {
      console.error('Get participated rooms error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi server khi lấy danh sách phòng thi',
        error: error.message,
      });
    }
  }

  /**
   * Xóa phòng thi
   */
  async deleteExamRoom(req: Request, res: Response) {
    try {
      const id = Number.parseInt(req.params.id, 10);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID phòng thi không hợp lệ',
        });
      }

      const userId = getUserIdFromToken(req);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Bạn cần đăng nhập để xóa phòng thi',
        });
      }
      await examRoomService.delete(id, userId);

      res.json({
        success: true,
        message: 'Xóa phòng thi thành công',
      });
    } catch (error: any) {
      console.error('Delete exam room error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi server khi xóa phòng thi',
        error: error.message,
      });
    }
  }
}

export default new ExamRoomController();

