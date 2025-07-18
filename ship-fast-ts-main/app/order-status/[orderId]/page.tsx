"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Order {
  _id: string;
  orderNo: string;
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  product: {
    name: string;
    serviceType: string;
    planDetails: {
      duration: string;
      features: string[];
    };
  };
  rechargeInfo: {
    customerAccount: {
      email: string;
    };
    rechargeStatus: string;
    completedAt?: string;
    rechargeNotes?: string;
  };
  createdAt: string;
  paidAt?: string;
}

export default function OrderStatusPage({ params }: { params: { orderId: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
    
    // 如果订单状态不是完成状态，每30秒刷新一次
    const interval = setInterval(() => {
      if (order && (order.paymentStatus !== 'paid' || order.rechargeInfo.rechargeStatus !== 'completed')) {
        fetchOrder();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [params.orderId, order]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      } else if (response.status === 404) {
        router.push("/products");
      }
    } catch (error) {
      console.error("获取订单失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return { text: "待支付", color: "badge-warning" };
      case "paid":
        return { text: "已支付", color: "badge-success" };
      case "failed":
        return { text: "支付失败", color: "badge-error" };
      case "refunded":
        return { text: "已退款", color: "badge-info" };
      default:
        return { text: status, color: "badge-ghost" };
    }
  };

  const getRechargeStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return { text: "待处理", color: "badge-warning" };
      case "processing":
        return { text: "处理中", color: "badge-info" };
      case "completed":
        return { text: "已完成", color: "badge-success" };
      case "failed":
        return { text: "失败", color: "badge-error" };
      default:
        return { text: status, color: "badge-ghost" };
    }
  };

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case "netflix":
        return "🎬";
      case "chatgpt":
        return "🤖";
      default:
        return "💳";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">订单不存在</h2>
          <Link href="/products" className="btn btn-primary">
            返回产品页
          </Link>
        </div>
      </div>
    );
  }

  const paymentStatus = getPaymentStatusText(order.paymentStatus);
  const rechargeStatus = getRechargeStatusText(order.rechargeInfo.rechargeStatus);

  return (
    <div className="min-h-screen bg-base-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">订单详情</h1>
              <div className="text-right">
                <div className="text-sm text-base-content/70">订单号</div>
                <div className="font-mono text-lg">{order.orderNo}</div>
              </div>
            </div>

            {/* 订单状态概览 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="stat bg-base-200 rounded-lg">
                <div className="stat-title">支付状态</div>
                <div className="stat-value text-lg">
                  <span className={`badge ${paymentStatus.color} badge-lg`}>
                    {paymentStatus.text}
                  </span>
                </div>
              </div>
              
              <div className="stat bg-base-200 rounded-lg">
                <div className="stat-title">代充状态</div>
                <div className="stat-value text-lg">
                  <span className={`badge ${rechargeStatus.color} badge-lg`}>
                    {rechargeStatus.text}
                  </span>
                </div>
              </div>
              
              <div className="stat bg-base-200 rounded-lg">
                <div className="stat-title">订单金额</div>
                <div className="stat-value text-lg text-primary">
                  ¥{order.totalAmount}
                </div>
              </div>
            </div>

            {/* 产品信息 */}
            <div className="card bg-base-200 mb-6">
              <div className="card-body">
                <h2 className="card-title">
                  <span className="text-4xl mr-2">
                    {getServiceIcon(order.product.serviceType)}
                  </span>
                  {order.product.name}
                </h2>
                <div className="flex items-center gap-2 mb-2">
                  <div className="badge badge-primary">{order.product.planDetails.duration}</div>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">套餐特色:</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {order.product.planDetails.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 代充信息 */}
            <div className="card bg-base-200 mb-6">
              <div className="card-body">
                <h2 className="card-title">代充信息</h2>
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold">代充账号:</span>
                    <span className="ml-2 font-mono">{order.rechargeInfo.customerAccount.email}</span>
                  </div>
                  
                  {order.rechargeInfo.rechargeNotes && (
                    <div>
                      <span className="font-semibold">代充备注:</span>
                      <div className="mt-1 p-3 bg-base-100 rounded">
                        {order.rechargeInfo.rechargeNotes}
                      </div>
                    </div>
                  )}
                  
                  {order.rechargeInfo.completedAt && (
                    <div>
                      <span className="font-semibold">完成时间:</span>
                      <span className="ml-2">
                        {new Date(order.rechargeInfo.completedAt).toLocaleString("zh-CN")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 订单进度 */}
            <div className="card bg-base-200 mb-6">
              <div className="card-body">
                <h2 className="card-title">订单进度</h2>
                <ul className="steps steps-vertical">
                  <li className="step step-primary">
                    <div className="text-left">
                      <div className="font-semibold">订单创建</div>
                      <div className="text-sm text-base-content/70">
                        {new Date(order.createdAt).toLocaleString("zh-CN")}
                      </div>
                    </div>
                  </li>
                  
                  <li className={`step ${order.paymentStatus === 'paid' ? 'step-primary' : ''}`}>
                    <div className="text-left">
                      <div className="font-semibold">支付完成</div>
                      {order.paidAt && (
                        <div className="text-sm text-base-content/70">
                          {new Date(order.paidAt).toLocaleString("zh-CN")}
                        </div>
                      )}
                    </div>
                  </li>
                  
                  <li className={`step ${['processing', 'completed'].includes(order.rechargeInfo.rechargeStatus) ? 'step-primary' : ''}`}>
                    <div className="text-left">
                      <div className="font-semibold">开始代充</div>
                      <div className="text-sm text-base-content/70">
                        我们将在收到付款后24小时内开始处理
                      </div>
                    </div>
                  </li>
                  
                  <li className={`step ${order.rechargeInfo.rechargeStatus === 'completed' ? 'step-primary' : ''}`}>
                    <div className="text-left">
                      <div className="font-semibold">代充完成</div>
                      {order.rechargeInfo.completedAt && (
                        <div className="text-sm text-base-content/70">
                          {new Date(order.rechargeInfo.completedAt).toLocaleString("zh-CN")}
                        </div>
                      )}
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* 支付信息 */}
            <div className="card bg-base-200">
              <div className="card-body">
                <h2 className="card-title">支付信息</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>支付方式:</span>
                    <span className="capitalize">
                      {order.paymentMethod === 'wechat' ? '微信支付' : '支付宝'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>订单金额:</span>
                    <span className="font-semibold">¥{order.totalAmount}</span>
                  </div>
                  {order.paymentStatus === 'pending' && (
                    <div className="alert alert-warning mt-4">
                      <div>
                        <span className="font-semibold">待支付</span>
                        <p className="text-sm">请完成支付以开始代充服务</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="card-actions justify-center mt-6">
              <Link href="/products" className="btn btn-outline">
                继续购买
              </Link>
              {order.paymentStatus === 'paid' && order.rechargeInfo.rechargeStatus === 'completed' && (
                <Link href="/products" className="btn btn-primary">
                  再次购买
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}