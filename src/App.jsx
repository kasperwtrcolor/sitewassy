import { useState, useEffect } from 'react';
import { PrivyProvider, usePrivy, useWallets, useFundWallet } from '@privy-io/react-auth';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { createApproveInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';

const API = import.meta.env.VITE_API_URL || "https://wassy-pay-backend.onrender.com";
const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID;
const VAULT_ADDRESS = import.meta.env.VITE_VAULT_ADDRESS;
const USDC_MINT = import.meta.env.VITE_USDC_MINT || "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const SOLANA_RPC = import.meta.env.VITE_SOLANA_RPC || "https://rpc.dev.fun/699840f631c97306a0c4";

function WassyPayApp() {
  const { ready, authenticated, user, login, logout, createWallet, exportWallet } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const { fundWallet } = useFundWallet();

  // Get Solana wallet from Privy - filter by chainType
  const solanaWallet = wallets?.find(w =>
    w.chainType === 'solana' ||
    (w.walletClientType === 'privy' && w.address && !w.address.startsWith('0x'))
  );

  // Debug: Log all wallets
  useEffect(() => {
    if (walletsReady && wallets.length > 0) {
      console.log('🔍 Available wallets:', wallets);
      console.log('🎯 Selected Solana wallet:', solanaWallet);
    }
  }, [wallets, walletsReady, solanaWallet]);

  // Auto-create Solana wallet if missing
  useEffect(() => {
    if (authenticated && walletsReady && !solanaWallet && createWallet) {
      console.log('🔧 No Solana wallet detected, attempting to create...');
      createWallet({ chainType: 'solana' })
        .then(() => console.log('✅ Solana wallet creation initiated'))
        .catch(err => console.error('❌ Failed to create Solana wallet:', err));
    }
  }, [authenticated, walletsReady, solanaWallet, createWallet]);

  // Admin wallet
  const ADMIN_WALLET = '6SxLVfFovSjR2LAFcJ5wfT6RFjc8GxsscRekGnLq8BMe';
  const isAdmin = solanaWallet?.address === ADMIN_WALLET;

  // State
  const [walletBalance, setWalletBalance] = useState(0);
  const [isDelegated, setIsDelegated] = useState(false);
  const [delegationAmount, setDelegationAmount] = useState(1000);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [pendingClaims, setPendingClaims] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [userStats, setUserStats] = useState({ deposited: 0, claimed: 0, sent: 0 });
  const [achievements, setAchievements] = useState([]);

  // Achievements definitions
  const ACHIEVEMENTS = [
    { id: 'first_payment', name: 'First Blood', desc: 'Send your first payment', icon: '🎯' },
    { id: 'first_claim', name: 'Claim Master', desc: 'Claim your first payment', icon: '💎' },
    { id: 'authorized', name: 'Trusted', desc: 'Authorize the vault', icon: '🔐' },
    { id: 'big_spender', name: 'Big Spender', desc: 'Send over $100', icon: '💸' },
    { id: 'collector', name: 'Collector', desc: 'Claim over $100', icon: '🏆' }
  ];

  // Get X username from Privy
  const xUsername = user?.twitter?.username || '';

  // Fetch wallet balance
  useEffect(() => {
    if (!solanaWallet?.address) return;

    const fetchBalance = async () => {
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
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 15000);
    return () => clearInterval(interval);
  }, [solanaWallet?.address]);

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
  }, [authenticated, xUsername, solanaWallet?.address]);

  // Fetch pending claims
  const fetchPendingClaims = async () => {
    if (!xUsername) return;

    try {
      const response = await fetch(`${API}/api/claims?handle=${xUsername}`);
      if (response.ok) {
        const data = await response.json();

        // Filter out already claimed payments
        const unclaimedPayments = (data.claims || []).filter(claim => {
          // Check if this claim has been completed
          return claim.status !== 'completed' && claim.claimed_by === null;
        });

        setPendingClaims(unclaimedPayments);
        console.log(`📥 Found ${unclaimedPayments.length} unclaimed payments for @${xUsername}`);
      }
    } catch (err) {
      console.error('Error fetching pending claims:', err);
    }
  };

  // Check for payments manually
  const handleCheckForPayments = async () => {
    setError('');
    setSuccess('');
    await fetchPendingClaims();
    setSuccess(`Checked for payments! Found ${pendingClaims.length} pending claims.`);
  };

  // Claim a payment
  const handleClaimPayment = async (claim) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Check if already claimed
      if (claim.status === 'completed' || claim.claimed_by) {
        setError('This payment has already been claimed!');
        setLoading(false);
        await fetchPendingClaims(); // Refresh the list
        return;
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
        const data = await response.json();
        setSuccess(`Successfully claimed $${claim.amount} from @${claim.sender}!`);

        // Refresh pending claims to remove this one
        await fetchPendingClaims();

        // Update achievements
        const newAchievements = [...achievements];
        if (!newAchievements.includes('first_claim')) {
          newAchievements.push('first_claim');
          setAchievements(newAchievements);
        }

        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(''), 5000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to claim payment. It may have already been claimed.');
      }
    } catch (err) {
      console.error('Claim error:', err);
      setError(`Error claiming payment: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch payment history and stats
  useEffect(() => {
    if (!xUsername) return;

    const fetchPayments = async () => {
      try {
        const response = await fetch(`${API}/api/payments/${xUsername}`);
        if (response.ok) {
          const data = await response.json();
          setPayments(data.payments || []);

          // Calculate stats
          const stats = (data.payments || []).reduce((acc, p) => {
            if (p.sender_username === xUsername) {
              acc.sent += parseFloat(p.amount) || 0;
            } else {
              acc.claimed += parseFloat(p.amount) || 0;
            }
            return acc;
          }, { deposited: delegationAmount, claimed: 0, sent: 0 });
          setUserStats(stats);

          // Update achievements
          const newAchievements = [...achievements];
          if (stats.sent > 0 && !newAchievements.includes('first_payment')) {
            newAchievements.push('first_payment');
          }
          if (stats.sent > 100 && !newAchievements.includes('big_spender')) {
            newAchievements.push('big_spender');
          }
          if (stats.claimed > 100 && !newAchievements.includes('collector')) {
            newAchievements.push('collector');
          }
          setAchievements(newAchievements);
        }
      } catch (err) {
        console.error('Error fetching payments:', err);
      }
    };

    fetchPayments();
    fetchPendingClaims();
    const interval = setInterval(() => {
      fetchPayments();
      fetchPendingClaims();
    }, 30000);
    return () => clearInterval(interval);
  }, [xUsername]);

  // Authorize delegation
  const handleAuthorizeDelegation = async () => {
    if (!solanaWallet?.address || !VAULT_ADDRESS) {
      setError('Wallet or vault address not configured');
      return;
    }

    setIsAuthorizing(true);
    setError('');
    setSuccess('');

    try {
      const connection = new Connection(SOLANA_RPC);
      const walletPubkey = new PublicKey(solanaWallet.address);
      const vaultPubkey = new PublicKey(VAULT_ADDRESS);
      const usdcMint = new PublicKey(USDC_MINT);

      // Get user's USDC token account
      const userATA = await getAssociatedTokenAddress(usdcMint, walletPubkey);

      // Check if token account exists
      const accountInfo = await connection.getAccountInfo(userATA);
      if (!accountInfo) {
        setError('Fund your wallet with USDC first.');
        setIsAuthorizing(false);
        return;
      }

      // Create approve instruction
      const amountLamports = Math.floor(delegationAmount * 1_000_000);
      const approveIx = createApproveInstruction(
        userATA,
        vaultPubkey,
        walletPubkey,
        amountLamports,
        [],
        TOKEN_PROGRAM_ID
      );

      // Create transaction
      const transaction = new Transaction().add(approveIx);
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = walletPubkey;

      // Sign and send via Privy
      const provider = await solanaWallet.getProvider();
      const signedTx = await provider.signAndSendTransaction(transaction);

      // Wait for confirmation
      await connection.confirmTransaction(signedTx);

      // Update backend
      await fetch(`${API}/api/authorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: solanaWallet.address,
          amount: delegationAmount,
          signature: signedTx
        })
      });

      setIsDelegated(true);
      setSuccess(`Authorized ${delegationAmount} USDC!`);

      // Update achievements
      const newAchievements = [...achievements];
      if (!newAchievements.includes('authorized')) {
        newAchievements.push('authorized');
        setAchievements(newAchievements);
      }

    } catch (err) {
      console.error('Authorization error:', err);
      setError(`Failed: ${err.message}`);
    } finally {
      setIsAuthorizing(false);
    }
  };

  // Fetch all users (admin only)
  useEffect(() => {
    if (!isAdmin) return;

    const fetchAllUsers = async () => {
      try {
        const response = await fetch(`${API}/api/admin/users`);
        if (response.ok) {
          const data = await response.json();
          setAllUsers(data.users || []);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    fetchAllUsers();
    const interval = setInterval(fetchAllUsers, 30000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  // Loading state
  if (!ready || !walletsReady) {
    return (
      <div style={{ minHeight: '100vh', background: '#e8e6e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Courier Prime', monospace" }}>
        <div style={{ fontSize: '20px', color: '#1a1a1a' }}>⏳ Loading...</div>
      </div>
    );
  }

  // Login screen
  if (!authenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#e8e6e1',
        backgroundImage: 'radial-gradient(#1a1a1a 0.5px, transparent 0.5px)',
        backgroundSize: '20px 20px',
        padding: '40px 20px',
        fontFamily: "'Courier Prime', monospace"
      }}>
        <div style={{
          maxWidth: '800px',
          margin: 'auto',
          position: 'relative',
          border: '2px solid #1a1a1a',
          padding: '40px',
          boxShadow: '15px 15px 0px #1a1a1a',
          background: '#e8e6e1'
        }}>
          {/* Tape mark */}
          <div style={{
            position: 'absolute',
            width: '100px',
            height: '30px',
            background: 'rgba(220, 210, 160, 0.4)',
            top: '-15px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderLeft: '2px solid rgba(0,0,0,0.1)',
            borderRight: '2px solid rgba(0,0,0,0.1)'
          }} />

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <img
              src="https://i.imgur.com/ZQXqN0L.png"
              alt="Wassy Pay"
              style={{ width: '100px', height: '100px', objectFit: 'contain', marginBottom: '20px' }}
            />
            <h1 style={{
              fontFamily: "'Work Sans', sans-serif",
              fontSize: 'clamp(3rem, 10vw, 5rem)',
              textTransform: 'uppercase',
              lineHeight: '0.8',
              letterSpacing: '-4px',
              transform: 'rotate(-1deg)',
              color: '#1a1a1a',
              margin: '0'
            }}>
              WASSY<br />PAY<br />V2
            </h1>
          </div>

          {/* Card 1 */}
          <div style={{
            background: 'white',
            border: '1px solid #1a1a1a',
            padding: '20px',
            marginTop: '20px',
            position: 'relative',
            transform: 'rotate(1.5deg)',
            boxShadow: '5px 5px 0px #ff4500'
          }}>
            <div style={{
              width: '100%',
              height: '200px',
              background: 'repeating-conic-gradient(#1a1a1a 0% 25%, transparent 0% 50%) 50% / 2px 2px',
              opacity: '0.2',
              marginBottom: '15px'
            }} />
            <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
              // ARTIFACT_01: Non-custodial payments via X. Post "@BOT_WASSY SEND @FRIEND $5"
              and the blockchain handles the rest. No banks. No intermediaries. Pure delegation.
            </p>
            <button
              onClick={login}
              style={{
                background: '#1a1a1a',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                fontFamily: "'Courier Prime', monospace",
                fontWeight: 'bold',
                cursor: 'pointer',
                textTransform: 'uppercase',
                fontSize: '14px',
                transition: 'all 0.1s'
              }}
              onMouseOver={(e) => e.target.style.background = '#ff4500'}
              onMouseOut={(e) => e.target.style.background = '#1a1a1a'}
              onMouseDown={(e) => e.target.style.transform = 'scale(0.97)'}
              onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              Login with X
            </button>
          </div>

          {/* Card 2 */}
          <div style={{
            background: 'white',
            border: '1px solid #1a1a1a',
            padding: '20px',
            marginTop: '20px',
            position: 'relative',
            transform: 'rotate(-1deg)',
            boxShadow: '5px 5px 0px #ff4500'
          }}>
            <p style={{ margin: '0', lineHeight: '1.6' }}>
              // ARTIFACT_02: Privy creates your Solana wallet. You authorize once.
              Payments execute automatically. The friction is removed, but the control remains yours.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard
  return (
    <div style={{
      minHeight: '100vh',
      background: '#e8e6e1',
      backgroundImage: 'radial-gradient(#1a1a1a 0.5px, transparent 0.5px)',
      backgroundSize: '20px 20px',
      padding: '20px',
      fontFamily: "'Courier Prime', monospace"
    }}>
      {/* Canvas */}
      <div style={{
        maxWidth: '1000px',
        margin: 'auto',
        border: '2px solid #1a1a1a',
        padding: '30px',
        boxShadow: '15px 15px 0px #1a1a1a',
        background: '#e8e6e1',
        position: 'relative'
      }}>
        {/* Tape mark */}
        <div style={{
          position: 'absolute',
          width: '100px',
          height: '30px',
          background: 'rgba(220, 210, 160, 0.4)',
          top: '-15px',
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: '2px solid rgba(0,0,0,0.1)',
          borderRight: '2px solid rgba(0,0,0,0.1)'
        }} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <img
              src="https://i.imgur.com/ZQXqN0L.png"
              alt="Wassy Pay"
              style={{ width: '60px', height: '60px', objectFit: 'contain' }}
            />
            <h1 style={{
              fontFamily: "'Work Sans', sans-serif",
              fontSize: 'clamp(2rem, 6vw, 3rem)',
              textTransform: 'uppercase',
              lineHeight: '0.8',
              letterSpacing: '-2px',
              margin: '0',
              color: '#1a1a1a'
            }}>
              WASSY<br />PAY
            </h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', opacity: '0.6' }}>LOGGED IN AS</div>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>@{xUsername}</div>
            <div style={{ display: 'flex', gap: '5px', marginTop: '5px', justifyContent: 'flex-end' }}>
              {solanaWallet && (
                <button
                  onClick={() => {
                    if (exportWallet) {
                      exportWallet();
                    }
                  }}
                  style={{
                    background: '#1a1a1a',
                    color: 'white',
                    border: '1px solid #1a1a1a',
                    padding: '5px 10px',
                    fontFamily: "'Courier Prime', monospace",
                    cursor: 'pointer',
                    fontSize: '12px',
                    transition: 'all 0.1s'
                  }}
                  onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
                  onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  👤 MANAGE WALLET
                </button>
              )}
              <button
                onClick={logout}
                style={{
                  background: 'transparent',
                  color: '#1a1a1a',
                  border: '1px solid #1a1a1a',
                  padding: '5px 10px',
                  fontFamily: "'Courier Prime', monospace",
                  cursor: 'pointer',
                  fontSize: '12px',
                  transition: 'all 0.1s'
                }}
                onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
                onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                LOGOUT
              </button>
            </div>
          </div>
        </div>

        {/* Wallet Card */}
        <div style={{
          background: 'white',
          border: '1px solid #1a1a1a',
          padding: '20px',
          marginBottom: '20px',
          transform: 'rotate(0.5deg)',
          boxShadow: '5px 5px 0px #ff4500'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '15px', fontSize: '14px', textTransform: 'uppercase' }}>
            // WALLET_STATUS
          </div>

          {solanaWallet ? (
            <>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', opacity: '0.6', marginBottom: '5px' }}>BALANCE</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: "'Work Sans', sans-serif" }}>
                  ${walletBalance.toFixed(2)}
                </div>
                <div style={{ fontSize: '12px', opacity: '0.6' }}>{walletBalance.toFixed(6)} USDC</div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', opacity: '0.6', marginBottom: '5px' }}>ADDRESS</div>
                <div style={{ fontSize: '10px', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                  {solanaWallet.address}
                </div>
              </div>

              {/* Authorization Section */}
              {isDelegated ? (
                <div style={{
                  background: '#d4edda',
                  border: '1px solid #28a745',
                  padding: '15px',
                  marginBottom: '15px'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>✓ AUTHORIZED</div>
                  <div style={{ fontSize: '12px' }}>
                    Vault can move up to ${delegationAmount} USDC
                  </div>
                </div>
              ) : (
                <>
                  <div style={{
                    background: '#fff3cd',
                    border: '1px solid #ffc107',
                    padding: '15px',
                    marginBottom: '15px'
                  }}>
                    <div style={{ fontSize: '12px' }}>
                      ⚠ Authorization required before making payments
                    </div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      AUTHORIZATION AMOUNT (USDC)
                    </label>
                    <input
                      type="number"
                      value={delegationAmount}
                      onChange={(e) => setDelegationAmount(parseFloat(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #1a1a1a',
                        fontFamily: "'Courier Prime', monospace",
                        fontSize: '14px'
                      }}
                      placeholder="1000"
                    />
                    <div style={{ fontSize: '10px', opacity: '0.6', marginTop: '5px' }}>
                      Maximum amount vault can move from your wallet
                    </div>
                  </div>

                  <button
                    onClick={handleAuthorizeDelegation}
                    disabled={isAuthorizing || walletBalance === 0}
                    style={{
                      background: '#1a1a1a',
                      color: 'white',
                      border: 'none',
                      padding: '12px 20px',
                      fontFamily: "'Courier Prime', monospace",
                      fontWeight: 'bold',
                      cursor: isAuthorizing || walletBalance === 0 ? 'not-allowed' : 'pointer',
                      textTransform: 'uppercase',
                      width: '100%',
                      fontSize: '14px',
                      opacity: isAuthorizing || walletBalance === 0 ? 0.5 : 1,
                      transition: 'all 0.1s'
                    }}
                    onMouseDown={(e) => !isAuthorizing && walletBalance > 0 && (e.target.style.transform = 'scale(0.98)')}
                    onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    {isAuthorizing ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          display: 'inline-block',
                          width: '12px',
                          height: '12px',
                          border: '2px solid white',
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'spin 0.6s linear infinite'
                        }}></span>
                        AUTHORIZING...
                      </span>
                    ) : '🔐 AUTHORIZE VAULT'}
                  </button>
                  <style>{`
                    @keyframes spin {
                      to { transform: rotate(360deg); }
                    }
                  `}</style>
                </>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button
                  onClick={() => {
                    if (solanaWallet) {
                      fundWallet(solanaWallet.address, { chain: 'solana' });
                    }
                  }}
                  style={{
                    flex: 1,
                    background: '#28a745',
                    border: 'none',
                    color: 'white',
                    padding: '12px 20px',
                    fontFamily: "'Courier Prime', monospace",
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.1s'
                  }}
                  onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
                  onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  💰 FUND WALLET
                </button>
                <a
                  href={`https://solscan.io/account/${solanaWallet.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                    border: '1px solid #1a1a1a',
                    color: '#1a1a1a',
                    padding: '12px 20px',
                    fontFamily: "'Courier Prime', monospace",
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    fontSize: '14px'
                  }}
                >
                  VIEW ON SOLSCAN
                </a>
              </div>

              {error && (
                <div style={{
                  background: '#f8d7da',
                  border: '1px solid #dc3545',
                  padding: '10px',
                  marginTop: '15px',
                  fontSize: '12px'
                }}>
                  {error}
                </div>
              )}

              {success && (
                <div style={{
                  background: '#d4edda',
                  border: '1px solid #28a745',
                  padding: '10px',
                  marginTop: '15px',
                  fontSize: '12px'
                }}>
                  {success}
                </div>
              )}
            </>
          ) : (
            <div style={{
              background: '#fff3cd',
              border: '1px solid #ffc107',
              padding: '15px'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>⏳ CREATING WALLET...</div>
              <div style={{ fontSize: '12px', marginBottom: '15px' }}>
                Privy is setting up your embedded Solana wallet. This may take a few moments.
              </div>
              <div style={{ fontSize: '10px', marginBottom: '15px', opacity: '0.6' }}>
                Debug: {wallets.length} wallet(s) detected
              </div>
              {createWallet && (
                <button
                  onClick={async () => {
                    try {
                      console.log('🔘 Manual Solana wallet creation triggered');
                      await createWallet({ chainType: 'solana' });
                      console.log('✅ Solana wallet creation successful');
                    } catch (err) {
                      console.error('❌ Manual Solana wallet creation failed:', err);
                      setError(`Failed to create wallet: ${err.message}`);
                    }
                  }}
                  style={{
                    background: '#1a1a1a',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    fontFamily: "'Courier Prime', monospace",
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    fontSize: '12px',
                    width: '100%',
                    transition: 'all 0.1s'
                  }}
                  onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
                  onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  🔧 CREATE WALLET MANUALLY
                </button>
              )}
            </div>
          )}
        </div>

        {/* Stats & Actions Row */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button
            onClick={handleCheckForPayments}
            style={{
              flex: 1,
              background: '#ff4500',
              color: 'white',
              border: '1px solid #1a1a1a',
              padding: '12px 20px',
              fontFamily: "'Courier Prime', monospace",
              fontWeight: 'bold',
              cursor: 'pointer',
              textTransform: 'uppercase',
              fontSize: '12px',
              minWidth: '150px',
              transition: 'all 0.1s'
            }}
            onMouseDown={(e) => e.target.style.transform = 'scale(0.97)'}
            onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            🔍 CHECK FOR PAYMENTS
          </button>
          <button
            onClick={() => setShowLeaderboard(true)}
            style={{
              flex: 1,
              background: '#1a1a1a',
              color: 'white',
              border: '1px solid #1a1a1a',
              padding: '12px 20px',
              fontFamily: "'Courier Prime', monospace",
              fontWeight: 'bold',
              cursor: 'pointer',
              textTransform: 'uppercase',
              fontSize: '12px',
              minWidth: '150px',
              transition: 'all 0.1s'
            }}
            onMouseDown={(e) => e.target.style.transform = 'scale(0.97)'}
            onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            🏆 LEADERBOARD
          </button>
          <button
            onClick={() => setShowAchievements(true)}
            style={{
              flex: 1,
              background: '#1a1a1a',
              color: 'white',
              border: '1px solid #1a1a1a',
              padding: '12px 20px',
              fontFamily: "'Courier Prime', monospace",
              fontWeight: 'bold',
              cursor: 'pointer',
              textTransform: 'uppercase',
              fontSize: '12px',
              minWidth: '150px',
              position: 'relative',
              transition: 'all 0.1s'
            }}
            onMouseDown={(e) => e.target.style.transform = 'scale(0.97)'}
            onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            ⭐ ACHIEVEMENTS
            {achievements.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: '#ff4500',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {achievements.length}
              </span>
            )}
          </button>
          {isAdmin && (
            <button
              onClick={() => setShowAdminPanel(true)}
              style={{
                flex: 1,
                background: '#dc3545',
                color: 'white',
                border: '1px solid #1a1a1a',
                padding: '12px 20px',
                fontFamily: "'Courier Prime', monospace",
                fontWeight: 'bold',
                cursor: 'pointer',
                textTransform: 'uppercase',
                fontSize: '12px',
                minWidth: '150px',
                transition: 'all 0.1s'
              }}
              onMouseDown={(e) => e.target.style.transform = 'scale(0.97)'}
              onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              👑 ADMIN
            </button>
          )}
        </div>

        {/* User Stats Card */}
        <div style={{
          background: 'white',
          border: '1px solid #1a1a1a',
          padding: '20px',
          marginBottom: '20px',
          transform: 'rotate(0.3deg)',
          boxShadow: '5px 5px 0px #ff4500'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '15px', fontSize: '14px', textTransform: 'uppercase' }}>
            // YOUR_STATS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px' }}>
            <div>
              <div style={{ fontSize: '10px', opacity: '0.6' }}>DEPOSITED</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: "'Work Sans', sans-serif" }}>
                ${userStats.deposited.toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10px', opacity: '0.6' }}>SENT</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: "'Work Sans', sans-serif", color: '#dc3545' }}>
                ${userStats.sent.toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10px', opacity: '0.6' }}>CLAIMED</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: "'Work Sans', sans-serif", color: '#28a745' }}>
                ${userStats.claimed.toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10px', opacity: '0.6' }}>POINTS</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: "'Work Sans', sans-serif", color: '#ff4500' }}>
                {(userStats.deposited + userStats.sent + userStats.claimed).toFixed(0)}
              </div>
            </div>
          </div>
        </div>

        {/* Pending Claims */}
        {pendingClaims.length > 0 && (
          <div style={{
            background: 'white',
            border: '2px solid #ff4500',
            padding: '20px',
            marginBottom: '20px',
            transform: 'rotate(-0.3deg)',
            boxShadow: '8px 8px 0px #ff4500'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '15px', fontSize: '14px', textTransform: 'uppercase', color: '#ff4500' }}>
              💸 PENDING CLAIMS ({pendingClaims.length})
            </div>
            {pendingClaims.map((claim) => (
              <div key={claim.tweet_id} style={{
                background: '#fff3cd',
                border: '1px solid #ffc107',
                padding: '15px',
                marginBottom: '10px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: '5px' }}>
                      ${claim.amount}
                    </div>
                    <div style={{ fontSize: '12px', opacity: '0.7' }}>
                      From: @{claim.sender}
                    </div>
                  </div>
                  <button
                    onClick={() => handleClaimPayment(claim)}
                    disabled={loading}
                    style={{
                      background: loading ? '#6c757d' : '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      fontFamily: "'Courier Prime', monospace",
                      fontWeight: 'bold',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      textTransform: 'uppercase',
                      fontSize: '12px',
                      transition: 'all 0.1s',
                      opacity: loading ? 0.7 : 1
                    }}
                    onMouseDown={(e) => !loading && (e.target.style.transform = 'scale(0.95)')}
                    onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    {loading ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          display: 'inline-block',
                          width: '10px',
                          height: '10px',
                          border: '2px solid white',
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'spin 0.6s linear infinite'
                        }}></span>
                        CLAIMING...
                      </span>
                    ) : '💰 CLAIM'}
                  </button>
                </div>
                {claim.tweet_id && (
                  <a
                    href={`https://twitter.com/i/status/${claim.tweet_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '10px',
                      color: '#1a1a1a',
                      textDecoration: 'underline'
                    }}
                  >
                    View tweet →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* How to Pay */}
        <div style={{
          background: 'white',
          border: '1px solid #1a1a1a',
          padding: '20px',
          marginBottom: '20px',
          transform: 'rotate(-0.5deg)',
          boxShadow: '5px 5px 0px #ff4500'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '15px', fontSize: '14px', textTransform: 'uppercase' }}>
            // HOW_TO_PAY
          </div>
          <div style={{
            background: '#f5f5f5',
            padding: '15px',
            border: '1px solid #1a1a1a',
            marginBottom: '15px',
            fontFamily: 'monospace'
          }}>
            @BOT_WASSY SEND @FRIEND $5
          </div>
          <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
            Post on X: "@BOT_WASSY SEND @USERNAME $AMOUNT" - Payments processed every 10 minutes.
          </div>
        </div>

        {/* Payment History */}
        <div style={{
          background: 'white',
          border: '1px solid #1a1a1a',
          padding: '20px',
          transform: 'rotate(0.5deg)',
          boxShadow: '5px 5px 0px #ff4500'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '15px', fontSize: '14px', textTransform: 'uppercase' }}>
            // PAYMENT_HISTORY
          </div>

          {payments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', opacity: '0.5' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>$</div>
              <div>No payments yet</div>
              <div style={{ fontSize: '12px', marginTop: '5px' }}>
                Make your first payment by posting on X
              </div>
            </div>
          ) : (
            <div>
              {payments.map((payment, idx) => (
                <div
                  key={payment.id}
                  style={{
                    background: '#f5f5f5',
                    border: '1px solid #1a1a1a',
                    padding: '15px',
                    marginBottom: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                        {payment.sender_username === xUsername ? (
                          <span style={{ color: '#dc3545' }}>→ SENT</span>
                        ) : (
                          <span style={{ color: '#28a745' }}>← RECEIVED</span>
                        )}
                        <span style={{ marginLeft: '10px' }}>${payment.amount}</span>
                      </div>
                      <div style={{ fontSize: '12px', opacity: '0.7' }}>
                        {payment.sender_username === xUsername ? (
                          <>To: @{payment.recipient_username}</>
                        ) : (
                          <>From: @{payment.sender_username}</>
                        )}
                      </div>
                      <div style={{ fontSize: '10px', opacity: '0.5', marginTop: '5px' }}>
                        {new Date(payment.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      {payment.status === 'completed' && <span style={{ color: '#28a745' }}>✓</span>}
                      {payment.status === 'pending' && <span style={{ color: '#ffc107' }}>⏳</span>}
                      {payment.status === 'failed' && <span style={{ color: '#dc3545' }}>✗</span>}
                    </div>
                  </div>

                  {payment.tx_signature && (
                    <a
                      href={`https://solscan.io/tx/${payment.tx_signature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '10px',
                        color: '#1a1a1a',
                        textDecoration: 'underline',
                        display: 'block',
                        marginTop: '5px'
                      }}
                    >
                      View transaction →
                    </a>
                  )}

                  {payment.tweet_url && (
                    <a
                      href={payment.tweet_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '10px',
                        color: '#1a1a1a',
                        textDecoration: 'underline',
                        display: 'block',
                        marginTop: '5px'
                      }}
                    >
                      View tweet →
                    </a>
                  )}

                  {payment.error_message && (
                    <div style={{
                      fontSize: '10px',
                      color: '#dc3545',
                      marginTop: '10px',
                      padding: '5px',
                      background: '#f8d7da',
                      border: '1px solid #dc3545'
                    }}>
                      Error: {payment.error_message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          background: 'white',
          border: '1px solid #1a1a1a',
          padding: '20px',
          marginTop: '20px',
          textAlign: 'center',
          transform: 'rotate(-0.3deg)',
          boxShadow: '5px 5px 0px #ff4500'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '15px', fontSize: '14px', textTransform: 'uppercase' }}>
            // FOLLOW_US
          </div>
          <a
            href="https://twitter.com/bot_wassy"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#1a1a1a',
              color: 'white',
              padding: '10px 20px',
              textDecoration: 'none',
              fontFamily: "'Courier Prime', monospace",
              fontWeight: 'bold',
              fontSize: '14px',
              border: 'none',
              transition: 'all 0.1s'
            }}
            onMouseDown={(e) => e.target.style.transform = 'scale(0.97)'}
            onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            @BOT_WASSY
          </a>
          <div style={{ fontSize: '10px', opacity: '0.5', marginTop: '15px' }}>
            © 2026 Wassy Pay • Built on Solana
          </div>
        </div>

        {/* Leaderboard Modal */}
        {showLeaderboard && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000
          }} onClick={() => setShowLeaderboard(false)}>
            <div style={{
              background: '#e8e6e1',
              border: '2px solid #1a1a1a',
              padding: '30px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '15px 15px 0px #1a1a1a',
              fontFamily: "'Courier Prime', monospace"
            }} onClick={(e) => e.stopPropagation()}>
              <h2 style={{
                fontFamily: "'Work Sans', sans-serif",
                fontSize: '2rem',
                textTransform: 'uppercase',
                marginBottom: '20px',
                color: '#1a1a1a'
              }}>🏆 LEADERBOARD</h2>
              <p style={{ fontSize: '12px', marginBottom: '20px', opacity: '0.7' }}>
                Points = Deposited + Sent + Claimed
              </p>
              {allUsers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', opacity: '0.5' }}>
                  <div>No users yet</div>
                </div>
              ) : (
                <div>
                  {allUsers
                    .map((u) => ({
                      ...u,
                      points: (u.total_deposited || 0) + (u.total_sent || 0) + (u.total_claimed || 0)
                    }))
                    .sort((a, b) => b.points - a.points)
                    .map((u, idx) => (
                      <div key={u.wallet_address} style={{
                        background: idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : 'white',
                        border: '1px solid #1a1a1a',
                        padding: '15px',
                        marginBottom: '10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                            #{idx + 1} @{u.x_username}
                          </div>
                          <div style={{ fontSize: '10px', opacity: '0.7' }}>
                            Deposited: ${(u.total_deposited || 0).toFixed(2)} |
                            Sent: ${(u.total_sent || 0).toFixed(2)} |
                            Claimed: ${(u.total_claimed || 0).toFixed(2)}
                          </div>
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                          {u.points.toFixed(0)}
                        </div>
                      </div>
                    ))}
                </div>
              )}
              <button
                onClick={() => setShowLeaderboard(false)}
                style={{
                  background: '#1a1a1a',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  fontFamily: "'Courier Prime', monospace",
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  marginTop: '20px',
                  width: '100%'
                }}
              >
                CLOSE
              </button>
            </div>
          </div>
        )}

        {/* Achievements Modal */}
        {showAchievements && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000
          }} onClick={() => setShowAchievements(false)}>
            <div style={{
              background: '#e8e6e1',
              border: '2px solid #1a1a1a',
              padding: '30px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '15px 15px 0px #1a1a1a',
              fontFamily: "'Courier Prime', monospace"
            }} onClick={(e) => e.stopPropagation()}>
              <h2 style={{
                fontFamily: "'Work Sans', sans-serif",
                fontSize: '2rem',
                textTransform: 'uppercase',
                marginBottom: '20px',
                color: '#1a1a1a'
              }}>⭐ ACHIEVEMENTS</h2>
              <div style={{ display: 'grid', gap: '15px' }}>
                {ACHIEVEMENTS.map((ach) => {
                  const unlocked = achievements.includes(ach.id);
                  return (
                    <div key={ach.id} style={{
                      background: unlocked ? '#d4edda' : '#f5f5f5',
                      border: `2px solid ${unlocked ? '#28a745' : '#1a1a1a'}`,
                      padding: '15px',
                      opacity: unlocked ? 1 : 0.5
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ fontSize: '40px' }}>{ach.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                            {ach.name}
                          </div>
                          <div style={{ fontSize: '12px' }}>{ach.desc}</div>
                          {unlocked && (
                            <div style={{ fontSize: '10px', color: '#28a745', marginTop: '5px', fontWeight: 'bold' }}>
                              ✓ UNLOCKED
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => setShowAchievements(false)}
                style={{
                  background: '#1a1a1a',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  fontFamily: "'Courier Prime', monospace",
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  marginTop: '20px',
                  width: '100%'
                }}
              >
                CLOSE
              </button>
            </div>
          </div>
        )}

        {/* Admin Panel Modal */}
        {showAdminPanel && isAdmin && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000
          }} onClick={() => setShowAdminPanel(false)}>
            <div style={{
              background: '#e8e6e1',
              border: '2px solid #dc3545',
              padding: '30px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '15px 15px 0px #dc3545',
              fontFamily: "'Courier Prime', monospace"
            }} onClick={(e) => e.stopPropagation()}>
              <h2 style={{
                fontFamily: "'Work Sans', sans-serif",
                fontSize: '2rem',
                textTransform: 'uppercase',
                marginBottom: '20px',
                color: '#dc3545'
              }}>👑 ADMIN DASHBOARD</h2>
              {allUsers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', opacity: '0.5' }}>
                  <div>No users yet</div>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    border: '1px solid #1a1a1a',
                    borderCollapse: 'collapse',
                    fontSize: '12px',
                    background: 'white'
                  }}>
                    <thead>
                      <tr style={{ background: '#1a1a1a', color: 'white' }}>
                        <th style={{ border: '1px solid #1a1a1a', padding: '10px', textAlign: 'left' }}>USERNAME</th>
                        <th style={{ border: '1px solid #1a1a1a', padding: '10px', textAlign: 'left' }}>WALLET</th>
                        <th style={{ border: '1px solid #1a1a1a', padding: '10px', textAlign: 'right' }}>DEPOSITED</th>
                        <th style={{ border: '1px solid #1a1a1a', padding: '10px', textAlign: 'right' }}>SENT</th>
                        <th style={{ border: '1px solid #1a1a1a', padding: '10px', textAlign: 'right' }}>CLAIMED</th>
                        <th style={{ border: '1px solid #1a1a1a', padding: '10px', textAlign: 'right' }}>POINTS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.map((u) => (
                        <tr key={u.wallet_address} style={{ borderBottom: '1px solid #1a1a1a' }}>
                          <td style={{ border: '1px solid #1a1a1a', padding: '10px' }}>@{u.x_username}</td>
                          <td style={{ border: '1px solid #1a1a1a', padding: '10px', fontFamily: 'monospace', fontSize: '10px' }}>
                            {u.wallet_address?.substring(0, 4)}...{u.wallet_address?.substring(u.wallet_address.length - 4)}
                          </td>
                          <td style={{ border: '1px solid #1a1a1a', padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>
                            ${(u.total_deposited || 0).toFixed(2)}
                          </td>
                          <td style={{ border: '1px solid #1a1a1a', padding: '10px', textAlign: 'right', color: '#dc3545' }}>
                            ${(u.total_sent || 0).toFixed(2)}
                          </td>
                          <td style={{ border: '1px solid #1a1a1a', padding: '10px', textAlign: 'right', color: '#28a745' }}>
                            ${(u.total_claimed || 0).toFixed(2)}
                          </td>
                          <td style={{ border: '1px solid #1a1a1a', padding: '10px', textAlign: 'right', fontWeight: 'bold', fontSize: '14px' }}>
                            {((u.total_deposited || 0) + (u.total_sent || 0) + (u.total_claimed || 0)).toFixed(0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <button
                onClick={() => setShowAdminPanel(false)}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  fontFamily: "'Courier Prime', monospace",
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  marginTop: '20px',
                  width: '100%'
                }}
              >
                CLOSE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Root App component with Privy Provider
export default function App() {
  if (!PRIVY_APP_ID) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#dc3545',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: "'Courier Prime', monospace",
        color: 'white'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>⚠️ CONFIGURATION ERROR</h1>
          <p>VITE_PRIVY_APP_ID environment variable is not set.</p>
          <p style={{ fontSize: '12px', marginTop: '10px' }}>Check your .env.local file.</p>
        </div>
      </div>
    );
  }

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ['twitter'],
        appearance: {
          theme: 'light',
          accentColor: '#1a1a1a',
          logo: 'https://i.imgur.com/ZQXqN0L.png'
        },
        defaultChain: 'solana',
        supportedChains: ['solana'],
        embeddedWallets: {
          createOnLogin: 'all-users',
          requireUserPasswordOnCreate: false,
          noPromptOnSignature: true
        }
      }}
    >
      <WassyPayApp />
    </PrivyProvider>
  );
}
