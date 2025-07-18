import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectMongo from "@/libs/mongoose";
import Order from "@/models/Order";
import VirtualProduct from "@/models/VirtualProduct";
import User from "@/models/User";
import { getWechatPayService } from "@/libs/wechat-pay";
import { getAlipayService } from "@/libs/alipay";

export async function POST(request: Request) {
  try {
    await connectMongo();
    
    const body = await request.json();
    const {
      productId,
      quantity = 1,
      customerEmail,
      customerPhone,
      accountInfo,
      paymentMethod,
      notes
    } = body;

    // 验证必填字段
    if (!productId || !customerEmail || !accountInfo || !paymentMethod) {
      return NextResponse.json(
        { message: "缺少必填字段" },
        { status: 400 }
      );
    }

    // 获取产品信息
    const product = await VirtualProduct.findById(productId);
    if (!product || !product.isActive) {
      return NextResponse.json(
        { message: "产品不存在或已下架" },
        { status: 404 }
      );
    }

    // 检查库存
    if (product.stock < quantity) {
      return NextResponse.json(
        { message: "库存不足" },
        { status: 400 }
      );
    }

    // 获取或创建用户
    let user = await User.findOne({ email: customerEmail });
    if (!user) {
      user = new User({
        email: customerEmail,
        name: customerEmail.split('@')[0],
      });
      await user.save();
    }

    // 生成订单号
    const orderNo = (Order as any).generateOrderNo();

    // 计算总金额
    const totalAmount = product.price * quantity;

    // 创建订单
    const order = new Order({
      orderNo,
      user: user._id,
      product: product._id,
      quantity,
      totalAmount,
      currency: product.currency,
      paymentMethod,
      buyerContact: {
        email: customerEmail,
        phone: customerPhone,
      },
      rechargeInfo: {
        customerAccount: {
          email: accountInfo,
          accountInfo: accountInfo,
        },
      },
      notes,
    });

    await order.save();

    // 生成支付链接
    let paymentUrl = null;
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const notifyUrl = `${baseUrl}/api/webhook/${paymentMethod}`;
    const returnUrl = `${baseUrl}/order-status/${order._id}`;

    try {
      if (paymentMethod === "wechat") {
        const wechatPay = getWechatPayService();
        const result = await wechatPay.createUnifiedOrder({
          orderNo,
          totalFee: Math.round(totalAmount * 100), // 转为分
          productName: product.name,
          notifyUrl,
          clientIp: request.headers.get('x-forwarded-for') || '127.0.0.1',
        });

        if (result.success && result.data.codeUrl) {
          paymentUrl = result.data.codeUrl;
        }
      } else if (paymentMethod === "alipay") {
        const alipay = getAlipayService();
        
        // 判断是否为移动端
        const userAgent = request.headers.get('user-agent') || '';
        const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
        
        if (isMobile) {
          paymentUrl = alipay.createWapPay({
            orderNo,
            totalAmount: totalAmount.toString(),
            subject: product.name,
            body: product.description,
            notifyUrl,
            returnUrl,
            quitUrl: `${baseUrl}/products`,
          });
        } else {
          paymentUrl = alipay.createPagePay({
            orderNo,
            totalAmount: totalAmount.toString(),
            subject: product.name,
            body: product.description,
            notifyUrl,
            returnUrl,
          });
        }
      }
    } catch (paymentError) {
      console.error("创建支付失败:", paymentError);
      // 即使支付创建失败，订单仍然保存，用户可以稍后重试
    }

    return NextResponse.json({
      orderId: order._id,
      orderNo,
      paymentUrl,
      message: "订单创建成功",
    });

  } catch (error) {
    console.error("创建订单失败:", error);
    return NextResponse.json(
      { message: "创建订单失败" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "未登录" },
        { status: 401 }
      );
    }

    await connectMongo();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { message: "用户不存在" },
        { status: 404 }
      );
    }

    const orders = await Order.find({ user: user._id })
      .populate('product')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(orders);
  } catch (error) {
    console.error("获取订单列表失败:", error);
    return NextResponse.json(
      { message: "获取订单列表失败" },
      { status: 500 }
    );
  }
}