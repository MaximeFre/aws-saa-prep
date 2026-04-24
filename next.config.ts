import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  allowedDevOrigins: ["192.168.1.65", "192.168.1.77", "192.168.1.*"],
};

export default nextConfig;
