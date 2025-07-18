module.exports = {
  apps: [{
    name: 'shop-website',
    script: 'npm',
    args: 'run dev',
    cwd: '/root/shop/ship-fast-ts-main',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    }
  }]
};