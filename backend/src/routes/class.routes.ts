import { Router } from 'express';
import classController from '../controllers/class.controller';

const router = Router();

/**
 * @swagger
 * /api/classes:
 *   get:
 *     summary: Lấy tất cả lớp học
 *     tags: [Classes]
 *     responses:
 *       200:
 *         description: Lấy danh sách lớp học thành công
 */
router.get('/', classController.getAllClasses.bind(classController));

/**
 * @swagger
 * /api/classes/verify:
 *   post:
 *     summary: Xác thực mã lớp học và mật khẩu (cho học sinh)
 *     tags: [Classes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - password
 *             properties:
 *               code:
 *                 type: string
 *                 example: "ABC123"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Xác thực thành công
 *       401:
 *         description: Mã lớp học hoặc mật khẩu không đúng
 */
router.post('/verify', classController.verifyClass.bind(classController));

/**
 * @swagger
 * /api/classes/participated:
 *   get:
 *     summary: Lấy danh sách lớp học đã tham gia của học sinh
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách lớp học đã tham gia thành công
 *       401:
 *         description: Không xác thực được người dùng
 */
router.get('/participated', classController.getParticipatedClasses.bind(classController));

/**
 * @swagger
 * /api/classes/{id}/participants:
 *   get:
 *     summary: Lấy danh sách học sinh trong lớp học
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lấy danh sách học sinh thành công
 */
router.get('/:id/participants', classController.getClassParticipants.bind(classController));

/**
 * @swagger
 * /api/classes/{id}/exams:
 *   post:
 *     summary: Thêm đề thi vào lớp học
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - examId
 *               - startDate
 *               - endDate
 *             properties:
 *               examId:
 *                 type: integer
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Thêm đề thi thành công
 */
router.post('/:id/exams', classController.addExamToClass.bind(classController));

/**
 * @swagger
 * /api/classes/{id}/exams/{examId}:
 *   put:
 *     summary: Cập nhật thời gian (start_date, end_date) cho đề thi trong lớp
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startDate
 *               - endDate
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Cập nhật thời gian đề thi thành công
 */
router.put('/:id/exams/:examId', classController.updateExamDatesInClass.bind(classController));

/**
 * @swagger
 * /api/classes/{id}/exams/{examId}:
 *   delete:
 *     summary: Xóa đề thi khỏi lớp học
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *         description: Xóa đề thi thành công
 */
router.delete('/:id/exams/:examId', classController.removeExamFromClass.bind(classController));

/**
 * @swagger
 * /api/classes/{id}:
 *   get:
 *     summary: Lấy lớp học theo ID
 *     tags: [Classes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lấy lớp học thành công
 */
router.get('/:id', classController.getClassById.bind(classController));

/**
 * @swagger
 * /api/classes:
 *   post:
 *     summary: Tạo lớp học mới
 *     tags: [Classes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateClassDTO'
 *     responses:
 *       201:
 *         description: Tạo lớp học thành công
 */
router.post('/', classController.createClass.bind(classController));

/**
 * @swagger
 * /api/classes/{id}:
 *   put:
 *     summary: Cập nhật lớp học
 *     tags: [Classes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateClassDTO'
 *     responses:
 *       200:
 *         description: Cập nhật lớp học thành công
 */
router.put('/:id', classController.updateClass.bind(classController));

/**
 * @swagger
 * /api/classes/{id}:
 *   delete:
 *     summary: Xóa lớp học
 *     tags: [Classes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Xóa lớp học thành công
 */
router.delete('/:id', classController.deleteClass.bind(classController));

export default router;


