import mysql from 'mysql2/promise';

// MySQL连接配置
const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'claude_shop',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// 创建连接池
let pool: mysql.Pool | null = null;

export async function getConnection(): Promise<mysql.Pool> {
  if (!pool) {
    try {
      pool = mysql.createPool(dbConfig);
      
      // 测试连接
      const connection = await pool.getConnection();
      console.log('MySQL数据库连接成功');
      connection.release();
      
      // 确保数据库和表存在
      await initDatabase();
    } catch (error) {
      console.error('MySQL连接失败:', error);
      throw error;
    }
  }
  return pool;
}

// 初始化数据库和表结构
async function initDatabase() {
  if (!pool) return;
  
  try {
    // 创建用户表
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE
      )
    `);

    // 创建用户会话表
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(500) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 创建订单表
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_no VARCHAR(255) UNIQUE NOT NULL,
        user_id INT,
        product_id VARCHAR(255) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        payment_method VARCHAR(100) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        duration VARCHAR(100),
        status VARCHAR(50) DEFAULT 'pending',
        is_paid BOOLEAN DEFAULT FALSE,
        credentials_email VARCHAR(255),
        credentials_password VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    console.log('数据库表结构初始化完成');
  } catch (error) {
    console.error('初始化数据库失败:', error);
    throw error;
  }
}

// 关闭连接池
export async function closeConnection() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('MySQL连接池已关闭');
  }
}

// 保持兼容性的默认导出
const connection = mysql.createPool(dbConfig);
export default connection;
export { pool };