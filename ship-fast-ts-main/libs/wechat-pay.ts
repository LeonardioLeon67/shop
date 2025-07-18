import crypto from 'crypto';

interface WechatPayConfig {
  appId: string;
  mchId: string;
  apiKey: string;
  certPath?: string;
  keyPath?: string;
}

interface CreateOrderParams {
  orderNo: string;
  totalFee: number; // 金额，单位：分
  productName: string;
  notifyUrl: string;
  openId?: string; // JSAPI支付必须
  clientIp: string;
}

interface WechatPayResponse {
  return_code: string;
  return_msg?: string;
  result_code?: string;
  err_code?: string;
  err_code_des?: string;
  [key: string]: any;
}

export class WechatPayService {
  private config: WechatPayConfig;
  private apiUrl = 'https://api.mch.weixin.qq.com/pay';

  constructor(config: WechatPayConfig) {
    this.config = config;
  }

  // 生成微信支付签名
  private generateSign(params: Record<string, any>): string {
    // 过滤空值并排序
    const filteredParams = Object.keys(params)
      .filter(key => params[key] !== '' && params[key] !== undefined)
      .sort()
      .reduce((obj, key) => {
        obj[key] = params[key];
        return obj;
      }, {} as Record<string, any>);

    // 构建签名字符串
    const stringA = Object.keys(filteredParams)
      .map(key => `${key}=${filteredParams[key]}`)
      .join('&');
    
    const stringSignTemp = `${stringA}&key=${this.config.apiKey}`;
    
    // MD5签名并转大写
    return crypto.createHash('md5').update(stringSignTemp, 'utf8').digest('hex').toUpperCase();
  }

  // 解析XML响应
  private parseXML(xml: string): WechatPayResponse {
    const result: WechatPayResponse = { return_code: '' };
    const regex = /<(\w+)><!\[CDATA\[(.*?)\]\]><\/\w+>/g;
    let match;
    
    while ((match = regex.exec(xml)) !== null) {
      result[match[1]] = match[2];
    }
    
    return result;
  }

  // 构建XML请求
  private buildXML(params: Record<string, any>): string {
    let xml = '<xml>';
    for (const key in params) {
      xml += `<${key}><![CDATA[${params[key]}]]></${key}>`;
    }
    xml += '</xml>';
    return xml;
  }

  // 创建统一下单
  async createUnifiedOrder(params: CreateOrderParams): Promise<{success: boolean; data?: any; error?: string}> {
    try {
      const orderParams: Record<string, any> = {
        appid: this.config.appId,
        mch_id: this.config.mchId,
        nonce_str: this.generateNonceStr(),
        body: params.productName,
        out_trade_no: params.orderNo,
        total_fee: params.totalFee,
        spbill_create_ip: params.clientIp,
        notify_url: params.notifyUrl,
        trade_type: params.openId ? 'JSAPI' : 'NATIVE',
        ...(params.openId && { openid: params.openId }),
      };

      // 生成签名
      orderParams.sign = this.generateSign(orderParams);

      // 构建请求XML
      const xml = this.buildXML(orderParams);

      // 发送请求
      const response = await fetch(`${this.apiUrl}/unifiedorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
        },
        body: xml,
      });

      const responseText = await response.text();
      const result = this.parseXML(responseText);

      if (result.return_code === 'SUCCESS' && result.result_code === 'SUCCESS') {
        return {
          success: true,
          data: {
            prepayId: result.prepay_id,
            codeUrl: result.code_url, // 二维码链接（NATIVE支付）
            result,
          },
        };
      } else {
        return {
          success: false,
          error: result.err_code_des || result.return_msg || '创建订单失败',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `微信支付API调用失败: ${error.message}`,
      };
    }
  }

  // 生成JSAPI支付参数
  generateJSAPIPayParams(prepayId: string): any {
    const timeStamp = Math.floor(Date.now() / 1000).toString();
    const nonceStr = this.generateNonceStr();
    const packageStr = `prepay_id=${prepayId}`;

    const params = {
      appId: this.config.appId,
      timeStamp,
      nonceStr,
      package: packageStr,
      signType: 'MD5',
    };

    const paySign = this.generateSign(params);

    return {
      ...params,
      paySign,
    };
  }

  // 验证支付回调
  verifyNotify(xmlData: string): {valid: boolean; data?: any} {
    try {
      const data = this.parseXML(xmlData);
      const sign = data.sign;
      delete data.sign;

      const calculatedSign = this.generateSign(data);
      
      return {
        valid: sign === calculatedSign,
        data: sign === calculatedSign ? data : undefined,
      };
    } catch (error) {
      return { valid: false };
    }
  }

  // 查询订单
  async queryOrder(orderNo: string): Promise<{success: boolean; data?: any; error?: string}> {
    try {
      const queryParams: any = {
        appid: this.config.appId,
        mch_id: this.config.mchId,
        out_trade_no: orderNo,
        nonce_str: this.generateNonceStr(),
      };

      queryParams.sign = this.generateSign(queryParams);
      const xml = this.buildXML(queryParams);

      const response = await fetch(`${this.apiUrl}/orderquery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
        },
        body: xml,
      });

      const responseText = await response.text();
      const result = this.parseXML(responseText);

      if (result.return_code === 'SUCCESS') {
        return {
          success: true,
          data: result,
        };
      } else {
        return {
          success: false,
          error: result.return_msg || '查询订单失败',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `查询订单失败: ${error.message}`,
      };
    }
  }

  // 生成随机字符串
  private generateNonceStr(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

// 获取微信支付实例
export const getWechatPayService = () => {
  const config: WechatPayConfig = {
    appId: process.env.WECHAT_APP_ID || '',
    mchId: process.env.WECHAT_MCH_ID || '',
    apiKey: process.env.WECHAT_API_KEY || '',
  };

  return new WechatPayService(config);
};