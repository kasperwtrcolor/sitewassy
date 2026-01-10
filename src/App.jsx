import { useState, useEffect } from 'react';
import { PrivyProvider, usePrivy, useWallets } from '@privy-io/react-auth';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { createApproveInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';

const API = import.meta.env.VITE_API_URL || "https://wassy-pay-backend.onrender.com";
const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID;
const VAULT_ADDRESS = import.meta.env.VITE_VAULT_ADDRESS;
const USDC_MINT = import.meta.env.VITE_USDC_MINT || "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const SOLANA_RPC = import.meta.env.VITE_SOLANA_RPC || "https://rpc.dev.fun/699840f631c97306a0c4";

function WassyPayApp() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();

  // Get Solana wallet from Privy - try multiple detection methods
  const solanaWallet = wallets?.find(w =>
    (w.walletClientType === 'privy' || w.connectorType === 'embedded') &&
    (w.chainType === 'solana' || w.address?.length > 32)
  ) || wallets?.find(w => w.address?.length > 32);

  // Debug: Log all wallets
  useEffect(() => {
    if (walletsReady && wallets.length > 0) {
      console.log('🔍 Available wallets:', wallets);
      console.log('🎯 Selected Solana wallet:', solanaWallet);
    }
  }, [wallets, walletsReady, solanaWallet]);

  // State
  const [walletBalance, setWalletBalance] = useState(0);
  const [isDelegated, setIsDelegated] = useState(false);
  const [delegationAmount, setDelegationAmount] = useState(1000);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  // Fetch payment history
  useEffect(() => {
    if (!xUsername) return;

    const fetchPayments = async () => {
      try {
        const response = await fetch(`${API}/api/payments/${xUsername}`);
        if (response.ok) {
          const data = await response.json();
          setPayments(data.payments || []);
        }
      } catch (err) {
        console.error('Error fetching payments:', err);
      }
    };

    fetchPayments();
    const interval = setInterval(fetchPayments, 30000);
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

    } catch (err) {
      console.error('Authorization error:', err);
      setError(`Failed: ${err.message}`);
    } finally {
      setIsAuthorizing(false);
    }
  };

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
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Work+Sans:wght@900&display=swap');
          `}
        </style>
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
          <h1 style={{
            fontFamily: "'Work Sans', sans-serif",
            fontSize: 'clamp(3rem, 10vw, 5rem)',
            textTransform: 'uppercase',
            lineHeight: '0.8',
            letterSpacing: '-4px',
            marginBottom: '40px',
            transform: 'rotate(-1deg)',
            color: '#1a1a1a'
          }}>
            WASSY<br />PAY<br />V2
          </h1>

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
              // ARTIFACT_01: Non-custodial payments via X. Post "@bot_wassy send $5 to @friend"
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
                transition: '0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#ff4500'}
              onMouseOut={(e) => e.target.style.background = '#1a1a1a'}
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
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Work+Sans:wght@900&display=swap');
        `}
      </style>

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
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', opacity: '0.6' }}>LOGGED IN AS</div>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>@{xUsername}</div>
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
                marginTop: '5px'
              }}
            >
              LOGOUT
            </button>
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
                      opacity: isAuthorizing || walletBalance === 0 ? 0.5 : 1
                    }}
                  >
                    {isAuthorizing ? '⏳ AUTHORIZING...' : '🔐 AUTHORIZE VAULT'}
                  </button>
                </>
              )}

              <a
                href={`https://solscan.io/account/${solanaWallet.address}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  background: 'transparent',
                  border: '1px solid #1a1a1a',
                  color: '#1a1a1a',
                  padding: '12px 20px',
                  fontFamily: "'Courier Prime', monospace",
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  marginTop: '15px',
                  textDecoration: 'none',
                  fontSize: '14px'
                }}
              >
                💰 FUND WALLET
              </a>

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
              <div style={{ fontSize: '12px' }}>
                Privy is setting up your embedded Solana wallet. This may take a few moments.
              </div>
              <div style={{ fontSize: '10px', marginTop: '10px', opacity: '0.6' }}>
                Debug: {wallets.length} wallet(s) detected
              </div>
            </div>
          )}
        </div>

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
            @bot_wassy send 5 to @friend
          </div>
          <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
            Payments processed every 10 minutes. Both sender and recipient must be registered.
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
          logo: 'https://wassypay.fun/wassy-logo.png'
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false
        },
        defaultChain: {
          id: 1399811149,
          name: 'Solana',
          network: 'mainnet-beta',
          nativeCurrency: {
            name: 'SOL',
            symbol: 'SOL',
            decimals: 9
          },
          rpcUrls: {
            default: { http: [SOLANA_RPC] },
            public: { http: [SOLANA_RPC] }
          }
        }
      }}
    >
      <WassyPayApp />
    </PrivyProvider>
  );
}
