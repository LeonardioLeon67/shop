import { NextResponse } from "next/server";

// 这个API用于手动标记订单为已支付（模拟管理员确认支付）
export async function POST(request: Request) {
  try {
    const { orderNo } = await request.json();
    
    if (!orderNo) {
      return NextResponse.json(
        { message: "订单号不能为空" },
        { status: 400 }
      );
    }

    // 从内存中获取订单信息
    const order = global.orders?.[orderNo];
    
    if (!order) {
      return NextResponse.json(
        { message: "订单不存在" },
        { status: 404 }
      );
    }

    // 标记订单为已支付
    order.paymentStatus = 'paid';
    order.status = 'completed';
    order.paidAt = new Date();

    console.log(`订单 ${orderNo} 已手动标记为支付成功`);

    return NextResponse.json({
      success: true,
      message: "订单已标记为支付成功",
    });

  } catch (error) {
    console.error("标记支付失败:", error);
    return NextResponse.json(
      { message: "标记支付失败" },
      { status: 500 }
    );
  }
}