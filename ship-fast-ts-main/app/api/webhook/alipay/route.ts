import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Order from "@/models/Order";
import VirtualProduct from "@/models/VirtualProduct";
import { getAlipayService } from "@/libs/alipay";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const params: Record<string, any> = {};
    
    // 将FormData转换为普通对象
    Array.from(formData.entries()).forEach(([key, value]) => {
      params[key] = value.toString();
    });
    
    const alipay = getAlipayService();
    const verification = alipay.verifyNotify(params);
    
    if (!verification.valid) {
      console.error("支付宝回调验签失败");
      return new Response("failure", { status: 400 });
    }

    const data = verification.data;
    
    // 检查支付状态
    if (data.trade_status !== 'TRADE_SUCCESS' && data.trade_status !== 'TRADE_FINISHED') {
      console.error("支付宝支付状态异常:", data.trade_status);
      return new Response("success"); // 即使状态异常，也返回success避免支付宝重复推送
    }

    await connectMongo();

    // 查找订单
    const order = await Order.findOne({ orderNo: data.out_trade_no });
    if (!order) {
      console.error("订单不存在:", data.out_trade_no);
      return new Response("failure", { status: 404 });
    }

    // 避免重复处理
    if (order.paymentStatus === 'paid') {
      return new Response("success");
    }

    // 验证金额
    const paidAmount = parseFloat(data.total_amount);
    if (Math.abs(paidAmount - order.totalAmount) > 0.01) {
      console.error("支付金额不匹配:", {
        expected: order.totalAmount,
        actual: paidAmount,
        orderNo: order.orderNo
      });
      return new Response("failure", { status: 400 });
    }

    // 更新订单状态
    order.paymentStatus = 'paid';
    order.paymentId = data.trade_no;
    order.paidAt = new Date();
    order.status = 'processing';
    order.rechargeInfo.rechargeStatus = 'pending';
    
    await order.save();

    // 更新产品销售统计
    await VirtualProduct.findByIdAndUpdate(order.product, {
      $inc: {
        'sales.totalSold': order.quantity,
        'sales.totalRevenue': order.totalAmount
      }
    });

    console.log(`支付宝支付成功处理订单: ${order.orderNo}`);

    // 这里可以添加发送邮件通知的逻辑
    // await sendOrderConfirmationEmail(order);

    return new Response("success");

  } catch (error) {
    console.error("处理支付宝回调失败:", error);
    return new Response("failure", { status: 500 });
  }
}