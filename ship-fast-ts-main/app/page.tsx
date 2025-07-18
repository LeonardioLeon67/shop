"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  serviceType: string;
  planDetails: {
    duration: string;
    features: string[];
    originalPrice: number;
  };
  image?: string;
  isActive: boolean;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    try {
      // 直接使用静态数据，不再尝试API调用
      const mockProducts = [
          {
            _id: "3",
            name: "ChatGPT Plus",
            description: "GPT-4访问权限，优先访问新功能",
            price: 165,
            currency: "CNY",
            category: "ChatGPT代充",
            serviceType: "chatgpt",
            planDetails: {
              duration: "1个月",
              features: ["提供更高的消息限制、文件上传、先进的数据分析和图像生成", "标准和高级语音模式", "访问深度研究、多个推理模型（o4-mini、o4-mini-high 和 o3），以及GPT-4.5", "创建和使用任务、项目以及自定义GPT", "有限访问Sora视频生成"],
              originalPrice: 200
            },
            isActive: true
          },
          {
            _id: "4",
            name: "ChatGPT Pro",
            description: "ChatGPT Pro版本，企业级AI助手",
            price: 1720,
            currency: "CNY",
            category: "ChatGPT代充",
            serviceType: "chatgpt",
            planDetails: {
              duration: "1个月",
              features: ["无限访问所有推理模型和GPT-4o", "无限访问高级语音", "扩展访问深度研究，进行多步骤在线研究以处理复杂任务", "访问GPT-4.5和Operator", "访问o3 Pro模式，利用更多计算资源为最难的问题提供最佳答案", "扩展访问Sora视频生成", "访问Codex agent"],
              originalPrice: 2000
            },
            isActive: true
          },
          {
            _id: "5",
            name: "Claude Pro",
            description: "Claude 3.5 Sonnet，5倍更多使用次数",
            price: 165,
            currency: "CNY",
            category: "Claude代充",
            serviceType: "claude",
            planDetails: {
              duration: "1个月",
              features: ["使用量是免费版的5倍", "提前体验Claude的新功能"],
              originalPrice: 140
            },
            isActive: true
          },
          {
            _id: "6",
            name: "Claude Max 5x",
            description: "Claude 3.5 Sonnet，25倍更多使用次数",
            price: 860,
            currency: "CNY",
            category: "Claude代充",
            serviceType: "claude",
            planDetails: {
              duration: "1个月",
              features: ["在高流量时段优先访问", "提前体验Claude的新功能", "使用量是Pro版的5倍"],
              originalPrice: 700
            },
            isActive: true
          },
          {
            _id: "7",
            name: "Claude Max 20x",
            description: "Claude 3.5 Sonnet，100倍更多使用次数",
            price: 1720,
            currency: "CNY",
            category: "Claude代充",
            serviceType: "claude",
            planDetails: {
              duration: "1个月",
              features: ["在高流量时段优先访问", "提前体验Claude的新功能", "使用量是Pro版的20倍"],
              originalPrice: 1400
            },
            isActive: true
          },
          {
            _id: "8",
            name: "Grok SuperGrok",
            description: "Grok AI助手，智能对话和分析功能",
            price: 250,
            currency: "CNY",
            category: "Grok代充",
            serviceType: "grok",
            planDetails: {
              duration: "1个月",
              features: ["增加对Grok4的访问", "增加对Grok3的访问", "上下文记忆128,000个令牌", "具备视觉的语音功能"],
              originalPrice: 280
            },
            isActive: true
          },
          {
            _id: "9",
            name: "Grok SuperGrok Heavy",
            description: "Grok AI助手重度版，更强大的AI功能",
            price: 2480,
            currency: "CNY",
            category: "Grok代充",
            serviceType: "grok",
            planDetails: {
              duration: "1个月",
              features: ["Grok4 Heavy", "提前体验新功能", "包含 SuperGrok 的所有内容"],
              originalPrice: 2800
            },
            isActive: true
          },
          {
            _id: "1",
            name: "Netflix",
            description: "高清画质，支持2个设备同时观看",
            price: 45,
            currency: "CNY",
            category: "奈飞代充",
            serviceType: "netflix",
            planDetails: {
              duration: "1个月",
              features: ["高清1080p", "同时2个设备", "无广告"],
              originalPrice: 68
            },
            isActive: true
          },
          {
            _id: "2",
            name: "Netflix",
            description: "高清画质，支持2个设备同时观看",
            price: 120,
            currency: "CNY",
            category: "奈飞代充",
            serviceType: "netflix",
            planDetails: {
              duration: "3个月",
              features: ["高清1080p", "同时2个设备", "无广告"],
              originalPrice: 204
            },
            isActive: true
          }
        ];
        setProducts(mockProducts);
        setLoading(false);
    } catch (error) {
      console.error("获取产品失败:", error);
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => 
    selectedCategory === "all" || product.serviceType === selectedCategory
  );

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case "netflix":
        return <img src="/netflix-icon.jpg" alt="Netflix" className="w-12 h-12 object-scale-down" />;
      case "chatgpt":
        return <img src="/chatgpt-icon.jpg" alt="ChatGPT" className="w-12 h-12 object-scale-down" />;
      case "claude":
        return <img src="/claude-icon.png" alt="Claude" className="w-12 h-12 object-scale-down" />;
      case "grok":
        return <img src="/grok-icon.jpg" alt="Grok" className="w-12 h-12 object-scale-down" />;
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

  return (
    <div className="min-h-screen bg-base-100">

      {/* Top navigation with logo and tabs */}
      <div className="w-full bg-base-100 px-4 py-2">
        <div className="flex items-center">
          <div className="ml-24">
            <h1 className="text-2xl font-medium text-yellow-title">
              浣熊订阅
            </h1>
          </div>
          <div className="flex-1 flex justify-center -ml-12">
            <div className="tabs tabs-boxed">
              <button 
                className={`tab text-gray-400 ${selectedCategory === "all" ? "bg-blue-100 text-blue-600" : ""}`}
                onClick={() => setSelectedCategory("all")}
              >
                <span className="ml-2">All Items</span>
              </button>
              <button 
                className={`tab text-gray-400 ${selectedCategory === "chatgpt" ? "bg-blue-100 text-blue-600" : ""}`}
                onClick={() => setSelectedCategory("chatgpt")}
              >
                <img src="/chatgpt-icon.jpg" alt="ChatGPT" className="w-6 h-6 object-contain rounded mr-2" />
                ChatGPT
              </button>
              <button 
                className={`tab text-gray-400 ${selectedCategory === "claude" ? "bg-blue-100 text-blue-600" : ""}`}
                onClick={() => setSelectedCategory("claude")}
              >
                <img src="/claude-icon.png" alt="Claude" className="w-6 h-6 object-contain rounded mr-2" />
                Claude
              </button>
              <button 
                className={`tab text-gray-400 ${selectedCategory === "grok" ? "bg-blue-100 text-blue-600" : ""}`}
                onClick={() => setSelectedCategory("grok")}
              >
                <img src="/grok-icon.jpg" alt="Grok" className="w-6 h-6 object-contain rounded mr-2" />
                Grok
              </button>
              <button 
                className={`tab text-gray-400 ${selectedCategory === "netflix" ? "bg-blue-100 text-blue-600" : ""}`}
                onClick={() => setSelectedCategory("netflix")}
              >
                <img src="/netflix-icon.jpg" alt="Netflix" className="w-6 h-6 object-contain rounded mr-2" />
                Netflix
              </button>
            </div>
          </div>
          <div className="w-32"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-0">

        {/* 小贴士 */}
        <div className="text-center mb-4">
          <p className="text-sm text-gray-400">
            购买须知：ChatGPT、Claude、Grok、Netflix会员成品号购买；如需充自己的号码请联系本店客服哈
          </p>
        </div>

        {/* 产品列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product._id} className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow flex flex-col h-full rounded-lg">
              <div className="w-full flex justify-center pt-6 pb-2">
                <div className="w-16 h-16 flex items-center justify-center overflow-visible">
                  {getServiceIcon(product.serviceType)}
                </div>
              </div>
              <div className="card-body flex flex-col justify-between h-full pt-2">
                <div className="flex-1">
                  <h2 className="card-title text-base text-gray-400">
                    {product.name}
                    <div className="badge bg-blue-200 text-blue-800 border-blue-200">{product.planDetails.duration}</div>
                  </h2>
                  <ul className="text-sm space-y-2 mt-2 text-gray-400">
                    {product.planDetails.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-success mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 价格和购买按钮固定在卡片底部 */}
                <div className="flex items-center justify-end gap-3 mt-4">
                  <div className="text-base font-light text-gray-400 font-mono">
                    ¥{product.price}
                  </div>
                  <Link href={`/order/${product._id}`}>
                    <button className="btn bg-blue-200 hover:bg-blue-300 text-gray-500 border-blue-200 hover:border-blue-300 btn-sm font-normal font-mono">
                      购买
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-normal mb-2 text-gray-400">暂无产品</h3>
            <p className="text-gray-300">该分类下暂时没有可用的产品</p>
          </div>
        )}
      </div>

    </div>
  );
}