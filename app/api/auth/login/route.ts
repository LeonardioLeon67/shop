import { NextRequest, NextResponse } from 'next/server';
import { MySQLUserModel } from '../../../../models/MySQLUser';
import { UserModel } from '../../../../models/MemoryUser';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 验证必填字段
    if (!email || !password) {
      return NextResponse.json(
        { message: '请输入邮箱和密码' },
        { status: 400 }
      );
    }

    // 优先尝试MySQL，失败则使用内存存储
    let user;
    let token;
    let useMySQL = false;
    
    try {
      // 从MySQL查找用户
      user = await MySQLUserModel.findByEmail(email);
      if (!user) {
        return NextResponse.json(
          { message: '邮箱或密码错误' },
          { status: 401 }
        );
      }

      // 验证密码
      const isPasswordValid = await MySQLUserModel.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { message: '邮箱或密码错误' },
          { status: 401 }
        );
      }

      // 生成JWT token
      token = MySQLUserModel.generateToken(user);

      // 创建用户会话
      await MySQLUserModel.createSession(user.id!, token);
      useMySQL = true;
      console.log('MySQL登录成功');
    } catch (mysqlError) {
      console.log('MySQL登录失败，尝试内存存储:', mysqlError);
      
      // 从内存存储查找用户
      user = await UserModel.findByEmail(email);
      if (!user) {
        return NextResponse.json(
          { message: '邮箱或密码错误' },
          { status: 401 }
        );
      }

      // 验证密码
      const isPasswordValid = await UserModel.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { message: '邮箱或密码错误' },
          { status: 401 }
        );
      }

      // 生成JWT token
      token = UserModel.generateToken(user);

      // 创建用户会话
      await UserModel.createSession(user.id!, token);
      console.log('内存存储登录成功');
    }

    // 返回用户信息（不包含密码）
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    const response = NextResponse.json(
      {
        message: '登录成功',
        user: userResponse,
        token,
        storage: useMySQL ? 'MySQL' : 'Memory'
      },
      { status: 200 }
    );

    // 设置cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7天
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('登录失败:', error);
    return NextResponse.json(
      { message: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}