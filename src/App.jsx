import { useState } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { createSolanaRpc, createSolanaRpcSubscriptions } from '@solana/kit';
import { PRIVY_APP_ID, SOLANA_RPC } from './constants';
import { useWassy } from './hooks/useWassy';
import './index.css';

// Components
import { LoginScreen, LoadingScreen } from './components/LoginScreen';
import { WalletCard } from './components/WalletCard';
import { PendingClaims } from './components/PendingClaims';
import { PendingOutgoing } from './components/PendingOutgoing';
import { PaymentHistory } from './components/PaymentHistory';
import { StatsCard, HowToPayCard, Footer } from './components/Cards';
import { LeaderboardModal, AchievementsModal, AdminModal } from './components/Modals';

// Achievements definitions
const ACHIEVEMENTS = [
  { id: 'first_payment', name: 'First Blood', desc: 'Send your first payment', icon: '🎯' },
  { id: 'first_claim', name: 'Claim Master', desc: 'Claim your first payment', icon: '💎' },
  { id: 'authorized', name: 'Trusted', desc: 'Authorize the vault', icon: '🔐' },
  { id: 'big_spender', name: 'Big Spender', desc: 'Send over $100', icon: '💸' },
  { id: 'collector', name: 'Collector', desc: 'Claim over $100', icon: '🏆' }
];

function WassyPayApp() {
  const {
    ready,
    authenticated,
    login,
    logout,
    solanaWallet,
    walletsReady,
    walletBalance,
    solBalance,
    xUsername,
    isAdmin,
    userStats,
    isDelegated,
    delegationAmount,
    setDelegationAmount,
    authorizeDelegation,
    payments,
    pendingClaims,
    pendingOutgoing,
    claimPayment,
    fetchPendingClaims,
    allUsers,
    handleFundWallet,
    handleExportWallet,
    loading,
    error,
    success,
    setSuccess
  } = useWassy();

  // Modal states
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  // Calculate unlocked achievements
  const unlockedAchievements = [];
  if (userStats.sent > 0) unlockedAchievements.push('first_payment');
  if (userStats.claimed > 0) unlockedAchievements.push('first_claim');
  if (isDelegated) unlockedAchievements.push('authorized');
  if (userStats.sent > 100) unlockedAchievements.push('big_spender');
  if (userStats.claimed > 100) unlockedAchievements.push('collector');

  // Handle authorization with loading state
  const handleAuthorize = async (amount) => {
    setIsAuthorizing(true);
    await authorizeDelegation(amount);
    setIsAuthorizing(false);
  };

  // Handle check for payments
  const handleCheckForPayments = async () => {
    await fetchPendingClaims();
    setSuccess(`Checked for payments! Found ${pendingClaims.length} pending claims.`);
    setTimeout(() => setSuccess(''), 3000);
  };

  // Loading state
  if (!ready || !walletsReady) {
    return <LoadingScreen />;
  }

  // Login screen
  if (!authenticated) {
    return <LoginScreen onLogin={login} />;
  }

  // Main dashboard
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0d0d0d',
      backgroundImage: 'radial-gradient(circle at 50% 50%, #1a1a1a 0%, #0d0d0d 100%)',
      padding: '20px',
      fontFamily: "'Space Grotesk', sans-serif"
    }}>
      {/* Main Container */}
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div className="plate animate-fade-in" style={{
          padding: '20px 30px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px',
          position: 'relative'
        }}>
          <div className="screw tl"></div>
          <div className="screw tr"></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              fontWeight: 700,
              fontSize: '1.2rem',
              letterSpacing: '-0.02em',
              background: 'linear-gradient(180deg, #fff 0%, #888 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              WASSY PAY
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div className="handle-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '6px' }}>
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
              </svg>
              @{xUsername}
            </div>
            <button
              onClick={logout}
              className="btn"
              style={{ padding: '8px 16px', fontSize: '0.75rem' }}
            >
              LOGOUT
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <button onClick={handleCheckForPayments} className="btn btn-primary">
            🔍 CHECK PAYMENTS
          </button>
          <button onClick={() => setShowLeaderboard(true)} className="btn">
            🏆 LEADERBOARD
          </button>
          <button onClick={() => setShowAchievements(true)} className="btn" style={{ position: 'relative' }}>
            ⭐ ACHIEVEMENTS
            {unlockedAchievements.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: '#d4af37',
                color: '#000',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '0.65rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700'
              }}>
                {unlockedAchievements.length}
              </span>
            )}
          </button>
          {isAdmin && (
            <button onClick={() => setShowAdminPanel(true)} className="btn btn-danger">
              👑 ADMIN
            </button>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="grid-2">
          {/* Left Column */}
          <div>
            {/* Wallet Card */}
            <WalletCard
              solanaWallet={solanaWallet}
              walletBalance={walletBalance}
              solBalance={solBalance}
              isDelegated={isDelegated}
              delegationAmount={delegationAmount}
              setDelegationAmount={setDelegationAmount}
              isAuthorizing={isAuthorizing}
              onAuthorize={handleAuthorize}
              onFundWallet={handleFundWallet}
              onExportWallet={solanaWallet ? handleExportWallet : null}
              error={error}
              success={success}
            />

            {/* How to Pay */}
            <HowToPayCard />
          </div>

          {/* Right Column */}
          <div>
            {/* Stats Card */}
            <StatsCard userStats={userStats} />

            {/* Pending Outgoing Payments (for senders) */}
            <PendingOutgoing
              payments={pendingOutgoing}
              isDelegated={isDelegated}
              walletBalance={walletBalance}
            />

            {/* Pending Claims (for recipients) */}
            <PendingClaims claims={pendingClaims} onClaim={claimPayment} loading={loading} />
          </div>
        </div>

        {/* Payment History - Full Width */}
        <PaymentHistory payments={payments} xUsername={xUsername} />

        {/* Footer */}
        <Footer />

        {/* Modals */}
        <LeaderboardModal
          show={showLeaderboard}
          onClose={() => setShowLeaderboard(false)}
          users={allUsers}
        />
        <AchievementsModal
          show={showAchievements}
          onClose={() => setShowAchievements(false)}
          achievements={ACHIEVEMENTS}
          unlockedIds={unlockedAchievements}
        />
        <AdminModal
          show={showAdminPanel}
          onClose={() => setShowAdminPanel(false)}
          users={allUsers}
        />
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
        background: '#0d0d0d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: "'Space Grotesk', sans-serif",
        color: '#ef4444'
      }}>
        <div className="plate" style={{ textAlign: 'center', maxWidth: '500px', padding: '40px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⚠️</div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>CONFIGURATION ERROR</h1>
          <p style={{ color: '#888' }}>VITE_PRIVY_APP_ID environment variable is not set.</p>
          <p className="mono" style={{ fontSize: '0.75rem', marginTop: '15px', color: '#666' }}>Check your .env.local file.</p>
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
          accentColor: '#31d7ff',
          logo: 'https://i.imgur.com/ZQXqN0L.png'
        },
        embeddedWallets: {
          solana: {
            createOnLogin: 'all-users'
          },
          ethereum: {
            createOnLogin: 'off'
          }
        },
        // Solana RPC configuration - REQUIRED for signAndSendTransaction
        solana: {
          rpcs: {
            'solana:mainnet': {
              rpc: createSolanaRpc(SOLANA_RPC),
              // WebSocket subscriptions (Helius supports WSS)
              rpcSubscriptions: createSolanaRpcSubscriptions(SOLANA_RPC.replace('https://', 'wss://'))
            }
          }
        }
      }}
    >
      <WassyPayApp />
    </PrivyProvider>
  );
}
