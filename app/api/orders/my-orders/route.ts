import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getOrdersByEmail } from "@/models/OrderStorage";

export async function GET() {
  try {
    const token = cookies().get("token");
    
    if (!token) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    // 从token中解析用户信息
    const userData = JSON.parse(Buffer.from(token.value.split('.')[1], 'base64').toString());
    const userEmail = userData.email;

    if (!userEmail) {
      return NextResponse.json({ error: "无效的用户信息" }, { status: 401 });
    }

    // 获取用户的订单
    const orders = getOrdersByEmail(userEmail);
    
    // 格式化订单数据
    const formattedOrders = orders.map(order => ({
      _id: order.orderNo,
      orderNo: order.orderNo,
      productName: order.productName,
      amount: order.amount,
      isPaid: order.isPaid,
      credentials: order.credentials,
      createdAt: order.createdAt
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("获取用户订单失败:", error);
    return NextResponse.json(
      { error: "获取订单失败" },
      { status: 500 }
    );
  }
}