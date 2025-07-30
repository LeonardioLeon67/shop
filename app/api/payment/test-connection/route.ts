import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiUrl = process.env.DULUPAY_API_URL;
    const merchantId = process.env.DULUPAY_MERCHANT_ID;
    const md5Key = process.env.DULUPAY_MD5_KEY;

    // 检查环境变量
    if (!apiUrl || !merchantId || !md5Key) {
      return NextResponse.json({
        success: false,
        error: "Dulupay配置不完整",
        config: {
          hasApiUrl: !!apiUrl,
          hasMerchantId: !!merchantId,
          hasMd5Key: !!md5Key,
        }
      });
    }

    // 测试不同的API端点
    const testUrls = [
      `${apiUrl}`,
      `${apiUrl}/pay/unifiedorder`,
      `${apiUrl}/api/pay/unifiedorder`,
      `${apiUrl}/v1/pay/unifiedorder`,
      `https://api.dulupay.com`,
      `https://pay.dulupay.com`,
      `https://gateway.dulupay.com`,
    ];

    const results = [];
    
    for (const url of testUrls) {
      try {
        console.log(`测试连接: ${url}`);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; DulupaySDK/1.0)',
          },
          signal: AbortSignal.timeout(5000), // 5秒超时
        });
        
        const text = await response.text();
        const isHtml = text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html');
        
        results.push({
          url,
          status: response.status,
          ok: response.ok,
          isHtml,
          contentType: response.headers.get('content-type'),
          responsePreview: text.substring(0, 200)
        });
      } catch (error) {
        results.push({
          url,
          error: error.message,
          ok: false
        });
      }
    }

    return NextResponse.json({
      success: true,
      config: {
        apiUrl,
        merchantId,
        md5KeyLength: md5Key.length
      },
      testResults: results
    });

  } catch (error) {
    console.error("测试连接失败:", error);
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}