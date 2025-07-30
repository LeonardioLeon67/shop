import { NextResponse } from "next/server";
import { UserModel } from "../../../../models/MemoryUser";

export async function GET() {
  try {
    // 获取所有用户
    const users = UserModel.getAllUsers();
    
    // 格式化用户数据
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: new Date(user.created_at).toLocaleDateString('zh-CN')
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("获取用户列表失败:", error);
    return NextResponse.json(
      { message: "获取用户列表失败" },
      { status: 500 }
    );
  }
}