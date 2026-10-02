import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 'standalone' output is for self-hosted/Docker deploys and is incompatible
  // with `next start`. Vercel builds this app itself, so it is not needed.
  typescript: { ignoreBuildErrors: true },
  reactStrictMode: false,
};

export default nextConfig;
