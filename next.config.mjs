/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  
  // Image optimization (updated for Next.js 16)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fincloud-tech.s3.ap-south-1.amazonaws.com',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Logging configuration
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  
  // Turbopack configuration (Next.js 16+)
  turbopack: {
    // Empty config to silence Turbopack warning
    // Most apps work fine with default Turbopack settings
  },
};

export default nextConfig;
