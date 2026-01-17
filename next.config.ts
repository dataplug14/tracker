import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.watchOptions = {
      ignored: ["**/tracker-desktop/**", "**/.git/**", "**/node_modules/**"],
    };
    return config;
  },
  turbopack: {},
};

export default nextConfig;
