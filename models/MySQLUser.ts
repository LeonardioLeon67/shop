import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getConnection } from '../libs/mysql';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface User {
  id?: number;
  email: string;
  password: string;
  name: string;
  created_at?: Date;
  updated_at?: Date;
  is_active?: boolean;
}

export interface UserSession {
  id?: number;
  user_id: number;
  token: string;
  expires_at: Date;
  created_at?: Date;
}

export class MySQLUserModel {
  // 创建用户
  static async create(userData: Omit<User, 'id' | 'created_at' | 'updated_at' | 'is_active'>): Promise<User> {
    try {
      const connection = await getConnection();
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      const [result] = await connection.execute<ResultSetHeader>(
        'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
        [userData.email, hashedPassword, userData.name]
      );
      
      const newUser: User = {
        id: result.insertId,
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true,
      };
      
      console.log('MySQL用户创建成功:', { email: newUser.email, name: newUser.name, id: newUser.id });
      return newUser;
    } catch (error) {
      console.error('MySQL创建用户失败:', error);
      throw error;
    }
  }

  // 根据邮箱查找用户
  static async findByEmail(email: string): Promise<User | null> {
    try {
      const connection = await getConnection();
      console.log('MySQL查找用户:', email);
      
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM users WHERE email = ? AND is_active = 1',
        [email]
      );
      
      if (rows.length === 0) {
        console.log('MySQL未找到用户:', email);
        return null;
      }
      
      const user = rows[0] as User;
      console.log('MySQL找到用户:', { email: user.email, name: user.name });
      return user;
    } catch (error) {
      console.error('MySQL查找用户失败:', error);
      return null;
    }
  }

  // 根据ID查找用户
  static async findById(id: number): Promise<User | null> {
    try {
      const connection = await getConnection();
      
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM users WHERE id = ? AND is_active = 1',
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return rows[0] as User;
    } catch (error) {
      console.error('MySQL根据ID查找用户失败:', error);
      return null;
    }
  }

  // 验证密码
  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // 生成JWT token
  static generateToken(user: User): string {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', {
      expiresIn: '7d',
    });
  }

  // 验证JWT token
  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    } catch (error) {
      return null;
    }
  }

  // 创建用户会话
  static async createSession(userId: number, token: string): Promise<void> {
    try {
      const connection = await getConnection();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7天后过期

      await connection.execute(
        'INSERT INTO user_sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
        [userId, token, expiresAt]
      );
    } catch (error) {
      console.error('MySQL创建会话失败:', error);
    }
  }

  // 删除用户会话
  static async deleteSession(token: string): Promise<void> {
    try {
      const connection = await getConnection();
      
      await connection.execute(
        'DELETE FROM user_sessions WHERE token = ?',
        [token]
      );
    } catch (error) {
      console.error('MySQL删除会话失败:', error);
    }
  }

  // 检查会话是否有效
  static async validateSession(token: string): Promise<User | null> {
    try {
      const connection = await getConnection();
      
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT us.*, u.* FROM user_sessions us JOIN users u ON us.user_id = u.id WHERE us.token = ? AND us.expires_at > NOW() AND u.is_active = 1',
        [token]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      const row = rows[0];
      return {
        id: row.user_id,
        email: row.email,
        password: row.password,
        name: row.name,
        created_at: row.created_at,
        updated_at: row.updated_at,
        is_active: row.is_active,
      };
    } catch (error) {
      console.error('MySQL验证会话失败:', error);
      return null;
    }
  }
}