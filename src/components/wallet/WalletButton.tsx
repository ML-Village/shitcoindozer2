import React from 'react';
import { useAccount,useDisconnect,Connector, useConnect  } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { addressShortener } from '../../utils/addressShortener';

const WalletButton = () => {
    const { address, isConnected } = useAccount()
    const { connect } = useConnect()
    const { disconnect } = useDisconnect()
    return (
        <button
        className="px-4 py-2 rounded-md bg-[#a9afb5]/80 ml-auto mx-2
        flex flex-row items-center justify-center border border-[#1e2124] 
        hover:border hover:border-indigo-600 shadow-md shadow-indigo-500/10"
        
        onClick={() => isConnected ? disconnect() : connect({ connector: injected() })}
        >
            {isConnected ? 
                addressShortener(address) : 
            
            <span className="flex items-center justify-between space-x-2">
                <img src="MetaMask_Fox.svg" alt="MetaMask Fox" width={25} height={25} />
                <h1 className="mx-auto">Connect Wallet</h1>
            </span>
            
            }
        </button>
    )
}

export default WalletButton