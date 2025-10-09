/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true, // For static export if needed
  },
  publicRuntimeConfig: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://smarterdoc-backend-1094971678787.us-central1.run.app'
  }
}

module.exports = nextConfig