import { NextRequest, NextResponse } from "next/server";
import { AdminUserModel } from "../../../../../models/AdminUser";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;

    if (token) {
      // 删除会话
      await AdminUserModel.deleteSession(token);
    }

    // 清除cookie
    const response = NextResponse.json({
      message: "退出登录成功"
    });

    response.cookies.set('admin_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0 // 立即过期
    });

    return response;

  } catch (error) {
    console.error("管理员登出失败:", error);
    return NextResponse.json(
      { message: "登出失败，请稍后重试" },
      { status: 500 }
    );
  }
}