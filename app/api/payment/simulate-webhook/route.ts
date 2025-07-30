import { NextRequest, NextResponse } from "next/server";
import { getOrderStorage, updateOrderStatus } from "../../../../models/OrderStorage";

export async function POST(request: NextRequest) {
  try {
    const { orderNo } = await request.json();
    
    if (!orderNo) {
      return NextResponse.json(
        { message: "订单号不能为空" },
        { status: 400 }
      );
    }

    console.log("模拟支付回调：", orderNo);
    
    // 查找订单
    const orders = getOrderStorage();
    const order = orders.find(o => o.orderNo === orderNo);
    
    if (!order) {
      return NextResponse.json(
        { message: "订单不存在" },
        { status: 404 }
      );
    }
    
    if (order.isPaid) {
      return NextResponse.json(
        { message: "订单已支付" },
        { status: 400 }
      );
    }

    // 更新订单状态为已支付
    updateOrderStatus(orderNo, {
      isPaid: true,
      status: '已支付',
      paidAt: new Date().toISOString()
    });

    console.log("模拟支付成功：", orderNo);

    return NextResponse.json({
      success: true,
      message: "模拟支付成功",
      orderNo: orderNo
    });

  } catch (error) {
    console.error("模拟支付回调失败:", error);
    return NextResponse.json(
      { message: "模拟支付回调失败" },
      { status: 500 }
    );
  }
}