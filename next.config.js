/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['uploadthing.com', 'utfs.io'], // Allow Uploadthing domains for images
  },
  async headers() {
    return [] // Temporarily remove all custom headers
  },
}

module.exports = nextConfig 