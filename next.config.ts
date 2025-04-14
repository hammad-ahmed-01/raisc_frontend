/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: "/users/:path*", destination: "http://localhost:8000/users/:path*" },
      { source: "/api/chat", destination: "http://localhost:8080/api/chat" },
      { source: "/api/history/:path*", destination: "http://localhost:8080/api/history/:path*" },
    ];
  },
};

module.exports = nextConfig;
