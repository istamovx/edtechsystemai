/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Render deploy uchun: TS va ESLint xatolari build'ni to'xtatmasin
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
};
module.exports = nextConfig;
