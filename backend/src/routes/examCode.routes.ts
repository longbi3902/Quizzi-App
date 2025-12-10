import { Router } from 'express';
import * as examCodeController from '../controllers/examCode.controller';

const router = Router();

/**
 * @swagger
 * /api/exam-codes/exam/{examId}:
 *   get:
 *     summary: Lấy tất cả mã đề của một đề thi
 *     tags: [Exam Codes]
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lấy danh sách mã đề thành công
 */
router.get('/exam/:examId', examCodeController.getExamCodesByExamId);

/**
 * @swagger
 * /api/exam-codes/{id}:
 *   get:
 *     summary: Lấy chi tiết mã đề theo ID
 *     tags: [Exam Codes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lấy chi tiết mã đề thành công
 */
router.get('/:id', examCodeController.getExamCodeById);

export default router;

