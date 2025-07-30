import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import connectMongo from "@/libs/mongoose";
import VirtualProduct from "@/models/VirtualProduct";

export async function GET() {
  try {
    // 读取Claude产品数据
    const claudeProductsPath = path.join(process.cwd(), "claude-products.json");
    
    let products = [];
    if (fs.existsSync(claudeProductsPath)) {
      const claudeProducts = JSON.parse(fs.readFileSync(claudeProductsPath, "utf8"));
      products = claudeProducts.map((product: any, index: number) => ({
        _id: `claude-${index + 1}`,
        ...product,
        isActive: true,
        createdAt: new Date().toISOString(),
        sales: {
          totalSold: 0,
          totalRevenue: 0
        }
      }));
    }

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