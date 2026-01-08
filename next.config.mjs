/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  
  // Image optimization
  images: {
    domains: ['fincloud-tech.s3.ap-south-1.amazonaws.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Logging configuration
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Suppress specific warnings
    config.infrastructureLogging = {
      level: 'error',
    };
    
    return config;
  },
};

export default nextConfig;
