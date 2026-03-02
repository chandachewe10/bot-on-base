import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@coinbase/onchainkit'],
  experimental: {
    serverComponentsExternalPackages: [
      'viem',
      '@noble/hashes',
      '@noble/curves',
      '@coinbase/agentkit',
      '@coinbase/agentkit-langchain',
      '@coinbase/cdp-sdk',
      'jose',
    ],
  },
};

export default nextConfig;