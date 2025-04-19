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
            value: "frame-ancestors 'self' http://*.traefik.me https://*.traefik.me http://localhost:* https://localhost:* https://*.twitch.tv https://*.twitch.tech https://*.twitchcdn.net;"
          }
        ],
      },
    ]
  },
}

module.exports = nextConfig 