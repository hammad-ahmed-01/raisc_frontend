/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    turbo: false, // disable Turbopack to force Webpack
  },
};

module.exports = nextConfig;
