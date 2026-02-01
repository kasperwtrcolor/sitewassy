import '../index.css';

// Note: achievements prop is an array of achievement objects from Firebase (with id, name, icon, etc.)

export function ProfilePage({
    xUsername,
    userStats,
    isDelegated,
    onCheckPayments,
    onResetTutorial,
    onOpenLeaderboard,
    onBack,
    achievements = [] // Array of unlocked achievement OBJECTS from Firebase
}) {
    // Full achievements list for display
    const ACHIEVEMENTS = [
        { id: 'first_payment', name: 'First Blood', desc: 'Send your first payment', icon: '🎯' },
        { id: 'first_claim', name: 'Claim Master', desc: 'Claim your first payment', icon: '💎' },
        { id: 'authorized', name: 'Trusted', desc: 'Authorize the vault', icon: '🔐' },
        { id: 'big_spender', name: 'Big Spender', desc: 'Send over $100', icon: '💸' },
        { id: 'collector', name: 'Collector', desc: 'Claim over $100', icon: '🏆' },
        { id: 'whale', name: 'Whale', desc: 'Send over $1000', icon: '🐋' },
        { id: 'mega_whale', name: 'Mega Whale', desc: 'Send over $10,000', icon: '🐳' },
        { id: 'veteran', name: 'Veteran', desc: 'Complete 10 transactions', icon: '⭐' },
        { id: 'multi_sender', name: 'Generous', desc: 'Send to 5 different users', icon: '🎁' },
        { id: 'daily_login', name: 'Dedicated', desc: 'Log in today', icon: '📅' },
        { id: 'streak_7', name: 'Weekly Warrior', desc: '7-day login streak', icon: '🔥' },
        { id: 'streak_30', name: 'Monthly Master', desc: '30-day login streak', icon: '💫' },
        { id: 'social_sharer', name: 'Influencer', desc: 'Share a payment on X', icon: '📣' },
        { id: 'early_adopter', name: 'Pioneer', desc: 'Join in first 1000 users', icon: '🚀' },
        { id: 'lottery_winner', name: 'Lucky', desc: 'Win the weekly lottery', icon: '🎰' }
    ];

    // Extract unlocked achievement IDs from achievement objects
    // Handle both object format {id: 'x'} and string format 'x'
    const unlockedIds = achievements.map(a => typeof a === 'object' ? a.id : a);

    // Calculate unlocked achievements based on stats + Firebase achievements
    const unlockedAchievements = [...unlockedIds];
    if ((userStats?.totalSent || 0) > 0 && !unlockedAchievements.includes('first_payment'))
        unlockedAchievements.push('first_payment');
    if ((userStats?.totalClaimed || 0) > 0 && !unlockedAchievements.includes('first_claim'))
        unlockedAchievements.push('first_claim');
    if (isDelegated && !unlockedAchievements.includes('authorized'))
        unlockedAchievements.push('authorized');
    if ((userStats?.totalSent || 0) >= 100 && !unlockedAchievements.includes('big_spender'))
        unlockedAchievements.push('big_spender');
    if ((userStats?.totalClaimed || 0) >= 100 && !unlockedAchievements.includes('collector'))
        unlockedAchievements.push('collector');
    if ((userStats?.totalSent || 0) >= 1000 && !unlockedAchievements.includes('whale'))
        unlockedAchievements.push('whale');
    if ((userStats?.totalSent || 0) >= 10000 && !unlockedAchievements.includes('mega_whale'))
        unlockedAchievements.push('mega_whale');




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
