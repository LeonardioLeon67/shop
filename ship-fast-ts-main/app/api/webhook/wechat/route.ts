import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Order from "@/models/Order";
import VirtualProduct from "@/models/VirtualProduct";
import { getWechatPayService } from "@/libs/wechat-pay";

export async function POST(request: Request) {
  try {
    const xmlData = await request.text();
    
    const wechatPay = getWechatPayService();
    const verification = wechatPay.verifyNotify(xmlData);
    
    if (!verification.valid) {
      console.error("微信支付回调验签失败");
      return new Response(
        '<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[签名失败]]></return_msg></xml>',
        { 
          status: 400,
          headers: { 'Content-Type': 'application/xml' }
        }
      );
    }

    const data = verification.data;
    
    // 检查支付状态
    if (data.result_code !== 'SUCCESS' || data.return_code !== 'SUCCESS') {
      console.error("微信支付失败:", data);
      return new Response(
        '<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>',
        { 
          headers: { 'Content-Type': 'application/xml' }
        }
      );
    }

    await connectMongo();

    // 查找订单
    const order = await Order.findOne({ orderNo: data.out_trade_no });
    if (!order) {
      console.error("订单不存在:", data.out_trade_no);
      return new Response(
        '<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[订单不存在]]></return_msg></xml>',
        { 
          status: 404,
          headers: { 'Content-Type': 'application/xml' }
        }
      );
    }

    // 避免重复处理
    if (order.paymentStatus === 'paid') {
      return new Response(
        '<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>',
        { 
          headers: { 'Content-Type': 'application/xml' }
        }
      );
    }

    // 更新订单状态
    order.paymentStatus = 'paid';
    order.paymentId = data.transaction_id;
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

    console.log(`微信支付成功处理订单: ${order.orderNo}`);

    // 这里可以添加发送邮件通知的逻辑
    // await sendOrderConfirmationEmail(order);

    return new Response(
      '<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>',
      { 
        headers: { 'Content-Type': 'application/xml' }
      }
    );

  } catch (error) {
    console.error("处理微信支付回调失败:", error);
    return new Response(
      '<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[系统错误]]></return_msg></xml>',
      { 
        status: 500,
        headers: { 'Content-Type': 'application/xml' }
      }
    );
  }
}