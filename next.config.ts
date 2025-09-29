import type { NextConfig } from "next";
import path from "path";

// Bundle analyzer configuration
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,

  // Image optimization
  images: {
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
  },

  // SCSS options
  sassOptions: {
    includePaths: [path.join(__dirname, "node_modules")],
  },

  // Webpack optimization
  webpack: (config, { isServer, dev }) => {
    // Handle qrcode library for client-side rendering
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        canvas: false,
      };
    }

    // Bundle optimization in production
    if (!dev) {
      // Tree shaking optimization
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
      };

      // Split chunks for better caching
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            priority: 20,
            chunks: 'all',
          },
          bootstrap: {
            test: /[\\/]node_modules[\\/](react-bootstrap|bootstrap)[\\/]/,
            name: 'bootstrap',
            priority: 15,
            chunks: 'all',
          },
          charts: {
            test: /[\\/]node_modules[\\/](react-apexcharts|apexcharts)[\\/]/,
            name: 'charts',
            priority: 15,
            chunks: 'all',
          },
          editor: {
            test: /[\\/]node_modules[\\/](quill|react-quilljs)[\\/]/,
            name: 'editor',
            priority: 15,
            chunks: 'all',
          },
        },
      };
    }

    // Optimize imports
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
      'components': path.resolve(__dirname, 'components'),
      'services': path.resolve(__dirname, 'services'),
      'hooks': path.resolve(__dirname, 'hooks'),
      'contexts': path.resolve(__dirname, 'contexts'),
      'types': path.resolve(__dirname, 'types'),
      'helpers': path.resolve(__dirname, 'helper'),
    };

    return config;
  },

  // Experimental features for performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'react-bootstrap',
      'react-bootstrap-icons',
      '@tabler/icons-react'
    ],
  },

  // ESLint configuration for build
  eslint: {
    // Tạm thời bỏ qua ESLint errors trong quá trình build production
    ignoreDuringBuilds: false,
    dirs: ['app', 'components', 'hooks', 'services'],
  },

  // TypeScript configuration
  typescript: {
    // Tạm thời bỏ qua TypeScript errors trong build để tập trung vào performance
    ignoreBuildErrors: false,
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default withBundleAnalyzer(nextConfig);
