import { NextRequest, NextResponse } from "next/server";
import { AdminUserModel } from "../../../../../models/AdminUser";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: "未登录" },
        { status: 401 }
      );
    }

    // 验证token
    const decoded = AdminUserModel.verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { message: "token无效" },
        { status: 401 }
      );
    }

    // 验证会话
    const admin = await AdminUserModel.validateSession(token);
    if (!admin) {
      return NextResponse.json(
        { message: "会话已过期" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (error) {
    console.error("获取管理员信息失败:", error);
    return NextResponse.json(
      { message: "获取用户信息失败" },
      { status: 500 }
    );
  }
}