import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: { optimizePackageImports: ["lucide-react"] },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.artic.edu" },
      { protocol: "https", hostname: "is*.mzstatic.com" },
    ],
  },
};

export default nextConfig;
