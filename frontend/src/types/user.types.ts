export enum UserRole {
  TEACHER = 'teacher',
  STUDENT = 'student'
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  birthYear?: number;
  className?: string;
  school: string;
  phone?: string;
  createdAt: string;
}












