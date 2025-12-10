import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Quizzi App API',
    version: '1.0.0',
    description: 'API documentation cho ứng dụng thi trắc nghiệm Quizzi App',
    contact: {
      name: 'Quizzi App Support',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1,
          },
          name: {
            type: 'string',
            example: 'Nguyễn Văn A',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          role: {
            type: 'string',
            enum: ['teacher', 'student'],
            example: 'teacher',
          },
          birthYear: {
            type: 'integer',
            example: 1990,
          },
          className: {
            type: 'string',
            example: '12A1',
          },
          school: {
            type: 'string',
            example: 'Trường THPT ABC',
          },
          phone: {
            type: 'string',
            example: '0123456789',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      RegisterDTO: {
        type: 'object',
        required: ['name', 'email', 'password', 'role', 'school'],
        properties: {
          name: {
            type: 'string',
            description: 'Tên người dùng (bắt buộc)',
            example: 'Nguyễn Văn A',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Email (bắt buộc)',
            example: 'user@example.com',
          },
          password: {
            type: 'string',
            format: 'password',
            description: 'Mật khẩu (bắt buộc, tối thiểu 6 ký tự)',
            example: '123456',
          },
          role: {
            type: 'string',
            enum: ['teacher', 'student'],
            description: 'Vai trò: teacher hoặc student (bắt buộc)',
            example: 'teacher',
          },
          birthYear: {
            type: 'integer',
            description: 'Năm sinh (không bắt buộc)',
            example: 1990,
          },
          className: {
            type: 'string',
            description: 'Lớp (không bắt buộc)',
            example: '12A1',
          },
          school: {
            type: 'string',
            description: 'Trường (bắt buộc)',
            example: 'Trường THPT ABC',
          },
          phone: {
            type: 'string',
            description: 'Số điện thoại (không bắt buộc)',
            example: '0123456789',
          },
        },
      },
      LoginDTO: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          password: {
            type: 'string',
            format: 'password',
            example: '123456',
          },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Đăng ký thành công',
          },
          data: {
            type: 'object',
            properties: {
              user: {
                $ref: '#/components/schemas/User',
              },
              token: {
                type: 'string',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              },
            },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'Lỗi xảy ra',
          },
          error: {
            type: 'string',
            example: 'Chi tiết lỗi',
          },
        },
      },
      Answer: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1,
          },
          content: {
            type: 'string',
            example: 'Đáp án A',
          },
          isTrue: {
            type: 'boolean',
            example: true,
          },
          questionId: {
            type: 'integer',
            example: 1,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Question: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1,
          },
          content: {
            type: 'string',
            example: 'Câu hỏi mẫu?',
          },
          image: {
            type: 'string',
            example: 'https://example.com/image.jpg',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      QuestionWithAnswers: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1,
          },
          content: {
            type: 'string',
            example: 'Câu hỏi mẫu?',
          },
          image: {
            type: 'string',
            example: 'https://example.com/image.jpg',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          answers: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Answer',
            },
          },
        },
      },
      CreateAnswerDTO: {
        type: 'object',
        required: ['content', 'isTrue'],
        properties: {
          content: {
            type: 'string',
            description: 'Nội dung đáp án (bắt buộc)',
            example: 'Đáp án A',
          },
          isTrue: {
            type: 'boolean',
            description: 'True nếu là đáp án đúng, false nếu là đáp án sai',
            example: true,
          },
        },
      },
      CreateQuestionDTO: {
        type: 'object',
        required: ['content', 'answers'],
        properties: {
          content: {
            type: 'string',
            description: 'Nội dung câu hỏi (bắt buộc)',
            example: 'Câu hỏi mẫu?',
          },
          image: {
            type: 'string',
            description: 'URL ảnh (không bắt buộc)',
            example: 'https://example.com/image.jpg',
          },
          answers: {
            type: 'array',
            description: 'Danh sách đáp án (tối thiểu 2 đáp án, phải có ít nhất 1 đáp án đúng)',
            minItems: 2,
            items: {
              $ref: '#/components/schemas/CreateAnswerDTO',
            },
          },
        },
      },
      UpdateQuestionDTO: {
        type: 'object',
        properties: {
          content: {
            type: 'string',
            example: 'Câu hỏi đã cập nhật?',
          },
          image: {
            type: 'string',
            example: 'https://example.com/new-image.jpg',
          },
        },
      },
      UpdateAnswerDTO: {
        type: 'object',
        properties: {
          content: {
            type: 'string',
            example: 'Đáp án đã cập nhật',
          },
          isTrue: {
            type: 'boolean',
            example: false,
          },
        },
      },
    },
  },
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Paths to files containing OpenAPI definitions
};

export const swaggerSpec = swaggerJsdoc(options);

