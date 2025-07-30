import crypto from 'crypto';
import https from 'https';
import http from 'http';

interface DulupayConfig {
  apiUrl: string;
  merchantId: string;
  md5Key: string;
}

interface BarcodePayParams {
  orderNo: string;
  authCode: string;
  totalAmount: string;
  subject: string;
  body: string;
  notifyUrl: string;
}

interface QrPayParams {
  orderNo: string;
  totalAmount: string;
  subject: string;
  body: string;
  notifyUrl: string;
  paymentType: 'alipay' | 'wechat';
  clientIp?: string;
}

interface PaymentResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class DulupayService {
  private config: DulupayConfig;

  constructor(config: DulupayConfig) {
    // 验证配置
    if (!config.apiUrl || !config.merchantId || !config.md5Key) {
      throw new Error('Dulupay配置不完整，请检查apiUrl、merchantId和md5Key');
    }
    this.config = config;
  }

  // 生成签名 - 根据SDK的签名方式
  private generateSign(params: Record<string, string>): string {
    // 过滤空值和签名参数
    const filteredParams: Record<string, string> = {};
    Object.keys(params).forEach(key => {
      if (key !== 'sign' && key !== 'sign_type' && params[key] !== '') {
        filteredParams[key] = params[key];
      }
    });

    // 按键名升序排列参数
    const sortedKeys = Object.keys(filteredParams).sort();
    const signString = sortedKeys
      .map(key => `${key}=${filteredParams[key]}`)
      .join('&') + this.config.md5Key;
    
    console.log('签名字符串:', signString.replace(this.config.md5Key, '***'));
    
    return crypto.createHash('md5').update(signString, 'utf8').digest('hex');
  }

  // 二维码支付 - 使用v1 API
  async createQrPay(params: QrPayParams): Promise<PaymentResponse> {
    try {
      // 验证必要参数
      if (!params.orderNo || !params.totalAmount || !params.subject) {
        return {
          success: false,
          error: '缺少必要参数：订单号、金额或商品名称',
        };
      }

      // 构造请求参数 - 根据SDK格式
      const requestParams: Record<string, string> = {
        pid: this.config.merchantId,
        type: params.paymentType === 'wechat' ? 'wxpay' : 'alipay',
        notify_url: params.notifyUrl,
        return_url: params.notifyUrl, // 同步通知地址，这里使用相同的
        out_trade_no: params.orderNo,
        name: params.subject,
        money: params.totalAmount,
        clientip: params.clientIp || '127.0.0.1', // 添加客户端IP
      };

      // 生成签名
      const sign = this.generateSign(requestParams);
      const requestData = { 
        ...requestParams, 
        sign,
        sign_type: 'MD5'
      };

      console.log('Dulupay创建二维码请求:', {
        url: `${this.config.apiUrl}mapi.php`,
        merchantId: this.config.merchantId,
        orderNo: params.orderNo,
        amount: params.totalAmount,
        type: requestParams.type
      });

      // 发送请求到mapi.php接口
      const apiUrl = `${this.config.apiUrl}mapi.php`;
      console.log('发送请求到:', apiUrl);
      console.log('请求参数:', requestData);
      
      let responseText: string;
      try {
        // 尝试使用Node.js原生HTTP模块
        const postData = new URLSearchParams(requestData).toString();
        responseText = await this.httpRequest(apiUrl, 'POST', postData);
        console.log('Dulupay API原始响应:', responseText.substring(0, 500));
      } catch (httpError) {
        console.error('HTTP请求失败，尝试使用fetch:', httpError);
        
        // 如果原生请求失败，回退到fetch
        try {
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(requestData).toString(),
          });
          
          console.log('Dulupay API响应状态:', response.status);
          responseText = await response.text();
          console.log('Dulupay API原始响应:', responseText.substring(0, 500));
        } catch (fetchError) {
          console.error('Fetch也失败了:', fetchError);
          throw fetchError;
        }
      }

      // 尝试解析JSON响应
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Dulupay API响应解析失败:', parseError.message);
        return {
          success: false,
          error: '二维码生成失败：API响应格式错误',
        };
      }

      // 根据API文档，检查返回状态
      if (result.code === 1 || result.code === '1') {
        return {
          success: true,
          data: {
            qrCode: result.qrcode || result.payurl,
            outTradeNo: params.orderNo,
            tradeNo: result.trade_no,
          }
        };
      } else {
        const errorMsg = result.msg || '二维码生成失败';
        console.error('Dulupay业务错误:', errorMsg);
        return {
          success: false,
          error: errorMsg,
        };
      }
    } catch (error) {
      console.error('Dulupay QR pay error:', error);
      console.error('错误详情:', {
        message: error.message,
        stack: error.stack,
        apiUrl: this.config.apiUrl,
      });
      
      // 如果是网络错误，提供更详细的信息
      if (error.message.includes('fetch failed')) {
        return {
          success: false,
          error: `网络请求失败，请检查API地址是否正确: ${this.config.apiUrl}`,
        };
      }
      
      return {
        success: false,
        error: `二维码生成失败: ${error.message}`,
      };
    }
  }

  // 付款码支付
  async barcodePay(params: BarcodePayParams): Promise<PaymentResponse> {
    try {
      const requestParams = {
        mch_id: this.config.merchantId,
        out_trade_no: params.orderNo,
        auth_code: params.authCode,
        total_fee: (parseFloat(params.totalAmount) * 100).toString(), // 转换为分
        body: params.subject,
        notify_url: params.notifyUrl,
        nonce_str: this.generateNonceStr(),
      };

      const sign = this.generateSign(requestParams);
      const requestData = { ...requestParams, sign };

      // 将参数转换为form-data格式
      const formData = new URLSearchParams();
      Object.keys(requestData).forEach(key => {
        formData.append(key, (requestData as any)[key]);
      });

      const response = await fetch(`${this.config.apiUrl}/pay/micropay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const result = await response.json();

      if (result.return_code === 'SUCCESS' && result.result_code === 'SUCCESS') {
        return {
          success: true,
          data: {
            tradeNo: result.transaction_id,
            outTradeNo: result.out_trade_no,
            totalAmount: (parseInt(result.total_fee) / 100).toString(),
            buyerLogonId: result.openid || '',
          }
        };
      } else if (result.err_code === 'USERPAYING') {
        return {
          success: false,
          data: {
            waiting: true,
            outTradeNo: result.out_trade_no,
          }
        };
      } else {
        return {
          success: false,
          error: result.err_code_des || result.return_msg || '付款失败',
        };
      }
    } catch (error) {
      console.error('Dulupay barcode pay error:', error);
      return {
        success: false,
        error: '网络请求失败',
      };
    }
  }

  // 查询订单状态 - 使用v1 API
  async queryOrder(orderNo: string): Promise<PaymentResponse> {
    try {
      // 使用api.php查询订单
      const url = `${this.config.apiUrl}api.php?act=order&pid=${this.config.merchantId}&key=${this.config.md5Key}&trade_no=${orderNo}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; DulupaySDK/1.0)',
        },
      });

      const result = await response.json();

      if (result.code === 1 || result.code === '1') {
        return {
          success: true,
          data: {
            trade_status: result.status === 1 || result.status === '1' ? 'SUCCESS' : 'WAIT_BUYER_PAY',
            trade_no: result.trade_no,
            out_trade_no: result.out_trade_no,
            total_amount: result.money,
            isPaid: result.status === 1 || result.status === '1',
          }
        };
      } else {
        return {
          success: false,
          error: result.msg || '查询失败',
        };
      }
    } catch (error) {
      console.error('Dulupay query order error:', error);
      return {
        success: false,
        error: '网络请求失败',
      };
    }
  }

  // 生成随机字符串
  private generateNonceStr(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  // 使用Node.js原生模块发送HTTP请求
  private async httpRequest(url: string, method: string, data: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const lib = isHttps ? https : http;
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: method,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(data),
          'User-Agent': 'DulupaySDK/1.0',
        },
      };

      const req = lib.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          resolve(responseData);
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      if (data) {
        req.write(data);
      }
      
      req.end();
    });
  }
}

// 导出服务实例
export function getDulupayService(): DulupayService {
  const config: DulupayConfig = {
    apiUrl: process.env.DULUPAY_API_URL!,
    merchantId: process.env.DULUPAY_MERCHANT_ID!,
    md5Key: process.env.DULUPAY_MD5_KEY!,
  };

  return new DulupayService(config);
}