# 🚀 真实支付配置指南

## 📋 目录
- [支付宝配置](#支付宝配置)
- [环境变量设置](#环境变量设置)
- [Webhook配置](#webhook配置)
- [测试验证](#测试验证)

## 💳 支付宝配置

### 1. 创建支付宝应用
1. 访问 [支付宝开放平台](https://open.alipay.com/)
2. 登录后点击"控制台" → "网页&移动应用" → "创建应用"
3. 选择"网页应用"，填写应用信息
4. 提交审核并等待通过

### 2. 获取配置信息
```bash
# 应用信息
ALIPAY_APP_ID=您的应用APPID

# RSA密钥对 (推荐RSA2)
ALIPAY_PRIVATE_KEY=您的RSA私钥(PKCS8格式)
ALIPAY_PUBLIC_KEY=支付宝公钥

# 网关地址
ALIPAY_GATEWAY_URL=https://openapi.alipay.com/gateway.do
```

### 3. 密钥生成步骤
```bash
# 生成RSA私钥
openssl genrsa -out alipay_private_key.pem 2048

# 生成RSA公钥
openssl rsa -in alipay_private_key.pem -pubout -out alipay_public_key.pem

# 转换为PKCS8格式(Java/Node.js使用)
openssl pkcs8 -topk8 -inform PEM -in alipay_private_key.pem -outform PEM -nocrypt -out alipay_private_key_pkcs8.pem
```

### 4. 配置回调地址
在支付宝控制台设置以下回调地址：
```
https://yourdomain.com/api/webhook/alipay
```


## 🔧 环境变量设置

### 1. 复制配置文件
```bash
cp .env.example .env
```

### 2. 填写真实配置
编辑 `.env` 文件：
```bash
# 基础配置
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-nextauth-secret

# 支付宝配置
ALIPAY_APP_ID=2021000122671234
ALIPAY_PRIVATE_KEY=MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...
ALIPAY_PUBLIC_KEY=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
ALIPAY_GATEWAY_URL=https://openapi.alipay.com/gateway.do

```

## 🔔 Webhook配置

### 1. 支付宝异步通知
- **通知地址**: `https://yourdomain.com/api/webhook/alipay`
- **请求方式**: POST
- **数据格式**: application/x-www-form-urlencoded


### 3. SSL证书要求
⚠️ **重要**: 生产环境必须使用HTTPS，支付平台不会向HTTP地址发送回调

## ✅ 测试验证

### 1. 检查配置
```bash
# 启动应用
npm run dev

# 测试支付宝配置
curl -X POST http://localhost:3000/api/payment/qrcode \
  -H "Content-Type: application/json" \
  -d '{
    "orderNo": "TEST_ORDER_001",
    "amount": 0.01,
    "productName": "测试商品",
    "paymentMethod": "alipay"
  }'
```

### 2. 验证二维码
- 使用支付宝扫描生成的二维码
- 确认能够正常跳转到支付页面
- 测试小额支付(建议0.01元)

### 3. 验证回调
- 完成支付后检查订单状态是否自动更新
- 查看服务器日志确认收到回调通知
- 测试邮件发送功能

## 🛡️ 安全注意事项

### 1. 密钥安全
- ❌ 不要将私钥提交到代码仓库
- ✅ 使用环境变量存储敏感信息
- ✅ 定期更换API密钥

### 2. 签名验证
- ✅ 验证所有支付回调的签名
- ✅ 检查订单金额和状态
- ✅ 防止重复处理同一笔订单

### 3. 网络安全
- ✅ 使用HTTPS协议
- ✅ 配置防火墙和DDoS保护
- ✅ 监控异常支付行为

## 🚀 部署到生产环境

### 1. 更新回调地址
将开发环境的回调地址更新为生产域名：
```bash
# 开发环境
http://localhost:3000/api/webhook/alipay

# 生产环境  
https://yourdomain.com/api/webhook/alipay
```

### 2. 环境变量
确保生产服务器正确设置所有环境变量：
```bash
# 检查环境变量
echo $ALIPAY_APP_ID
```

### 3. 监控与日志
- 设置支付异常监控
- 记录所有支付相关日志
- 配置钉钉/企微支付通知

## 📞 技术支持

### 支付宝
- 官方文档: https://opendocs.alipay.com/
- 技术支持: 支付宝开放平台论坛


---

✅ **配置完成后，您的系统将支持真实的支付宝支付动态二维码！**