import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

// 虚拟商品Schema
const virtualProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "CNY",
      enum: ["CNY", "USD"],
    },
    category: {
      type: String,
      required: true,
      enum: ["奈飞代充", "ChatGPT代充", "其他代充服务"],
    },
    // 代充服务特有字段
    serviceType: {
      type: String,
      required: true,
      enum: ["chatgpt", "claude", "grok", "other"],
    },
    // 套餐详情
    planDetails: {
      duration: {
        type: String, // "1个月", "3个月", "1年"
        required: true,
      },
      features: [String], // 套餐特色
      originalPrice: Number, // 官方原价
    },
    image: {
      type: String,
    },
    // 虚拟商品的数字内容或激活码
    digitalContent: [{
      code: String,
      isUsed: { type: Boolean, default: false },
      usedAt: Date,
      usedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    }],
    // 库存数量
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    // 是否上架
    isActive: {
      type: Boolean,
      default: true,
    },
    // 销售统计
    sales: {
      totalSold: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
    },
    // 创建者
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// 添加索引
virtualProductSchema.index({ name: 1 });
virtualProductSchema.index({ category: 1 });
virtualProductSchema.index({ isActive: 1 });

// 虚拟属性：剩余库存
virtualProductSchema.virtual('availableStock').get(function() {
  const usedCount = this.digitalContent.filter((item: any) => item.isUsed).length;
  return this.digitalContent.length - usedCount;
});

virtualProductSchema.plugin(toJSON);

export default mongoose.models.VirtualProduct || mongoose.model("VirtualProduct", virtualProductSchema);