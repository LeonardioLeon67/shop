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
  // Claude 产品
  {
    name: "Claude Pro 1个月",
    description: "Claude Pro会员代充，享受Claude 3 Opus访问权限和更高的使用限制",
    price: 140,
    currency: "CNY",
    category: "Claude代充",
    serviceType: "claude",
    planDetails: {
      duration: "1个月",
      features: [
        "Claude 3 Opus访问权限",
        "更高的使用限制",
        "优先访问新功能",
        "更快的响应速度",
        "无限制对话次数"
      ],
      originalPrice: 160,
    },
    image: "/claude-icon.png",
    stock: 999,
  },
  {
    name: "Claude Pro 3个月",
    description: "Claude Pro 3个月套餐，长期AI助手体验",
    price: 380,
    currency: "CNY",
    category: "Claude代充",
    serviceType: "claude",
    planDetails: {
      duration: "3个月",
      features: [
        "Claude 3 Opus访问权限",
        "更高的使用限制",
        "优先访问新功能",
        "更快的响应速度",
        "无限制对话次数",
        "3个月优惠套餐"
      ],
      originalPrice: 480,
    },
    image: "/claude-icon.png",
    stock: 999,
  },
  {
    name: "Claude Team 1个月",
    description: "Claude Team会员，适合团队协作使用",
    price: 220,
    currency: "CNY",
    category: "Claude代充",
    serviceType: "claude",
    planDetails: {
      duration: "1个月",
      features: [
        "Claude 3 Opus和Sonnet访问",
        "团队协作功能",
        "更高的使用限制",
        "优先客户支持",
        "数据隐私保护",
        "管理员控制台"
      ],
      originalPrice: 280,
    },
    image: "/claude-icon.png",
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