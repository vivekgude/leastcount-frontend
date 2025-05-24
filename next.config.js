/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://140.245.228.15:8080/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
