import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 图片域名配置
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fqkdpsdtadrkqrcezdxq.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
