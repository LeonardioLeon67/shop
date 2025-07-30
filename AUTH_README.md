# 用户认证系统说明

## 功能概述

本项目已集成MySQL用户认证系统，包含以下功能：

- 用户注册和登录
- JWT token认证
- 会话管理
- 订单查询（仅限登录用户）
- 密码加密存储

## 数据库配置

### 1. 安装MySQL

确保您的系统已安装MySQL数据库。

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并配置以下变量：

```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=claude_shop
JWT_SECRET=your-very-secure-jwt-secret-key
```

### 3. 初始化数据库

运行以下命令创建数据库表：

```bash
npm run setup-db
```

这将创建以下表：
- `users`: 存储用户信息（ID、邮箱、密码、姓名等）
- `user_sessions`: 存储用户会话token

## 功能使用

### 用户注册
- 访问 `/register` 页面
- 填写用户名、邮箱和密码
- 注册成功后跳转到登录页面

### 用户登录
- 访问 `/login` 页面
- 使用邮箱和密码登录
- 登录成功后跳转到首页

### 首页功能
- **未登录用户**: 显示"登录"和"注册"按钮
- **已登录用户**: 显示用户名、"订单查询"和"退出"按钮

### 订单查询
- 仅登录用户可使用
- 点击"订单查询"按钮打开查询弹窗
- 输入订单号查询订单状态

## API接口

### 认证相关API

#### 注册用户
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "用户名",
  "email": "user@example.com",
  "password": "password123"
}
```

#### 用户登录
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com", 
  "password": "password123"
}
```

#### 获取当前用户信息
```
GET /api/auth/me
```

#### 用户登出
```
POST /api/auth/logout
```

## 安全特性

1. **密码加密**: 使用bcryptjs对密码进行哈希加密
2. **JWT认证**: 使用JSON Web Token进行身份验证
3. **会话管理**: 服务端存储和验证用户会话
4. **HttpOnly Cookie**: 使用HttpOnly cookie存储认证token
5. **输入验证**: 前后端双重输入验证

## 开发注意事项

1. 确保 `JWT_SECRET` 环境变量设置为强密码
2. 生产环境中使用HTTPS来保护认证cookie
3. 定期清理过期的用户会话
4. 考虑添加密码强度验证和邮箱验证功能

## 故障排除

### 数据库连接失败
- 检查MySQL服务是否运行
- 验证环境变量配置是否正确
- 确认数据库用户权限

### 认证失败
- 检查JWT_SECRET是否配置
- 确认cookie设置是否正确
- 查看浏览器开发者工具中的网络请求

### 会话过期
- 用户会话默认7天过期
- 可在 `models/MySQLUser.ts` 中调整过期时间