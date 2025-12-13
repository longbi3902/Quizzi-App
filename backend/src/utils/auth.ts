import { Request } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface TokenPayload {
  id: number;
  email: string;
  role: string;
}

/**
 * Lấy user ID từ JWT token trong Authorization header
 */
export const getUserIdFromToken = (req: Request): number | null => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded.id;
  } catch (error) {
    return null;
  }
};





