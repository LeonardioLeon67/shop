"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  serviceType: string;
  planDetails: {
    duration: string;
    features: string[];
    originalPrice: number;
  };
}

interface OrderForm {
  customerEmail: string;
  paymentMethod: "alipay" | "wechat";
  notes: string;
  quantity: number;
}

export default function OrderPage({ params }: { params: { productId: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [currentOrderNo, setCurrentOrderNo] = useState<string>("");
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [paymentCheckInterval, setPaymentCheckInterval] = useState<ReturnType<typeof setInterval> | null>(null);
  const [isComponentMounted, setIsComponentMounted] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [qrCodeImage, setQrCodeImage] = useState<string>("");
  const [form, setForm] = useState<OrderForm>({
    customerEmail: "",
    paymentMethod: "alipay",
    notes: "",
    quantity: 1,
  });

  useEffect(() => {
    fetchProduct();
    setIsComponentMounted(true);
    
    // 组件卸载时清理定时器
    return () => {
      setIsComponentMounted(false);
      if (paymentCheckInterval) {
        clearInterval(paymentCheckInterval);
      }
    };
  }, []);

  const fetchProduct = () => {
    // 产品列表
    const mockProducts = [
      {
        _id: "5",
        name: "Pro",
        description: "",
        price: 188,
        currency: "CNY",
        serviceType: "claude",
        planDetails: {
          duration: "月卡",
          features: ["Claude Code 官方源(非镜像源)", "成品号购买", "Sonnet 4", "单人独享号(非合租)", "入门级"],
          originalPrice: 0
        }
      },
      {
        _id: "6",
        name: "Max 5x",
        description: "",
        price: 938,
        currency: "CNY",
        serviceType: "claude",
        planDetails: {
          duration: "月卡",
          features: ["Claude Code 官方源(非镜像源)", "成品号购买", "Opus 4 & Sonnet 4", "单人独享号(非合租)", "职场首选"],
          originalPrice: 0
        }
      },
      {
        _id: "7",
        name: "Max 20x",
        description: "",
        price: 1868,
        currency: "CNY",
        serviceType: "claude",
        planDetails: {
          duration: "月卡",
          features: ["Claude Code 官方源(非镜像源)", "成品号购买", "Opus 4 & Sonnet 4", "单人独享号(非合租)", "用量充足"],
          originalPrice: 0
        }
      },
      {
        _id: "8",
        name: "Pro 增项",
        description: "",
        price: 30,
        currency: "CNY",
        serviceType: "claude",
        planDetails: {
          duration: "月卡",
          features: ["Claude Code 线路服务", "解决封号"],
          originalPrice: 0
        }
      },
      {
        _id: "9",
        name: "Max 5x 增项",
        description: "",
        price: 150,
        currency: "CNY",
        serviceType: "claude",
        planDetails: {
          duration: "月卡",
          features: ["Claude Code 线路服务", "解决封号"],
          originalPrice: 0
        }
      },
      {
        _id: "10",
        name: "Max 20x 增项",
        description: "",
        price: 300,
        currency: "CNY",
        serviceType: "claude",
        planDetails: {
          duration: "月卡",
          features: ["Claude Code 线路服务", "解决封号"],
          originalPrice: 0
        }
      }
    ];

    const foundProduct = mockProducts.find(p => p._id === params.productId);
    if (foundProduct) {
      setProduct(foundProduct);
    } else {
      router.push("/products");
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("表单提交开始");
    if (!product) return;

    setSubmitting(true);
    console.log("设置提交状态为true");
    try {
      // 先创建订单
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
          productName: product.name,
          quantity: form.quantity,
          customerEmail: form.customerEmail,
          paymentMethod: form.paymentMethod,
          notes: form.notes,
          price: product.price * form.quantity,
          duration: product.planDetails.duration,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("订单创建成功:", result);
        setCurrentOrderNo(result.orderNo);
        
        // 生成动态二维码
        const qrResponse = await fetch("/api/payment/qrcode", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderNo: result.orderNo,
            amount: product.price * form.quantity,
            productName: product.name,
            paymentMethod: form.paymentMethod,
          }),
        });

        if (qrResponse.ok) {
          const qrResult = await qrResponse.json();
          setQrCodeUrl(qrResult.qrCodeUrl);
          
          // 生成二维码图片
          try {
            const qrImage = await QRCode.toDataURL(qrResult.qrCodeUrl, {
              width: 256,
              margin: 2,
            });
            setQrCodeImage(qrImage);
          } catch (qrError) {
            console.error("生成二维码图片失败:", qrError);
          }
          
          // 保存订单号到本地存储
          const savedOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
          savedOrders.push({
            orderNo: result.orderNo,
            productName: product.name,
            timestamp: Date.now(),
            status: 'pending'
          });
          localStorage.setItem('userOrders', JSON.stringify(savedOrders));
          
          // 显示支付二维码
          setShowPayment(true);
          // 开始轮询支付状态
          startPaymentCheck(result.orderNo);
        } else {
          // 支付API调用失败，显示错误信息
          console.log("支付API调用失败，状态码:", qrResponse.status);
          try {
            const qrError = await qrResponse.json();
            console.error("支付接口失败:", qrError);
            alert(`支付接口错误: ${qrError.message || '未知错误'}`);
          } catch (e) {
            console.error("解析响应失败:", e);
            alert('支付服务不可用，请稍后再试');
          }
        }
      } else {
        const error = await response.json();
        alert(error.message || "创建订单失败");
      }
    } catch (error) {
      console.error("处理失败:", error);
      
      alert("处理失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  // 轮询检查支付状态
  const startPaymentCheck = (orderNo: string) => {
    setCheckingPayment(true);
    let attempts = 0;
    const maxAttempts = 60; // 最多检查60次（5分钟）
    
    const checkInterval = setInterval(async () => {
      // 检查组件是否仍然挂载
      if (!isComponentMounted) {
        clearInterval(checkInterval);
        return;
      }
      
      attempts++;
      
      try {
        const response = await fetch("/api/orders/check-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderNo }),
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.isPaid) {
            clearInterval(checkInterval);
            setCheckingPayment(false);
            setShowPayment(false);
            if (isComponentMounted) {
              router.push("/");
            }
          }
        }
      } catch (error) {
        console.error("检查支付状态失败:", error);
      }
      
      if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        setCheckingPayment(false);
        // 移除alert，避免在其他页面弹出
        console.log("支付检查超时");
      }
    }, 5000); // 每5秒检查一次
    
    // 保存定时器ID以供清理
    setPaymentCheckInterval(checkInterval);
    
    // 返回清理函数
    return () => clearInterval(checkInterval);
  };

  const handlePaymentConfirm = async () => {
    if (!currentOrderNo) {
      console.error("订单信息错误");
      return;
    }
    
    setVerifyingPayment(true);
    
    // 开始持续轮询支付状态
    const startContinuousCheck = () => {
      let attempts = 0;
      const maxAttempts = 120; // 最多检查10分钟
      
      const checkInterval = setInterval(async () => {
        // 检查组件是否仍然挂载
        if (!isComponentMounted) {
          clearInterval(checkInterval);
          setPaymentCheckInterval(null);
          return;
        }
        
        attempts++;
        
        try {
          const response = await fetch("/api/orders/confirm-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ orderNo: currentOrderNo }),
          });
          
          const result = await response.json();
          
          if (response.ok && result.success) {
            // 支付成功
            clearInterval(checkInterval);
            setPaymentCheckInterval(null);
            setVerifyingPayment(false);
            setShowPayment(false);
            if (isComponentMounted) {
              router.push("/");
            }
          } else {
            // 还未支付，继续等待
            console.log(`第${attempts}次检查: 支付未完成，继续等待...`);
          }
        } catch (error) {
          console.error("检查支付状态失败:", error);
        }
        
        if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          setPaymentCheckInterval(null);
          setVerifyingPayment(false);
          // 只在组件仍然挂载时显示提示
          if (isComponentMounted) {
            console.log("支付验证超时");
          }
        }
      }, 5000); // 每5秒检查一次
      
      // 保存interval ID
      setPaymentCheckInterval(checkInterval);
    };
    
    // 开始轮询
    startContinuousCheck();
  };

  const getAccountPlaceholder = () => {
    return "请输入您的Claude账号信息";
  };

  const getServiceInstructions = (): null => {
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-400">加载中...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">产品不存在</h2>
          <button onClick={() => router.push("/products")} className="btn btn-primary">
            返回产品页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 产品信息 */}
          <div className="card bg-base-100 shadow-xl" style={{ borderRadius: '1rem' }}>
            <div className="card-body">
              <h2 className="card-title text-3xl mb-4">{product.name}</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 text-lg">套餐详情</h3>
                  <div className="badge bg-blue-300 text-blue-800 border-blue-300 font-bold mb-2 text-base px-3 py-1">{product.planDetails.duration}</div>
                  <ul className="space-y-1">
                    {product.planDetails.features.map((feature, index) => (
                      <li key={index} className="text-base">
                        {(() => {
                          // 处理多个关键词高亮
                          let displayFeature = feature;
                          const keywords = ['Claude Code', '官方源(非镜像源)', '线路服务'];
                          
                          // 为每个关键词创建带样式的版本
                          keywords.forEach(keyword => {
                            if (displayFeature.includes(keyword)) {
                              displayFeature = displayFeature.replace(
                                keyword,
                                `<span class="title-blue">${keyword}</span>`
                              );
                            }
                          });
                          
                          return <span dangerouslySetInnerHTML={{ __html: displayFeature }} />;
                        })()}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="divider"></div>
                
                <div>
                  <h3 className="font-semibold mb-2 text-lg">价格信息</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-base font-bold text-gray-400" style={{fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif', letterSpacing: '0.5px', whiteSpace: 'nowrap'}}>¥{product.price}/月</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 订单表单 */}
          <div className="card bg-base-100 shadow-xl" style={{ borderRadius: '1rem' }}>
            <div className="card-body">
              <h2 className="card-title mb-4 text-2xl">填写订单信息</h2>
              
              {getServiceInstructions()}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-base">联系邮箱</span>
                  </label>
                  <input
                    type="email"
                    className="input input-bordered text-base"
                    value={form.customerEmail}
                    onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                    required
                    placeholder="用于接收订单通知"
                  />
                </div>



                <div className="form-control">
                  <label className="label justify-start gap-3">
                    <span className="label-text text-base">数量</span>
                    <input
                      type="number"
                      min="1"
                      value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="input input-xs input-bordered text-center text-sm font-mono focus:outline-none"
                      style={{width: '4.5rem'}}
                    />
                  </label>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-base">支付方式</span>
                  </label>
                  <div className="flex gap-4">
                    <label className="cursor-pointer label flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="alipay"
                        checked={form.paymentMethod === "alipay"}
                        onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as "alipay" | "wechat" })}
                        className="radio radio-primary"
                      />
                      <span className="label-text ml-2 text-base flex items-center gap-1">
                        <img src="/alipay-icon.png" alt="支付宝" className="w-5 h-5 object-contain" />
                        支付宝
                      </span>
                    </label>
                    <label className="cursor-pointer label flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="wechat"
                        checked={form.paymentMethod === "wechat"}
                        onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as "alipay" | "wechat" })}
                        className="radio radio-primary"
                      />
                      <span className="label-text ml-2 text-base flex items-center gap-1">
                        <img src="/wechatpay-icon.webp" alt="微信支付" className="w-5 h-5 object-contain" />
                        微信支付
                      </span>
                    </label>
                  </div>
                </div>


                <div className="divider"></div>

                <div className="flex items-center justify-between text-base font-semibold">
                  <span>总计:</span>
                  <span className="text-base font-bold text-gray-400" style={{fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif', letterSpacing: '0.5px', whiteSpace: 'nowrap'}}>¥{product.price * form.quantity}</span>
                </div>

                <button
                  type="submit"
                  className="btn bg-blue-300 hover:bg-blue-400 text-gray-500 border-blue-300 hover:border-blue-400 w-full text-lg"
                  style={{ fontWeight: 900 }}
                  disabled={submitting}
                >
                  <strong>立即订阅</strong>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* 支付二维码弹窗 */}
        {showPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-bold mb-4 text-center">
                <span style={{fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif', letterSpacing: '0.5px'}}>请扫码支付 ¥{product.price * form.quantity}</span>
              </h3>
              <div className="mb-4">
                {qrCodeImage ? (
                  <img 
                    src={qrCodeImage} 
                    alt={`${form.paymentMethod === 'alipay' ? '支付宝' : '微信支付'}二维码`} 
                    className="w-64 h-64 mx-auto object-contain"
                  />
                ) : (
                  <div className="w-64 h-64 mx-auto flex items-center justify-center bg-gray-100 rounded">
                    <span className="text-gray-500">生成二维码中...</span>
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-600 mb-4 text-center">
                <p>请使用{form.paymentMethod === 'alipay' ? '支付宝' : '微信支付'}扫描二维码</p>
                <p className="text-xs text-gray-500 mt-1">（由Dulupay提供支付服务）</p>
                <p className="mt-2">支付完成后系统会自动确认</p>
                {checkingPayment && (
                  <p className="mt-2 text-primary">正在检测支付状态...</p>
                )}
                {verifyingPayment && (
                  <div className="mt-2">
                    <p className="text-warning">正在等待支付确认...</p>
                    <p className="text-xs text-gray-500 mt-1">请确保已完成支付，系统将自动检测</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // 如果正在验证支付，需要用户确认
                    if (verifyingPayment) {
                      const confirmed = confirm(
                        "您已点击了\"我已支付\"，系统正在验证中。\n\n如果您已经完成支付，建议不要取消，以免丢失订单信息。\n\n确定要取消吗？"
                      );
                      if (!confirmed) {
                        return;
                      }
                    }
                    
                    // 如果有订单号，保存到本地存储
                    if (currentOrderNo) {
                      const savedOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
                      const orderExists = savedOrders.some((order: any) => order.orderNo === currentOrderNo);
                      if (!orderExists) {
                        savedOrders.push({
                          orderNo: currentOrderNo,
                          productName: product?.name || '',
                          timestamp: Date.now(),
                          status: verifyingPayment ? 'verifying' : 'pending'
                        });
                        localStorage.setItem('userOrders', JSON.stringify(savedOrders));
                      }
                    }
                    
                    // 清除支付检查的定时器
                    if (paymentCheckInterval) {
                      clearInterval(paymentCheckInterval);
                      setPaymentCheckInterval(null);
                    }
                    // 重置所有状态
                    setShowPayment(false);
                    setPaymentConfirmed(false);
                    setVerifyingPayment(false);
                  }}
                  className="btn btn-ghost flex-1"
                >
                  取消
                </button>
                <button
                  onClick={handlePaymentConfirm}
                  className={`btn btn-primary flex-1`}
                  disabled={verifyingPayment}
                >
                  {verifyingPayment ? (
                    <span className="flex items-center justify-center">
                      验证中...
                    </span>
                  ) : (
                    "我已支付"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}