import type { NextConfig } from 'next';

const backendOrigin = process.env.BACKEND_ORIGIN ?? 'http://localhost:3001';

const nextConfig: NextConfig = {
  // Proxies the frontend's /api/* to the backend so the app is same-origin —
  // the session cookie just works, CORS stops mattering, and there is no
  // mixed-content problem when this is served over HTTPS for the mobile demo.
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendOrigin}/api/v1/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.qsaifudin.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
};

export default nextConfig;
