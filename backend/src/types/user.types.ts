export enum UserRole {
  TEACHER = 'teacher',
  STUDENT = 'student'
}

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  birthYear?: number;
  className?: string;
  school: string;
  phone?: string;
  createdAt: Date;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  birthYear?: number;
  className?: string;
  school: string;
  phone?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}







