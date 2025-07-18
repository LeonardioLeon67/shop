import crypto from 'crypto';

interface AlipayConfig {
  appId: string;
  privateKey: string;
  alipayPublicKey: string;
  gatewayUrl?: string;
  charset?: string;
  signType?: string;
}

interface CreateOrderParams {
  orderNo: string;
  totalAmount: string; // 金额，单位：元
  subject: string;
  body?: string;
  notifyUrl: string;
  returnUrl?: string;
  quitUrl?: string;
}

export class AlipayService {
  private config: AlipayConfig;
  private gatewayUrl: string;
  private charset: string;
  private signType: string;

  constructor(config: AlipayConfig) {
    this.config = config;
    this.gatewayUrl = config.gatewayUrl || 'https://openapi.alipay.com/gateway.do';
    this.charset = config.charset || 'utf-8';
    this.signType = config.signType || 'RSA2';
  }

  // RSA2签名
  private sign(params: Record<string, any>): string {
    // 过滤空值并排序
    const filteredParams = Object.keys(params)
      .filter(key => params[key] !== '' && params[key] !== undefined && params[key] !== null)
      .sort()
      .reduce((obj, key) => {
        obj[key] = params[key];
        return obj;
      }, {} as Record<string, any>);

    // 构建签名字符串
    const signString = Object.keys(filteredParams)
      .map(key => `${key}=${filteredParams[key]}`)
      .join('&');

    // RSA2签名
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(signString, this.charset);
    return sign.sign(this.config.privateKey, 'base64');
  }

  // 验证支付宝签名
  private verifySign(params: Record<string, any>, sign: string): boolean {
    // 移除sign和sign_type参数
    const { sign: _, sign_type: __, ...verifyParams } = params;
    
    // 过滤空值并排序
    const filteredParams = Object.keys(verifyParams)
      .filter(key => verifyParams[key] !== '' && verifyParams[key] !== undefined && verifyParams[key] !== null)
      .sort()
      .reduce((obj, key) => {
        obj[key] = verifyParams[key];
        return obj;
      }, {} as Record<string, any>);

    // 构建验签字符串
    const signString = Object.keys(filteredParams)
      .map(key => `${key}=${filteredParams[key]}`)
      .join('&');

    // 验证签名
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(signString, this.charset);
    return verify.verify(this.config.alipayPublicKey, sign, 'base64');
  }

  // 构建请求参数
  private buildRequestParams(bizContent: any, method: string): Record<string, any> {
    const params = {
      app_id: this.config.appId,
      method,
      charset: this.charset,
      sign_type: this.signType,
      timestamp: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }).replace(/\//g, '-'),
      version: '1.0',
      biz_content: JSON.stringify(bizContent),
    };

    // 生成签名
    params.sign = this.sign(params);
    
    return params;
  }

  // 创建PC网站支付
  createPagePay(params: CreateOrderParams): string {
    const bizContent = {
      out_trade_no: params.orderNo,
      total_amount: params.totalAmount,
      subject: params.subject,
      body: params.body,
      product_code: 'FAST_INSTANT_TRADE_PAY',
    };

    const requestParams = this.buildRequestParams(bizContent, 'alipay.trade.page.pay');
    
    // 添加回调URL
    if (params.returnUrl) {
      requestParams.return_url = params.returnUrl;
    }
    if (params.notifyUrl) {
      requestParams.notify_url = params.notifyUrl;
    }

    // 构建URL参数
    const urlParams = Object.keys(requestParams)
      .map(key => `${key}=${encodeURIComponent(requestParams[key])}`)
      .join('&');

    return `${this.gatewayUrl}?${urlParams}`;
  }

  // 创建手机网站支付
  createWapPay(params: CreateOrderParams): string {
    const bizContent = {
      out_trade_no: params.orderNo,
      total_amount: params.totalAmount,
      subject: params.subject,
      body: params.body,
      product_code: 'QUICK_WAP_WAY',
      quit_url: params.quitUrl,
    };

    const requestParams = this.buildRequestParams(bizContent, 'alipay.trade.wap.pay');
    
    // 添加回调URL
    if (params.returnUrl) {
      requestParams.return_url = params.returnUrl;
    }
    if (params.notifyUrl) {
      requestParams.notify_url = params.notifyUrl;
    }

    // 构建URL参数
    const urlParams = Object.keys(requestParams)
      .map(key => `${key}=${encodeURIComponent(requestParams[key])}`)
      .join('&');

    return `${this.gatewayUrl}?${urlParams}`;
  }

  // 创建二维码支付
  async createQrPay(params: CreateOrderParams): Promise<{success: boolean; data?: any; error?: string}> {
    try {
      const bizContent = {
        out_trade_no: params.orderNo,
        total_amount: params.totalAmount,
        subject: params.subject,
        body: params.body,
      };

      const requestParams = this.buildRequestParams(bizContent, 'alipay.trade.precreate');
      
      if (params.notifyUrl) {
        requestParams.notify_url = params.notifyUrl;
      }

      // 发送请求
      const formData = new URLSearchParams();
      Object.keys(requestParams).forEach(key => {
        formData.append(key, requestParams[key]);
      });

      const response = await fetch(this.gatewayUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      const result = await response.json();
      const responseData = result.alipay_trade_precreate_response;

      if (responseData.code === '10000') {
        return {
          success: true,
          data: {
            qrCode: responseData.qr_code,
            outTradeNo: responseData.out_trade_no,
          },
        };
      } else {
        return {
          success: false,
          error: responseData.sub_msg || responseData.msg || '创建二维码支付失败',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `支付宝API调用失败: ${error.message}`,
      };
    }
  }

  // 查询订单
  async queryOrder(orderNo: string): Promise<{success: boolean; data?: any; error?: string}> {
    try {
      const bizContent = {
        out_trade_no: orderNo,
      };

      const requestParams = this.buildRequestParams(bizContent, 'alipay.trade.query');

      // 发送请求
      const formData = new URLSearchParams();
      Object.keys(requestParams).forEach(key => {
        formData.append(key, requestParams[key]);
      });

      const response = await fetch(this.gatewayUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      const result = await response.json();
      const responseData = result.alipay_trade_query_response;

      if (responseData.code === '10000') {
        return {
          success: true,
          data: responseData,
        };
      } else {
        return {
          success: false,
          error: responseData.sub_msg || responseData.msg || '查询订单失败',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `查询订单失败: ${error.message}`,
      };
    }
  }

  // 验证异步通知
  verifyNotify(params: Record<string, any>): {valid: boolean; data?: any} {
    try {
      const sign = params.sign;
      const isValid = this.verifySign(params, sign);
      
      return {
        valid: isValid,
        data: isValid ? params : undefined,
      };
    } catch (error) {
      return { valid: false };
    }
  }

  // 关闭订单
  async closeOrder(orderNo: string): Promise<{success: boolean; error?: string}> {
    try {
      const bizContent = {
        out_trade_no: orderNo,
      };

      const requestParams = this.buildRequestParams(bizContent, 'alipay.trade.close');

      const formData = new URLSearchParams();
      Object.keys(requestParams).forEach(key => {
        formData.append(key, requestParams[key]);
      });

      const response = await fetch(this.gatewayUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      const result = await response.json();
      const responseData = result.alipay_trade_close_response;

      return {
        success: responseData.code === '10000',
        error: responseData.code !== '10000' ? (responseData.sub_msg || responseData.msg) : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: `关闭订单失败: ${error.message}`,
      };
    }
  }
}

// 获取支付宝服务实例
export const getAlipayService = () => {
  const config: AlipayConfig = {
    appId: process.env.ALIPAY_APP_ID || '',
    privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
    alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY || '',
    gatewayUrl: process.env.ALIPAY_GATEWAY_URL,
  };

  return new AlipayService(config);
};