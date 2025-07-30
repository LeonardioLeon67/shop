import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

// 订单Schema
const orderSchema = new mongoose.Schema(
  {
    orderNo: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VirtualProduct",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "CNY",
      enum: ["CNY", "USD"],
    },
    // 支付方式
    paymentMethod: {
      type: String,
      required: true,
      enum: ["alipay", "stripe"],
    },
    // 支付状态
    paymentStatus: {
      type: String,
      default: "pending",
      enum: ["pending", "paid", "failed", "refunded"],
    },
    // 第三方支付平台的交易ID
    paymentId: String,
    // 支付时间
    paidAt: Date,
    // 订单状态
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "processing", "completed", "cancelled"],
    },
    // 代充服务相关信息
    rechargeInfo: {
      // 客户提供的账号信息
      customerAccount: {
        email: String,
        accountInfo: String, // 其他必要的账号信息
      },
      // 代充状态
      rechargeStatus: {
        type: String,
        default: "pending",
        enum: ["pending", "processing", "completed", "failed"],
      },
      // 代充完成时间
      completedAt: Date,
      // 代充备注
      rechargeNotes: String,
    },
    // 买家联系信息
    buyerContact: {
      email: String,
      phone: String,
    },
    // 备注
    notes: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// 添加索引
orderSchema.index({ orderNo: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// 生成订单号的静态方法
orderSchema.statics.generateOrderNo = function() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `VG${timestamp}${random}`;
};

orderSchema.plugin(toJSON);

export default mongoose.models.Order || mongoose.model("Order", orderSchema);