import React from 'react';
import CoinDozerGame from './components/CoinDozerGame';
import { WagmiProvider } from 'wagmi';
import { config } from './config/walletconfig';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

const App: React.FC = () => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="w-full h-screen">
          <CoinDozerGame />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;