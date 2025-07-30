# 代充服务网站

基于 Ship Fast TypeScript 框架构建的专业代充服务平台，主要提供 Netflix 和 ChatGPT 会员代充服务。

## 🚀 主要功能

### 核心业务功能
- **产品展示**: Netflix、ChatGPT 等代充服务展示
- **在线下单**: 用户填写账号信息并选择套餐
- **多种支付**: 支持支付宝支付
- **订单跟踪**: 实时查看代充进度和状态
- **自动化流程**: 支付后自动进入代充队列

### 技术特性
- **现代化框架**: Next.js 14 + TypeScript
- **数据库**: MongoDB + Mongoose
- **支付集成**: 支付宝、Stripe
- **用户认证**: NextAuth.js
- **UI 组件**: Tailwind CSS + DaisyUI
- **响应式设计**: 支持手机端和桌面端

## 📁 项目结构

```
├── app/
│   ├── api/                    # API 路由
│   │   ├── products/          # 产品相关 API
│   │   ├── orders/            # 订单相关 API
│   │   └── webhook/           # 支付回调 API
│   ├── products/              # 产品展示页面
│   ├── order/                 # 下单页面
│   └── order-status/          # 订单状态页面
├── models/                    # 数据模型
│   ├── VirtualProduct.ts      # 虚拟产品模型
│   ├── Order.ts               # 订单模型
│   └── User.ts                # 用户模型
├── libs/                      # 工具库
│   ├── alipay.ts              # 支付宝服务
│   └── mongoose.ts            # 数据库连接
└── scripts/
    └── seed-products.js       # 初始数据脚本
```

## 🛠️ 环境配置

### 1. 克隆项目
```bash
cd /root/shop/ship-fast-ts-main
```

### 2. 安装依赖
```bash
npm install
```

### 3. 环境变量配置
复制 `.env.example` 到 `.env.local` 并填写以下配置：

```env
# 数据库
MONGODB_URI=mongodb://localhost:27017/recharge-service

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key


# 支付宝配置
ALIPAY_APP_ID=your-alipay-app-id
ALIPAY_PRIVATE_KEY=your-alipay-private-key
ALIPAY_PUBLIC_KEY=your-alipay-public-key
```

### 4. 初始化数据
```bash
node scripts/seed-products.js
```

### 5. 启动项目
```bash
npm run dev
```

## 📋 产品配置

### Netflix 代充服务
- 1个月套餐: ¥45 (官方价 ¥68)
- 3个月套餐: ¥120 (官方价 ¥204)
- 12个月套餐: ¥400 (官方价 ¥816)

### ChatGPT 代充服务
- Plus 1个月: ¥130 (官方价 ¥140)
- Plus 3个月: ¥360 (官方价 ¥420)
- Team 1个月: ¥200 (官方价 ¥250)

## 🔄 订单流程

1. **用户下单**: 选择产品，填写账号信息
2. **支付确认**: 选择支付方式（支付宝）
3. **支付回调**: 自动验证支付状态
4. **订单处理**: 标记为处理中状态
5. **代充完成**: 手动更新订单状态
6. **通知用户**: 发送完成通知

## 💳 支付集成


### 支付宝
- 支持网页支付
- 支持手机网站支付
- 支持扫码支付
- RSA2 签名验证

## 🔧 管理功能

### 产品管理
- 添加/编辑产品信息
- 设置价格和套餐详情
- 管理库存状态

### 订单管理
- 查看所有订单
- 更新代充状态
- 添加处理备注

## 🚦 部署说明

### 1. 生产环境配置
```env
NEXTAUTH_URL=https://your-domain.com
MONGODB_URI=your-production-mongodb-uri
```

### 2. 支付配置
确保配置生产环境的支付参数和回调 URL。

### 3. 域名配置
- 配置支付回调 URL
- 设置 CORS 策略
- 配置 SSL 证书

## 📝 使用须知

### 法律合规
- 确保代充服务符合当地法律法规
- 遵守平台服务条款
- 保护用户隐私信息

### 风险提示
- 代充服务存在平台政策风险
- 建议设置合理的服务条款
- 建议购买相关保险

### 客户服务
- 及时处理客户咨询
- 保证代充时效性
- 建立完善的售后流程

## 🤝 技术支持

如需技术支持或定制开发，请联系开发团队。

## 📄 许可证

本项目基于原 Ship Fast 框架构建，请遵守相关许可证条款。