import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  turbopack: {
    root: '/Users/muhyun/clawmarket',
  },
};

export default nextConfig;
