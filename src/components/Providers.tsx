'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';
import { OnchainKitProvider } from '@coinbase/onchainkit';

const config = createConfig({
    chains: [base],
    connectors: [
        coinbaseWallet({
            appName: 'AgentKit Twitter Bot',
            preference: 'smartWalletOnly',
        }),
    ],
    transports: {
        [base.id]: http(),
    },
});

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <OnchainKitProvider
                    chain={base}
                    apiKey={process.env.NEXT_PUBLIC_CDP_API_KEY}
                >
                    {children}
                </OnchainKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
