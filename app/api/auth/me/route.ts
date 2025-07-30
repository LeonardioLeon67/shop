import { NextRequest, NextResponse } from 'next/server';
import { MySQLUserModel } from '../../../../models/MySQLUser';
import { UserModel } from '../../../../models/MemoryUser';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: '未登录' },
        { status: 401 }
      );
    }

    // 优先尝试MySQL验证会话
    let user;
    try {
      user = await MySQLUserModel.validateSession(token);
      if (user) {
        console.log('MySQL会话验证成功');
      }
    } catch (mysqlError) {
      console.log('MySQL会话验证失败，尝试内存存储:', mysqlError);
    }
    
    // 如果MySQL失败，尝试内存存储
    if (!user) {
      user = await UserModel.validateSession(token);
      if (user) {
        console.log('内存存储会话验证成功');
      }
    }
    
    if (!user) {
      return NextResponse.json(
        { message: '会话已过期，请重新登录' },
        { status: 401 }
      );
    }

    // 返回用户信息（不包含密码）
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    return NextResponse.json(
      { user: userResponse },
      { status: 200 }
    );

  } catch (error) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json(
      { message: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}