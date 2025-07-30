import { NextRequest, NextResponse } from "next/server";
import { getDulupayService } from "@/libs/dulupay";
import Order from "@/models/Order";
import connectMongo from "@/libs/mongoose";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderNo,
      authCode, // 用户付款码
      paymentMethod,
    } = body;

    // 验证必填字段
    if (!orderNo || !authCode || !paymentMethod) {
      return NextResponse.json(
        { message: "缺少必填字段" },
        { status: 400 }
      );
    }

    // 验证付款码格式（支付宝付款码通常是28位数字）
    if (!/^\d{16,28}$/.test(authCode)) {
      return NextResponse.json(
        { message: "付款码格式不正确" },
        { status: 400 }
      );
    }

    // 连接数据库获取订单信息
    await connectMongo();
    const order = await Order.findOne({ orderNo });
    
    if (!order) {
      return NextResponse.json(
        { message: "订单不存在" },
        { status: 404 }
      );
    }

    if (order.status === 'completed') {
      return NextResponse.json(
        { message: "订单已支付" },
        { status: 400 }
      );
    }

    // 生产环境Webhook URL
    const notifyUrl = `${process.env.NEXTAUTH_URL}/api/webhook/dulupay`;
    
    if (paymentMethod === 'alipay' || paymentMethod === 'dulupay') {
      // 检查 Dulupay 配置
      if (!process.env.DULUPAY_API_URL || !process.env.DULUPAY_MERCHANT_ID || !process.env.DULUPAY_MD5_KEY) {
        return NextResponse.json(
          { message: "Dulupay配置不完整，请检查环境变量" },
          { status: 500 }
        );
      }

      try {
        // 调用 Dulupay 付款码支付API（支持支付宝支付）
        const dulupayService = getDulupayService();
        const result = await dulupayService.barcodePay({
          orderNo,
          authCode,
          totalAmount: order.amount.toString(),
          subject: order.productName,
          body: `商品：${order.productName}，订单号：${orderNo}`,
          notifyUrl,
        });

        if (result.success) {
          // 支付成功，更新订单状态
          order.status = 'completed';
          order.paymentId = result.data.tradeNo;
          order.paymentStatus = 'paid';
          order.paidAt = new Date();
          order.paymentDetails = {
            ...order.paymentDetails,
            ...result.data
          };
          await order.save();

          console.log(`Dulupay付款码支付成功:`, {
            orderNo,
            tradeNo: result.data.tradeNo,
            amount: result.data.totalAmount,
            buyerLogonId: result.data.buyerLogonId
          });

          return NextResponse.json({
            success: true,
            message: "支付成功",
            data: {
              orderNo: result.data.outTradeNo,
              tradeNo: result.data.tradeNo,
              totalAmount: result.data.totalAmount,
              buyerLogonId: result.data.buyerLogonId,
            }
          });
        } else if (result.data?.waiting) {
          // 等待用户输入密码
          return NextResponse.json({
            success: false,
            waiting: true,
            message: "等待用户输入支付密码",
            orderNo: result.data.outTradeNo,
          });
        } else {
          console.error("Dulupay付款码支付失败:", result.error);
          return NextResponse.json(
            { message: `付款码支付失败: ${result.error}` },
            { status: 400 }
          );
        }
      } catch (error) {
        console.error("调用Dulupay API失败:", error);
        return NextResponse.json(
          { message: "调用Dulupay API失败，请检查配置" },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { message: "不支持的支付方式" },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("付款码支付失败:", error);
    return NextResponse.json(
      { message: "付款码支付失败" },
      { status: 500 }
    );
  }
}

// 查询付款码支付结果（用于等待用户输入密码的情况）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNo = searchParams.get('orderNo');

    if (!orderNo) {
      return NextResponse.json(
        { message: "缺少订单号" },
        { status: 400 }
      );
    }

    // 根据订单信息确定支付方式
    await connectMongo();
    const order = await Order.findOne({ orderNo });
    
    if (!order) {
      return NextResponse.json(
        { message: "订单不存在" },
        { status: 404 }
      );
    }

    // 统一使用 Dulupay 查询订单（包括支付宝支付）
    const dulupayService = getDulupayService();
    const result = await dulupayService.queryOrder(orderNo);

    if (result.success) {
      const tradeStatus = result.data.trade_status;
      
      // 兼容不同支付方式的状态
      const isSuccess = tradeStatus === 'TRADE_SUCCESS' || 
                       tradeStatus === 'TRADE_FINISHED' || 
                       tradeStatus === 'SUCCESS';
      
      const isWaiting = tradeStatus === 'WAIT_BUYER_PAY' || 
                       tradeStatus === 'USERPAYING' || 
                       tradeStatus === 'NOTPAY';
      
      if (isSuccess) {
        // 更新订单状态
        if (order && order.status !== 'completed') {
          order.status = 'completed';
          order.paymentId = result.data.trade_no;
          order.paymentStatus = 'paid';
          order.paidAt = new Date();
          order.paymentDetails = {
            ...order.paymentDetails,
            ...result.data
          };
          await order.save();
        }

        return NextResponse.json({
          success: true,
          paid: true,
          data: result.data
        });
      } else if (isWaiting) {
        return NextResponse.json({
          success: true,
          paid: false,
          waiting: true,
          message: "等待买家付款"
        });
      } else {
        return NextResponse.json({
          success: false,
          paid: false,
          message: "交易状态异常"
        });
      }
    } else {
      return NextResponse.json(
        { message: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("查询支付结果失败:", error);
    return NextResponse.json(
      { message: "查询支付结果失败" },
      { status: 500 }
    );
  }
}