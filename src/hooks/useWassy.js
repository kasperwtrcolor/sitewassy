import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useWallets, useSignAndSendTransaction, useExportWallet, useFundWallet, useSolanaFundingPlugin } from '@privy-io/react-auth/solana';
import { Connection, PublicKey, Transaction, ComputeBudgetProgram } from '@solana/web3.js';
import { createApproveInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, createAssociatedTokenAccountInstruction, createTransferInstruction } from '@solana/spl-token';
import { API, USDC_MINT, WASSY_MINT, SOLANA_RPC, VAULT_ADDRESS, ADMIN_USERNAMES } from '../constants';
import { useFirestore } from './useFirestore';

export function useWassy() {
    const { ready, authenticated, user, login, logout } = usePrivy();
    const { wallets, ready: walletsReady } = useWallets();
    const { signAndSendTransaction } = useSignAndSendTransaction();
    const { exportWallet } = useExportWallet();
    const { fundWallet } = useFundWallet();
    // Mount Solana funding plugin (required for Solana funding flows)
    useSolanaFundingPlugin();

    // Find embedded Solana wallet (created by Privy)
    const embeddedWallet = wallets?.find(w => w.walletClientType === 'privy');
    // Fall back to any available wallet for transactions
    const solanaWallet = embeddedWallet || wallets?.[0] || null;
    // Track if user has an embedded wallet (for export functionality)
    const hasEmbeddedWallet = !!embeddedWallet;

    // Get X username from Privy
    const xUsername = user?.twitter?.username || '';

    // Check if admin by X username (case-insensitive)
    const isAdmin = ADMIN_USERNAMES.includes(xUsername?.toLowerCase());

    // State
    const [walletBalance, setWalletBalance] = useState(0);
    const [wassyBalance, setWassyBalance] = useState(0);
    const [solBalance, setSolBalance] = useState(0); // SOL balance for gas fees
    const [isDelegated, setIsDelegated] = useState(false);
    const [delegationAmount, setDelegationAmount] = useState(1000);
    const [isWassyDelegated, setIsWassyDelegated] = useState(false);
    const [wassyDelegationAmount, setWassyDelegationAmount] = useState(1000000);
    const [payments, setPayments] = useState([]);
    const [pendingClaims, setPendingClaims] = useState([]);
    const [pendingOutgoing, setPendingOutgoing] = useState([]); // Payments user sent that aren't claimed yet
    const [allUsers, setAllUsers] = useState([]);
    const [lotteryParticipants, setLotteryParticipants] = useState([]);
    const [unclaimedPaymentsAdmin, setUnclaimedPaymentsAdmin] = useState([]);
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
        recordDailyLogin,
        recordShare,
        fetchLeaderboard,
        ACHIEVEMENTS,
        // Enhanced Lottery
        currentLottery,
        lotteryHistory,
        createLottery,
        activateLottery,
        fetchActiveLottery,
        fetchLotteryHistory,
        setLotteryPrize,
        drawLotteryWinner,
        claimLotteryPrize: firebaseClaimLotteryPrize,
        resetVaultCracker,
        endVaultCracker,
        fetchVaultHistory,
        burnVaultWassy,
        getVaultWassyBalance
    } = useFirestore(solanaWallet?.address, xUsername);


    // State for backend stats (from backend_users collection via API)
    const [backendStats, setBackendStats] = useState({ totalSent: 0, totalClaimed: 0, hasSent: false, profileImage: null });

    // Fetch backend stats from backend_users collection via the leaderboard API
    useEffect(() => {
        if (!xUsername) return;

        const fetchBackendStats = async () => {
            if (!xUsername) return;
            try {
                const response = await fetch(`${API}/api/user/stats/${xUsername}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.stats) {
                        setBackendStats({
                            totalSent: data.stats.total_sent || 0,
                            totalClaimed: data.stats.total_claimed || 0,
                            points: data.stats.points || 0,
                            hasSent: data.stats.has_sent || false,
                            ethosScore: data.stats.ethos_score || null,
                            profileImage: data.stats.profile_image_url || null
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
        hasSent: backendStats.hasSent || (userProfile?.stats?.totalSent > 0) || false,
        points: backendStats.points || userProfile?.stats?.points || 0,
        ethosScore: backendStats.ethosScore || null,
        profileImage: backendStats.profileImage || null
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

    // Log wallet info and admin status
    useEffect(() => {
        if (walletsReady && wallets?.length > 0) {
            console.log(`✅ Solana wallet ready: ${solanaWallet?.address?.slice(0, 8)}...`);
        } else if (walletsReady && authenticated) {
            console.log('⏳ Waiting for wallet...');
        }
        // Debug admin check
        if (xUsername) {
            console.log(`👤 X Username: ${xUsername}, isAdmin: ${isAdmin}`);
        }
    }, [wallets, walletsReady, solanaWallet, authenticated, xUsername, isAdmin]);

    // Record daily login when user authenticates
    useEffect(() => {
        if (authenticated && solanaWallet?.address && recordDailyLogin) {
            console.log('📅 Recording daily login...');
            recordDailyLogin();
        }
    }, [authenticated, solanaWallet?.address, recordDailyLogin]);


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

        // Fetch WASSY balance (Token-2022)
        try {
            const wassyMint = new PublicKey(WASSY_MINT);
            const ata = await getAssociatedTokenAddress(wassyMint, walletPubkey, false, TOKEN_2022_PROGRAM_ID);
            const tokenAccountInfo = await connection.getTokenAccountBalance(ata);
            const wassyBal = parseFloat(tokenAccountInfo.value.uiAmount || 0);
            setWassyBalance(wassyBal);
        } catch (err) {
            if (err.message?.includes('could not find account') ||
                err.name === 'TokenAccountNotFoundError') {
                setWassyBalance(0);
            } else {
                console.error('Error fetching WASSY balance:', err);
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
                    if (data.success) {
                        setIsDelegated(!!data.is_delegated);
                        setDelegationAmount(data.delegation_amount || 0);
                        setIsWassyDelegated(!!data.is_wassy_delegated);
                        setWassyDelegationAmount(data.wassy_delegation_amount || 0);
                        return data;
                    }
                    return { success: false };
                }
            } catch (e) {
                console.error("registerUser error:", e);
                return { success: false };
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

    // Fetch unclaimed payments for admin
    const fetchUnclaimedPaymentsAdmin = useCallback(async () => {
        if (!isAdmin) return;
        try {
            const response = await fetch(`${API}/api/admin/pending-claims`);
            if (response.ok) {
                const data = await response.json();
                setUnclaimedPaymentsAdmin(data.pendingClaims || []);
            }
        } catch (err) {
            console.error('Error fetching unclaimed payments admin:', err);
        }
    }, [isAdmin]);

    // Compute recently paid users from payment history
    const recentlyPaid = useMemo(() => {
        if (!payments || payments.length === 0 || !xUsername) return [];

        const mySentPayments = payments.filter(p =>
            p.sender_username?.toLowerCase() === xUsername.toLowerCase()
        );

        const recipientsMap = new Map();
        mySentPayments.forEach(p => {
            const handle = p.recipient_username?.toLowerCase();
            if (!handle) return;

            const timestamp = p.created_at?.toMillis ? p.created_at.toMillis() :
                p.created_at?.seconds ? p.created_at.seconds * 1000 :
                    new Date(p.created_at).getTime() || 0;

            if (!recipientsMap.has(handle)) {
                recipientsMap.set(handle, {
                    username: p.recipient_username,
                    lastPaidAt: timestamp,
                    ethosScore: p.recipient_ethos_score || null,
                    profileImage: p.recipient_profile_image || null,
                    count: 1
                });
            } else {
                const existing = recipientsMap.get(handle);
                existing.count += 1;
                // Update to latest profile info if available
                if (p.recipient_profile_image) existing.profileImage = p.recipient_profile_image;
                if (p.recipient_ethos_score) existing.ethosScore = p.recipient_ethos_score;
                if (timestamp > existing.lastPaidAt) {
                    existing.lastPaidAt = timestamp;
                }
            }
        });

        return Array.from(recipientsMap.values())
            .sort((a, b) => b.lastPaidAt - a.lastPaidAt);
    }, [payments, xUsername]);

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

    // Fetch dedicated lottery participants (all users with has_sent: true)
    const fetchLotteryParticipants = useCallback(async () => {
        try {
            const response = await fetch(`${API}/api/lottery/participants`);
            if (response.ok) {
                const data = await response.json();
                setLotteryParticipants(data.participants || []);
            }
        } catch (err) {
            console.error('Error fetching lottery participants:', err);
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

    // Authorize delegation (USDC)
    const authorizeDelegation = async (amount) => {
        return await handleAuthorization(amount, false);
    };

    // Authorize WASSY delegation
    const authorizeWassyDelegation = async (amount) => {
        return await handleAuthorization(amount, true);
    };

    const handleAuthorization = async (amount, isWassy = false) => {
        const tokenLabel = isWassy ? 'WASSY' : 'USDC';
        const mintAddress = isWassy ? WASSY_MINT : USDC_MINT;
        const programId = isWassy ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID;

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
            const mintPubkey = new PublicKey(mintAddress);

            const userATA = await getAssociatedTokenAddress(mintPubkey, walletPubkey, false, programId);
            const accountInfo = await connection.getAccountInfo(userATA);

            const transaction = new Transaction();
            transaction.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 50000 }));

            if (!accountInfo) {
                console.log(`Adding instruction to create ${tokenLabel} ATA...`);
                transaction.add(
                    createAssociatedTokenAccountInstruction(
                        walletPubkey,
                        userATA,
                        walletPubkey,
                        mintPubkey,
                        programId
                    )
                );
            }

            const amountLamports = Math.floor(amount * 1_000_000);
            transaction.add(createApproveInstruction(
                userATA,
                vaultPubkey,
                walletPubkey,
                amountLamports,
                [],
                programId
            ));

            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = walletPubkey;

            const result = await signAndSendTransaction({
                transaction: Uint8Array.from(transaction.serialize({
                    requireAllSignatures: false,
                    verifySignatures: false
                })),
                wallet: solanaWallet,
                chain: 'solana:mainnet',
                options: { sponsor: true }
            });

            const signature = result?.signature;

            await fetch(`${API}/api/authorize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    wallet: solanaWallet.address,
                    amount: amount,
                    signature: signature ? 'confirmed' : 'unknown',
                    is_wassy: isWassy
                })
            });

            if (isWassy) {
                setIsWassyDelegated(true);
                setWassyDelegationAmount(amount);
            } else {
                await updateFirebaseAuth(amount);
                setIsDelegated(true);
                setDelegationAmount(amount);
            }

            setSuccess(`✓ Authorized ${amount.toLocaleString()} ${tokenLabel}!`);
            await fetchBalance();
            return true;
        } catch (err) {
            const cleanMessage = err.message?.split('?api-key')[0] || 'Unknown error';
            setError(`Failed: ${cleanMessage}`);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Withdraw tokens (USDC or WASSY)
    const handleWithdraw = async (recipientAddress, amount, isWassy = false) => {
        const tokenLabel = isWassy ? 'WASSY' : 'USDC';
        const mintAddress = isWassy ? WASSY_MINT : USDC_MINT;
        const programId = isWassy ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID;

        if (!solanaWallet?.address || !recipientAddress) {
            setError('Missing wallet or recipient address');
            return false;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const connection = new Connection(SOLANA_RPC);
            const walletPubkey = new PublicKey(solanaWallet.address);
            const recipientPubkey = new PublicKey(recipientAddress);
            const mintPubkey = new PublicKey(mintAddress);

            const sourceATA = await getAssociatedTokenAddress(mintPubkey, walletPubkey, false, programId);
            const destinationATA = await getAssociatedTokenAddress(mintPubkey, recipientPubkey, false, programId);

            const transaction = new Transaction();
            transaction.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 50000 }));

            // Check if destination ATA exists
            const destAccountInfo = await connection.getAccountInfo(destinationATA);
            if (!destAccountInfo) {
                console.log(`Adding instruction to create ${tokenLabel} destination ATA...`);
                transaction.add(
                    createAssociatedTokenAccountInstruction(
                        walletPubkey,
                        destinationATA,
                        recipientPubkey,
                        mintPubkey,
                        programId
                    )
                );
            }

            const amountLamports = Math.floor(amount * 1_000_000);
            transaction.add(createTransferInstruction(
                sourceATA,
                destinationATA,
                walletPubkey,
                amountLamports,
                [],
                programId
            ));

            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = walletPubkey;

            const result = await signAndSendTransaction({
                transaction: Uint8Array.from(transaction.serialize({
                    requireAllSignatures: false,
                    verifySignatures: false
                })),
                wallet: solanaWallet,
                chain: 'solana:mainnet',
                options: { sponsor: true }
            });

            const signature = result?.signature;
            setSuccess(`✓ Successfully withdrew ${amount.toLocaleString()} ${tokenLabel}!`);
            console.log('Withdrawal signature:', signature);

            await fetchBalance();
            return true;
        } catch (err) {
            const cleanMessage = err.message?.split('?api-key')[0] || 'Unknown error';
            setError(`Withdrawal failed: ${cleanMessage}`);
            return false;
        } finally {
            setLoading(false);
        }
    };


    // Fund wallet via Privy modal (MoonPay, Google Pay, external wallet, etc.)
    const handleFundWallet = async () => {
        if (!solanaWallet?.address) {
            setError('No wallet found');
            return;
        }

        try {
            await fundWallet({
                address: solanaWallet.address,
                options: {
                    asset: 'USDC',
                }
            });
            // Refresh balance after funding
            await fetchBalance();
        } catch (err) {
            // Privy funding modal throws on any user dismissal (cancel, back button, etc.)
            // Only show real errors, suppress all user-initiated closures
            const msg = err?.message?.toLowerCase() || '';
            const isUserDismissal = msg.includes('cancel') || msg.includes('close') || msg.includes('dismiss') || msg.includes('exit') || msg.includes('user') || msg.includes('aborted');
            if (isUserDismissal || !msg) {
                console.log('Funding modal closed by user');
                return;
            }
            console.error('Fund wallet error:', err);
            setError('Failed to open funding options. Please try again.');
            setTimeout(() => setError(''), 5000);
        }
    };

    // Export/manage wallet with error handling for mobile
    const handleExportWallet = async () => {
        if (!exportWallet) {
            setError('Wallet management not available');
            return;
        }

        try {
            // Solana-specific export hook handles the target automatically
            await exportWallet();
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

    // Wrap lottery claim to refresh balance
    const claimLotteryPrize = useCallback(async (lotteryId) => {
        const result = await firebaseClaimLotteryPrize(lotteryId);
        if (result?.success) {
            console.log('🔄 Refreshing balance after lottery claim...');
            await fetchBalance();
        }
        return result;
    }, [firebaseClaimLotteryPrize, fetchBalance]);

    // Cancel a pending payment
    const handleCancelPayment = useCallback(async (tweetId) => {
        if (!tweetId || !solanaWallet?.address) return false;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API}/api/payments/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tweet_id: tweetId,
                    wallet: solanaWallet.address
                })
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.error || 'Failed to cancel payment');

            setSuccess('Payment cancelled successfully');

            // Refresh state
            if (xUsername) {
                fetchPayments(xUsername);
                fetchPendingClaims(xUsername);
            }

            return true;
        } catch (err) {
            console.error('Cancel payment error:', err);
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [solanaWallet, xUsername, fetchPayments, fetchPendingClaims]);

    // Data fetching effect
    useEffect(() => {
        if (!xUsername) return;

        fetchPayments();
        fetchPendingClaims();
        fetchAllUsers();
        fetchLotteryParticipants();

        const interval = setInterval(() => {
            fetchPayments();
            fetchPendingClaims();
            fetchAllUsers();
            fetchLotteryParticipants();
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
        wassyBalance,
        hasEmbeddedWallet,

        // User info
        xUsername,
        isAdmin,
        userStats,

        // Delegation
        isDelegated,
        delegationAmount,
        isWassyDelegated,
        wassyDelegationAmount,
        setDelegationAmount,
        authorizeDelegation,

        // Payments
        payments,
        recentlyPaid,
        pendingClaims,
        pendingOutgoing,
        unclaimedPaymentsAdmin,
        claimPayment,
        fetchPendingClaims,
        fetchUnclaimedPaymentsAdmin,

        // Admin
        allUsers,
        lotteryParticipants,

        // Actions
        handleFundWallet,
        handleExportWallet,
        fetchBalance,

        // Firebase data
        userProfile,
        leaderboard,
        fetchLeaderboard,
        achievements: userProfile?.achievements || [],
        ACHIEVEMENTS,
        recordDailyLogin,
        recordShare,

        // Enhanced Lottery
        currentLottery,
        lotteryHistory,
        createLottery,
        activateLottery,
        fetchActiveLottery,
        fetchLotteryHistory,
        setLotteryPrize,
        drawLotteryWinner,
        claimLotteryPrize,
        resetVaultCracker,
        endVaultCracker,
        fetchVaultHistory,
        authorizeWassyDelegation,
        burnVaultWassy,
        getVaultWassyBalance,
        handleWithdraw,
        handleCancelPayment,

        // UI state
        loading: loading || firebaseLoading,
        error,
        success,
        setError,
        setSuccess
    };


}
