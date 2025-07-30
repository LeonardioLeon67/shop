const nodemailer = require("nodemailer");

interface OrderEmailData {
  customerEmail: string;
  productName: string;
  price: number;
  duration: string;
  account: string;
  password: string;
  orderNo: string;
}

// 创建邮件传输器
export const createTransporter = () => {
  // 如果有环境变量配置，使用配置的SMTP服务
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  
  // 否则使用测试账号（仅用于开发）
  return nodemailer.createTransporter({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: "ethereal.user@ethereal.email",
      pass: "ethereal.pass",
    },
  });
};

export const sendOrderEmailWithNodemailer = async (data: OrderEmailData) => {
  const { customerEmail, productName, price, duration, account, password, orderNo } = data;
  
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.SMTP_FROM || '"浣熊订阅" <noreply@example.com>',
    to: customerEmail,
    subject: `您的${productName}订单已完成 - 订单号: ${orderNo}`,
    html: `
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
    `,
    text: `
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
    `,
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("邮件发送成功:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("发送邮件失败:", error);
    return { success: false, error };
  }
};