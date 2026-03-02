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
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        '@coinbase/cdp-sdk',
        '@coinbase/agentkit',
        '@coinbase/agentkit-langchain',
        'jose',
      ];
    }
    return config;
  },
};

export default nextConfig;