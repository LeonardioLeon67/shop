import { NextRequest, NextResponse } from 'next/server';
import { MySQLUserModel } from '../../../../models/MySQLUser';
import { UserModel } from '../../../../models/MemoryUser';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // 验证必填字段
    if (!email || !password || !name) {
      return NextResponse.json(
        { message: '请填写所有必填字段' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: '请输入有效的邮箱地址' },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { message: '密码长度至少6位' },
        { status: 400 }
      );
    }

    // 优先尝试MySQL，失败则使用内存存储
    let newUser;
    let useMySQL = false;
    
    try {
      // 检查MySQL中用户是否已存在
      const existingMySQLUser = await MySQLUserModel.findByEmail(email);
      if (existingMySQLUser) {
        return NextResponse.json(
          { message: '该邮箱已被注册' },
          { status: 409 }
        );
      }

      // 在MySQL中创建新用户
      newUser = await MySQLUserModel.create({
        email,
        password,
        name,
      });
      useMySQL = true;
      console.log('用户已保存到MySQL数据库');
    } catch (mysqlError) {
      console.log('MySQL操作失败，回退到内存存储:', mysqlError);
      
      // 检查内存存储中用户是否已存在
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return NextResponse.json(
          { message: '该邮箱已被注册' },
          { status: 409 }
        );
      }

      // 在内存中创建新用户
      newUser = await UserModel.create({
        email,
        password,
        name,
      });
      console.log('用户已保存到内存存储');
    }

    // 返回成功响应（不包含密码）
    const userResponse = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      created_at: newUser.created_at,
    };

    return NextResponse.json(
      {
        message: '注册成功',
        user: userResponse,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('注册失败:', error);
    return NextResponse.json(
      { message: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}