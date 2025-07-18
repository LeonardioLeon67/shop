const mongoose = require('mongoose');

// 简化的模型定义（用于seed脚本）
const virtualProductSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  currency: { type: String, default: "CNY" },
  category: String,
  serviceType: String,
  planDetails: {
    duration: String,
    features: [String],
    originalPrice: Number,
  },
  image: String,
  stock: { type: Number, default: 999 },
  isActive: { type: Boolean, default: true },
  sales: {
    totalSold: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, {
  timestamps: true,
});

const VirtualProduct = mongoose.models.VirtualProduct || mongoose.model("VirtualProduct", virtualProductSchema);

// 示例产品数据
const sampleProducts = [
  // Netflix 产品
  {
    name: "Netflix 高级会员 1个月",
    description: "Netflix高级会员代充服务，支持4K画质，4个设备同时观看",
    price: 45,
    currency: "CNY",
    category: "奈飞代充",
    serviceType: "netflix",
    planDetails: {
      duration: "1个月",
      features: [
        "4K超高清画质",
        "支持4个设备同时观看",
        "无广告观影体验",
        "包含所有Netflix原创内容"
      ],
      originalPrice: 68,
    },
    stock: 999,
  },
  {
    name: "Netflix 高级会员 3个月",
    description: "Netflix高级会员3个月套餐，更优惠的长期观影选择",
    price: 120,
    currency: "CNY",
    category: "奈飞代充",
    serviceType: "netflix",
    planDetails: {
      duration: "3个月",
      features: [
        "4K超高清画质",
        "支持4个设备同时观看",
        "无广告观影体验",
        "包含所有Netflix原创内容",
        "3个月超值套餐"
      ],
      originalPrice: 204,
    },
    stock: 999,
  },
  {
    name: "Netflix 高级会员 12个月",
    description: "Netflix高级会员年费套餐，最优惠的长期选择",
    price: 400,
    currency: "CNY",
    category: "奈飞代充",
    serviceType: "netflix",
    planDetails: {
      duration: "12个月",
      features: [
        "4K超高清画质",
        "支持4个设备同时观看",
        "无广告观影体验",
        "包含所有Netflix原创内容",
        "年费超值优惠"
      ],
      originalPrice: 816,
    },
    stock: 999,
  },
  
  // ChatGPT 产品
  {
    name: "ChatGPT Plus 1个月",
    description: "ChatGPT Plus会员代充，享受GPT-4访问权限和更快响应速度",
    price: 130,
    currency: "CNY",
    category: "ChatGPT代充",
    serviceType: "chatgpt",
    planDetails: {
      duration: "1个月",
      features: [
        "GPT-4访问权限",
        "更快的响应速度",
        "优先访问新功能",
        "无限制对话次数",
        "DALL-E 3图像生成"
      ],
      originalPrice: 140,
    },
    stock: 999,
  },
  {
    name: "ChatGPT Plus 3个月",
    description: "ChatGPT Plus 3个月套餐，长期AI助手体验",
    price: 360,
    currency: "CNY",
    category: "ChatGPT代充",
    serviceType: "chatgpt",
    planDetails: {
      duration: "3个月",
      features: [
        "GPT-4访问权限",
        "更快的响应速度",
        "优先访问新功能",
        "无限制对话次数",
        "DALL-E 3图像生成",
        "3个月优惠套餐"
      ],
      originalPrice: 420,
    },
    stock: 999,
  },
  {
    name: "ChatGPT Team 1个月",
    description: "ChatGPT Team会员，适合团队协作使用",
    price: 200,
    currency: "CNY",
    category: "ChatGPT代充",
    serviceType: "chatgpt",
    planDetails: {
      duration: "1个月",
      features: [
        "GPT-4和GPT-4 Turbo访问",
        "团队协作功能",
        "更高的使用限制",
        "优先客户支持",
        "数据隐私保护",
        "管理员控制台"
      ],
      originalPrice: 250,
    },
    stock: 999,
  }
];

async function seedProducts() {
  try {
    // 连接数据库（请根据实际情况修改连接字符串）
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shipfast');
    
    console.log('Connected to MongoDB');
    
    // 创建一个默认的创建者ID（你需要先创建一个用户或使用现有用户的ID）
    const defaultCreatorId = new mongoose.Types.ObjectId();
    
    // 为所有产品添加创建者ID
    const productsWithCreator = sampleProducts.map(product => ({
      ...product,
      createdBy: defaultCreatorId
    }));
    
    // 清空现有产品（可选）
    // await VirtualProduct.deleteMany({});
    
    // 插入示例产品
    await VirtualProduct.insertMany(productsWithCreator);
    
    console.log('Sample products have been created successfully!');
    console.log(`Created ${sampleProducts.length} products`);
    
    // 显示创建的产品
    const products = await VirtualProduct.find({}).select('name price serviceType');
    console.log('\nCreated products:');
    products.forEach(product => {
      console.log(`- ${product.name} (${product.serviceType}): ¥${product.price}`);
    });
    
  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDatabase connection closed');
  }
}

// 运行脚本
if (require.main === module) {
  seedProducts();
}

module.exports = { seedProducts, sampleProducts };