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
 
}

export default nextConfig
