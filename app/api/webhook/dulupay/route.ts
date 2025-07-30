import { NextRequest, NextResponse } from "next/server";
import crypto from 'crypto';
import Order from "@/models/Order";
import connectMongo from "@/libs/mongoose";

export async function GET(request: NextRequest) {
  try {
    // 获取GET参数
    const url = new URL(request.url);
    const params: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    console.log('Dulupay webhook received:', params);

    // 验证签名 - 根据SDK的验证方式
    const sign = params.sign;
    const sign_type = params.sign_type;
    
    // 创建签名验证参数（排除sign和sign_type）
    const verifyParams: Record<string, string> = {};
    Object.keys(params).forEach(key => {
      if (key !== 'sign' && key !== 'sign_type' && params[key] !== '') {
        verifyParams[key] = params[key];
      }
    });
    
    // 按键名升序排列参数
    const sortedKeys = Object.keys(verifyParams).sort();
    const signString = sortedKeys
      .map(key => `${key}=${verifyParams[key]}`)
      .join('&') + process.env.DULUPAY_MD5_KEY;
    
    const expectedSign = crypto.createHash('md5').update(signString).digest('hex');
    
    if (sign !== expectedSign) {
      console.error('Dulupay webhook signature verification failed');
      return NextResponse.json({ message: 'fail' }, { status: 400 });
    }

    // 处理支付成功通知
    const trade_status = params.trade_status;
    const orderNo = params.out_trade_no;
    const trade_no = params.trade_no;
    const money = params.money;

    if (trade_status === 'TRADE_SUCCESS') {
      // 更新内存中的订单状态
      if (global.orders && global.orders[orderNo]) {
        const order = global.orders[orderNo];
        order.status = 'processing';
        order.paymentStatus = 'paid';
        order.paidAt = new Date();
        (order as any).paymentId = trade_no;
        (order as any).paymentDetails = {
          ...(order as any).paymentDetails,
          transactionId: trade_no,
          totalAmount: money,
          webhookData: params
        };

        console.log(`Dulupay webhook: 订单 ${orderNo} 支付成功，交易号: ${trade_no}`);
      }

      // 如果使用MongoDB，也更新数据库
      try {
        await connectMongo();
        const order = await Order.findOne({ orderNo });

        if (order && order.status !== 'completed') {
          order.status = 'completed';
          (order as any).paymentId = trade_no;
          order.paymentStatus = 'paid';
          order.paidAt = new Date();
          (order as any).paymentDetails = {
            ...(order as any).paymentDetails,
            transactionId: trade_no,
            totalAmount: money,
            webhookData: params
          };

          await order.save();
        }
      } catch (dbError) {
        console.log('MongoDB更新失败，仅更新内存:', dbError.message);
      }
    }

    // 返回成功响应
    return new NextResponse('success', { status: 200 });
    
  } catch (error) {
    console.error('Dulupay webhook处理失败:', error);
    return new NextResponse('fail', { status: 500 });
  }
}