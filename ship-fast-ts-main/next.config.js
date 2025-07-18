/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 减少内存使用
  experimental: {
    workerThreads: false,
    cpus: 1
  },
  // 生产模式优化
  swcMinify: true,
  images: {
    domains: [
      // NextJS <Image> component needs to whitelist domains for src={}
      "lh3.googleusercontent.com",
      "pbs.twimg.com",
      "images.unsplash.com",
      "logos-world.net",
    ],
  },
};

module.exports = nextConfig;