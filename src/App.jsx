import { useState, useEffect } from 'react';
import { PrivyProvider, usePrivy, useWallets } from '@privy-io/react-auth';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { createApproveInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Wallet, Send, DollarSign, ExternalLink, CheckCircle, XCircle, Clock, LogOut } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || "https://wassy-pay-backend.onrender.com";
const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID;
const VAULT_ADDRESS = import.meta.env.VITE_VAULT_ADDRESS;
const USDC_MINT = import.meta.env.VITE_USDC_MINT || "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const SOLANA_RPC = import.meta.env.VITE_SOLANA_RPC || "https://rpc.dev.fun/699840f631c97306a0c4";

function WassyPayApp() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();

  // Get Solana wallet from Privy
  const solanaWallet = wallets.find(w => w.walletClientType === 'privy' && w.chainType === 'solana');

  // State
  const [walletBalance, setWalletBalance] = useState(0);
  const [isDelegated, setIsDelegated] = useState(false);
  const [delegationAmount, setDelegationAmount] = useState(1000);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
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
    const interval = setInterval(fetchBalance, 15000); // Refresh every 15s
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
    const interval = setInterval(fetchPayments, 30000); // Refresh every 30s
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
        setError('USDC token account not found. Please fund your wallet with USDC first.');
        setIsAuthorizing(false);
        return;
      }

      // Create approve instruction
      const amountLamports = Math.floor(delegationAmount * 1_000_000); // USDC has 6 decimals
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
      setSuccess(`✅ Successfully authorized ${delegationAmount} USDC delegation!`);

      // Store in localStorage
      localStorage.setItem(`delegation_${solanaWallet.address}`, JSON.stringify({
        amount: delegationAmount,
        timestamp: Date.now()
      }));

    } catch (err) {
      console.error('Authorization error:', err);
      setError(`Failed to authorize: ${err.message}`);
    } finally {
      setIsAuthorizing(false);
    }
  };

  // Loading state
  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Wassy Pay...</div>
      </div>
    );
  }

  // Login screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold text-white mb-4">💸 Wassy Pay</h1>
            <p className="text-2xl text-purple-200 mb-8">
              Pay anyone on X with USDC
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6">How It Works</h2>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 text-white font-bold">1</div>
                <div>
                  <p className="text-white font-semibold">Login with X</p>
                  <p className="text-purple-200 text-sm">Connect your X account via Privy</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 text-white font-bold">2</div>
                <div>
                  <p className="text-white font-semibold">Get Your Wallet</p>
                  <p className="text-purple-200 text-sm">Solana wallet auto-created for you</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 text-white font-bold">3</div>
                <div>
                  <p className="text-white font-semibold">Fund & Authorize</p>
                  <p className="text-purple-200 text-sm">Add USDC and authorize Wassy vault</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 text-white font-bold">4</div>
                <div>
                  <p className="text-white font-semibold">Post & Pay</p>
                  <p className="text-purple-200 text-sm">Tweet "@wassypay send 5 to @friend"</p>
                </div>
              </div>
            </div>

            <button
              onClick={login}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105"
            >
              🐦 Login with X
            </button>
          </div>

          <div className="text-center mt-8 text-purple-200">
            <p className="text-sm">Non-custodial • Powered by Privy • Built on Solana</p>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">💸 Wassy Pay</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-white">
              <p className="text-sm text-purple-200">Logged in as</p>
              <p className="font-semibold">@{xUsername}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wallet Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-2 mb-4">
                <Wallet className="w-6 h-6 text-purple-300" />
                <h2 className="text-xl font-bold text-white">Your Wallet</h2>
              </div>

              {solanaWallet ? (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-purple-200 mb-1">Balance</p>
                    <p className="text-3xl font-bold text-white">${walletBalance.toFixed(2)}</p>
                    <p className="text-sm text-purple-300">{walletBalance.toFixed(6)} USDC</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-purple-200 mb-1">Address</p>
                    <p className="text-xs text-white font-mono break-all">{solanaWallet.address}</p>
                  </div>

                  {/* Authorization Section */}
                  <div className="border-t border-white/20 pt-4 mt-4">
                    {isDelegated ? (
                      <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-300" />
                          <p className="text-green-300 font-semibold">Authorized</p>
                        </div>
                        <p className="text-sm text-green-200">
                          Wassy vault can move up to ${delegationAmount} USDC from your wallet
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-4">
                          <p className="text-yellow-300 text-sm">
                            ⚠️ You must authorize the Wassy vault before making payments
                          </p>
                        </div>

                        <div className="mb-4">
                          <label className="text-sm text-purple-200 mb-2 block">
                            Authorization Amount (USDC)
                          </label>
                          <input
                            type="number"
                            value={delegationAmount}
                            onChange={(e) => setDelegationAmount(parseFloat(e.target.value) || 0)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                            placeholder="1000"
                          />
                          <p className="text-xs text-purple-300 mt-1">
                            Maximum amount Wassy can move from your wallet
                          </p>
                        </div>

                        <button
                          onClick={handleAuthorizeDelegation}
                          disabled={isAuthorizing || walletBalance === 0}
                          className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-all"
                        >
                          {isAuthorizing ? '⏳ Authorizing...' : '🔐 Authorize Wassy Vault'}
                        </button>
                      </>
                    )}
                  </div>

                  {/* Fund Wallet Button */}
                  <a
                    href={`https://solscan.io/account/${solanaWallet.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-3 px-4 rounded-xl transition-all mt-4"
                  >
                    💰 Fund Wallet
                  </a>

                  {error && (
                    <div className="mt-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="mt-4 bg-green-500/20 border border-green-500/50 rounded-lg p-3">
                      <p className="text-green-300 text-sm">{success}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-purple-300">No wallet found</p>
              )}
            </div>

            {/* How to Pay */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mt-6">
              <h3 className="text-lg font-bold text-white mb-4">💬 How to Pay</h3>
              <div className="bg-white/5 rounded-lg p-4 mb-4">
                <p className="text-purple-200 text-sm mb-2">Post on X:</p>
                <code className="text-white text-sm">@wassypay send 5 to @friend</code>
              </div>
              <p className="text-purple-300 text-sm">
                Payments are processed every 5-10 minutes. Both sender and recipient must be registered on Wassy Pay.
              </p>
            </div>
          </div>

          {/* Payment History */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-2 mb-6">
                <Send className="w-6 h-6 text-purple-300" />
                <h2 className="text-xl font-bold text-white">Payment History</h2>
              </div>

              {payments.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
                  <p className="text-purple-300">No payments yet</p>
                  <p className="text-sm text-purple-400 mt-2">
                    Make your first payment by posting on X!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {payment.sender_username === xUsername ? (
                              <span className="text-red-400 font-semibold">→ Sent</span>
                            ) : (
                              <span className="text-green-400 font-semibold">← Received</span>
                            )}
                            <span className="text-white font-bold">${payment.amount}</span>
                          </div>
                          <p className="text-purple-200 text-sm">
                            {payment.sender_username === xUsername ? (
                              <>To: @{payment.recipient_username}</>
                            ) : (
                              <>From: @{payment.sender_username}</>
                            )}
                          </p>
                          <p className="text-purple-400 text-xs mt-1">
                            {new Date(payment.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {payment.status === 'completed' && (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          )}
                          {payment.status === 'pending' && (
                            <Clock className="w-5 h-5 text-yellow-400" />
                          )}
                          {payment.status === 'failed' && (
                            <XCircle className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                      </div>

                      {payment.tx_signature && (
                        <a
                          href={`https://solscan.io/tx/${payment.tx_signature}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-300 hover:text-purple-200 text-xs flex items-center gap-1 mt-2"
                        >
                          View transaction <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      {payment.tweet_url && (
                        <a
                          href={payment.tweet_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-300 hover:text-purple-200 text-xs flex items-center gap-1 mt-1"
                        >
                          View tweet <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      {payment.error_message && (
                        <p className="text-red-400 text-xs mt-2">Error: {payment.error_message}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Root App component with Privy Provider
export default function App() {
  if (!PRIVY_APP_ID) {
    return (
      <div className="min-h-screen bg-red-900 flex items-center justify-center p-4">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">⚠️ Configuration Error</h1>
          <p>VITE_PRIVY_APP_ID environment variable is not set.</p>
          <p className="text-sm mt-2">Please check your .env.local file.</p>
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
          theme: 'dark',
          accentColor: '#8B5CF6',
          logo: 'https://wassypay.fun/wassy-logo.png'
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false
        },
        supportedChains: [{
          id: 1399811149, // Solana mainnet
          name: 'Solana',
          network: 'mainnet',
          nativeCurrency: {
            name: 'SOL',
            symbol: 'SOL',
            decimals: 9
          },
          rpcUrls: {
            default: { http: [SOLANA_RPC] }
          }
        }]
      }}
    >
      <WassyPayApp />
    </PrivyProvider>
  );
}
