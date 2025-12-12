import { Router } from 'express';
import questionController from '../controllers/question.controller';

const router = Router();

/**
 * @swagger
 * /api/questions:
 *   get:
 *     summary: Lấy tất cả câu hỏi
 *     tags: [Questions]
 *     responses:
 *       200:
 *         description: Lấy danh sách câu hỏi thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/QuestionWithAnswers'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', questionController.getAllQuestions.bind(questionController));

/**
 * @swagger
 * /api/questions/{id}:
 *   get:
 *     summary: Lấy câu hỏi theo ID
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của câu hỏi
 *     responses:
 *       200:
 *         description: Lấy câu hỏi thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/QuestionWithAnswers'
 *       404:
 *         description: Không tìm thấy câu hỏi
 *       500:
 *         description: Lỗi server
 */
router.get('/:id', questionController.getQuestionById.bind(questionController));

/**
 * @swagger
 * /api/questions:
 *   post:
 *     summary: Tạo câu hỏi mới
 *     tags: [Questions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateQuestionDTO'
 *           example:
 *             content: "Câu hỏi mẫu?"
 *             image: "https://example.com/image.jpg"
 *             answers:
 *               - content: "Đáp án 1"
 *                 isTrue: true
 *               - content: "Đáp án 2"
 *                 isTrue: false
 *               - content: "Đáp án 3"
 *                 isTrue: false
 *     responses:
 *       201:
 *         description: Tạo câu hỏi thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/QuestionWithAnswers'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       500:
 *         description: Lỗi server
 */
router.post('/', questionController.createQuestion.bind(questionController));

/**
 * @swagger
 * /api/questions/{id}:
 *   put:
 *     summary: Cập nhật câu hỏi
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của câu hỏi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateQuestionDTO'
 *     responses:
 *       200:
 *         description: Cập nhật câu hỏi thành công
 *       404:
 *         description: Không tìm thấy câu hỏi
 *       500:
 *         description: Lỗi server
 */
router.put('/:id', questionController.updateQuestion.bind(questionController));

/**
 * @swagger
 * /api/questions/{id}:
 *   delete:
 *     summary: Xóa câu hỏi
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của câu hỏi
 *     responses:
 *       200:
 *         description: Xóa câu hỏi thành công
 *       404:
 *         description: Không tìm thấy câu hỏi
 *       500:
 *         description: Lỗi server
 */
router.delete('/:id', questionController.deleteQuestion.bind(questionController));

/**
 * @swagger
 * /api/questions/answers/{answerId}:
 *   put:
 *     summary: Cập nhật đáp án
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: answerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của đáp án
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAnswerDTO'
 *     responses:
 *       200:
 *         description: Cập nhật đáp án thành công
 *       404:
 *         description: Không tìm thấy đáp án
 *       500:
 *         description: Lỗi server
 */
router.put('/answers/:answerId', questionController.updateAnswer.bind(questionController));

/**
 * @swagger
 * /api/questions/answers/{answerId}:
 *   delete:
 *     summary: Xóa đáp án
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: answerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của đáp án
 *     responses:
 *       200:
 *         description: Xóa đáp án thành công
 *       404:
 *         description: Không tìm thấy đáp án
 *       500:
 *         description: Lỗi server
 */
router.delete('/answers/:answerId', questionController.deleteAnswer.bind(questionController));

export default router;




