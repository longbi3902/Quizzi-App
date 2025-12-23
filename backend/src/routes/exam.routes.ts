import { Router } from 'express';
import examController from '../controllers/exam.controller';

const router = Router();

/**
 * @swagger
 * /api/exams:
 *   get:
 *     summary: Lấy tất cả đề thi
 *     tags: [Exams]
 *     responses:
 *       200:
 *         description: Lấy danh sách đề thi thành công
 */
router.get('/', examController.getAllExams.bind(examController));

/**
 * @swagger
 * /api/exams/{id}:
 *   get:
 *     summary: Lấy đề thi theo ID
 *     tags: [Exams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lấy đề thi thành công
 */
router.get('/:id', examController.getExamById.bind(examController));

/**
 * @swagger
 * /api/exams/{id}/status:
 *   get:
 *     summary: Lấy trạng thái đề thi (có mã đề chưa, có học sinh làm bài chưa)
 *     tags: [Exams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lấy trạng thái đề thi thành công
 */
router.get('/:id/status', examController.getExamStatus.bind(examController));

/**
 * @swagger
 * /api/exams:
 *   post:
 *     summary: Tạo đề thi tự chọn
 *     tags: [Exams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExamDTO'
 *     responses:
 *       201:
 *         description: Tạo đề thi thành công
 */
router.post('/', examController.createExam.bind(examController));

/**
 * @swagger
 * /api/exams/random:
 *   post:
 *     summary: Tạo đề thi random
 *     tags: [Exams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExamRandomDTO'
 *     responses:
 *       201:
 *         description: Tạo đề thi random thành công
 */
router.post('/random', examController.createRandomExam.bind(examController));

/**
 * @swagger
 * /api/exams/{id}:
 *   put:
 *     summary: Cập nhật đề thi (chỉ thông tin cơ bản)
 *     tags: [Exams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cập nhật đề thi thành công
 */
router.put('/:id', examController.updateExam.bind(examController));

/**
 * @swagger
 * /api/exams/{id}/questions:
 *   put:
 *     summary: Cập nhật đề thi kèm câu hỏi
 *     tags: [Exams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cập nhật đề thi thành công
 */
router.put('/:id/questions', examController.updateExamWithQuestions.bind(examController));

/**
 * @swagger
 * /api/exams/{id}:
 *   delete:
 *     summary: Xóa đề thi
 *     tags: [Exams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Xóa đề thi thành công
 */
router.delete('/:id', examController.deleteExam.bind(examController));

export default router;

