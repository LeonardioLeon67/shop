import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import VirtualProduct from "@/models/VirtualProduct";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();
    
    const product = await VirtualProduct.findById(params.id).lean();
    
    if (!product) {
      return NextResponse.json(
        { message: "产品不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("获取产品详情失败:", error);
    return NextResponse.json(
      { message: "获取产品详情失败" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();
    
    const body = await request.json();
    
    const product = await VirtualProduct.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return NextResponse.json(
        { message: "产品不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("更新产品失败:", error);
    return NextResponse.json(
      { message: "更新产品失败" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();
    
    const product = await VirtualProduct.findByIdAndDelete(params.id);
    
    if (!product) {
      return NextResponse.json(
        { message: "产品不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "产品删除成功" });
  } catch (error) {
    console.error("删除产品失败:", error);
    return NextResponse.json(
      { message: "删除产品失败" },
      { status: 500 }
    );
  }
}