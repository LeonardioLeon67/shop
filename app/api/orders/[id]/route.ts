import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Order from "@/models/Order";
import { findOrderByNo } from "../../../../models/OrderStorage";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 先从内存订单数组中查找
    const order = findOrderByNo(params.id);
    if (order) {
      return NextResponse.json(order);
    }

    // 从内存中获取订单信息（模拟数据库）
    const globalOrders = global.orders || {};
    const globalOrder = globalOrders[params.id];
    
    if (!globalOrder) {
      return NextResponse.json(
        { message: "订单不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json(globalOrder);
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
    
    const order = await (Order as any).findByIdAndUpdate(
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