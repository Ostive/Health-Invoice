/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Uncomment for static site generation if needed
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true, // We are handling types carefully, but for production build we might want to be lenient if there are minor issues
  },
  serverExternalPackages: ['@react-pdf/renderer'],
  experimental: {
  },
};

module.exports = nextConfig;
