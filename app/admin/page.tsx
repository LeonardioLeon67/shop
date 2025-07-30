"use client";

import React, { useState, useEffect } from "react";

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

interface Order {
  orderNo: string;
  productName: string;
  customerEmail: string;
  amount: number;
  status: string;
  createdAt: string;
  isPaid: boolean;
}


interface Stats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  paidOrders: number;
  paymentRate: number;
  growth: {
    users: number;
    orders: number;
    revenue: number;
  };
}

export default function AdminPage() {
  // 认证状态
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // 登录表单
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");

  // 管理员界面状态
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    paidOrders: 0,
    paymentRate: 0,
    growth: {
      users: 0,
      orders: 0,
      revenue: 0
    }
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 快速支付确认
  const [orderNo, setOrderNo] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // 先检查本地存储是否有管理员信息
      const localAdmin = localStorage.getItem('admin');
      if (localAdmin) {
        const adminData = JSON.parse(localAdmin);
        setAdmin(adminData);
        setIsAuthenticated(true);
        setAuthLoading(false);
        loadDashboardData();
        return;
      }

      const response = await fetch('/api/admin/auth/me');
      if (response.ok) {
        const result = await response.json();
        setAdmin(result.admin);
        setIsAuthenticated(true);
        // 保存管理员信息到本地存储
        localStorage.setItem('admin', JSON.stringify(result.admin));
        loadDashboardData();
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", {
        method: "POST",
      });
      setIsAuthenticated(false);
      setAdmin(null);
      // 清除本地存储的管理员信息
      localStorage.removeItem('admin');
    } catch (error) {
      console.error("登出失败:", error);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 并行加载所有数据
      const [statsResponse, ordersResponse, usersResponse] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/orders'),
        fetch('/api/admin/users')
      ]);
      
      // 加载统计数据
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
      
      // 加载订单数据
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setOrders(ordersData);
      }
      
      // 加载用户数据
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }
      
      
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async () => {
    if (!orderNo.trim()) {
      setMessage("请输入订单号");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/orders/mark-paid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderNo: orderNo.trim() }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage(`✅ ${result.message}`);
        setOrderNo("");
        loadDashboardData(); // 刷新数据
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (error) {
      setMessage("❌ 网络错误");
    } finally {
      setLoading(false);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stats text-blue-900" style={{backgroundColor: '#BFDBFE'}}>
          <div className="stat">
            <div className="stat-title text-blue-900">总用户数</div>
            <div className="stat-value text-blue-900">{stats.totalUsers}</div>
            <div className="stat-desc text-blue-900">+{stats.growth.users}%</div>
          </div>
        </div>
        
        <div className="stats text-blue-900" style={{backgroundColor: '#BFDBFE'}}>
          <div className="stat">
            <div className="stat-title text-blue-900">总订单数</div>
            <div className="stat-value text-blue-900">{stats.totalOrders}</div>
            <div className="stat-desc text-blue-900">+{stats.growth.orders}%</div>
          </div>
        </div>
        
        <div className="stats text-blue-900" style={{backgroundColor: '#BFDBFE'}}>
          <div className="stat">
            <div className="stat-title text-blue-900">MMR</div>
            <div className="stat-value text-blue-900">¥{stats.paidOrders.toLocaleString()}</div>
            <div className="stat-desc text-blue-900">+12%</div>
          </div>
        </div>
        
        <div className="stats text-blue-900" style={{backgroundColor: '#BFDBFE'}}>
          <div className="stat">
            <div className="stat-title text-blue-900">总收入</div>
            <div className="stat-value text-blue-900">¥{stats.totalRevenue.toLocaleString()}</div>
            <div className="stat-desc text-blue-900">+{stats.growth.revenue}%</div>
          </div>
        </div>
      </div>

      
      {/* 总收入曲线图 */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">总收入趋势</h3>
          <div className="w-full h-64 bg-base-200 rounded-lg flex items-center justify-center relative overflow-hidden">
            {/* 简单的SVG曲线图 */}
            <svg viewBox="0 0 600 200" className="w-full h-full">
              {/* 网格线 */}
              <defs>
                <pattern id="grid" width="60" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Y轴标签 */}
              <text x="10" y="20" className="text-xs fill-gray-500">¥20K</text>
              <text x="10" y="60" className="text-xs fill-gray-500">¥15K</text>
              <text x="10" y="100" className="text-xs fill-gray-500">¥10K</text>
              <text x="10" y="140" className="text-xs fill-gray-500">¥5K</text>
              <text x="10" y="180" className="text-xs fill-gray-500">¥0</text>
              
              {/* X轴标签 */}
              <text x="80" y="195" className="text-xs fill-gray-500">1月</text>
              <text x="140" y="195" className="text-xs fill-gray-500">2月</text>
              <text x="200" y="195" className="text-xs fill-gray-500">3月</text>
              <text x="260" y="195" className="text-xs fill-gray-500">4月</text>
              <text x="320" y="195" className="text-xs fill-gray-500">5月</text>
              <text x="380" y="195" className="text-xs fill-gray-500">6月</text>
              <text x="440" y="195" className="text-xs fill-gray-500">7月</text>
              <text x="500" y="195" className="text-xs fill-gray-500">8月</text>
              
              {/* 收入曲线 */}
              <path
                d="M 50 160 Q 110 140 170 120 T 290 100 Q 350 90 410 80 T 530 60"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
              />
              
              {/* 面积填充 */}
              <path
                d="M 50 160 Q 110 140 170 120 T 290 100 Q 350 90 410 80 T 530 60 L 530 180 L 50 180 Z"
                fill="url(#gradient)"
                opacity="0.2"
              />
              
              {/* 渐变定义 */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#3b82f6', stopOpacity: 0.8}} />
                  <stop offset="100%" style={{stopColor: '#3b82f6', stopOpacity: 0}} />
                </linearGradient>
              </defs>
              
              {/* 数据点 */}
              <circle cx="50" cy="160" r="4" fill="#3b82f6" />
              <circle cx="110" cy="140" r="4" fill="#3b82f6" />
              <circle cx="170" cy="120" r="4" fill="#3b82f6" />
              <circle cx="230" cy="110" r="4" fill="#3b82f6" />
              <circle cx="290" cy="100" r="4" fill="#3b82f6" />
              <circle cx="350" cy="90" r="4" fill="#3b82f6" />
              <circle cx="410" cy="80" r="4" fill="#3b82f6" />
              <circle cx="470" cy="70" r="4" fill="#3b82f6" />
              <circle cx="530" cy="60" r="4" fill="#3b82f6" />
            </svg>
            
            {/* 图表说明 */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-sm p-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>月收入 (¥)</span>
              </div>
            </div>
          </div>
          
          {/* 图表下方统计信息 */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">+23.5%</div>
              <div className="text-sm text-gray-500">环比增长</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">¥{stats.totalRevenue.toLocaleString()}</div>
              <div className="text-sm text-gray-500">本月收入</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">¥{Math.floor(stats.totalRevenue * 1.2).toLocaleString()}</div>
              <div className="text-sm text-gray-500">预计下月</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      {/* 订单统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stats text-blue-900" style={{backgroundColor: '#BFDBFE'}}>
          <div className="stat">
            <div className="stat-figure text-blue-900">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="stat-title text-blue-900">待处理</div>
            <div className="stat-value text-blue-900">{orders.filter(o => !o.isPaid).length}</div>
            <div className="stat-desc text-blue-900">需要确认</div>
          </div>
        </div>
        
        <div className="stats text-green-900" style={{backgroundColor: '#BBF7D0'}}>
          <div className="stat">
            <div className="stat-figure text-green-900">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="stat-title text-green-900">已完成</div>
            <div className="stat-value text-green-900">{orders.filter(o => o.isPaid).length}</div>
            <div className="stat-desc text-green-900">支付成功</div>
          </div>
        </div>
        
        <div className="stats text-purple-900" style={{backgroundColor: '#E9D5FF'}}>
          <div className="stat">
            <div className="stat-figure text-purple-900">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
            </div>
            <div className="stat-title text-purple-900">今日收入</div>
            <div className="stat-value text-purple-900">¥{Math.floor(Math.random() * 5000 + 1000)}</div>
            <div className="stat-desc text-purple-900">+12% 较昨日</div>
          </div>
        </div>
        
        <div className="stats text-orange-900" style={{backgroundColor: '#FED7AA'}}>
          <div className="stat">
            <div className="stat-figure text-orange-900">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
            <div className="stat-title text-orange-900">平均订单</div>
            <div className="stat-value text-orange-900">¥{Math.floor(orders.reduce((sum, o) => sum + o.amount, 0) / orders.length || 0)}</div>
            <div className="stat-desc text-orange-900">单笔金额</div>
          </div>
        </div>
      </div>

      {/* 快速操作面板 */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">快速操作</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 批量确认支付 */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">批量确认支付</span>
              </label>
              <div className="join">
                <input
                  type="text"
                  placeholder="输入订单号，用逗号分隔"
                  className="input input-bordered join-item flex-1"
                />
                <button className="btn bg-green-300 hover:bg-green-400 text-green-800 border-green-300 join-item">
                  批量确认
                </button>
              </div>
            </div>
            
            {/* 单个订单确认 */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">单个订单确认</span>
              </label>
              <div className="join">
                <input
                  type="text"
                  value={orderNo}
                  onChange={(e) => setOrderNo(e.target.value)}
                  placeholder="输入订单号"
                  className="input input-bordered join-item flex-1"
                />
                <button 
                  className="btn bg-blue-300 hover:bg-blue-400 text-blue-800 border-blue-300 join-item"
                  onClick={markAsPaid}
                  disabled={loading}
                >
                  {loading ? "处理中..." : "确认支付"}
                </button>
              </div>
            </div>
          </div>
          
          {message && (
            <div className={`alert mt-4 ${message.includes('✅') ? 'alert-success' : 'alert-error'}`}>
              <span>{message}</span>
            </div>
          )}
        </div>
      </div>

      {/* 订单筛选和搜索 */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="form-control flex-1">
              <input
                type="text"
                placeholder="搜索订单号、客户邮箱或产品名称..."
                className="input input-bordered w-full"
              />
            </div>
            <div className="form-control">
              <select className="select select-bordered">
                <option>全部状态</option>
                <option>待支付</option>
                <option>已支付</option>
                <option>已取消</option>
              </select>
            </div>
            <div className="form-control">
              <select className="select select-bordered">
                <option>全部产品</option>
                <option>Pro</option>
                <option>Max 5x</option>
                <option>Max 20x</option>
              </select>
            </div>
            <div className="form-control">
              <input
                type="date"
                className="input input-bordered"
                placeholder="选择日期"
              />
            </div>
            <button className="btn bg-blue-300 hover:bg-blue-400 text-blue-800 border-blue-300">
              搜索
            </button>
            <button className="btn btn-outline">
              重置
            </button>
          </div>
        </div>
      </div>

      {/* 订单列表 */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h3 className="card-title">订单列表</h3>
            <div className="flex gap-2">
              <button className="btn btn-sm bg-green-300 hover:bg-green-400 text-green-800 border-green-300">
                导出Excel
              </button>
              <button className="btn btn-sm bg-purple-300 hover:bg-purple-400 text-purple-800 border-purple-300">
                导出PDF
              </button>
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-sm bg-gray-300 hover:bg-gray-400 text-gray-800 border-gray-300">
                  批量操作 ▼
                </label>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                  <li><a>批量确认支付</a></li>
                  <li><a>批量标记取消</a></li>
                  <li><a>批量删除</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th className="text-xs font-normal">
                    <input type="checkbox" className="checkbox checkbox-xs" />
                  </th>
                  <th className="text-xs font-normal">订单号</th>
                  <th className="text-xs font-normal">产品名称</th>
                  <th className="text-xs font-normal">客户信息</th>
                  <th className="text-xs font-normal">金额</th>
                  <th className="text-xs font-normal">支付方式</th>
                  <th className="text-xs font-normal">状态</th>
                  <th className="text-xs font-normal">创建时间</th>
                  <th className="text-xs font-normal">操作</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr key={order.orderNo} className="hover">
                    <td>
                      <input type="checkbox" className="checkbox checkbox-xs" />
                    </td>
                    <td>
                      <div className="font-mono text-xs">
                        {order.orderNo}
                        <div className="text-xs text-gray-500 mt-1">
                          #{String(index + 1).padStart(4, '0')}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar placeholder">
                          <div className="bg-blue-100 text-blue-800 rounded w-8 h-8">
                            <span className="text-xs">📦</span>
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold">{order.productName}</div>
                          <div className="text-xs text-gray-500">月度订阅</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="font-semibold">{order.customerEmail}</div>
                        <div className="text-xs text-gray-500">用户ID: {Math.floor(Math.random() * 10000)}</div>
                      </div>
                    </td>
                    <td>
                      <div className="font-semibold text-lg">¥{order.amount}</div>
                      <div className="text-xs text-gray-500">CNY</div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <span className="text-sm">💳</span>
                        <span className="text-xs">支付宝</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <span className={`badge badge-sm ${order.isPaid ? 'badge-success' : 'badge-warning'}`}>
                          {order.status}
                        </span>
                        {order.isPaid && (
                          <span className="text-xs text-green-600">✓ 已发货</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">{order.createdAt}</div>
                      <div className="text-xs text-gray-500">
                        {Math.floor(Math.random() * 24)}小时前
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        {!order.isPaid ? (
                          <>
                            <button 
                              className="btn btn-xs bg-green-300 hover:bg-green-400 text-green-800 border-green-300"
                              onClick={() => {
                                setOrderNo(order.orderNo);
                                markAsPaid();
                              }}
                            >
                              确认支付
                            </button>
                            <button className="btn btn-xs btn-error">
                              取消订单
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="btn btn-xs bg-blue-300 hover:bg-blue-400 text-blue-800 border-blue-300">
                              查看详情
                            </button>
                            <button className="btn btn-xs btn-outline">
                              重新发货
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* 分页控件 */}
          <div className="flex justify-between items-center mt-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">每页显示</span>
              <select className="select select-bordered select-xs">
                <option>10</option>
                <option>25</option>
                <option>50</option>
                <option>100</option>
              </select>
              <span className="text-sm text-gray-500">条记录</span>
            </div>
            
            <div className="text-sm text-gray-500">
              显示 1-{orders.length} 条，共 {stats.totalOrders} 条记录
            </div>
            
            <div className="join">
              <button className="join-item btn btn-sm">«</button>
              <button className="join-item btn btn-sm btn-active">1</button>
              <button className="join-item btn btn-sm">2</button>
              <button className="join-item btn btn-sm">3</button>
              <button className="join-item btn btn-sm">...</button>
              <button className="join-item btn btn-sm">10</button>
              <button className="join-item btn btn-sm">»</button>
            </div>
          </div>
        </div>
      </div>

      {/* 最近活动时间线 */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">最近活动</h3>
          <div className="space-y-4">
            {[
              { time: '2分钟前', action: '订单 #ORD001 支付成功', type: 'success', icon: '✅' },
              { time: '15分钟前', action: '新订单 #ORD002 创建', type: 'info', icon: '📦' },
              { time: '1小时前', action: '订单 #ORD003 已取消', type: 'error', icon: '❌' },
              { time: '2小时前', action: '订单 #ORD004 支付成功', type: 'success', icon: '✅' },
              { time: '3小时前', action: '新用户注册：user@example.com', type: 'info', icon: '👤' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="avatar placeholder">
                  <div className={`rounded-full w-10 h-10 ${
                    activity.type === 'success' ? 'bg-green-100 text-green-800' :
                    activity.type === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    <span>{activity.icon}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{activity.action}</div>
                  <div className="text-xs text-gray-500">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      {/* 用户统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stats text-blue-900" style={{backgroundColor: '#BFDBFE'}}>
          <div className="stat">
            <div className="stat-title text-blue-900">活跃用户</div>
            <div className="stat-value text-blue-900">{Math.floor(stats.totalUsers * 0.75)}</div>
            <div className="stat-desc text-blue-900">近30天登录</div>
          </div>
        </div>
        
        <div className="stats text-blue-900" style={{backgroundColor: '#BFDBFE'}}>
          <div className="stat">
            <div className="stat-title text-blue-900">付费用户</div>
            <div className="stat-value text-blue-900">{Math.floor(stats.totalUsers * 0.45)}</div>
            <div className="stat-desc text-blue-900">至少购买一次</div>
          </div>
        </div>
        
        <div className="stats text-blue-900" style={{backgroundColor: '#BFDBFE'}}>
          <div className="stat">
            <div className="stat-title text-blue-900">今日新增</div>
            <div className="stat-value text-blue-900">{Math.floor(Math.random() * 10 + 1)}</div>
            <div className="stat-desc text-blue-900">新注册用户</div>
          </div>
        </div>
      </div>

      {/* 用户搜索和筛选 */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="form-control flex-1">
              <input
                type="text"
                placeholder="搜索用户名或邮箱..."
                className="input input-bordered w-full"
              />
            </div>
            <div className="form-control">
              <select className="select select-bordered">
                <option>全部用户</option>
                <option>活跃用户</option>
                <option>付费用户</option>
                <option>新注册用户</option>
              </select>
            </div>
            <button className="btn bg-blue-300 hover:bg-blue-400 text-blue-800 border-blue-300">
              搜索
            </button>
          </div>
        </div>
      </div>

      {/* 用户列表 */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h3 className="card-title">用户列表</h3>
            <div className="flex gap-2">
              <button className="btn btn-sm bg-green-300 hover:bg-green-400 text-green-800 border-green-300">
                导出用户
              </button>
              <button className="btn btn-sm bg-blue-300 hover:bg-blue-400 text-blue-800 border-blue-300">
                批量操作
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th className="text-xs font-normal">
                    <input type="checkbox" className="checkbox checkbox-xs" />
                  </th>
                  <th className="text-xs font-normal">ID</th>
                  <th className="text-xs font-normal">用户名</th>
                  <th className="text-xs font-normal">邮箱</th>
                  <th className="text-xs font-normal">注册时间</th>
                  <th className="text-xs font-normal">订单数</th>
                  <th className="text-xs font-normal">总消费</th>
                  <th className="text-xs font-normal">状态</th>
                  <th className="text-xs font-normal">操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <input type="checkbox" className="checkbox checkbox-xs" />
                    </td>
                    <td>{user.id}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar placeholder">
                          <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8">
                            <span className="text-xs">{user.name?.charAt(0).toUpperCase()}</span>
                          </div>
                        </div>
                        {user.name}
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.created_at}</td>
                    <td>{Math.floor(Math.random() * 10)}</td>
                    <td>¥{Math.floor(Math.random() * 5000)}</td>
                    <td>
                      <span className={`badge badge-sm ${Math.random() > 0.3 ? 'badge-success' : 'badge-warning'}`}>
                        {Math.random() > 0.3 ? '正常' : '待激活'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn btn-xs bg-blue-300 hover:bg-blue-400 text-blue-800 border-blue-300">
                          查看
                        </button>
                        <button className="btn btn-xs btn-warning">
                          编辑
                        </button>
                        <button className="btn btn-xs btn-error">
                          禁用
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* 分页 */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              显示 1-{users.length} 条，共 {stats.totalUsers} 条记录
            </div>
            <div className="join">
              <button className="join-item btn btn-sm">«</button>
              <button className="join-item btn btn-sm btn-active">1</button>
              <button className="join-item btn btn-sm">2</button>
              <button className="join-item btn btn-sm">3</button>
              <button className="join-item btn btn-sm">»</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );


  // 加载中状态
  if (authLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <div className="mt-4 text-lg">验证身份中...</div>
        </div>
      </div>
    );
  }

  // 未认证状态 - 直接重定向到登录页
  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* 顶部导航 */}
      <div className="navbar bg-base-100 shadow-lg">
        <div className="flex-1">
          <a className="btn btn-ghost normal-case text-xl cute-title-small">浣熊订阅管理后台</a>
        </div>
        <div className="flex-none">
          <div className="flex items-center gap-4">
            <span className="text-sm">欢迎，{admin?.username}</span>
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full bg-neutral text-neutral-content flex items-center justify-center">
                  👤
                </div>
              </label>
              <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                <li><a>设置</a></li>
                <li><a href="/">返回前台</a></li>
                <li><a onClick={handleLogout}>退出登录</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* 侧边栏 */}
        <div className="w-64 bg-base-100 shadow-lg min-h-screen">
          <ul className="menu p-4 space-y-2">
            <li>
              <div 
                className={`cursor-pointer px-4 py-2 rounded-lg transition-colors select-none text-base ${activeTab === 'dashboard' ? '' : 'hover:bg-gray-100'}`}
                style={activeTab === 'dashboard' ? {backgroundColor: '#BFDBFE', color: '#1e40af', userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', outline: 'none', border: 'none', WebkitTapHighlightColor: 'transparent'} : {userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', outline: 'none', border: 'none', WebkitTapHighlightColor: 'transparent'}}
                onMouseDown={(e) => e.preventDefault()}
                onFocus={(e) => e.preventDefault()}
                onClick={() => setActiveTab('dashboard')}
              >
                📊 仪表盘
              </div>
            </li>
            <li>
              <div 
                className={`cursor-pointer px-4 py-2 rounded-lg transition-colors select-none text-base ${activeTab === 'orders' ? '' : 'hover:bg-gray-100'}`}
                style={activeTab === 'orders' ? {backgroundColor: '#BFDBFE', color: '#1e40af', userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', outline: 'none', border: 'none', WebkitTapHighlightColor: 'transparent'} : {userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', outline: 'none', border: 'none', WebkitTapHighlightColor: 'transparent'}}
                onMouseDown={(e) => e.preventDefault()}
                onFocus={(e) => e.preventDefault()}
                onClick={() => setActiveTab('orders')}
              >
                📦 订单管理
              </div>
            </li>
            <li>
              <div 
                className={`cursor-pointer px-4 py-2 rounded-lg transition-colors select-none text-base ${activeTab === 'users' ? '' : 'hover:bg-gray-100'}`}
                style={activeTab === 'users' ? {backgroundColor: '#BFDBFE', color: '#1e40af', userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', outline: 'none', border: 'none', WebkitTapHighlightColor: 'transparent'} : {userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', outline: 'none', border: 'none', WebkitTapHighlightColor: 'transparent'}}
                onMouseDown={(e) => e.preventDefault()}
                onFocus={(e) => e.preventDefault()}
                onClick={() => setActiveTab('users')}
              >
                👥 用户管理
              </div>
            </li>
          </ul>
        </div>

        {/* 主内容区 */}
        <div className="flex-1 p-6">
          {loading && (
            <div className="flex justify-center items-center py-12">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          )}
          
          {!loading && (
            <>
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'orders' && renderOrders()}
              {activeTab === 'users' && renderUsers()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}