import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import VirtualProduct from "@/models/VirtualProduct";

export async function GET() {
  try {
    await connectMongo();
    
    const products = await VirtualProduct.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(products);
  } catch (error) {
    console.error("获取产品列表失败:", error);
    return NextResponse.json(
      { message: "获取产品列表失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectMongo();
    
    const body = await request.json();
    const {
      name,
      description,
      price,
      currency = "CNY",
      category,
      serviceType,
      planDetails,
      image,
      stock = 999,
      createdBy
    } = body;

    // 验证必填字段
    if (!name || !description || !price || !category || !serviceType || !planDetails || !createdBy) {
      return NextResponse.json(
        { message: "缺少必填字段" },
        { status: 400 }
      );
    }

    const product = new VirtualProduct({
      name,
      description,
      price,
      currency,
      category,
      serviceType,
      planDetails,
      image,
      stock,
      createdBy
    });

    await product.save();

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("创建产品失败:", error);
    return NextResponse.json(
      { message: "创建产品失败" },
      { status: 500 }
    );
  }
}