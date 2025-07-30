import { sendOrderEmailWithNodemailer } from "./nodemailer-service";

interface OrderEmailData {
  customerEmail: string;
  productName: string;
  price: number;
  duration: string;
  account: string;
  password: string;
  orderNo: string;
}

// 动态导入 resend，避免没有 API key 时报错
let sendEmailWithResend: any = null;
try {
  if (process.env.RESEND_API_KEY) {
    const { sendEmail } = require("./resend");
    sendEmailWithResend = sendEmail;
  }
} catch (error) {
  console.log("Resend 未配置，将使用 Nodemailer");
}

export const sendOrderEmail = async (data: OrderEmailData) => {
  const { customerEmail, productName, price, duration, account, password, orderNo } = data;

  const subject = `您的${productName}订单已完成 - 订单号: ${orderNo}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">订单确认</h2>
      <p>尊敬的客户，</p>
      <p>感谢您的购买！您的订单已成功处理。</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0;">订单详情</h3>
        <p><strong>订单号：</strong>${orderNo}</p>
        <p><strong>产品：</strong>${productName}</p>
        <p><strong>套餐时长：</strong>${duration}</p>
        <p><strong>支付金额：</strong>¥${price}</p>
      </div>
      
      <div style="background-color: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0;">账号信息</h3>
        <p><strong>账号：</strong>${account}</p>
        <p><strong>密码：</strong>${password}</p>
        <p style="color: #666; font-size: 14px; margin-top: 10px;">
          请妥善保管您的账号信息。如有任何问题，请联系客服。
        </p>
      </div>
      
      <p style="color: #666; font-size: 14px;">
        此邮件由系统自动发送，请勿回复。<br>
        如有疑问，请联系客服支持。
      </p>
    </div>
  `;
  
  const text = `
订单确认

尊敬的客户，

感谢您的购买！您的订单已成功处理。

订单详情：
订单号：${orderNo}
产品：${productName}
套餐时长：${duration}
支付金额：¥${price}

账号信息：
账号：${account}
密码：${password}

请妥善保管您的账号信息。如有任何问题，请联系客服。

此邮件由系统自动发送，请勿回复。
如有疑问，请联系客服支持。
  `;

  try {
    // 优先使用 Resend，如果没有配置则使用 Nodemailer
    if (sendEmailWithResend && process.env.RESEND_API_KEY) {
      await sendEmailWithResend({
        to: customerEmail,
        subject,
        text,
        html,
      });
      return { success: true };
    } else {
      // 使用 Nodemailer
      return await sendOrderEmailWithNodemailer(data);
    }
  } catch (error) {
    console.error("发送订单邮件失败:", error);
    // 如果 Resend 失败，尝试使用 Nodemailer
    try {
      return await sendOrderEmailWithNodemailer(data);
    } catch (fallbackError) {
      console.error("备用邮件发送也失败:", fallbackError);
      return { success: false, error: fallbackError };
    }
  }
};