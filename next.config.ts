/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ This line skips ESLint in production build
  },
};

export default nextConfig;