import { Request, Response } from 'express';
import examCodeService from '../services/examCode.service';

/**
 * Lấy tất cả mã đề của một đề thi
 */
export const getExamCodesByExamId = async (req: Request, res: Response) => {
  try {
    const examId = Number.parseInt(req.params.examId, 10);

    if (isNaN(examId)) {
      return res.status(400).json({
        success: false,
        message: 'ID đề thi không hợp lệ',
      });
    }

    const examCodes = await examCodeService.findByExamId(examId);

    return res.status(200).json({
      success: true,
      data: examCodes,
    });
  } catch (error: any) {
    console.error('Error getting exam codes:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách mã đề',
    });
  }
};

/**
 * Lấy chi tiết mã đề theo ID
 */
export const getExamCodeById = async (req: Request, res: Response) => {
  try {
    const id = Number.parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID mã đề không hợp lệ',
      });
    }

    const examCode = await examCodeService.findById(id);

    if (!examCode) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy mã đề',
      });
    }

    return res.status(200).json({
      success: true,
      data: examCode,
    });
  } catch (error: any) {
    console.error('Error getting exam code:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy chi tiết mã đề',
    });
  }
};




