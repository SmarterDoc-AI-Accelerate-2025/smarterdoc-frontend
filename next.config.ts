/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  publicRuntimeConfig: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://smarterdoc-backend-1094971678787.us-central1.run.app'
  }
}

module.exports = nextConfig