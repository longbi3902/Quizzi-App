import { Router } from 'express';
import examResultController from '../controllers/examResult.controller';

const router = Router();

/**
 * @swagger
 * /api/exam-results/start/class/{classId}/exam/{examId}:
 *   post:
 *     summary: Bắt đầu làm bài thi (logic mới theo lớp và đề thi)
 *     tags: [Exam Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Bắt đầu làm bài thi thành công
 */
router.post('/start/class/:classId/exam/:examId', examResultController.startExam.bind(examResultController));


/**
 * @swagger
 * /api/exam-results/submit:
 *   post:
 *     summary: Nộp bài thi
 *     tags: [Exam Results]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - classId
 *               - examId
 *               - answers
 *             properties:
 *               classId:
 *                 type: integer
 *               examId:
 *                 type: integer
 *               examCodeId:
 *                 type: integer
 *                 nullable: true
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: integer
 *                     answerIds:
 *                       type: array
 *                       items:
 *                         type: integer
 *     responses:
 *       200:
 *         description: Nộp bài thi thành công
 */
router.post('/submit', examResultController.submitExam.bind(examResultController));

/**
 * @swagger
 * /api/exam-results/class/{classId}/exam/{examId}:
 *   get:
 *     summary: Lấy kết quả làm bài trong lớp và đề thi (cho học sinh)
 *     tags: [Exam Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lấy kết quả làm bài thành công
 */
router.get('/class/:classId/exam/:examId', examResultController.getResultByClassAndExam.bind(examResultController));

/**
 * @swagger
 * /api/exam-results/class/{classId}/exam/{examId}/all:
 *   get:
 *     summary: Lấy lịch sử thi của tất cả học sinh trong lớp và đề thi (cho giáo viên)
 *     tags: [Exam Results]
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lấy lịch sử thi thành công
 */
router.get('/class/:classId/exam/:examId/all', examResultController.getResultsByClassAndExam.bind(examResultController));

/**
 * @swagger
 * /api/exam-results/history:
 *   get:
 *     summary: Lấy lịch sử làm bài của học sinh
 *     tags: [Exam Results]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy lịch sử làm bài thành công
 */
router.get('/history', examResultController.getHistory.bind(examResultController));


/**
 * @swagger
 * /api/exam-results/detail/{resultId}:
 *   get:
 *     summary: Lấy chi tiết bài làm của học sinh (cho giáo viên)
 *     tags: [Exam Results]
 *     parameters:
 *       - in: path
 *         name: resultId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lấy chi tiết bài làm thành công
 */
router.get('/detail/:resultId', examResultController.getResultDetailForTeacher.bind(examResultController));

export default router;

