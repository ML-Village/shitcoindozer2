"use client";

import { useState } from "react";
import { ConnectWalletClient, ConnectPublicClient } from "./client";
import { formatEther } from 'viem'

export default function WalletButton() {
  // State variables to store the wallet address and balance
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  // Function to handle the button click event
  async function handleClick() {
    try {
      // Instantiate a Wallet Client and a Public Client
      const walletClient = await ConnectWalletClient();
      const publicClient = ConnectPublicClient();

      // Retrieve the wallet address using the Wallet Client
      const [address] = await walletClient.requestAddresses();
      // const [address] = await walletClient.getAddresses();

      // Retrieve the balance of the address using the Public Client
      const balance = formatEther(await publicClient.getBalance({ address }));

      // Update the state variables with the retrieved address and balance
      setAddress(address);
      setBalance(balance);
    } catch (error) {
      // Error handling: Display an alert if the transaction fails
      alert(`Transaction failed: ${error}`);
    }
  }

  return (
    <>
      {/* Render the Connect Wallet button */}
      <button 
        className="px-8 py-2 rounded-md bg-[#a9afb5] 
        flex flex-row items-center justify-center 
        border border-[#1e2124] 
        hover:border hover:border-indigo-600 
        shadow-md shadow-indigo-500/10"
        onClick={handleClick}
      >
        {/* Display the MetaMask Fox image */}
        <img src="MetaMask_Fox.svg" alt="MetaMask Fox" width={25} height={25} />
        <h1 className="mx-auto">Connect Wallet</h1>
      </button>
       {/* Render the Status component with the address and balance */}
      <Status address={address} balance={balance ?? ""} />
    </>
  );
}

// Component to display the wallet status (connected or disconnected)
function Status({
  address,
  balance,
}: {
  address: string | null;
  balance: string;
}) {
  if (!address) {
    // If no address is provided, display "Disconnected" status
    return (
      <div className="flex items-center justify-end">
        <div className="border bg-red-600 border-red-600 rounded-full w-1.5 h-1.5 mr-2">
        </div>
        <div className="mr-2">Disconnected</div>
      </div>
    );
  }

  // If an address is provided, display the address and balance
  return (
    <div className="flex items-center w-full">
      <div className="border bg-green-500 border-green-500 rounded-full w-1.5 h-1.5 mr-2"></div>
      <div className="text-xs md:text-xs">{address} <br /> Balance: {balance}</div>
    </div>
  );
}