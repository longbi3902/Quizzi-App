import { Router } from 'express';
import examRoomController from '../controllers/examRoom.controller';

const router = Router();

/**
 * @swagger
 * /api/exam-rooms:
 *   get:
 *     summary: Lấy tất cả phòng thi
 *     tags: [Exam Rooms]
 *     responses:
 *       200:
 *         description: Lấy danh sách phòng thi thành công
 */
router.get('/', examRoomController.getAllExamRooms.bind(examRoomController));

/**
 * @swagger
 * /api/exam-rooms/verify:
 *   post:
 *     summary: Xác thực mã phòng thi và mật khẩu (cho học sinh)
 *     tags: [Exam Rooms]
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
 *         description: Mã phòng thi hoặc mật khẩu không đúng
 */
router.post('/verify', examRoomController.verifyExamRoom.bind(examRoomController));

/**
 * @swagger
 * /api/exam-rooms/participated:
 *   get:
 *     summary: Lấy danh sách phòng thi đã tham gia của học sinh
 *     tags: [Exam Rooms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách phòng thi đã tham gia thành công
 *       401:
 *         description: Không xác thực được người dùng
 */
router.get('/participated', examRoomController.getParticipatedRooms.bind(examRoomController));

/**
 * @swagger
 * /api/exam-rooms/{id}:
 *   get:
 *     summary: Lấy phòng thi theo ID
 *     tags: [Exam Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lấy phòng thi thành công
 */
router.get('/:id', examRoomController.getExamRoomById.bind(examRoomController));

/**
 * @swagger
 * /api/exam-rooms:
 *   post:
 *     summary: Tạo phòng thi mới
 *     tags: [Exam Rooms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExamRoomDTO'
 *     responses:
 *       201:
 *         description: Tạo phòng thi thành công
 */
router.post('/', examRoomController.createExamRoom.bind(examRoomController));

/**
 * @swagger
 * /api/exam-rooms/{id}:
 *   put:
 *     summary: Cập nhật phòng thi
 *     tags: [Exam Rooms]
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
 *             $ref: '#/components/schemas/UpdateExamRoomDTO'
 *     responses:
 *       200:
 *         description: Cập nhật phòng thi thành công
 */
router.put('/:id', examRoomController.updateExamRoom.bind(examRoomController));

/**
 * @swagger
 * /api/exam-rooms/{id}:
 *   delete:
 *     summary: Xóa phòng thi
 *     tags: [Exam Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Xóa phòng thi thành công
 */
router.delete('/:id', examRoomController.deleteExamRoom.bind(examRoomController));

export default router;

