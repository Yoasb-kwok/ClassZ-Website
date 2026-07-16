/** @type {import('next').NextConfig} */
const backendOrigin = (
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_CLASSZ_API_URL?.replace(/\/api\/?$/, "") ||
  "http://localhost:3003"
).replace(/\/$/, "")

const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${backendOrigin}/uploads/:path*`,
      },
    ]
  },
}

export default nextConfig