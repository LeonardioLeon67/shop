# 浣熊订阅 - 虚拟产品代充服务平台

专业的ChatGPT、Claude和Grok代充服务平台，基于Next.js和TypeScript构建的现代化电商解决方案。

## 项目特性

- 🚀 **Next.js 14** - 基于App Router的现代化React框架
- 💎 **TypeScript** - 类型安全的开发体验
- 🎨 **DaisyUI + Tailwind CSS** - 美观的UI组件和响应式设计
- 🔐 **JWT认证** - 安全的用户认证系统
- 💳 **Dulupay支付集成** - 支持支付宝和微信支付
- 🗄️ **MySQL数据库** - 可靠的数据存储
- 📧 **邮件服务** - 订单通知和用户沟通

## 快速开始

### 环境要求

- Node.js 18+
- MySQL 5.7+
- npm 或 yarn

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd ship-fast-ts-main
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库和支付信息
```

4. **初始化数据库**
```bash
npm run setup-db
```

5. **启动开发服务器**
```bash
npm run dev
# 访问 http://localhost:3000
```

## 开发模式

开发模式提供热更新功能，适合实时修改和调试：

```bash
npm run dev
```

特点：
- ✨ 代码修改后自动热更新
- 🔍 实时预览修改效果
- 🐛 更好的错误提示
- 📝 详细的开发日志

## 生产部署

### 使用PM2部署

1. **构建项目**
```bash
npm run build
```

2. **启动PM2进程**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

3. **配置Nginx反向代理**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### PM2配置优化

- 内存限制：500MB（避免内存溢出）
- 最大重启次数：10次
- 最小运行时间：10秒
- Node.js堆内存限制：512MB

## 项目结构

```
ship-fast-ts-main/
├── app/                    # Next.js App Router页面
│   ├── api/               # API路由
│   ├── admin/             # 管理后台
│   └── ...                # 其他页面
├── components/            # React组件
├── libs/                  # 工具库和服务
├── models/                # 数据模型
├── public/                # 静态资源
├── scripts/               # 数据库脚本
└── types/                 # TypeScript类型定义
```

## 常用命令

```bash
# 开发
npm run dev              # 启动开发服务器

# 构建
npm run build            # 构建生产版本
npm start               # 启动生产服务器

# 数据库
npm run setup-db        # 初始化数据库

# PM2管理
pm2 status              # 查看进程状态
pm2 logs                # 查看实时日志
pm2 monit               # 查看资源使用情况
pm2 restart shop-website # 重启服务
```

## 故障排查

### 常见问题

1. **端口被占用**
```bash
# 查找占用3000端口的进程
lsof -i :3000
# 终止进程
kill -9 <PID>
```

2. **数据库连接失败**
- 检查MySQL服务是否运行
- 验证.env中的数据库配置
- 确保数据库claude_shop存在

3. **依赖安装失败**
```bash
# 清理缓存重新安装
rm -rf node_modules package-lock.json
npm install
```

### 资源监控

```bash
# 检查内存使用
free -h

# 查看PM2日志
pm2 logs --lines 100

# 清理日志
pm2 flush
```

## 技术栈

- **前端框架**: Next.js 14, React 18
- **样式**: Tailwind CSS, DaisyUI
- **数据库**: MySQL
- **认证**: JWT (jsonwebtoken)
- **支付**: Dulupay API
- **部署**: PM2, Nginx

## 贡献指南

欢迎提交问题和拉取请求。请确保：
- 遵循现有的代码风格
- 添加适当的类型定义
- 测试你的更改
- 更新相关文档

## 许可证

本项目基于 ShipFast 模板构建。

---

**需要帮助？** 请查看[文档](https://shipfa.st/docs)或联系支持团队。