'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Order {
  _id: string;
  orderNo: string;
  productName: string;
  amount: number;
  isPaid: boolean;
  credentials?: string;
  createdAt: string;
}

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      router.push('/login');
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders/my-orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('获取订单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="text-lg text-gray-400">加载中...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-400">我的订单</h1>
          <Link href="/">
            <span className="text-gray-400 hover:text-gray-600 hover:underline cursor-pointer text-lg">
              返回首页
            </span>
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="card bg-base-100 shadow-xl p-8 text-center">
            <p className="text-gray-400 text-lg">暂无订单记录</p>
            <Link href="/">
              <button className="btn btn-primary mt-4 text-lg">去购买</button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <div key={order._id} className="card bg-base-100 shadow-xl p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">
                      {order.productName}
                    </h3>
                    <p className="text-sm text-gray-500">订单号: {order.orderNo}</p>
                    <p className="text-sm text-gray-500">
                      下单时间: {new Date(order.createdAt).toLocaleString()}
                    </p>
                    <p className="text-lg font-semibold text-gray-400 mt-2">
                      ¥{order.amount}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`badge ${order.isPaid ? 'badge-success' : 'badge-warning'} text-lg px-4 py-3`}>
                      {order.isPaid ? '已支付' : '待支付'}
                    </span>
                    {order.isPaid && order.credentials && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800">
                          账号信息已发送到您的邮箱
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}