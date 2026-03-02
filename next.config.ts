import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@coinbase/onchainkit'],
  experimental: {
    serverComponentsExternalPackages: ['viem', '@noble/hashes', '@coinbase/agentkit', '@noble/curves'],
  },
};

export default nextConfig;