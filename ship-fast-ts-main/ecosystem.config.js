module.exports = {
  apps: [{
    name: 'shop-app',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/root/shop/ship-fast-ts-main',
    instances: 1,
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};