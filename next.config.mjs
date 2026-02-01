import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'api.mapbox.com',
      },
    ],
  },

  // Experimental features
  experimental: {
    // Enable server actions (stable in Next.js 14)
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Rewrites for clean URLs
  async rewrites() {
    return [
      {
        source: '/showcase',
        destination: '/showcase.html',
      },
    ];
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // Suppresses source map uploading logs during build
  silent: true,

  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only upload source maps in production
  dryRun: process.env.NODE_ENV !== 'production',

  // Upload source maps conditionally
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
};

// Wrap config with Sentry only if DSN is set, otherwise export raw config
export default process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;
