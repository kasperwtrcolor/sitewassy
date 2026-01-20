import { useState } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { PRIVY_APP_ID } from './constants';
import { useWassy } from './hooks/useWassy';

// Components
import { LoginScreen, LoadingScreen } from './components/LoginScreen';
import { WalletCard } from './components/WalletCard';
import { PendingClaims } from './components/PendingClaims';
import { PaymentHistory } from './components/PaymentHistory';
import { StatsCard, HowToPayCard, Footer } from './components/Cards';
import { LeaderboardModal, AchievementsModal, AdminModal } from './components/Modals';
import { buttonStyle, primaryButtonStyle, dangerButtonStyle } from './constants';

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
    xUsername,
    isAdmin,
    userStats,
    isDelegated,
    delegationAmount,
    setDelegationAmount,
    authorizeDelegation,
    payments,
    pendingClaims,
    claimPayment,
    fetchPendingClaims,
    allUsers,
    handleFundWallet,
    exportWallet,
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
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
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
              {solanaWallet && exportWallet && (
                <button
                  onClick={exportWallet}
                  style={{ ...buttonStyle, padding: '5px 10px', fontSize: '12px' }}
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
                  fontSize: '12px'
                }}
              >
                LOGOUT
              </button>
            </div>
          </div>
        </div>

        {/* Wallet Card */}
        <WalletCard
          solanaWallet={solanaWallet}
          walletBalance={walletBalance}
          isDelegated={isDelegated}
          delegationAmount={delegationAmount}
          setDelegationAmount={setDelegationAmount}
          isAuthorizing={isAuthorizing}
          onAuthorize={handleAuthorize}
          onFundWallet={handleFundWallet}
          onExportWallet={solanaWallet ? exportWallet : null}
          error={error}
          success={success}
        />

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button onClick={handleCheckForPayments} style={{ ...primaryButtonStyle, flex: 1, minWidth: '150px' }}>
            🔍 CHECK FOR PAYMENTS
          </button>
          <button onClick={() => setShowLeaderboard(true)} style={{ ...buttonStyle, flex: 1, minWidth: '150px' }}>
            🏆 LEADERBOARD
          </button>
          <button
            onClick={() => setShowAchievements(true)}
            style={{ ...buttonStyle, flex: 1, minWidth: '150px', position: 'relative' }}
          >
            ⭐ ACHIEVEMENTS
            {unlockedAchievements.length > 0 && (
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
                {unlockedAchievements.length}
              </span>
            )}
          </button>
          {isAdmin && (
            <button onClick={() => setShowAdminPanel(true)} style={{ ...dangerButtonStyle, flex: 1, minWidth: '150px' }}>
              👑 ADMIN
            </button>
          )}
        </div>

        {/* Stats Card */}
        <StatsCard userStats={userStats} />

        {/* Pending Claims */}
        <PendingClaims claims={pendingClaims} onClaim={claimPayment} loading={loading} />

        {/* How to Pay */}
        <HowToPayCard />

        {/* Payment History */}
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
        embeddedWallets: {
          solana: {
            createOnLogin: 'all-users'
          },
          ethereum: {
            createOnLogin: 'off'
          }
        }
      }}
    >
      <WassyPayApp />
    </PrivyProvider>
  );
}
