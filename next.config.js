/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['uploadthing.com', 'utfs.io'], // Allow Uploadthing domains for images
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' http://twitch-pet-awards-ui-bc28h5-b1a268-5-161-68-100.traefik.me https://twitch-pet-awards-ui-bc28h5-b1a268-5-161-68-100.traefik.me;"
          }
        ],
      },
    ]
  },
}

module.exports = nextConfig 