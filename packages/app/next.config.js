/** @type {import('next').NextConfig} */
const nextConfig = {
  // appDir is now stable in Next.js 14, no longer experimental
  images: {
    domains: ['id.worldcoin.org'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://worldapp.org https://*.worldapp.org",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
