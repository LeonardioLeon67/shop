import { NextRequest, NextResponse } from "next/server";
import { AdminUserModel } from "../../../../../models/AdminUser";

export async function POST(request: NextRequest) {
  try {
    // 确保管理员初始化
    await AdminUserModel.init();
    
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "用户名和密码不能为空" },
        { status: 400 }
      );
    }

    console.log("管理员登录尝试:", username);

    // 查找管理员
    const admin = await AdminUserModel.findByUsername(username);
    if (!admin) {
      console.log("管理员不存在:", username);
      return NextResponse.json(
        { message: "用户名或密码错误" },
        { status: 401 }
      );
    }

    // 验证密码
    const isPasswordValid = await AdminUserModel.verifyPassword(password, admin.password);
    if (!isPasswordValid) {
      console.log("密码错误:", username);
      return NextResponse.json(
        { message: "用户名或密码错误" },
        { status: 401 }
      );
    }

    // 生成token
    const token = AdminUserModel.generateToken(admin);
    
    // 创建会话
    await AdminUserModel.createSession(admin.id!, token);

    console.log("管理员登录成功:", { username: admin.username, id: admin.id });

    // 设置HTTP-only cookie
    const response = NextResponse.json({
      message: "登录成功",
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24小时
    });

    return response;

  } catch (error) {
    console.error("管理员登录失败:", error);
    return NextResponse.json(
      { message: "登录失败，请稍后重试" },
      { status: 500 }
    );
  }
}