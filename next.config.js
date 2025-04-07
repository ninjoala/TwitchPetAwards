/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['uploadthing.com', 'utfs.io'], // Allow Uploadthing domains for images
  },
}

module.exports = nextConfig 