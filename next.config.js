/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/signup',
        destination: 'http://140.245.228.15:8080/api/auth/register', // external API
      },
      {
        source: '/api/auth/login',
        destination: 'http://140.245.228.15:8080/api/auth/login', // external API
      },
    ];
  },
};

module.exports = nextConfig; 