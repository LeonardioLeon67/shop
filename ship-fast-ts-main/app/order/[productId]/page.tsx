"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

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
  paymentMethod: "wechat" | "alipay";
  notes: string;
}

export default function OrderPage({ params }: { params: { productId: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<OrderForm>({
    customerEmail: "",
    paymentMethod: "alipay",
    notes: "",
  });

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = () => {
    // 直接使用静态数据，无需异步操作
    const mockProducts = [
      {
        _id: "1",
        name: "Netflix",
        description: "高清画质，支持2个设备同时观看",
        price: 45,
        currency: "CNY",
        serviceType: "netflix",
        planDetails: {
          duration: "1个月",
          features: ["高清1080p", "同时2个设备", "无广告"],
          originalPrice: 68
        }
      },
      {
        _id: "2",
        name: "Netflix",
        description: "高清画质，支持2个设备同时观看",
        price: 120,
        currency: "CNY",
        serviceType: "netflix",
        planDetails: {
          duration: "3个月",
          features: ["高清1080p", "同时2个设备", "无广告"],
          originalPrice: 204
        }
      },
      {
        _id: "3",
        name: "ChatGPT Plus",
        description: "GPT-4访问权限，优先访问新功能",
        price: 165,
        currency: "CNY",
        serviceType: "chatgpt",
        planDetails: {
          duration: "1个月",
          features: ["提供更高的消息限制、文件上传、先进的数据分析和图像生成", "访问深度研究、多个推理模型（o4-mini、o4-mini-high 和 o3），以及GPT-4.5的研究预览版", "创建和使用任务、项目以及自定义GPT", "有限访问Sora视频生成"],
          originalPrice: 200
        }
      },
      {
        _id: "4",
        name: "ChatGPT Pro",
        description: "ChatGPT Pro版本，企业级AI助手",
        price: 1720,
        currency: "CNY",
        serviceType: "chatgpt",
        planDetails: {
          duration: "1个月",
          features: ["无限访问所有推理模型和GPT-4o", "无限访问高级语音", "访问GPT-4.5和Operator的研究预览版", "访问o3 Pro模式，利用更多计算资源为最难的问题提供最佳答案", "扩展访问Sora视频生成", "访问Codex agent的研究预览版"],
          originalPrice: 2000
        }
      },
      {
        _id: "5",
        name: "Claude Pro",
        description: "Claude 3.5 Sonnet，5倍更多使用次数",
        price: 165,
        currency: "CNY",
        serviceType: "claude",
        planDetails: {
          duration: "1个月",
          features: ["使用量是免费版的5倍", "提前体验Claude的新功能"],
          originalPrice: 140
        }
      },
      {
        _id: "6",
        name: "Claude Max 5x",
        description: "Claude 3.5 Sonnet，25倍更多使用次数",
        price: 860,
        currency: "CNY",
        serviceType: "claude",
        planDetails: {
          duration: "1个月",
          features: ["在高流量时段优先访问", "提前体验Claude的新功能", "使用量是Pro版的5倍"],
          originalPrice: 700
        }
      },
      {
        _id: "7",
        name: "Claude Max 20x",
        description: "Claude 3.5 Sonnet，100倍更多使用次数",
        price: 1720,
        currency: "CNY",
        serviceType: "claude",
        planDetails: {
          duration: "1个月",
          features: ["在高流量时段优先访问", "提前体验Claude的新功能", "使用量是Pro版的20倍"],
          originalPrice: 1400
        }
      },
      {
        _id: "8",
        name: "Grok SuperGrok",
        description: "Grok AI助手，智能对话和分析功能",
        price: 250,
        currency: "CNY",
        serviceType: "grok",
        planDetails: {
          duration: "1个月",
          features: ["增加对Grok4的访问", "增加对Grok3的访问", "上下文记忆128,000个令牌", "具备视觉的语音功能"],
          originalPrice: 280
        }
      },
      {
        _id: "9",
        name: "Grok SuperGrok Heavy",
        description: "Grok AI助手重度版，更强大的AI功能",
        price: 2480,
        currency: "CNY",
        serviceType: "grok",
        planDetails: {
          duration: "1个月",
          features: ["Grok4 Heavy独家预览", "提前体验新功能", "包含 SuperGrok 的所有内容"],
          originalPrice: 2800
        }
      }
    ];

    const foundProduct = mockProducts.find(p => p._id === params.productId);
    if (foundProduct) {
      setProduct(foundProduct);
      if (session?.user?.email) {
        setForm(prev => ({ ...prev, customerEmail: session.user.email }));
      }
    } else {
      router.push("/products");
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
          customerEmail: form.customerEmail,
          paymentMethod: form.paymentMethod,
          notes: form.notes,
        }),
      });

      if (response.ok) {
        const { orderId, paymentUrl } = await response.json();
        if (paymentUrl) {
          // 跳转到支付页面
          window.location.href = paymentUrl;
        } else {
          router.push(`/order-status/${orderId}`);
        }
      } else {
        const error = await response.json();
        alert(error.message || "创建订单失败");
      }
    } catch (error) {
      console.error("提交订单失败:", error);
      alert("提交订单失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  const getAccountPlaceholder = () => {
    if (product?.serviceType === "netflix") {
      return "请输入您的Netflix账号邮箱";
    } else if (product?.serviceType === "chatgpt") {
      return "请输入您的OpenAI账号邮箱";
    }
    return "请输入您的账号信息";
  };

  const getServiceInstructions = (): null => {
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
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
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">{product.name}</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">套餐详情</h3>
                  <div className="badge badge-primary mb-2">{product.planDetails.duration}</div>
                  <ul className="space-y-1">
                    {product.planDetails.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <span className="text-success mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="divider"></div>
                
                <div>
                  <h3 className="font-semibold mb-2">价格信息</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        ¥{product.price}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 订单表单 */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">填写订单信息</h2>
              
              {getServiceInstructions()}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">联系邮箱 *</span>
                  </label>
                  <input
                    type="email"
                    className="input input-bordered"
                    value={form.customerEmail}
                    onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                    required
                    placeholder="用于接收订单通知"
                  />
                </div>


                <div className="form-control">
                  <label className="label">
                    <span className="label-text">支付方式 *</span>
                  </label>
                  <div className="flex gap-4">
                    <label className="cursor-pointer label">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="alipay"
                        checked={form.paymentMethod === "alipay"}
                        onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as "alipay" })}
                        className="radio radio-primary"
                      />
                      <span className="label-text ml-2">支付宝</span>
                    </label>
                    <label className="cursor-pointer label">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="wechat"
                        checked={form.paymentMethod === "wechat"}
                        onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as "wechat" })}
                        className="radio radio-primary"
                      />
                      <span className="label-text ml-2">微信支付</span>
                    </label>
                  </div>
                </div>


                <div className="divider"></div>

                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>总计:</span>
                  <span className="text-primary">¥{product.price}</span>
                </div>

                <button
                  type="submit"
                  className={`btn btn-primary w-full ${submitting ? "loading" : ""}`}
                  disabled={submitting}
                >
                  {submitting ? "处理中..." : "立即支付"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}