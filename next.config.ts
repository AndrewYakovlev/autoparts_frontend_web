import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
        }/api/v1/:path*`,
      },
    ]
  },
}

export default nextConfig
