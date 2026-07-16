import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    // The blueberry project page lived at /grocery before the app was named.
    return [{ source: '/grocery', destination: '/blueberry', permanent: true }];
  },
};

export default nextConfig;
