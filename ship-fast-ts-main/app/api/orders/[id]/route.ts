import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Order from "@/models/Order";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongo();
    
    const order = await Order.findById(params.id)
      .populate('product')
      .populate('user', 'name email')
      .lean();
    
    if (!order) {
      return NextResponse.json(
        { message: "订单不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("获取订单详情失败:", error);
    return NextResponse.json(
      { message: "获取订单详情失败" },
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
    const { rechargeStatus, rechargeNotes } = body;
    
    const updateData: any = {};
    
    if (rechargeStatus) {
      updateData['rechargeInfo.rechargeStatus'] = rechargeStatus;
      
      if (rechargeStatus === 'completed') {
        updateData['rechargeInfo.completedAt'] = new Date();
        updateData['status'] = 'completed';
      } else if (rechargeStatus === 'processing') {
        updateData['status'] = 'processing';
      } else if (rechargeStatus === 'failed') {
        updateData['status'] = 'cancelled';
      }
    }
    
    if (rechargeNotes !== undefined) {
      updateData['rechargeInfo.rechargeNotes'] = rechargeNotes;
    }
    
    const order = await Order.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('product');
    
    if (!order) {
      return NextResponse.json(
        { message: "订单不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("更新订单失败:", error);
    return NextResponse.json(
      { message: "更新订单失败" },
      { status: 500 }
    );
  }
}