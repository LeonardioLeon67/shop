import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// 内存存储用户数据（仅用于演示，生产环境请使用真实数据库）
let users: any[] = [];
let sessions: any[] = [];
let nextUserId = 1;

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

export class UserModel {
  // 创建用户
  static async create(userData: Omit<User, 'id' | 'created_at' | 'updated_at' | 'is_active'>): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const newUser = {
      id: nextUserId++,
      email: userData.email,
      password: hashedPassword,
      name: userData.name,
      created_at: new Date(),
      updated_at: new Date(),
      is_active: true,
    };
    
    users.push(newUser);
    console.log('用户创建成功:', { email: newUser.email, name: newUser.name, id: newUser.id });
    console.log('当前用户总数:', users.length);
    return newUser;
  }

  // 根据邮箱查找用户
  static async findByEmail(email: string): Promise<User | null> {
    console.log('查找用户:', email);
    console.log('当前所有用户:', users.map(u => ({ email: u.email, name: u.name })));
    const user = users.find(user => user.email === email && user.is_active) || null;
    console.log('找到用户:', user ? { email: user.email, name: user.name } : null);
    return user;
  }

  // 根据ID查找用户
  static async findById(id: number): Promise<User | null> {
    return users.find(user => user.id === id && user.is_active) || null;
  }

  // 获取所有用户
  static getAllUsers(): User[] {
    return users.filter(user => user.is_active);
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
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7天后过期

    sessions.push({
      id: sessions.length + 1,
      user_id: userId,
      token,
      expires_at: expiresAt,
      created_at: new Date(),
    });
  }

  // 删除用户会话
  static async deleteSession(token: string): Promise<void> {
    const index = sessions.findIndex(session => session.token === token);
    if (index > -1) {
      sessions.splice(index, 1);
    }
  }

  // 检查会话是否有效
  static async validateSession(token: string): Promise<User | null> {
    const session = sessions.find(
      s => s.token === token && s.expires_at > new Date()
    );
    
    if (!session) {
      return null;
    }

    return this.findById(session.user_id);
  }
}