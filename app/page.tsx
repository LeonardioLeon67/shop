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
  const [user, setUser] = useState<any>(null);
  const [showSpecification, setShowSpecification] = useState(false);

  useEffect(() => {
    fetchProducts();
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      setUser(null);
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  };

  const fetchProducts = () => {
    try {
      const mockProducts = [
        {
          _id: "5",
          name: "Pro",
          description: "",
          price: 188,
          currency: "CNY",
          category: "浣熊代充",
          serviceType: "claude",
          planDetails: {
            duration: "月卡",
            features: ["Claude Code 官方源(非镜像源)", "成品号购买", "Sonnet 4", "单人独享号(非合租)", "入门级"],
            originalPrice: 0
          },
          isActive: true
        },
        {
          _id: "6",
          name: "Max 5x",
          description: "",
          price: 938,
          currency: "CNY",
          category: "浣熊代充",
          serviceType: "claude",
          planDetails: {
            duration: "月卡",
            features: ["Claude Code 官方源(非镜像源)", "成品号购买", "Opus 4 & Sonnet 4", "单人独享号(非合租)", "职场首选"],
            originalPrice: 0
          },
          isActive: true
        },
        {
          _id: "7",
          name: "Max 20x",
          description: "",
          price: 1868,
          currency: "CNY",
          category: "浣熊代充",
          serviceType: "claude",
          planDetails: {
            duration: "月卡",
            features: ["Claude Code 官方源(非镜像源)", "成品号购买", "Opus 4 & Sonnet 4", "单人独享号(非合租)", "用量充足"],
            originalPrice: 0
          },
          isActive: true
        },
        // 复制的三个卡片栏，按您的要求命名
        {
          _id: "8",
          name: "Pro 增项",
          description: "",
          price: 30,
          currency: "CNY",
          category: "浣熊代充",
          serviceType: "claude",
          planDetails: {
            duration: "月卡",
            features: ["Claude Code 线路服务", "解决封号"],
            originalPrice: 0
          },
          isActive: true
        },
        {
          _id: "9",
          name: "Max 5x 增项",
          description: "",
          price: 150,
          currency: "CNY",
          category: "浣熊代充",
          serviceType: "claude",
          planDetails: {
            duration: "月卡",
            features: ["Claude Code 线路服务", "解决封号"],
            originalPrice: 0
          },
          isActive: true
        },
        {
          _id: "10",
          name: "Max 20x 增项",
          description: "",
          price: 300,
          currency: "CNY",
          category: "浣熊代充",
          serviceType: "claude",
          planDetails: {
            duration: "月卡",
            features: ["Claude Code 线路服务", "解决封号"],
            originalPrice: 0
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

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case "chatgpt":
        return <img src="/chatgpt.jpg" alt="ChatGPT" className="w-[80px] h-[80px] object-contain" />;
      case "claude":
        return <img src="/claude-code.webp" alt="Claude" className="w-[120px] h-[120px] object-scale-down" />;
      default:
        return "💳";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 pt-2">
        <div className="mb-0 relative">
          <div className="flex items-center justify-center">
            <div className="cute-title-wrapper">
              <h1 className="cute-title">
                浣熊订阅
              </h1>
            </div>
          </div>
          <div className="absolute top-5 right-0 flex gap-6 items-center">
              <button
                onClick={() => setShowSpecification(true)}
                className="bg-gray-200 text-gray-800 px-4 py-1 rounded-full text-base hover:bg-gray-300 cursor-pointer"
              >
                使用说明
              </button>
            {user ? (
              <>
                <Link href="/user/orders">
                  <span className="username-purple hover:underline cursor-pointer self-center text-lg font-semibold inline-block">
                    {user.name}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-gray-600 hover:underline cursor-pointer"
                >
                  登出
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <span className="title-blue hover:underline cursor-pointer">
                    请登录
                  </span>
                </Link>
                <Link href="/register">
                  <span className="title-blue hover:underline cursor-pointer">
                    立即注册
                  </span>
                </Link>
              </>
            )}
          </div>
          <p className="text-lg text-gray-600 mt-0 text-center">
            Embrace Vibe Coding, Get Ahead of the Game
          </p>
        </div>

        <div className="flex justify-center mt-2">
          <div className="space-y-12">
            {/* 第一行 - 前3个产品 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-full mx-auto px-16">
              {products.slice(0, 3).map((product) => (
                <div key={product._id} className={`card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow flex flex-col h-full rounded-lg relative min-w-[350px] ${product._id === '5' ? 'border-2 border-pink-300' : ''} ${product._id === '7' ? 'border-2 border-green-300' : ''}`}>
                  {product._id === '5' && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-pink-300 text-pink-800 px-4 py-1 rounded text-base font-bold border border-pink-300">
                      热销
                    </div>
                  )}
                  {product._id === '7' && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-300 text-green-800 px-4 py-1 rounded text-base font-bold border border-green-300">
                      推荐
                    </div>
                  )}
                  <div className="w-full flex justify-center pt-6 pb-2">
                    <div className="w-32 h-32 flex items-center justify-center overflow-visible">
                      {getServiceIcon(product.serviceType)}
                    </div>
                  </div>
                  <div className="card-body flex flex-col justify-between h-full pt-2 px-8">
                    <div className="flex-1">
                      <h2 className="card-title text-lg text-gray-400">
                        {product.name}
                        <div className="badge bg-blue-300 text-blue-800 border-blue-300 text-sm px-3 py-1">{product.planDetails.duration}</div>
                      </h2>
                      <p className="text-sm text-gray-500 mt-1 mb-3">{product.description}</p>
                      <ul className="space-y-1 mb-4">
                        {product.planDetails.features.map((feature, index) => (
                          <li key={index} className="text-sm text-gray-600">
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
                    <div className="card-actions flex flex-col mt-4">
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className="text-left">
                          {product.planDetails.originalPrice > 0 && (
                            <span className="text-xs text-gray-500 line-through">原价: ¥{product.planDetails.originalPrice}</span>
                          )}
                          <div className="text-base font-bold text-gray-400" style={{fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif', letterSpacing: '0.5px', whiteSpace: 'nowrap'}}>¥{product.price}/月</div>
                        </div>
                      </div>
                      {user ? (
                        <Link href={`/order/${product._id}`} className="w-full">
                          <button className="btn w-full bg-blue-300 hover:bg-blue-400 text-blue-800 border-blue-300 hover:border-blue-400 text-base font-bold">
                            立即订阅
                          </button>
                        </Link>
                      ) : (
                        <Link href={`/login?redirect=/order/${product._id}`} className="w-full">
                          <button className="btn w-full bg-blue-300 hover:bg-blue-400 text-blue-800 border-blue-300 hover:border-blue-400 text-base font-bold">
                            立即订阅
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 第二行 - 后3个产品 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-full mx-auto px-16">
              {products.slice(3, 6).map((product) => (
                <div key={product._id} className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow flex flex-col h-full rounded-lg relative min-w-[350px]">
                  <div className="w-full flex justify-center pt-6 pb-2">
                    <div className="w-32 h-32 flex items-center justify-center overflow-visible">
                      {getServiceIcon(product.serviceType)}
                    </div>
                  </div>
                  <div className="card-body flex flex-col justify-between h-full pt-2 px-8">
                    <div className="flex-1">
                      <h2 className="card-title text-lg text-gray-400">
                        {product.name}
                        <div className="badge bg-blue-300 text-blue-800 border-blue-300 text-sm px-3 py-1">{product.planDetails.duration}</div>
                      </h2>
                      <p className="text-sm text-gray-500 mt-1 mb-3">{product.description}</p>
                      <ul className="space-y-1 mb-4">
                        {product.planDetails.features.map((feature, index) => (
                          <li key={index} className="text-sm text-gray-600">
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
                    <div className="card-actions flex flex-col mt-4">
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className="text-left">
                          {product.planDetails.originalPrice > 0 && (
                            <span className="text-xs text-gray-500 line-through">原价: ¥{product.planDetails.originalPrice}</span>
                          )}
                          <div className="text-base font-bold text-gray-400" style={{fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif', letterSpacing: '0.5px', whiteSpace: 'nowrap'}}>¥{product.price}/月</div>
                        </div>
                      </div>
                      {user ? (
                        <Link href={`/order/${product._id}`} className="w-full">
                          <button className="btn w-full bg-blue-300 hover:bg-blue-400 text-blue-800 border-blue-300 hover:border-blue-400 text-base font-bold">
                            立即订阅
                          </button>
                        </Link>
                      ) : (
                        <Link href={`/login?redirect=/order/${product._id}`} className="w-full">
                          <button className="btn w-full bg-blue-300 hover:bg-blue-400 text-blue-800 border-blue-300 hover:border-blue-400 text-base font-bold">
                            立即订阅
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-normal mb-2 text-gray-400">暂无产品</h3>
            <p className="text-gray-300">暂时没有可用的产品</p>
          </div>
        )}
        
        {/* 使用说明弹窗 */}
        {showSpecification && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSpecification(false)}
          >
            <div 
              className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 pb-4 border-b sticky top-0 bg-white rounded-t-lg">
                <h2 className="text-2xl font-normal ml-2">使用说明</h2>
                <button
                  onClick={() => setShowSpecification(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="prose prose-sm max-w-none overflow-y-auto p-6 pt-4">
                <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                  <div className="whitespace-pre-wrap font-mono">{`一、安装 Node.js

确保 Node.js 版本 ≥ 18.0

1. Linux 用户

# Download and install nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# in lieu of restarting the shell
\\. "$HOME/.nvm/nvm.sh"

# Download and install Node.js:
nvm install 22

# Verify the Node.js version:
node -v
nvm current

# Verify npm version:
npm -v

2. macOS 用户

# Download and install nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# in lieu of restarting the shell
\\. "$HOME/.nvm/nvm.sh"

# Download and install Node.js:
nvm install 22

# Verify the Node.js version:
node -v
nvm current

# Verify npm version:
npm -v

3. Windows 用户

登入 https://nodejs.org/zh-cn/download 下载安装包执行


二、安装 Claude Code

npm install -g @anthropic-ai/claude-code
claude --version

`}</div>
                  <div className="whitespace-pre-wrap font-mono">
                    <span className="title-blue">三、配置环境变量（购买增项的用户配置,未购买的跳过此步骤）</span>
                  </div>
                  <div className="whitespace-pre-wrap font-mono">{`
终端中运行echo $SHELL

1、显示/bin/zsh的用户
echo -e '\\n export ANTHROPIC_BASE_URL=https://api.816981.xyz/your_token_value >> ~/.zshrc
source ~/.zshrc

2、显示/bin/bash的用户
echo -e '\\n export ANTHROPIC_BASE_URL=https://api.816981.xyz/your_token_value >> ~/.bashrc
source ~/.bashrc

# 每位购买增项的用户都会分配独立的your_token_value



四、重启终端，直接运行

cd your-project-folder
claude`}</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* 客服链接 - 右下角固定位置 */}
        <div className="fixed bottom-24 right-4 z-50">
          <div className="relative">
            {/* 客服选项面板 */}
            <div className="absolute bottom-16 right-0 mb-2 bg-white shadow-lg rounded-lg p-4 min-w-[180px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
              <div className="space-y-3">
                
                {/* 企业微信 */}
                <a 
                  href="#" 
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    // 这里可以添加企业微信的逻辑，比如显示二维码或跳转
                    alert('企业微信客服联系方式：添加微信号 your-wechat-id');
                  }}
                >
                  <img src="/wechat.png" alt="微信" className="w-5 h-5 rounded" />
                  <span className="text-sm text-gray-700">企业微信</span>
                </a>
                
                {/* 电报 */}
                <a 
                  href="https://t.me/yourtelegramchannel" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#229ED9">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  <span className="text-sm text-gray-700">Telegram</span>
                </a>
              </div>
            </div>
            
            {/* 主按钮 */}
            <div className="group">
              <button className="flex items-center gap-3 bg-white shadow-lg rounded-full px-4 py-3 hover:shadow-xl transition-all cursor-pointer hover:scale-105">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#9333ea">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700">联系客服</span>
              </button>
              
              {/* 悬停时显示的选项面板 */}
              <div className="absolute bottom-16 right-0 mb-2 bg-white shadow-lg rounded-lg p-4 min-w-[180px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <div className="space-y-3">
                    
                  {/* 企业微信 */}
                  <button 
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer w-full text-left"
                    onClick={() => {
                      // 这里可以添加企业微信的逻辑，比如显示二维码或跳转
                      alert('企业微信客服联系方式：添加微信号 your-wechat-id');
                    }}
                  >
                    <img src="/wechat.png" alt="微信" className="w-5 h-5 rounded" />
                    <span className="text-sm text-gray-700">企业微信</span>
                  </button>
                  
                  {/* 电报 */}
                  <a 
                    href="https://t.me/yourtelegramchannel" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer w-full"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#229ED9">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    <span className="text-sm text-gray-700">Telegram</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}