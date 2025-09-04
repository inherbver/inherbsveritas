const createNextIntlPlugin = require('next-intl/plugin')

const withNextIntl = createNextIntlPlugin('./src/i18n.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Bundle optimization
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      'date-fns',
      'clsx',
      'class-variance-authority',
    ],
  },
  // Bundle analysis in development
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            generateStatsFile: true,
          })
        );
      }
      return config;
    },
  }),
  images: {
    domains: [
      'localhost',
      'images.unsplash.com',
      'via.placeholder.com',
      // Add Supabase storage domain when configured
      process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '').replace('.supabase.co', '.supabase.co') || '',
    ].filter(Boolean),
    formats: ['image/webp', 'image/avif'],
  },
  env: {
    CUSTOM_KEY: 'inherbisveritas',
    NEXT_PUBLIC_SITE_NAME: 'HerbisVeritas',
  },
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
      {
        source: '/robots.txt',
        destination: '/api/robots',
      },
    ]
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })
    return config
  },
}

module.exports = withNextIntl(nextConfig)
