# Shop Website 一键运行指南

## 项目说明
这是一个基于 Next.js 的电商网站项目，使用 PM2 进行进程管理，Nginx 作为反向代理。

## 一键运行命令

当您使用提示词"请运行"时，我会执行以下操作：

```bash
# 1. 清理旧的日志文件
cd /root/shop/ship-fast-ts-main
truncate -s 0 logs/*.log

# 2. 确保依赖安装完成
npm install

# 3. 构建项目
npm run build

# 4. 启动 PM2 进程
pm2 delete shop-website 2>/dev/null || true
pm2 start ecosystem.config.js

# 5. 保存 PM2 配置
pm2 save
pm2 startup

# 6. 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 资源优化配置

### PM2 配置优化
- 内存限制：500MB（避免内存溢出）
- 最大重启次数：10次
- 最小运行时间：10秒
- Node.js 堆内存限制：512MB

### 日志管理
- 日志格式：JSON（便于分析）
- 日志轮转：自动管理
- 日志合并：启用

## 监控命令

```bash
# 查看进程状态
pm2 status

# 查看实时日志
pm2 logs

# 查看资源使用情况
pm2 monit

# 查看详细信息
pm2 info shop-website
```

## 停止服务

```bash
# 停止 PM2 进程
pm2 stop shop-website

# 停止 Nginx
sudo systemctl stop nginx
```

## 故障排查

如果服务器出现资源紧张：
1. 检查内存使用：`free -h`
2. 检查 PM2 日志：`pm2 logs --lines 100`
3. 重启服务：`pm2 restart shop-website`
4. 清理日志：`pm2 flush`

## 开发模式（热更新）

当需要实时修改和预览效果时，使用开发模式：

```bash
# 停止生产环境
pm2 stop shop-website

# 启动开发服务器（支持热更新）
npm run dev

# 访问 http://localhost:3000
# 修改代码后自动刷新，无需重启服务
```

开发模式优势：
- 代码修改后自动热更新
- 无需手动构建和重启
- 实时预览修改效果
- 更快的开发调试

## 环境要求
- Node.js 18+
- PM2
- Nginx
- 至少 1GB 可用内存