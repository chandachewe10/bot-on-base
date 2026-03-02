import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@coinbase/onchainkit'],
  serverExternalPackages: [
    'viem',
    '@noble/hashes',
    '@noble/curves',
    '@coinbase/agentkit',
    '@coinbase/agentkit-langchain',
    '@coinbase/cdp-sdk',
    'jose',
  ],
  turbopack: {},
};

export default nextConfig;