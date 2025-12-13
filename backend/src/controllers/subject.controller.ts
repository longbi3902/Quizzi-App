import { Request, Response } from 'express';
import subjectService from '../services/subject.service';

export class SubjectController {
  /**
   * Lấy tất cả môn học
   */
  async getAllSubjects(req: Request, res: Response) {
    try {
      const subjects = await subjectService.findAll();
      res.json({
        success: true,
        message: 'Lấy danh sách môn học thành công',
        data: subjects,
      });
    } catch (error: any) {
      console.error('Get all subjects error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy danh sách môn học',
        error: error.message,
      });
    }
  }

  /**
   * Lấy môn học theo ID
   */
  async getSubjectById(req: Request, res: Response) {
    try {
      const id = Number.parseInt(req.params.id, 10);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID môn học không hợp lệ',
        });
      }

      const subject = await subjectService.findById(id);

      if (!subject) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy môn học',
        });
      }

      res.json({
        success: true,
        message: 'Lấy môn học thành công',
        data: subject,
      });
    } catch (error: any) {
      console.error('Get subject by id error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy môn học',
        error: error.message,
      });
    }
  }
}

export default new SubjectController();



