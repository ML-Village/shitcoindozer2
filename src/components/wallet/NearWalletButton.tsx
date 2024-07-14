import React, {useState, useEffect, useContext} from 'react';
import { NearContext } from '../../NearContext';
import { setupModal } from '@near-wallet-selector/modal-ui';
import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupHereWallet } from '@near-wallet-selector/here-wallet';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';

const NearWalletButton = () => {
    const { signedAccountId, wallet } = useContext(NearContext);
    const [loggedIn, setLoggedIn] = useState(false);
    const [action, setAction] = useState(() => { });
    const [label, setLabel] = useState('NEAR AA');

    useEffect(() => {
        setLoggedIn(!!signedAccountId);
    }, [signedAccountId]);

    useEffect(() => {
        if (!wallet) return;
    
        if (signedAccountId) {
            setAction(() => wallet.signOut);
            setLabel(`Logout ${signedAccountId}`);
        } else {
            setAction(() => wallet.signIn);
            setLabel('NEAR AA');
        }
    }, [signedAccountId, wallet]);

    return (
        <button className={`h-full py-5 px-2
        border ${loggedIn? "border-green-600":"border-black"} rounded-lg bg-white/50
        flex items-center justify-center
        `}
        onClick={action} 
        >
            {label}
        </button>
    )
}

export default NearWalletButton