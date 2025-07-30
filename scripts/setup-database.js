const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  try {
    // 读取环境变量
    require('dotenv').config();
    
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
    });

    console.log('连接到MySQL服务器成功');

    // 读取SQL文件
    const sqlPath = path.join(__dirname, 'init-db.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // 分割SQL语句
    const sqlStatements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    // 执行每条SQL语句
    for (const statement of sqlStatements) {
      if (statement.trim()) {
        await connection.execute(statement);
        console.log('执行SQL语句成功:', statement.substring(0, 50) + '...');
      }
    }

    console.log('数据库初始化完成！');
    console.log('已创建以下表：');
    console.log('- users: 用户表');
    console.log('- user_sessions: 用户会话表');

    await connection.end();
  } catch (error) {
    console.error('数据库初始化失败:', error.message);
    process.exit(1);
  }
}

setupDatabase();