import { useState, useEffect } from 'react';
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
import { StatsCard, HowToPayCard, Footer, PaymentTicker, ScanCountdown, TermsModal } from './components/Cards';
import { LeaderboardModal, AchievementsModal, AdminModal, StatsModal, HistoryModal, ShareSuccessModal } from './components/Modals';
import { TutorialOverlay, useTutorial } from './components/TutorialOverlay';
import { MobileNav } from './components/MobileNav';
import { ThemeToggle } from './components/ThemeToggle';
import { ProfilePage } from './components/ProfilePage';
import { AdminDashboard } from './components/AdminDashboard';

// Note: ACHIEVEMENTS is now provided by useWassy hook from useFirestore.js


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
    hasEmbeddedWallet,
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
    setSuccess,
    setError,
    ACHIEVEMENTS,
    recordDailyLogin,
    recordShare,
    userProfile,
    // Lottery
    currentLottery,
    setLotteryPrize: setLotteryPrizeApi,
    drawLotteryWinner
  } = useWassy();


  // Modal states
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [lastClaimedPayment, setLastClaimedPayment] = useState(null);

  // Animation states
  const [isClaiming, setIsClaiming] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Tutorial state
  const { showTutorial, completeTutorial, resetTutorial } = useTutorial();

  // Page navigation state
  const [currentPage, setCurrentPage] = useState('home');

  // Theme toggle
  const [theme, setTheme] = useState(() => localStorage.getItem('wassy-theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('wassy-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Auto-dismiss errors and success messages
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        if (success) setSuccess('');
        if (error) setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success, setSuccess, setError]);

  // Last scan timestamp removed - ScanCountdown now calculates dynamically

  // Calculate unlocked achievements (using Firebase field names)
  const unlockedAchievements = [];
  if ((userStats?.totalSent || 0) > 0) unlockedAchievements.push('first_payment');
  if ((userStats?.totalClaimed || 0) > 0) unlockedAchievements.push('first_claim');
  if (isDelegated) unlockedAchievements.push('authorized');
  if ((userStats?.totalSent || 0) > 100) unlockedAchievements.push('big_spender');
  if ((userStats?.totalClaimed || 0) > 100) unlockedAchievements.push('collector');

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
    setTimeout(() => setSuccess(''), 5000);
  };

  // Handle claim with loading overlay and confetti
  const handleClaim = async (claim) => {
    setIsClaiming(true);
    const result = await claimPayment(claim);
    setIsClaiming(false);

    if (result && result.success) {
      setLastClaimedPayment(claim);
      setShowShareModal(true);
      // Trigger confetti!
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  };

  // Generate confetti pieces
  const renderConfetti = () => {
    if (!showConfetti) return null;
    const pieces = [];
    for (let i = 0; i < 50; i++) {
      const style = {
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 0.5}s`,
        animationDuration: `${2 + Math.random() * 2}s`
      };
      pieces.push(<div key={i} className="confetti" style={style} />);
    }
    return <div className="confetti-container">{pieces}</div>;
  };

  // Loading state
  if (!ready || !walletsReady) {
    return <LoadingScreen theme={theme} onToggleTheme={toggleTheme} />;
  }

  // Login screen
  if (!authenticated) {
    return <LoginScreen onLogin={login} theme={theme} onToggleTheme={toggleTheme} />;
  }

  // Main dashboard
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      backgroundImage: 'radial-gradient(circle at 50% 50%, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
      padding: '20px',
      fontFamily: "'Space Grotesk', sans-serif",
      color: 'var(--text-primary)'
    }}>
      {/* Tutorial Overlay */}
      {showTutorial && <TutorialOverlay onComplete={completeTutorial} />}

      {/* Confetti Animation */}
      {renderConfetti()}

      {/* Claiming Overlay */}
      {isClaiming && (
        <div className="claiming-overlay">
          <div className="claiming-spinner"></div>
          <div style={{ color: '#fff', fontSize: '1.2rem' }}>Processing claim...</div>
          <div style={{ color: '#888', fontSize: '0.9rem', marginTop: '10px' }}>Submitting transaction to Solana</div>
        </div>
      )}

      {/* Theme Toggle */}
      <ThemeToggle theme={theme} onToggle={toggleTheme} />

      {/* Global Toast Notifications - visible on all pages */}
      {(error || success) && (
        <div className="toast-container" style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          zIndex: 9999
        }}>
          {error && (
            <div className="toast-notification error">
              <div className="message">⚠ ERROR</div>
              <div className="sub-message">{error}</div>
            </div>
          )}
          {success && (
            <div className="toast-notification success">
              <div className="message">✓ SUCCESS</div>
              <div className="sub-message">{success}</div>
            </div>
          )}
        </div>
      )}

      {/* Main Container */}
      <div className="dashboard-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 15px' }}>

        {/* Header - Simplified */}
        <div className="plate animate-fade-in dashboard-header" style={{
          padding: '15px 20px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative'
        }}>
          <div className="screw tl"></div>
          <div className="screw tr"></div>

          <div style={{
            fontFamily: "'Fredoka', sans-serif",
            fontWeight: 700,
            fontSize: '1.3rem',
            letterSpacing: '0.02em',
            color: 'var(--text-primary)'
          }}>
            Wassy Pay
          </div>

          {/* Desktop Navigation */}
          <div className="desktop-nav" style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setCurrentPage('home')}
              className={`btn ${currentPage === 'home' ? 'btn-primary' : ''}`}
              style={{ padding: '8px 14px', fontSize: '0.7rem' }}
            >
              🏠 HOME
            </button>
            <button
              onClick={() => setCurrentPage('profile')}
              className={`btn ${currentPage === 'profile' ? 'btn-primary' : ''}`}
              style={{ padding: '8px 14px', fontSize: '0.7rem' }}
            >
              👤 PROFILE
            </button>
            <button
              onClick={() => setShowLeaderboard(true)}
              className="btn"
              style={{ padding: '8px 14px', fontSize: '0.7rem' }}
            >
              🏆 LEADERS
            </button>
            {isAdmin && (
              <button
                onClick={() => setCurrentPage('admin')}
                className={`btn ${currentPage === 'admin' ? 'btn-primary' : ''}`}
                style={{ padding: '8px 14px', fontSize: '0.7rem', color: 'var(--accent-gold)' }}
              >
                👑 ADMIN
              </button>
            )}
          </div>


          <button
            onClick={logout}
            className="btn"
            style={{ padding: '8px 16px', fontSize: '0.75rem' }}
          >
            LOGOUT
          </button>
        </div>

        {/* Page Content */}
        {currentPage === 'home' ? (
          <>
            {/* Payment Ticker - scrolling recent users */}
            <PaymentTicker payments={payments} />

            {/* Countdown to next scan */}
            <div className="scan-countdown">
              <ScanCountdown />
            </div>

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

            {/* Pending Outgoing Payments (for senders) */}
            <PendingOutgoing
              payments={pendingOutgoing}
              isDelegated={isDelegated}
              walletBalance={walletBalance}
            />

            {/* Pending Claims (for recipients) */}
            <PendingClaims claims={pendingClaims} onClaim={handleClaim} loading={loading || isClaiming} />

            {/* How to Pay - minimal version */}
            <HowToPayCard />
          </>
        ) : currentPage === 'profile' ? (
          <ProfilePage
            xUsername={xUsername}
            userStats={userStats}
            isDelegated={isDelegated}
            achievements={userProfile?.achievements || []}
            onCheckPayments={handleCheckForPayments}
            onResetTutorial={() => {
              setCurrentPage('home');
              resetTutorial();
            }}
            onBack={() => setCurrentPage('home')}
          />
        ) : currentPage === 'admin' && isAdmin ? (
          <AdminDashboard
            users={allUsers}
            currentLottery={currentLottery}
            onSetLotteryPrize={setLotteryPrizeApi}
            onDrawLottery={async () => {
              const result = await drawLotteryWinner(allUsers);
              if (result.success) {
                setSuccess(`🎉 Winner: @${result.winner.username}!`);
              } else {
                setError(result.error || 'Failed to draw winner');
              }
            }}
            onClose={() => setCurrentPage('home')}
          />
        ) : null}



        {/* Footer */}
        <Footer onShowTerms={() => setShowTerms(true)} />

        {/* Modals */}
        {lastClaimedPayment && (
          <ShareSuccessModal
            show={showShareModal}
            onClose={() => setShowShareModal(false)}
            payment={lastClaimedPayment}
            xUsername={xUsername}
            theme={theme}
          />
        )}
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
        <StatsModal
          show={showStats}
          onClose={() => setShowStats(false)}
          userStats={userStats}
        />
        <HistoryModal
          show={showHistory}
          onClose={() => setShowHistory(false)}
          payments={payments}
          xUsername={xUsername}
        />
        <TermsModal
          show={showTerms}
          onClose={() => setShowTerms(false)}
        />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        activeItem={currentPage}
        isAdmin={isAdmin}
        onNavigate={(id) => {
          switch (id) {
            case 'home':
              setCurrentPage('home');
              setShowLeaderboard(false);
              break;
            case 'profile':
              setCurrentPage('profile');
              setShowLeaderboard(false);
              break;
            case 'leaders':
              setShowLeaderboard(true);
              break;
            case 'admin':
              if (isAdmin) {
                setCurrentPage('admin');
                setShowLeaderboard(false);
              }
              break;
          }
        }}
        accentColor={theme === 'light' ? '#a855f7' : '#31d7ff'}
      />


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
          logo: '/favicon.jpg',
          walletChainType: 'solana-only'
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
