import { NextResponse } from "next/server";
import { getDulupayService } from "@/libs/dulupay";

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

    // 如果订单已经是已支付状态，直接返回
    if (order.paymentStatus === 'paid') {
      return NextResponse.json({
        isPaid: true,
        status: order.status,
        paymentStatus: order.paymentStatus,
      });
    }

    // 通过Dulupay API查询订单支付状态
    try {
      const dulupayService = getDulupayService();
      const result = await dulupayService.queryOrder(orderNo);
      
      if (result.success && result.data.isPaid) {
        // 更新订单状态为已支付
        order.paymentStatus = 'paid';
        order.status = 'processing';
        order.paidAt = new Date();
        
        console.log(`订单 ${orderNo} 支付成功，已更新状态`);
        
        return NextResponse.json({
          isPaid: true,
          status: order.status,
          paymentStatus: order.paymentStatus,
        });
      }
    } catch (queryError) {
      console.error("查询Dulupay订单状态失败:", queryError);
      // 继续返回当前状态，不抛出错误
    }

    // 返回当前支付状态
    return NextResponse.json({
      isPaid: order.paymentStatus === 'paid',
      status: order.status,
      paymentStatus: order.paymentStatus,
    });

  } catch (error) {
    console.error("检查支付状态失败:", error);
    return NextResponse.json(
      { message: "检查支付状态失败" },
      { status: 500 }
    );
  }
}