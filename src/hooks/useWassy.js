import { useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useWallets, useSignAndSendTransaction } from '@privy-io/react-auth/solana';
// Note: useFundWallet removed - causes crashes with Solana, using manual funding approach
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { createApproveInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { API, USDC_MINT, SOLANA_RPC, VAULT_ADDRESS, ADMIN_WALLET } from '../constants';
import { useFirestore } from './useFirestore';

export function useWassy() {
    const { ready, authenticated, user, login, logout, exportWallet } = usePrivy();
    const { wallets, ready: walletsReady } = useWallets();
    const { signAndSendTransaction } = useSignAndSendTransaction();
    // useFundWallet removed - causes crashes, using manual funding instead

    // Find embedded Solana wallet (created by Privy)
    const embeddedWallet = wallets?.find(w => w.walletClientType === 'privy');
    // Fall back to any available wallet for transactions
    const solanaWallet = embeddedWallet || wallets?.[0] || null;
    // Track if user has an embedded wallet (for export functionality)
    const hasEmbeddedWallet = !!embeddedWallet;

    // Get X username from Privy
    const xUsername = user?.twitter?.username || '';

    // Check if admin
    const isAdmin = solanaWallet?.address === ADMIN_WALLET;

    // State
    const [walletBalance, setWalletBalance] = useState(0);
    const [solBalance, setSolBalance] = useState(0); // SOL balance for gas fees
    const [isDelegated, setIsDelegated] = useState(false);
    const [delegationAmount, setDelegationAmount] = useState(1000);
    const [payments, setPayments] = useState([]);
    const [pendingClaims, setPendingClaims] = useState([]);
    const [pendingOutgoing, setPendingOutgoing] = useState([]); // Payments user sent that aren't claimed yet
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Firebase integration for real-time stats and achievements
    const {
        userProfile,
        leaderboard,
        loading: firebaseLoading,
        updateAuthorization: updateFirebaseAuth,
        recordClaim: recordFirebaseClaim,
        fetchLeaderboard,
        ACHIEVEMENTS
    } = useFirestore(solanaWallet?.address, xUsername);

    // State for backend stats (from backend_users collection via API)
    const [backendStats, setBackendStats] = useState({ totalSent: 0, totalClaimed: 0 });

    // Fetch backend stats from backend_users collection via the leaderboard API
    useEffect(() => {
        if (!xUsername) return;

        const fetchBackendStats = async () => {
            try {
                const response = await fetch(`${API}/api/leaderboard`);
                if (response.ok) {
                    const data = await response.json();
                    // Find this user's stats in the leaderboard data
                    const myStats = data.users?.find(u =>
                        u.x_username?.toLowerCase() === xUsername.toLowerCase()
                    );
                    if (myStats) {
                        setBackendStats({
                            totalSent: myStats.total_sent || 0,
                            totalClaimed: myStats.total_claimed || 0,
                            points: myStats.points || 0
                        });
                    }
                }
            } catch (err) {
                console.error('Failed to fetch backend stats:', err);
            }
        };

        fetchBackendStats();
        // Refresh every 2 minutes
        const interval = setInterval(fetchBackendStats, 120000);
        return () => clearInterval(interval);
    }, [xUsername]);

    // Derive stats - use backend stats for sent/claimed as they're more accurate
    const userStats = {
        totalDeposited: 0, // Not used anymore
        totalSent: backendStats.totalSent || userProfile?.stats?.totalSent || 0,
        totalClaimed: backendStats.totalClaimed || userProfile?.stats?.totalClaimed || 0,
        points: backendStats.points || userProfile?.stats?.points || 0
    };

    // Sync isDelegated from Firebase (real-time)
    useEffect(() => {
        if (userProfile?.authorization?.isDelegated !== undefined) {
            setIsDelegated(userProfile.authorization.isDelegated);
            if (userProfile.authorization.delegationAmount) {
                setDelegationAmount(userProfile.authorization.delegationAmount);
            }
        }
    }, [userProfile?.authorization]);

    // Log wallet info
    useEffect(() => {
        if (walletsReady && wallets?.length > 0) {
            console.log(`✅ Solana wallet ready: ${solanaWallet?.address?.slice(0, 8)}...`);
        } else if (walletsReady && authenticated) {
            console.log('⏳ Waiting for wallet...');
        }
    }, [wallets, walletsReady, solanaWallet, authenticated]);

    // Fetch wallet balances (USDC and SOL)
    const fetchBalance = useCallback(async () => {
        if (!solanaWallet?.address) return;

        const connection = new Connection(SOLANA_RPC, 'confirmed');
        const walletPubkey = new PublicKey(solanaWallet.address);

        // Fetch SOL balance for gas fees
        try {
            const solBalanceLamports = await connection.getBalance(walletPubkey);
            const solBal = solBalanceLamports / 1_000_000_000;
            console.log('SOL balance:', solBal);
            setSolBalance(solBal);
        } catch (err) {
            console.error('Error fetching SOL balance:', err);
            // Don't reset to 0, keep previous value
        }

        // Fetch USDC balance (separate try/catch so one failure doesn't affect the other)
        try {
            const usdcMint = new PublicKey(USDC_MINT);
            const ata = await getAssociatedTokenAddress(usdcMint, walletPubkey);

            console.log('Fetching USDC balance for ATA:', ata.toString());
            const tokenAccountInfo = await connection.getTokenAccountBalance(ata);
            const usdcBal = parseFloat(tokenAccountInfo.value.uiAmount || 0);
            console.log('USDC balance:', usdcBal);
            setWalletBalance(usdcBal);
        } catch (err) {
            // TokenAccountNotFoundError means no USDC in wallet
            if (err.message?.includes('could not find account') ||
                err.message?.includes('Invalid param') ||
                err.name === 'TokenAccountNotFoundError') {
                console.log('No USDC token account found - wallet has 0 USDC');
                setWalletBalance(0);
            } else {
                console.error('Error fetching USDC balance:', err);
                // Don't reset to 0 on network errors, keep previous value
            }
        }
    }, [solanaWallet?.address]);

    // Fetch balance on wallet change (no polling - refresh manually after transactions)
    useEffect(() => {
        if (!solanaWallet?.address) return;
        fetchBalance();
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
                const allPayments = data.payments || [];
                setPayments(allPayments);

                // Calculate pending outgoing payments (sent by user, not yet claimed)
                const outgoing = allPayments.filter(p =>
                    p.sender_username === xUsername.toLowerCase() &&
                    p.status === 'pending' &&
                    !p.claimed_by
                );
                setPendingOutgoing(outgoing);

                // Note: Stats now come from Firebase (userProfile.stats)
                // The backend still tracks payments for tweet scanning
            }
        } catch (err) {
            console.error('Error fetching payments:', err);
        }
    }, [xUsername]);

    // Fetch leaderboard users (public endpoint)
    const fetchAllUsers = useCallback(async () => {
        try {
            const response = await fetch(`${API}/api/leaderboard`);
            if (response.ok) {
                const data = await response.json();
                setAllUsers(data.users || []);
            }
        } catch (err) {
            console.error('Error fetching leaderboard:', err);
        }
    }, []);

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
                // Record claim in Firebase for stats and achievements
                await recordFirebaseClaim(claim.amount, claim.sender_username);

                setSuccess(`Successfully claimed $${claim.amount} from @${claim.sender_username || claim.sender}!`);
                await fetchPendingClaims();
                await fetchBalance(); // Refresh balance after claim
                setTimeout(() => setSuccess(''), 5000);
                return { success: true, amount: claim.amount, sender: claim.sender_username };
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

            // Privy v3: Use useSignAndSendTransaction hook with serialized transaction
            console.log('Sending authorization transaction...');
            const result = await signAndSendTransaction({
                transaction: transaction.serialize({ requireAllSignatures: false }),
                wallet: solanaWallet
            });

            console.log('Transaction result:', result);

            // Transaction was successful (Privy waits for confirmation)
            // The signature may be a Uint8Array or string - just log it for reference
            const signature = result?.signature;
            console.log('Transaction signature:', signature);

            // Call backend to record authorization
            await fetch(`${API}/api/authorize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    wallet: solanaWallet.address,
                    amount: amount,
                    signature: signature ? 'confirmed' : 'unknown'
                })
            });

            // Update Firebase for real-time stats
            await updateFirebaseAuth(amount);

            // Update UI state
            setIsDelegated(true);
            setDelegationAmount(amount);
            setSuccess(`✓ Authorized ${amount} USDC! You can now make payments.`);

            // Refresh balance to show updated state
            await fetchBalance();

            return true;

        } catch (err) {
            console.error('Authorization error:', err);
            setError(`Failed: ${err.message}`);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Fund wallet - just copy address to clipboard (no Solscan redirect)
    const handleFundWallet = async () => {
        if (!solanaWallet?.address) {
            setError('No wallet found');
            return;
        }

        try {
            await navigator.clipboard.writeText(solanaWallet.address);
            setSuccess('✓ Address copied! Send USDC to this address on Solana.');
            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            // Fallback for browsers that don't support clipboard
            setSuccess(`Send USDC to: ${solanaWallet.address.slice(0, 8)}...${solanaWallet.address.slice(-4)}`);
            setTimeout(() => setSuccess(''), 8000);
        }
    };

    // Export/manage wallet with error handling for mobile
    const handleExportWallet = async () => {
        if (!exportWallet) {
            setError('Wallet management not available');
            return;
        }

        try {
            await exportWallet({ address: solanaWallet.address });
        } catch (err) {
            console.error('Export wallet error:', err);
            // Handle specific error cases
            if (err.message?.includes('embedded wallet')) {
                setError('Wallet management requires an embedded Privy wallet. Please contact support if you believe this is an error.');
            } else if (err.message?.includes('not supported') || err.message?.includes('unavailable')) {
                setError('Wallet export is only available on desktop browsers. Use a desktop to export your private key.');
            } else {
                setError('Unable to open wallet manager. Please try again or use a desktop browser.');
            }
            setTimeout(() => setError(''), 5000);
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
        }, 120000); // Every 2 minutes (was 30s)

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
        solBalance,
        hasEmbeddedWallet,

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
        pendingOutgoing,
        claimPayment,
        fetchPendingClaims,

        // Admin
        allUsers,

        // Actions
        handleFundWallet,
        handleExportWallet,

        // Firebase data
        userProfile,
        leaderboard,
        fetchLeaderboard,
        achievements: userProfile?.achievements || [],
        ACHIEVEMENTS,

        // UI state
        loading: loading || firebaseLoading,
        error,
        success,
        setError,
        setSuccess
    };
}
