import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectMongo from "@/libs/mongoose";
import Order from "@/models/Order";
import VirtualProduct from "@/models/VirtualProduct";
import User from "@/models/User";
import { sendOrderEmail } from "@/libs/email-service";
import { UserModel } from "../../../models/MemoryUser";
import { addOrder } from "../../../models/OrderStorage";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productId,
      productName,
      quantity = 1,
      customerEmail,
      customerPhone,
      accountInfo,
      paymentMethod,
      notes,
      price,
      duration
    } = body;

    // 验证必填字段
    if (!productId || !customerEmail || !paymentMethod) {
      return NextResponse.json(
        { message: "缺少必填字段" },
        { status: 400 }
      );
    }

    // 检查用户登录状态
    let userId = null;
    const token = request.cookies.get('auth_token')?.value;
    if (token) {
      const decoded = UserModel.verifyToken(token);
      if (decoded) {
        userId = decoded.id;
      }
    }

    // 生成订单号
    const orderNo = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 模拟数据库连接和产品验证
    let dbConnected = false;
    let product = null;
    
    try {
      await connectMongo();
      dbConnected = true;
      product = await VirtualProduct.findById(productId);
    } catch (dbError) {
      console.log("数据库连接失败，使用模拟模式:", dbError.message);
    }

    // 生成模拟的账号密码
    const account = `user_${Date.now()}@example.com`;
    const password = `pwd_${Math.random().toString(36).substring(2, 15)}`;

    // 创建订单对象
    const orderData = {
      _id: orderNo,
      orderNo,
      productId,
      productName: productName || '订阅服务',
      customerEmail,
      paymentMethod,
      amount: price || 100,
      duration: duration || '1个月',
      status: 'pending',
      isPaid: false,
      createdAt: new Date().toISOString(),
      userId: userId, // 关联用户ID
      credentials: {
        email: account,
        password: password
      }
    };

    // 保存到内存订单数组
    addOrder(orderData);

    // 在内存中保存订单信息（模拟数据库）
    global.orders = global.orders || {};
    global.orders[orderNo] = {
      orderNo,
      productId,
      productName: productName || '订阅服务',
      customerEmail,
      paymentMethod,
      price: price || 100,
      duration: duration || '1个月',
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date(),
      account,
      password
    };

    // 邮件服务暂时禁用
    console.log("邮件服务已禁用，订单信息：", {
      customerEmail,
      productName: productName || '订阅服务',
      orderNo,
      account,
      password
    });

    return NextResponse.json({
      orderId: orderNo,
      orderNo,
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