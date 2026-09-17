import type { NextConfig } from "next";
import path from "path";

const rootDir = path.resolve(__dirname);

const nextConfig: NextConfig = {
  outputFileTracingRoot: rootDir,
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ["@prisma/client", "pg"],
};

export default nextConfig;

