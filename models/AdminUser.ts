import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// 管理员数据存储（生产环境请使用真实数据库）
let admins: AdminUser[] = [];
let adminSessions: AdminSession[] = [];
let nextAdminId = 1;

export interface AdminUser {
  id?: number;
  username: string;
  password: string;
  email: string;
  role: 'super_admin' | 'admin';
  created_at?: Date;
  updated_at?: Date;
  is_active?: boolean;
}

export interface AdminSession {
  id?: number;
  admin_id: number;
  token: string;
  expires_at: Date;
  created_at?: Date;
}

export class AdminUserModel {
  // 初始化默认管理员账号
  static async init(): Promise<void> {
    if (admins.length === 0) {
      // 创建默认管理员账号：admin / admin123
      await this.create({
        username: 'admin',
        password: 'admin123',
        email: 'admin@example.com',
        role: 'super_admin'
      });
      console.log('✅ 默认管理员账号已创建: admin / admin123');
    }
  }

  // 创建管理员用户
  static async create(adminData: Omit<AdminUser, 'id' | 'created_at' | 'updated_at' | 'is_active'>): Promise<AdminUser> {
    const hashedPassword = await bcrypt.hash(adminData.password, 12);
    
    const newAdmin = {
      id: nextAdminId++,
      username: adminData.username,
      password: hashedPassword,
      email: adminData.email,
      role: adminData.role,
      created_at: new Date(),
      updated_at: new Date(),
      is_active: true,
    };
    
    admins.push(newAdmin);
    console.log('管理员用户创建成功:', { username: newAdmin.username, email: newAdmin.email, id: newAdmin.id });
    return newAdmin;
  }

  // 根据用户名查找管理员
  static async findByUsername(username: string): Promise<AdminUser | null> {
    console.log('查找管理员:', username);
    const admin = admins.find(admin => admin.username === username && admin.is_active) || null;
    console.log('找到管理员:', admin ? { username: admin.username, email: admin.email } : null);
    return admin;
  }

  // 根据ID查找管理员
  static async findById(id: number): Promise<AdminUser | null> {
    return admins.find(admin => admin.id === id && admin.is_active) || null;
  }

  // 验证密码
  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // 生成JWT token
  static generateToken(admin: AdminUser): string {
    const payload = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      type: 'admin'
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', {
      expiresIn: '24h', // 管理员token有效期24小时
    });
  }

  // 验证JWT token
  static verifyToken(token: string): any {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      // 确保是管理员token
      if (typeof decoded === 'object' && decoded.type === 'admin') {
        return decoded;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // 创建管理员会话
  static async createSession(adminId: number, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1); // 1天后过期

    adminSessions.push({
      id: adminSessions.length + 1,
      admin_id: adminId,
      token,
      expires_at: expiresAt,
      created_at: new Date(),
    });
  }

  // 删除管理员会话
  static async deleteSession(token: string): Promise<void> {
    const index = adminSessions.findIndex(session => session.token === token);
    if (index > -1) {
      adminSessions.splice(index, 1);
    }
  }

  // 检查会话是否有效
  static async validateSession(token: string): Promise<AdminUser | null> {
    const session = adminSessions.find(
      s => s.token === token && s.expires_at > new Date()
    );
    
    if (!session) {
      return null;
    }

    return this.findById(session.admin_id);
  }

  // 获取所有管理员
  static getAllAdmins(): AdminUser[] {
    return admins.filter(admin => admin.is_active);
  }
}

// 在模块加载时初始化默认管理员
AdminUserModel.init();