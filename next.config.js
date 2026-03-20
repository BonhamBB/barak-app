/** @type {import('next').NextConfig} */
// Barak-app - Vercel build config
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
}

module.exports = nextConfig
