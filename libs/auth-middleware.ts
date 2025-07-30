import { NextRequest } from 'next/server';
import { MySQLUserModel } from '../models/MySQLUser';

export async function getAuthenticatedUser(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return null;
    }

    // 验证会话
    const user = await MySQLUserModel.validateSession(token);
    return user;
  } catch (error) {
    console.error('验证用户失败:', error);
    return null;
  }
}

export function requireAuth(handler: (request: NextRequest, user: any) => Promise<Response>) {
  return async (request: NextRequest) => {
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return Response.json(
        { message: '请先登录' },
        { status: 401 }
      );
    }

    return handler(request, user);
  };
}