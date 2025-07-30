import { NextResponse } from "next/server";
import { getOrderStorage } from "../../../../models/OrderStorage";

export async function GET() {
  try {
    // 获取所有订单
    const orders = getOrderStorage();
    
    // 格式化订单数据
    const formattedOrders = orders.map(order => ({
      orderNo: order.orderNo,
      productName: order.productName,
      customerEmail: order.customerEmail,
      amount: order.amount,
      status: order.isPaid ? '已支付' : '待支付',
      createdAt: new Date(order.createdAt).toLocaleString('zh-CN'),
      isPaid: order.isPaid
    }));

    // 按创建时间倒序排列
    formattedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("获取订单列表失败:", error);
    return NextResponse.json(
      { message: "获取订单列表失败" },
      { status: 500 }
    );
  }
}