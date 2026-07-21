import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Required for the slim production/HML Docker image (standalone server).
  output: "standalone",
};

export default nextConfig;
