import { NextRequest, NextResponse } from "next/server";
import { getDulupayService } from "@/libs/dulupay";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderNo,
      amount,
      productName,
      paymentMethod,
    } = body;

    // 验证必填字段
    if (!orderNo || !amount || !productName || !paymentMethod) {
      return NextResponse.json(
        { message: "缺少必填字段" },
        { status: 400 }
      );
    }

    // 生产环境Webhook URL
    const notifyUrl = `${process.env.NEXTAUTH_URL}/api/webhook/dulupay`;
    
    if (paymentMethod === 'alipay' || paymentMethod === 'wechat') {
      // 检查 Dulupay 配置
      if (!process.env.DULUPAY_API_URL || !process.env.DULUPAY_MERCHANT_ID || !process.env.DULUPAY_MD5_KEY) {
        return NextResponse.json(
          { message: "Dulupay配置不完整，请检查环境变量" },
          { status: 500 }
        );
      }

      try {
        // 获取客户端IP
        const clientIp = request.headers.get('x-forwarded-for') || 
                        request.headers.get('x-real-ip') || 
                        '127.0.0.1';
        
        // 调用 Dulupay API生成二维码
        const dulupayService = getDulupayService();
        const result = await dulupayService.createQrPay({
          orderNo,
          totalAmount: amount.toString(),
          subject: productName,
          body: `商品：${productName}，订单号：${orderNo}`,
          notifyUrl,
          paymentType: paymentMethod as 'alipay' | 'wechat',
          clientIp: clientIp.split(',')[0].trim(), // 如果有多个IP，取第一个
        });

        if (result.success) {
          console.log(`Dulupay二维码生成成功:`, {
            orderNo,
            amount,
            productName,
            paymentMethod,
            qrCode: result.data.qrCode
          });

          return NextResponse.json({
            success: true,
            qrCodeUrl: result.data.qrCode,
            orderNo: result.data.outTradeNo,
            tradeNo: result.data.tradeNo,
          });
        } else {
          console.error("Dulupay二维码生成失败:", result.error);
          return NextResponse.json(
            { message: `Dulupay二维码生成失败: ${result.error}` },
            { status: 500 }
          );
        }
      } catch (error) {
        console.error("调用Dulupay API失败:", error);
        return NextResponse.json(
          { message: `支付接口错误: ${error.message}` },
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
    console.error("生成二维码失败:", error);
    return NextResponse.json(
      { message: "生成二维码失败" },
      { status: 500 }
    );
  }
}