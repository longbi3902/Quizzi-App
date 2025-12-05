import bcrypt from 'bcryptjs';
import { User, RegisterDTO, UserRole } from '../types/user.types';

// Fake database - sẽ thay thế bằng MySQL sau
// TODO: Kết nối với MySQL database
// const db = mysql.createConnection({...});

// Fake data storage (in-memory)
let fakeUsers: User[] = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    email: 'teacher@example.com',
    password: '$2a$10$mkSFrgK2f7tTxHGwqcwLCue7aPqCZ8hLt7DncundDP8MbN0cU62Sm', // password: 123456
    role: UserRole.TEACHER,
    school: 'Trường THPT ABC',
    birthYear: 1985,
    phone: '0123456789',
    createdAt: new Date()
  },
  {
    id: 2,
    name: 'Trần Thị B',
    email: 'student@example.com',
    password: '$2a$10$mkSFrgK2f7tTxHGwqcwLCue7aPqCZ8hLt7DncundDP8MbN0cU62Sm', // password: 123456
    role: UserRole.STUDENT,
    school: 'Trường THPT XYZ',
    birthYear: 2005,
    className: '12A1',
    phone: '0987654321',
    createdAt: new Date()
  }
];

let nextId = 3;

export class UserService {
  // TODO: Thay thế bằng MySQL query
  // async findByEmail(email: string): Promise<User | null> {
  //   return new Promise((resolve, reject) => {
  //     db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
  //       if (err) reject(err);
  //       resolve(results[0] || null);
  //     });
  //   });
  // }

  async findByEmail(email: string): Promise<User | null> {
    // Fake database query
    return fakeUsers.find(user => user.email === email) || null;
  }

  // TODO: Thay thế bằng MySQL query
  // async findById(id: number): Promise<User | null> {
  //   return new Promise((resolve, reject) => {
  //     db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
  //       if (err) reject(err);
  //       resolve(results[0] || null);
  //     });
  //   });
  // }

  async findById(id: number): Promise<User | null> {
    // Fake database query
    return fakeUsers.find(user => user.id === id) || null;
  }

  // TODO: Thay thế bằng MySQL query
  // async create(userData: RegisterDTO): Promise<User> {
  //   const hashedPassword = await bcrypt.hash(userData.password, 10);
  //   return new Promise((resolve, reject) => {
  //     db.query(
  //       'INSERT INTO users (name, email, password, role, birth_year, class_name, school, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  //       [userData.name, userData.email, hashedPassword, userData.role, userData.birthYear, userData.className, userData.school, userData.phone],
  //       (err, results) => {
  //         if (err) reject(err);
  //         resolve({ id: results.insertId, ...userData, password: hashedPassword, createdAt: new Date() });
  //       }
  //     );
  //   });
  // }

  async create(userData: RegisterDTO): Promise<User> {
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Fake database insert
    const newUser: User = {
      id: nextId++,
      ...userData,
      password: hashedPassword,
      createdAt: new Date()
    };
    
    fakeUsers.push(newUser);
    return newUser;
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

export default new UserService();

