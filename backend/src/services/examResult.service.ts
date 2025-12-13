import {
  ExamResult,
  StudentAnswer,
  CorrectAnswer,
  StartExamResponse,
  ExamQuestionForTaking,
  SubmitExamDTO,
  ExamResultWithDetails,
} from '../types/examResult.types';
import { query } from '../config/database';
import classService from './class.service';
import examCodeService from './examCode.service';
import examService from './exam.service';
import questionService from './question.service';

interface ExamResultRow {
  id: number;
  user_id: number;
  class_id: number | null;
  exam_code_id: number | null;
  exam_id: number;
  started_at: Date;
  submitted_at: Date | null;
  score: number;
  max_score: number;
  answers: string; // JSON string
  correct_answers: string | null; // JSON string
  exam_code?: string | null; // Mã đề (khi JOIN)
}

export class ExamResultService {
  /**
   * Bắt đầu làm bài thi
   * Random mã đề (nếu có) hoặc lấy đề gốc
   * Logic mới: Nhận classId và examId (vì trong lớp có nhiều đề thi)
   */
  async startExam(userId: number, classId: number, examId: number): Promise<StartExamResponse> {
    try {
      // Kiểm tra đã làm bài chưa (theo classId và examId)
      const existingResult = await this.findByUserAndClassAndExam(userId, classId, examId);
      if (existingResult) {
        throw new Error('Bạn đã làm bài thi này rồi');
      }

      // Lấy thông tin lớp học
      const classData = await classService.findByIdForStudent(classId);
      if (!classData) {
        throw new Error('Lớp học không tồn tại');
      }

      // Kiểm tra đề thi có trong lớp không
      const examInClass = classData.exams.find(e => e.id === examId);
      if (!examInClass) {
        throw new Error('Đề thi không có trong lớp học này');
      }

      // Kiểm tra thời gian cho phép thi
      const now = new Date();
      const startDate = new Date(examInClass.startDate);
      const endDate = new Date(examInClass.endDate);

      if (now < startDate) {
        throw new Error('Chưa đến thời gian bắt đầu thi');
      }

      if (now > endDate) {
        throw new Error('Đã hết thời gian thi');
      }

      const exam = examInClass;
      let examCodeId: number | null = null;
      let examCode: string | null = null;
      let questionOrder: number[] = [];

      // Kiểm tra xem đề có mã đề không
      const examCodes = await examCodeService.findByExamId(exam.id);
      
      if (examCodes.length > 0) {
        // Random một mã đề
        const randomIndex = Math.floor(Math.random() * examCodes.length);
        const selectedExamCode = examCodes[randomIndex];
        examCodeId = selectedExamCode.id;
        examCode = selectedExamCode.code;
        questionOrder = selectedExamCode.questionOrder;
      }

      // Lấy câu hỏi theo thứ tự
      const questionsForTaking: ExamQuestionForTaking[] = [];
      
      if (questionOrder.length > 0) {
        // Có mã đề, lấy câu hỏi theo thứ tự đã đảo
        for (let i = 0; i < questionOrder.length; i++) {
          const questionId = questionOrder[i];
          const examQuestion = exam.questions.find((eq) => eq.questionId === questionId);
          if (examQuestion && examQuestion.question) {
            const question = examQuestion.question;
            // Xác định type dựa trên số lượng đáp án đúng
            const correctAnswersCount = question.answers.filter((a) => a.isTrue).length;
            const questionType = correctAnswersCount > 1 ? 'multiple' : 'single';
            
            questionsForTaking.push({
              id: examQuestion.id,
              questionId: question.id,
              score: examQuestion.score,
              orderIndex: i + 1,
              question: {
                id: question.id,
                content: question.content,
                type: questionType,
                answers: question.answers.map((answer) => ({
                  id: answer.id,
                  content: answer.content,
                  isCorrect: false, // Không gửi đáp án đúng khi đang thi
                })),
              },
            });
          }
        }
      } else {
        // Không có mã đề, lấy câu hỏi theo thứ tự gốc
        for (const examQuestion of exam.questions) {
          if (examQuestion.question) {
            const question = examQuestion.question;
            // Xác định type dựa trên số lượng đáp án đúng
            const correctAnswersCount = question.answers.filter((a) => a.isTrue).length;
            const questionType = correctAnswersCount > 1 ? 'multiple' : 'single';
            
            questionsForTaking.push({
              id: examQuestion.id,
              questionId: question.id,
              score: examQuestion.score,
              orderIndex: examQuestion.orderIndex,
              question: {
                id: question.id,
                content: question.content,
                type: questionType,
                answers: question.answers.map((answer) => ({
                  id: answer.id,
                  content: answer.content,
                  isCorrect: false, // Không gửi đáp án đúng khi đang thi
                })),
              },
            });
          }
        }
      }

      // Tạo record exam_result với trạng thái đang làm
      const startTime = new Date();
      await query(
        `INSERT INTO exam_results (user_id, exam_room_id, class_id, exam_code_id, exam_id, started_at, max_score, answers)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          null, // exam_room_id deprecated, set NULL
          classId,
          examCodeId,
          exam.id,
          startTime,
          exam.maxScore,
          JSON.stringify([]), // Chưa có đáp án
        ]
      );

      return {
        classId,
        examId: exam.id,
        examCodeId,
        examCode,
        questions: questionsForTaking,
        duration: exam.duration,
        maxScore: exam.maxScore,
        startTime,
      };
    } catch (error) {
      console.error('Error starting exam:', error);
      throw error;
    }
  }

  /**
   * Nộp bài và chấm điểm
   */
  async submitExam(userId: number, submitData: SubmitExamDTO): Promise<ExamResult> {
    try {
      // Lấy kết quả hiện tại (theo classId và examId)
      const result = await this.findByUserAndClassAndExam(userId, submitData.classId, submitData.examId);
      if (!result) {
        throw new Error('Không tìm thấy bài thi');
      }

      if (result.submittedAt) {
        throw new Error('Bạn đã nộp bài rồi');
      }

      // Lấy đề thi để chấm điểm
      const exam = await examService.findById(result.examId);
      if (!exam) {
        throw new Error('Đề thi không tồn tại');
      }

      // Tính điểm và lấy đáp án đúng
      let totalScore = 0;
      const correctAnswers: CorrectAnswer[] = [];

      for (const studentAnswer of submitData.answers) {
        const examQuestion = exam.questions.find(
          (eq) => eq.questionId === studentAnswer.questionId
        );

        if (!examQuestion || !examQuestion.question) {
          continue;
        }

        const question = examQuestion.question;
        // Lấy đáp án đúng
        const correctAnswerIds = question.answers
          .filter((answer) => answer.isTrue)
          .map((answer) => answer.id)
          .sort((a, b) => a - b);

        correctAnswers.push({
          questionId: question.id,
          answerIds: correctAnswerIds,
        });

        // So sánh đáp án học sinh với đáp án đúng
        const studentAnswerIds = [...studentAnswer.answerIds].sort((a, b) => a - b);
        const isCorrect =
          studentAnswerIds.length === correctAnswerIds.length &&
          studentAnswerIds.every((id, index) => id === correctAnswerIds[index]);

        if (isCorrect) {
          totalScore += examQuestion.score;
        }
      }

      // Cập nhật kết quả
      const submittedAt = new Date();
      await query(
        `UPDATE exam_results 
         SET submitted_at = ?, score = ?, answers = ?, correct_answers = ?
         WHERE id = ?`,
        [
          submittedAt,
          totalScore,
          JSON.stringify(submitData.answers),
          JSON.stringify(correctAnswers),
          result.id,
        ]
      );

      // Lấy lại kết quả đã cập nhật
      const updatedResult = await this.findById(result.id);
      if (!updatedResult) {
        throw new Error('Không thể lấy kết quả sau khi nộp bài');
      }

      return updatedResult;
    } catch (error) {
      console.error('Error submitting exam:', error);
      throw error;
    }
  }

  /**
   * Lấy kết quả theo user, class và exam
   */
  async findByUserAndClassAndExam(userId: number, classId: number, examId: number): Promise<ExamResult | null> {
    try {
      interface ResultRow extends ExamResultRow {
        exam_code: string | null;
      }

      const rows = await query<ResultRow[]>(
        `SELECT er.*, ec.code as exam_code
         FROM exam_results er
         LEFT JOIN exam_codes ec ON er.exam_code_id = ec.id
         WHERE er.user_id = ? AND er.class_id = ? AND er.exam_id = ?`,
        [userId, classId, examId]
      );

      if (rows.length === 0) {
        return null;
      }

      const result = this.mapRowToExamResult(rows[0]);
      // Thêm examCode vào result
      return {
        ...result,
        examCode: rows[0].exam_code || null,
      };
    } catch (error) {
      console.error('Error finding exam result by user, class and exam:', error);
      throw error;
    }
  }


  /**
   * Lấy kết quả theo ID
   */
  async findById(id: number): Promise<ExamResult | null> {
    try {
      const rows = await query<ExamResultRow[]>(
        'SELECT * FROM exam_results WHERE id = ?',
        [id]
      );

      if (rows.length === 0) {
        return null;
      }

      return this.mapRowToExamResult(rows[0]);
    } catch (error) {
      console.error('Error finding exam result by id:', error);
      throw error;
    }
  }

  /**
   * Lấy lịch sử thi của tất cả học sinh trong lớp và đề thi (cho giáo viên)
   * Với bộ lọc và phân trang
   */
  async getResultsByClassAndExam(
    classId: number,
    examId: number,
    options: {
      studentName?: string;
      scoreSort?: 'asc' | 'desc' | 'none';
      durationSort?: 'asc' | 'desc' | 'none';
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ data: any[]; total: number; page: number; limit: number; totalPages: number }> {
    try {
      interface ResultRow extends ExamResultRow {
        user_id: number;
        user_name: string;
        user_email: string;
        exam_code: string | null;
        started_at: Date;
        submitted_at: Date | null;
        score: number;
        max_score: number;
      }

      const {
        studentName = '',
        scoreSort = 'none',
        durationSort = 'none',
        page = 1,
        limit = 10,
      } = options;

      // Xây dựng WHERE clause
      let whereClause = 'WHERE er.class_id = ? AND er.exam_id = ?';
      const params: any[] = [classId, examId];

      if (studentName.trim()) {
        whereClause += ' AND u.name LIKE ?';
        params.push(`%${studentName.trim()}%`);
      }

      // Xây dựng ORDER BY clause
      let orderByClause = 'ORDER BY ';
      const orderByParts: string[] = [];

      if (scoreSort !== 'none') {
        orderByParts.push(`er.score ${scoreSort.toUpperCase()}`);
      }
      if (durationSort !== 'none') {
        // Tính duration trong subquery hoặc dùng TIMESTAMPDIFF
        // Nếu submitted_at là NULL thì không sort theo duration
        if (durationSort === 'asc') {
          orderByParts.push(
            `CASE WHEN er.submitted_at IS NOT NULL THEN TIMESTAMPDIFF(SECOND, er.started_at, er.submitted_at) ELSE 999999999 END ASC`
          );
        } else {
          orderByParts.push(
            `CASE WHEN er.submitted_at IS NOT NULL THEN TIMESTAMPDIFF(SECOND, er.started_at, er.submitted_at) ELSE 0 END DESC`
          );
        }
      }

      // Nếu không có sort nào, dùng mặc định
      if (orderByParts.length === 0) {
        orderByClause += 'er.started_at DESC';
      } else {
        orderByClause += orderByParts.join(', ');
        // Thêm started_at DESC làm sort phụ
        orderByClause += ', er.started_at DESC';
      }

      // Đếm tổng số records
      const countRows = await query<{ count: number }[]>(
        `SELECT COUNT(*) as count
         FROM exam_results er
         INNER JOIN users u ON er.user_id = u.id
         ${whereClause}`,
        params
      );
      const total = countRows[0]?.count || 0;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;

      // Chuyển limit và offset thành số nguyên
      const limitInt = Number.parseInt(limit.toString(), 10);
      const offsetInt = Number.parseInt(offset.toString(), 10);

      // Lấy dữ liệu với pagination
      // MySQL yêu cầu LIMIT và OFFSET phải là số nguyên, không thể dùng placeholder
      const rows = await query<ResultRow[]>(
        `SELECT er.*, 
                u.id as user_id, u.name as user_name, u.email as user_email,
                ec.code as exam_code
         FROM exam_results er
         INNER JOIN users u ON er.user_id = u.id
         LEFT JOIN exam_codes ec ON er.exam_code_id = ec.id
         ${whereClause}
         ${orderByClause}
         LIMIT ${limitInt} OFFSET ${offsetInt}`,
        params
      );

      const data = rows.map((row) => {
        const result = this.mapRowToExamResult(row);
        return {
          ...result,
          examCode: row.exam_code || null,
          student: {
            id: row.user_id,
            name: row.user_name,
            email: row.user_email,
          },
          // Tính thời gian làm bài (giây)
          duration: row.submitted_at
            ? Math.floor((new Date(row.submitted_at).getTime() - new Date(row.started_at).getTime()) / 1000)
            : null,
        };
      });

      return {
        data,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      console.error('Error getting results by class and exam:', error);
      throw error;
    }
  }


  /**
   * Lấy chi tiết bài làm của học sinh (cho giáo viên)
   */
  async getResultDetailForTeacher(resultId: number): Promise<any> {
    try {
      interface DetailRow extends ExamResultRow {
        user_id: number;
        user_name: string;
        user_email: string;
        exam_code: string | null;
        exam_id: number;
        exam_name: string;
        exam_duration: number;
        exam_max_score: number;
        class_id: number;
        class_name: string;
        class_code: string;
      }

      const rows = await query<DetailRow[]>(
        `SELECT er.*, 
                u.id as user_id, u.name as user_name, u.email as user_email,
                ec.code as exam_code,
                e.id as exam_id, e.name as exam_name, e.duration as exam_duration, e.max_score as exam_max_score,
                c.id as class_id, c.name as class_name, c.code as class_code
         FROM exam_results er
         INNER JOIN users u ON er.user_id = u.id
         LEFT JOIN exam_codes ec ON er.exam_code_id = ec.id
         INNER JOIN exams e ON er.exam_id = e.id
         INNER JOIN classes c ON er.class_id = c.id
         WHERE er.id = ?`,
        [resultId]
      );

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      const result = this.mapRowToExamResult(row);

      // Lấy thông tin đề thi để có câu hỏi
      const exam = await examService.findById(row.exam_id);
      if (!exam) {
        return null;
      }

      return {
        ...result,
        examCode: row.exam_code || null,
        student: {
          id: row.user_id,
          name: row.user_name,
          email: row.user_email,
        },
        exam: {
          id: row.exam_id,
          name: row.exam_name,
          duration: row.exam_duration,
          maxScore: Number(row.exam_max_score),
        },
        class: {
          id: row.class_id,
          name: row.class_name,
          code: row.class_code,
        },
        questions: exam.questions,
        duration: row.submitted_at
          ? Math.floor((new Date(row.submitted_at).getTime() - new Date(row.started_at).getTime()) / 1000)
          : null,
      };
    } catch (error) {
      console.error('Error getting result detail for teacher:', error);
      throw error;
    }
  }

  /**
   * Lấy lịch sử làm bài của học sinh
   */
  async getHistoryByUser(userId: number): Promise<ExamResultWithDetails[]> {
    try {
      interface HistoryRow extends ExamResultRow {
        class_id: number;
        class_name: string;
        class_code: string;
        start_date: Date;
        end_date: Date;
        exam_id_detail: number;
        exam_name: string;
        duration: number;
        exam_max_score: number;
        code_id: number | null;
        code_code: string | null;
      }

      const rows = await query<HistoryRow[]>(
        `SELECT er.*, 
                c.id as class_id, c.name as class_name, c.code as class_code, 
                c.start_date, c.end_date,
                e.id as exam_id_detail, e.name as exam_name, e.duration, e.max_score as exam_max_score,
                ec.id as code_id, ec.code as code_code
         FROM exam_results er
         INNER JOIN classes c ON er.class_id = c.id
         INNER JOIN exams e ON er.exam_id = e.id
         LEFT JOIN exam_codes ec ON er.exam_code_id = ec.id
         WHERE er.user_id = ?
         ORDER BY er.started_at DESC`,
        [userId]
      );

      return rows.map((row) => ({
        ...this.mapRowToExamResult(row),
        class: {
          id: row.class_id,
          name: row.class_name,
          code: row.class_code,
          startDate: row.start_date,
          endDate: row.end_date,
        },
        exam: {
          id: row.exam_id_detail,
          name: row.exam_name,
          duration: row.duration,
          maxScore: Number(row.exam_max_score),
        },
        examCode: row.code_id
          ? {
              id: row.code_id,
              code: row.code_code || '',
            }
          : null,
      }));
    } catch (error) {
      console.error('Error getting exam history:', error);
      throw error;
    }
  }

  /**
   * Map database row sang ExamResult object
   */
  private mapRowToExamResult(row: ExamResultRow): ExamResult {
    let answers: StudentAnswer[] = [];
    let correctAnswers: CorrectAnswer[] | null = null;

    try {
      if (row.answers) {
        answers = typeof row.answers === 'string' ? JSON.parse(row.answers) : row.answers;
      }
      if (row.correct_answers) {
        correctAnswers =
          typeof row.correct_answers === 'string'
            ? JSON.parse(row.correct_answers)
            : row.correct_answers;
      }
    } catch (error) {
      console.error('Error parsing answers JSON:', error);
    }

    return {
      id: row.id,
      userId: row.user_id,
      classId: row.class_id || null,
      examCodeId: row.exam_code_id,
      examCode: row.exam_code || null,
      examId: row.exam_id,
      startedAt: row.started_at,
      submittedAt: row.submitted_at,
      score: Number(row.score),
      maxScore: Number(row.max_score),
      answers,
      correctAnswers,
    };
  }
}

export default new ExamResultService();

