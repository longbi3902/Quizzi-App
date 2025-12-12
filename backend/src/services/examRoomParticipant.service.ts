import { ExamRoomWithExam } from '../types/examRoom.types';
import { query } from '../config/database';
import examRoomService from './examRoom.service';

interface ParticipantRow {
  id: number;
  user_id: number;
  exam_room_id: number;
  joined_at: Date;
}

export class ExamRoomParticipantService {
  /**
   * Lưu participant khi học sinh tham gia phòng thi thành công
   */
  async createParticipant(userId: number, examRoomId: number): Promise<void> {
    try {
      // Sử dụng INSERT IGNORE để tránh lỗi nếu đã tham gia rồi
      await query(
        'INSERT IGNORE INTO exam_room_participants (user_id, exam_room_id) VALUES (?, ?)',
        [userId, examRoomId]
      );
    } catch (error) {
      console.error('Error creating participant:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách phòng thi đã tham gia của học sinh
   */
  async getParticipatedRooms(userId: number): Promise<ExamRoomWithExam[]> {
    try {
      const rows = await query<ParticipantRow[]>(
        `SELECT erp.*, er.* 
         FROM exam_room_participants erp
         INNER JOIN exam_rooms er ON erp.exam_room_id = er.id
         WHERE erp.user_id = ?
         ORDER BY erp.joined_at DESC`,
        [userId]
      );

      const examRooms: ExamRoomWithExam[] = [];

      for (const row of rows) {
        const examRoom = await examRoomService.findById(row.exam_room_id);
        if (examRoom) {
          examRooms.push(examRoom);
        }
      }

      return examRooms;
    } catch (error) {
      console.error('Error getting participated rooms:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra học sinh đã tham gia phòng thi chưa
   */
  async hasParticipated(userId: number, examRoomId: number): Promise<boolean> {
    try {
      const rows = await query<ParticipantRow[]>(
        'SELECT id FROM exam_room_participants WHERE user_id = ? AND exam_room_id = ?',
        [userId, examRoomId]
      );
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking participation:', error);
      throw error;
    }
  }
}

export default new ExamRoomParticipantService();



