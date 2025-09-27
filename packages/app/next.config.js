/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['avatar.vercel.sh'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'none';",
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
