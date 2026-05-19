/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@bs42/ui"],
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.blob.core.windows.net",
      },
    ],
  },
  // experimental: {
  //   serverActions: {
  //     bodySizeLimit: "5mb",
  //   },
  // },

  async headers() {
    return [
      {
        source: "/api/storage/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store",
          },
        ],
      },
    ]
  },
}

export default nextConfig
