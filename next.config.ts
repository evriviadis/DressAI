import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pwmitdneuiqjfjarmbde.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Common placeholder, easy to remove if not used
      }
    ],
  },
};

export default nextConfig;
