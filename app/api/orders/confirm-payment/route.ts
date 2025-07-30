import { NextResponse } from "next/server";
import { sendOrderEmail } from "@/libs/email-service";

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

    // 检查订单是否已经被标记为已支付
    if (order.paymentStatus === 'paid') {
      // 订单已支付，可以返回成功
    } else {
      // 订单还未支付，返回失败
      return NextResponse.json({
        success: false,
        message: "支付验证中，请稍后再试或联系客服",
      }, { status: 400 });
    }

    // 发送邮件通知（在后台进行）
    setTimeout(async () => {
      try {
        await sendOrderEmail({
          customerEmail: order.customerEmail,
          productName: order.productName,
          price: order.price,
          duration: order.duration,
          account: order.account,
          password: order.password,
          orderNo: order.orderNo,
        });
        console.log(`订单 ${order.orderNo} 邮件发送成功`);
      } catch (emailError) {
        console.error("发送邮件失败:", emailError);
      }
    }, 1000);

    return NextResponse.json({
      success: true,
      message: "支付确认成功",
    });

  } catch (error) {
    console.error("确认支付失败:", error);
    return NextResponse.json(
      { message: "确认支付失败" },
      { status: 500 }
    );
  }
}