import { Router } from 'express';
import subjectController from '../controllers/subject.controller';

const router = Router();

/**
 * @swagger
 * /api/subjects:
 *   get:
 *     summary: Lấy tất cả môn học
 *     tags: [Subjects]
 *     responses:
 *       200:
 *         description: Lấy danh sách môn học thành công
 */
router.get('/', subjectController.getAllSubjects.bind(subjectController));

/**
 * @swagger
 * /api/subjects/{id}:
 *   get:
 *     summary: Lấy môn học theo ID
 *     tags: [Subjects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lấy môn học thành công
 */
router.get('/:id', subjectController.getSubjectById.bind(subjectController));

export default router;

