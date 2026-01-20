import { useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useWallets } from '@privy-io/react-auth/solana';
import { useFundWallet } from '@privy-io/react-auth';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { createApproveInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { API, USDC_MINT, SOLANA_RPC, VAULT_ADDRESS, ADMIN_WALLET } from '../constants';

export function useWassy() {
    const { ready, authenticated, user, login, logout, exportWallet } = usePrivy();
    const { wallets, ready: walletsReady } = useWallets();
    const { fundWallet } = useFundWallet();

    // Get embedded Solana wallet from Privy
    const solanaWallet = wallets?.find(w => w.walletClientType === 'privy') || wallets?.[0] || null;

    // Get X username from Privy
    const xUsername = user?.twitter?.username || '';

    // Check if admin
    const isAdmin = solanaWallet?.address === ADMIN_WALLET;

    // State
    const [walletBalance, setWalletBalance] = useState(0);
    const [isDelegated, setIsDelegated] = useState(false);
    const [delegationAmount, setDelegationAmount] = useState(1000);
    const [payments, setPayments] = useState([]);
    const [pendingClaims, setPendingClaims] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [userStats, setUserStats] = useState({ deposited: 0, claimed: 0, sent: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Log wallet info
    useEffect(() => {
        if (walletsReady && wallets?.length > 0) {
            console.log(`✅ Solana wallet ready: ${solanaWallet?.address?.slice(0, 8)}...`);
        } else if (walletsReady && authenticated) {
            console.log('⏳ Waiting for wallet...');
        }
    }, [wallets, walletsReady, solanaWallet, authenticated]);

    // Fetch wallet balance
    const fetchBalance = useCallback(async () => {
        if (!solanaWallet?.address) return;

        try {
            const connection = new Connection(SOLANA_RPC);
            const walletPubkey = new PublicKey(solanaWallet.address);
            const ata = await getAssociatedTokenAddress(
                new PublicKey(USDC_MINT),
                walletPubkey
            );

            const balance = await connection.getTokenAccountBalance(ata);
            setWalletBalance(parseFloat(balance.value.uiAmount || 0));
        } catch (err) {
            console.error('Error fetching balance:', err);
            setWalletBalance(0);
        }
    }, [solanaWallet?.address]);

    // Fetch balance on wallet change
    useEffect(() => {
        if (!solanaWallet?.address) return;
        fetchBalance();
        const interval = setInterval(fetchBalance, 15000);
        return () => clearInterval(interval);
    }, [solanaWallet?.address, fetchBalance]);

    // Register user with backend on login
    useEffect(() => {
        if (!authenticated || !xUsername || !solanaWallet?.address) return;

        const registerUser = async () => {
            try {
                const response = await fetch(`${API}/api/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        x_username: xUsername,
                        x_user_id: user?.twitter?.subject || '',
                        wallet_address: solanaWallet.address
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    setIsDelegated(data.is_delegated || false);
                    setDelegationAmount(data.delegation_amount || 1000);
                }
            } catch (err) {
                console.error('Error registering user:', err);
            }
        };

        registerUser();
    }, [authenticated, xUsername, solanaWallet?.address, user?.twitter?.subject]);

    // Fetch pending claims
    const fetchPendingClaims = useCallback(async () => {
        if (!xUsername) return;

        try {
            const response = await fetch(`${API}/api/claims?handle=${xUsername}`);
            if (response.ok) {
                const data = await response.json();
                const unclaimedPayments = (data.claims || []).filter(claim =>
                    claim.status !== 'completed' && claim.claimed_by === null
                );
                setPendingClaims(unclaimedPayments);
            }
        } catch (err) {
            console.error('Error fetching pending claims:', err);
        }
    }, [xUsername]);

    // Fetch payments
    const fetchPayments = useCallback(async () => {
        if (!xUsername) return;

        try {
            const response = await fetch(`${API}/api/payments/${xUsername}`);
            if (response.ok) {
                const data = await response.json();
                setPayments(data.payments || []);

                // Calculate stats from actual data
                const stats = (data.payments || []).reduce((acc, p) => {
                    if (p.sender_username === xUsername.toLowerCase()) {
                        acc.sent += parseFloat(p.amount) || 0;
                    } else if (p.recipient_username === xUsername.toLowerCase()) {
                        acc.claimed += parseFloat(p.amount) || 0;
                    }
                    return acc;
                }, { deposited: 0, claimed: 0, sent: 0 });
                setUserStats(stats);
            }
        } catch (err) {
            console.error('Error fetching payments:', err);
        }
    }, [xUsername]);

    // Fetch all users (admin only)
    const fetchAllUsers = useCallback(async () => {
        if (!isAdmin) return;

        try {
            const response = await fetch(`${API}/api/admin/users`);
            if (response.ok) {
                const data = await response.json();
                setAllUsers(data.users || []);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    }, [isAdmin]);

    // Claim a payment
    const claimPayment = async (claim) => {
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (claim.status === 'completed' || claim.claimed_by) {
                setError('This payment has already been claimed!');
                await fetchPendingClaims();
                return false;
            }

            const response = await fetch(`${API}/api/claim`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tweet_id: claim.tweet_id,
                    wallet: solanaWallet.address,
                    username: xUsername
                })
            });

            if (response.ok) {
                setSuccess(`Successfully claimed $${claim.amount} from @${claim.sender}!`);
                await fetchPendingClaims();
                setTimeout(() => setSuccess(''), 5000);
                return true;
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to claim payment.');
                return false;
            }
        } catch (err) {
            console.error('Claim error:', err);
            setError(`Error claiming payment: ${err.message}`);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Authorize delegation
    const authorizeDelegation = async (amount) => {
        if (!solanaWallet?.address || !VAULT_ADDRESS) {
            setError('Wallet or vault address not configured');
            return false;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const connection = new Connection(SOLANA_RPC);
            const walletPubkey = new PublicKey(solanaWallet.address);
            const vaultPubkey = new PublicKey(VAULT_ADDRESS);
            const usdcMint = new PublicKey(USDC_MINT);

            const userATA = await getAssociatedTokenAddress(usdcMint, walletPubkey);
            const accountInfo = await connection.getAccountInfo(userATA);

            if (!accountInfo) {
                setError('Fund your wallet with USDC first.');
                return false;
            }

            const amountLamports = Math.floor(amount * 1_000_000);
            const approveIx = createApproveInstruction(
                userATA,
                vaultPubkey,
                walletPubkey,
                amountLamports,
                [],
                TOKEN_PROGRAM_ID
            );

            const transaction = new Transaction().add(approveIx);
            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = walletPubkey;

            const provider = await solanaWallet.getProvider();
            const signedTx = await provider.signAndSendTransaction(transaction);
            await connection.confirmTransaction(signedTx);

            await fetch(`${API}/api/authorize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    wallet: solanaWallet.address,
                    amount: amount,
                    signature: signedTx
                })
            });

            setIsDelegated(true);
            setDelegationAmount(amount);
            setSuccess(`Authorized ${amount} USDC!`);
            return true;

        } catch (err) {
            console.error('Authorization error:', err);
            setError(`Failed: ${err.message}`);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Fund wallet via Privy - with error handling to prevent crash
    const handleFundWallet = async () => {
        if (!solanaWallet?.address) {
            setError('No wallet found');
            return;
        }

        try {
            if (fundWallet) {
                await fundWallet(solanaWallet.address, { cluster: 'mainnet-beta' });
            } else {
                // Fallback: open Solscan to show wallet address
                window.open(`https://solscan.io/account/${solanaWallet.address}`, '_blank');
                setSuccess('Fund your wallet by sending USDC to the address shown');
            }
        } catch (err) {
            console.error('Fund wallet error:', err);
            // Don't crash - just show a helpful message
            window.open(`https://solscan.io/account/${solanaWallet.address}`, '_blank');
            setSuccess('Fund your wallet by sending USDC to the address shown');
        }
    };

    // Data fetching effect
    useEffect(() => {
        if (!xUsername) return;

        fetchPayments();
        fetchPendingClaims();
        fetchAllUsers();

        const interval = setInterval(() => {
            fetchPayments();
            fetchPendingClaims();
            fetchAllUsers();
        }, 30000);

        return () => clearInterval(interval);
    }, [xUsername, fetchPayments, fetchPendingClaims, fetchAllUsers]);

    return {
        // Auth state
        ready,
        authenticated,
        login,
        logout,

        // Wallet state
        solanaWallet,
        walletsReady,
        walletBalance,

        // User info
        xUsername,
        isAdmin,
        userStats,

        // Delegation
        isDelegated,
        delegationAmount,
        setDelegationAmount,
        authorizeDelegation,

        // Payments
        payments,
        pendingClaims,
        claimPayment,
        fetchPendingClaims,

        // Admin
        allUsers,

        // Actions
        handleFundWallet,
        exportWallet,

        // UI state
        loading,
        error,
        success,
        setError,
        setSuccess
    };
}
