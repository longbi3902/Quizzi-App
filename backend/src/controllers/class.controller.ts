import { Request, Response } from 'express';
import classService from '../services/class.service';
import userService from '../services/user.service';
import classParticipantService from '../services/classParticipant.service';
import { getUserIdFromToken } from '../utils/auth';
import {
  CreateClassDTO,
  UpdateClassDTO,
  ClassWithExams,
} from '../types/class.types';

export class ClassController {
  /**
   * Lấy tất cả lớp học
   */
  async getAllClasses(req: Request, res: Response) {
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
            message: 'Bạn cần đăng nhập để xem danh sách lớp học',
          });
        }
        const search = req.query.search as string | undefined;
        const result = await classService.findAllPaginated(page, limit, userId, search);
        res.json({
          success: true,
          message: 'Lấy danh sách lớp học thành công',
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
            message: 'Bạn cần đăng nhập để xem danh sách lớp học',
          });
        }
        const classes = await classService.findAll(userId);
        res.json({
          success: true,
          message: 'Lấy danh sách lớp học thành công',
          data: classes,
        });
      }
    } catch (error: any) {
      console.error('Get all classes error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy danh sách lớp học',
        error: error.message,
      });
    }
  }

  /**
   * Lấy lớp học theo ID
   * - Giáo viên: chỉ lấy lớp của mình
   * - Học sinh: có thể lấy lớp đã tham gia
   */
  async getClassById(req: Request, res: Response) {
    try {
      const id = Number.parseInt(req.params.id, 10);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID lớp học không hợp lệ',
        });
      }

      const userId = getUserIdFromToken(req);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Bạn cần đăng nhập để xem lớp học',
        });
      }

      // Lấy thông tin user để kiểm tra role
      const user = await userService.findById(userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Không tìm thấy thông tin người dùng',
        });
      }

      let classData: ClassWithExams | null;

      if (user.role === 'teacher') {
        // Giáo viên: chỉ lấy lớp của mình
        classData = await classService.findById(id, userId);
      } else {
        // Học sinh: lấy lớp đã tham gia (không filter theo userId)
        classData = await classService.findByIdForStudent(id);
        
        // Kiểm tra học sinh đã tham gia lớp chưa
        if (classData) {
          const hasParticipated = await classParticipantService.hasParticipated(userId, id);
          if (!hasParticipated) {
            return res.status(403).json({
              success: false,
              message: 'Bạn chưa tham gia lớp học này',
            });
          }
        }
      }

      if (!classData) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy lớp học',
        });
      }

      res.json({
        success: true,
        message: 'Lấy lớp học thành công',
        data: classData,
      });
    } catch (error: any) {
      console.error('Get class by id error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy lớp học',
        error: error.message,
      });
    }
  }

  /**
   * Tạo lớp học mới
   */
  async createClass(req: Request, res: Response) {
    try {
      const classData: CreateClassDTO = req.body;

      // Validation
      if (!classData.name || !classData.password) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền đầy đủ thông tin',
        });
      }

      const userId = getUserIdFromToken(req);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Bạn cần đăng nhập để tạo lớp học',
        });
      }
      const newClass = await classService.create(classData, userId);

      res.status(201).json({
        success: true,
        message: 'Tạo lớp học thành công',
        data: newClass,
      });
    } catch (error: any) {
      console.error('Create class error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi server khi tạo lớp học',
        error: error.message,
      });
    }
  }

  /**
   * Cập nhật lớp học
   */
  async updateClass(req: Request, res: Response) {
    try {
      const id = Number.parseInt(req.params.id, 10);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID lớp học không hợp lệ',
        });
      }

      const classData: UpdateClassDTO = req.body;

      const userId = getUserIdFromToken(req);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Bạn cần đăng nhập để cập nhật lớp học',
        });
      }
      const updatedClass = await classService.update(id, classData, userId);

      res.json({
        success: true,
        message: 'Cập nhật lớp học thành công',
        data: updatedClass,
      });
    } catch (error: any) {
      console.error('Update class error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi server khi cập nhật lớp học',
        error: error.message,
      });
    }
  }

  /**
   * Xác thực mã lớp học và mật khẩu (cho học sinh tham gia)
   */
  async verifyClass(req: Request, res: Response) {
    try {
      const { code, password } = req.body;

      if (!code || !password) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập mã lớp học và mật khẩu',
        });
      }

      const classData = await classService.verifyClass(code, password);

      if (!classData) {
        return res.status(401).json({
          success: false,
          message: 'Mã lớp học hoặc mật khẩu không đúng',
        });
      }

      // Lưu participant nếu có userId từ token
      const userId = getUserIdFromToken(req);
      if (userId) {
        try {
          await classParticipantService.createParticipant(userId, classData.id);
        } catch (error) {
          // Không throw error nếu lưu participant thất bại (có thể đã tham gia rồi)
          console.log('Could not save participant:', error);
        }
      }

      res.json({
        success: true,
        message: 'Xác thực thành công',
        data: classData,
      });
    } catch (error: any) {
      console.error('Verify class error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi server khi xác thực lớp học',
        error: error.message,
      });
    }
  }

  /**
   * Lấy danh sách lớp học đã tham gia của học sinh
   */
  async getParticipatedClasses(req: Request, res: Response) {
    try {
      const userId = getUserIdFromToken(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Không xác thực được người dùng',
        });
      }

      const classes = await classParticipantService.getParticipatedClasses(userId);

      res.json({
        success: true,
        message: 'Lấy danh sách lớp học đã tham gia thành công',
        data: classes,
      });
    } catch (error: any) {
      console.error('Get participated classes error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi server khi lấy danh sách lớp học',
        error: error.message,
      });
    }
  }

  /**
   * Lấy danh sách học sinh trong lớp học
   */
  async getClassParticipants(req: Request, res: Response) {
    try {
      const classId = Number.parseInt(req.params.id, 10);

      if (isNaN(classId)) {
        return res.status(400).json({
          success: false,
          message: 'ID lớp học không hợp lệ',
        });
      }

      const userId = getUserIdFromToken(req);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Bạn cần đăng nhập để xem danh sách học sinh',
        });
      }

      // Kiểm tra quyền sở hữu lớp
      const classData = await classService.findById(classId, userId);
      if (!classData) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xem lớp học này',
        });
      }

      const participants = await classParticipantService.getClassParticipants(classId);

      res.json({
        success: true,
        message: 'Lấy danh sách học sinh thành công',
        data: participants,
      });
    } catch (error: any) {
      console.error('Get class participants error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi server khi lấy danh sách học sinh',
        error: error.message,
      });
    }
  }

  /**
   * Thêm đề thi vào lớp học
   */
  async addExamToClass(req: Request, res: Response) {
    try {
      const classId = Number.parseInt(req.params.id, 10);
      const { examId, startDate, endDate } = req.body;

      if (isNaN(classId) || !examId || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'ID lớp học, ID đề thi, ngày bắt đầu và ngày kết thúc là bắt buộc',
        });
      }

      const userId = getUserIdFromToken(req);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Bạn cần đăng nhập để thêm đề thi',
        });
      }

      await classService.addExamToClass(classId, examId, startDate, endDate, userId);

      const updatedClass = await classService.findById(classId, userId);

      res.json({
        success: true,
        message: 'Thêm đề thi vào lớp học thành công',
        data: updatedClass,
      });
    } catch (error: any) {
      console.error('Add exam to class error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi server khi thêm đề thi',
        error: error.message,
      });
    }
  }

  /**
   * Cập nhật start_date và end_date cho đề thi trong lớp
   */
  async updateExamDatesInClass(req: Request, res: Response) {
    try {
      const classId = Number.parseInt(req.params.id, 10);
      const examId = Number.parseInt(req.params.examId, 10);
      const { startDate, endDate } = req.body;

      if (isNaN(classId) || isNaN(examId) || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'ID lớp học, ID đề thi, ngày bắt đầu và ngày kết thúc là bắt buộc',
        });
      }

      const userId = getUserIdFromToken(req);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Bạn cần đăng nhập để cập nhật thời gian đề thi',
        });
      }

      await classService.updateExamDatesInClass(classId, examId, startDate, endDate, userId);

      const updatedClass = await classService.findById(classId, userId);

      res.json({
        success: true,
        message: 'Cập nhật thời gian đề thi thành công',
        data: updatedClass,
      });
    } catch (error: any) {
      console.error('Update exam dates in class error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi server khi cập nhật thời gian đề thi',
        error: error.message,
      });
    }
  }

  /**
   * Xóa đề thi khỏi lớp học
   */
  async removeExamFromClass(req: Request, res: Response) {
    try {
      const classId = Number.parseInt(req.params.id, 10);
      const examId = Number.parseInt(req.params.examId, 10);

      if (isNaN(classId) || isNaN(examId)) {
        return res.status(400).json({
          success: false,
          message: 'ID lớp học hoặc ID đề thi không hợp lệ',
        });
      }

      const userId = getUserIdFromToken(req);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Bạn cần đăng nhập để xóa đề thi',
        });
      }

      await classService.removeExamFromClass(classId, examId, userId);

      const updatedClass = await classService.findById(classId, userId);

      res.json({
        success: true,
        message: 'Xóa đề thi khỏi lớp học thành công',
        data: updatedClass,
      });
    } catch (error: any) {
      console.error('Remove exam from class error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi server khi xóa đề thi',
        error: error.message,
      });
    }
  }

  /**
   * Xóa lớp học
   */
  async deleteClass(req: Request, res: Response) {
    try {
      const id = Number.parseInt(req.params.id, 10);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID lớp học không hợp lệ',
        });
      }

      const userId = getUserIdFromToken(req);
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Bạn cần đăng nhập để xóa lớp học',
        });
      }
      await classService.delete(id, userId);

      res.json({
        success: true,
        message: 'Xóa lớp học thành công',
      });
    } catch (error: any) {
      console.error('Delete class error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi server khi xóa lớp học',
        error: error.message,
      });
    }
  }
}

export default new ClassController();


