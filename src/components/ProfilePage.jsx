import '../index.css';

// Achievements definitions (same as App.jsx)
const ACHIEVEMENTS = [
    { id: 'first_payment', name: 'First Blood', desc: 'Send your first payment', icon: '🎯' },
    { id: 'first_claim', name: 'Claim Master', desc: 'Claim your first payment', icon: '💎' },
    { id: 'authorized', name: 'Trusted', desc: 'Authorize the vault', icon: '🔐' },
    { id: 'big_spender', name: 'Big Spender', desc: 'Send over $100', icon: '💸' },
    { id: 'collector', name: 'Collector', desc: 'Claim over $100', icon: '🏆' }
];

export function ProfilePage({
    xUsername,
    userStats,
    isDelegated,
    onCheckPayments,
    onResetTutorial,
    onOpenLeaderboard,
    onBack
}) {
    // Calculate unlocked achievements
    const unlockedAchievements = [];
    if ((userStats?.totalSent || 0) > 0) unlockedAchievements.push('first_payment');
    if ((userStats?.totalClaimed || 0) > 0) unlockedAchievements.push('first_claim');
    if (isDelegated) unlockedAchievements.push('authorized');
    if ((userStats?.totalSent || 0) > 100) unlockedAchievements.push('big_spender');
    if ((userStats?.totalClaimed || 0) > 100) unlockedAchievements.push('collector');

    return (
        <div className="profile-page">
            {/* Profile Header */}
            <div className="plate animate-fade-in profile-header">
                <div className="screw tl"></div>
                <div className="screw tr"></div>

                <div className="profile-avatar">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                    </svg>
                </div>
                <h2 className="profile-username">@{xUsername}</h2>
                <div className="profile-points">
                    <span className="engraved">POINTS</span>
                    <span className="points-value">{userStats?.points?.toFixed(0) || 0}</span>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="plate animate-fade-in delay-1 profile-actions">
                <div className="screw tl"></div>
                <div className="screw tr"></div>

                <h3 className="engraved" style={{ marginBottom: '15px' }}>QUICK ACTIONS</h3>
                <div className="profile-action-grid">
                    <button onClick={onCheckPayments} className="btn btn-primary">
                        🔍 CHECK PAYMENTS
                    </button>
                    <button onClick={onResetTutorial} className="btn">
                        📚 RESTART TUTORIAL
                    </button>
                </div>
            </div>

            {/* Achievements */}
            <div className="plate animate-fade-in delay-2 profile-badges">
                <div className="screw tl"></div>
                <div className="screw tr"></div>

                <h3 className="engraved" style={{ marginBottom: '15px' }}>BADGES</h3>
                <div className="badges-grid">
                    {ACHIEVEMENTS.map(achievement => {
                        const isUnlocked = unlockedAchievements.includes(achievement.id);
                        return (
                            <div
                                key={achievement.id}
                                className={`badge-item ${isUnlocked ? 'unlocked' : 'locked'}`}
                                title={achievement.desc}
                            >
                                <span className="badge-icon">{achievement.icon}</span>
                                <span className="badge-name">{achievement.name}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Stats */}
            <div className="plate animate-fade-in delay-3 profile-stats">
                <div className="screw tl"></div>
                <div className="screw tr"></div>

                <h3 className="engraved" style={{ marginBottom: '15px' }}>STATS</h3>
                <div className="stats-grid">
                    <div className="stat-item">
                        <span className="stat-value">${(userStats?.totalDeposited || 0).toFixed(2)}</span>
                        <span className="stat-label">Deposited</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">${(userStats?.totalSent || 0).toFixed(2)}</span>
                        <span className="stat-label">Sent</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">${(userStats?.totalClaimed || 0).toFixed(2)}</span>
                        <span className="stat-label">Claimed</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
