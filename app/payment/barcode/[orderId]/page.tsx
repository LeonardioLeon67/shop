"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function BarcodePaymentPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  
  const [authCode, setAuthCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [waitingForPassword, setWaitingForPassword] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);

  // 获取订单信息
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data);
          
          // 如果订单已支付，跳转到订单页面
          if (data.status === 'completed') {
            toast.success("订单已支付");
            router.push(`/user/orders`);
          }
        } else {
          toast.error("获取订单信息失败");
        }
      } catch (error) {
        console.error("获取订单失败:", error);
        toast.error("获取订单信息失败");
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, router]);

  // 处理付款码支付
  const handleBarcodePay = async () => {
    if (!authCode) {
      toast.error("请输入付款码");
      return;
    }

    // 验证付款码格式
    if (!/^\d{16,28}$/.test(authCode)) {
      toast.error("付款码格式不正确，请输入16-28位数字");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/payment/barcode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderNo: order.orderNo,
          authCode,
          paymentMethod: "alipay",
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("支付成功！");
        // 跳转到订单列表
        setTimeout(() => {
          router.push("/user/orders");
        }, 1500);
      } else if (data.waiting) {
        // 等待用户输入密码
        setWaitingForPassword(true);
        toast("请在手机上输入支付密码", { icon: "🔐" });
        // 开始轮询检查支付状态
        startPollingPaymentStatus(order.orderNo);
      } else {
        toast.error(data.message || "支付失败");
      }
    } catch (error) {
      console.error("支付失败:", error);
      toast.error("支付失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  // 轮询检查支付状态
  const startPollingPaymentStatus = (orderNo: string) => {
    setCheckingPayment(true);
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payment/barcode?orderNo=${orderNo}`);
        const data = await response.json();

        if (data.paid) {
          clearInterval(interval);
          setCheckingPayment(false);
          setWaitingForPassword(false);
          toast.success("支付成功！");
          setTimeout(() => {
            router.push("/user/orders");
          }, 1500);
        } else if (!data.waiting) {
          clearInterval(interval);
          setCheckingPayment(false);
          setWaitingForPassword(false);
          toast.error("支付失败或超时");
        }
      } catch (error) {
        console.error("查询支付状态失败:", error);
      }
    }, 2000); // 每2秒查询一次

    // 30秒后停止轮询
    setTimeout(() => {
      clearInterval(interval);
      if (checkingPayment) {
        setCheckingPayment(false);
        setWaitingForPassword(false);
        toast.error("支付超时，请重试");
      }
    }, 30000);
  };

  if (!order) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-base-100 rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-8">付款码支付</h1>
          
          {/* 订单信息 */}
          <div className="bg-base-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">订单信息</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-base-content/70">订单号：</span>
                <span className="font-mono">{order.orderNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/70">商品：</span>
                <span>{order.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/70">金额：</span>
                <span className="text-xl font-bold text-primary">¥{order.amount}</span>
              </div>
            </div>
          </div>

          {/* 付款码输入 */}
          {!waitingForPassword ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  请输入支付宝付款码
                </label>
                <input
                  type="text"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  placeholder="请扫描或输入付款码数字"
                  className="input input-bordered w-full text-lg"
                  maxLength={28}
                  disabled={loading}
                />
                <p className="text-sm text-base-content/70 mt-2">
                  付款码是支付宝付款页面显示的一串数字，通常为16-28位
                </p>
                <p className="text-xs text-base-content/50 mt-1">
                  （由Dulupay提供支付服务）
                </p>
              </div>

              <button
                onClick={handleBarcodePay}
                disabled={loading || !authCode}
                className="btn btn-primary w-full text-lg"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    处理中...
                  </>
                ) : (
                  "确认支付"
                )}
              </button>

              <div className="divider">使用说明</div>
              
              <div className="bg-base-200 rounded-lg p-4 space-y-2 text-sm">
                <p>1. 打开支付宝APP</p>
                <p>2. 点击首页的&ldquo;付钱&rdquo;功能</p>
                <p>3. 展示付款码，输入显示的数字</p>
                <p>4. 点击确认支付完成付款</p>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="loading loading-spinner loading-lg text-primary"></div>
              </div>
              <h3 className="text-xl font-semibold">等待支付确认</h3>
              <p className="text-base-content/70">
                请在手机支付宝上输入支付密码完成支付
              </p>
              <p className="text-sm text-base-content/50">
                正在检查支付状态...
              </p>
            </div>
          )}

          {/* 返回按钮 */}
          <div className="mt-8 text-center">
            <button
              onClick={() => router.back()}
              className="btn btn-ghost"
              disabled={loading || checkingPayment}
            >
              返回
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}