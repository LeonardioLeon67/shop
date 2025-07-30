import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '../../../../models/MemoryUser';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (token) {
      // 删除用户会话
      await UserModel.deleteSession(token);
    }

    const response = NextResponse.json(
      { message: '登出成功' },
      { status: 200 }
    );

    // 清除cookie
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('登出失败:', error);
    return NextResponse.json(
      { message: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}