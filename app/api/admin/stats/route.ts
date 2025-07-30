import { NextResponse } from "next/server";
import { getOrderStorage } from "../../../../models/OrderStorage";
import { UserModel } from "../../../../models/MemoryUser";

export async function GET() {
  try {
    // 获取所有订单
    const orders = getOrderStorage();
    
    // 获取所有用户
    const users = UserModel.getAllUsers();
    
    // 计算统计数据
    const totalUsers = users.length;
    const totalOrders = orders.length;
    const paidOrders = orders.filter(order => order.isPaid).length;
    const totalRevenue = orders
      .filter(order => order.isPaid)
      .reduce((sum, order) => sum + (order.amount || 0), 0);
    
    // 计算增长率（模拟数据）
    const userGrowth = Math.round(Math.random() * 20 + 5); // 5-25%
    const orderGrowth = Math.round(Math.random() * 15 + 3); // 3-18%
    const revenueGrowth = Math.round(Math.random() * 30 + 10); // 10-40%
    
    const stats = {
      totalUsers,
      totalOrders,
      totalRevenue,
      paidOrders,
      paymentRate: totalOrders > 0 ? Math.round((paidOrders / totalOrders) * 100) : 0,
      growth: {
        users: userGrowth,
        orders: orderGrowth,
        revenue: revenueGrowth
      }
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("获取统计数据失败:", error);
    return NextResponse.json(
      { message: "获取统计数据失败" },
      { status: 500 }
    );
  }
}