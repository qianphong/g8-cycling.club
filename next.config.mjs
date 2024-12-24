/** @type {import('next').NextConfig} */
const nextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dgalywyr863hv.cloudfront.net',
        port: '',
        pathname: '/pictures/athletes/**',
      },
    ],
  },
  transpilePackages: ['three'],
}

export default nextConfig
