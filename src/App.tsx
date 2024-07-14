import React from 'react';
import CoinDozerGame from './components/CoinDozerGame';
import { WagmiProvider } from 'wagmi';
import { config } from './config/walletconfig';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


//import { Wallet } from '@/wallets/near';
//import { NetworkId, HelloNearContract } from '@/config';
import { NearContext } from './NearContext';

const queryClient = new QueryClient()

//const wallet = new Wallet({ createAccessKeyFor: HelloNearContract, networkId: NetworkId });

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