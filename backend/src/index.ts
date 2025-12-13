import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { testConnection } from './config/database';
import authRoutes from './routes/auth.routes';
import questionRoutes from './routes/question.routes';
import examRoutes from './routes/exam.routes';
import examCodeRoutes from './routes/examCode.routes';
import examResultRoutes from './routes/examResult.routes';
import subjectRoutes from './routes/subject.routes';
import classRoutes from './routes/class.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Quizzi App API Documentation',
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/exam-codes', examCodeRoutes);
app.use('/api/exam-results', examResultRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/classes', classRoutes);

// Health check
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server is running!
 */
app.get('/api/health', (req: express.Request, res: express.Response) => {
  res.json({ message: 'Server is running!' });
});

// Khởi động server
const startServer = async () => {
  try {
    // Test kết nối database
    await testConnection();
    
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`📖 Swagger documentation available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

