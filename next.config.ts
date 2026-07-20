import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/cookies',                permanent: true, destination: '/terms#cookies' },
      { source: '/copyright',              permanent: true, destination: '/terms#copyright' },
      { source: '/disclaimer',             permanent: true, destination: '/terms#disclaimer' },
      { source: '/ai-policy',              permanent: true, destination: '/terms#ai-policy' },
      { source: '/account-deletion',       permanent: true, destination: '/terms#account-deletion' },
      { source: '/community-guidelines',   permanent: true, destination: '/trust#community-guidelines' },
      { source: '/candidate-verification', permanent: true, destination: '/trust#candidate-verification' },
      { source: '/employer-verification',  permanent: true, destination: '/trust#employer-verification' },
    ]
  },
  async headers() {
    return [
      {
        source: '/videos/:path*',
        headers: [
          { key: 'Accept-Ranges', value: 'bytes' },
          { key: 'Content-Type', value: 'video/mp4' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
};

export default nextConfig;
