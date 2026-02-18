import { useState } from 'react';
import '../index.css';
import { EthosBadge } from './EthosBadge';

// Note: achievements prop is an array of achievement objects from Firebase (with id, name, icon, etc.)

export function ProfilePage({
    xUsername,
    userStats,
    isDelegated,
    onCheckPayments,
    onResetTutorial,
    onOpenLeaderboard,
    onBack,
    recentlyPaid = [],
    achievements = [] // Array of unlocked achievement OBJECTS from Firebase
}) {
    const [selectedRecipient, setSelectedRecipient] = useState(null);
    const [quickPayAmount, setQuickPayAmount] = useState('5');
    const [payeeSearch, setPayeeSearch] = useState('');

    // Filter payees based on search
    const filteredPayees = payeeSearch.trim()
        ? recentlyPaid.filter(p => p.username?.toLowerCase().includes(payeeSearch.toLowerCase()))
        : recentlyPaid.slice(0, 8); // Top 8 by default

    const handleQuickPay = () => {
        if (!selectedRecipient || !quickPayAmount) return;
        const text = `@bot_wassy send @${selectedRecipient} $${quickPayAmount}`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };
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
        <div className="profile-page reveal-element visible">
            {/* Profile Header */}
            <div className="glass-panel animate-fade-in" style={{ textAlign: 'center', marginBottom: '30px' }}>
                <div className="mono label-subtle" style={{ marginBottom: '20px' }}>// USER_IDENTITY</div>
                <div style={{
                    width: '80px',
                    height: '80px',
                    margin: '0 auto 20px',
                    background: 'var(--accent)',
                    borderRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#000',
                    fontSize: '2rem',
                    fontWeight: 900,
                    overflow: 'hidden',
                    border: '2px solid var(--border-medium)'
                }}>
                    {userStats?.profileImage ? (
                        <img
                            src={userStats.profileImage}
                            alt={xUsername}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerText = xUsername[0].toUpperCase(); }}
                        />
                    ) : (
                        xUsername ? xUsername[0].toUpperCase() : 'W'
                    )}
                </div>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '5px' }}>@{xUsername}</h2>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
                    {userStats?.ethosScore && (
                        <div title="Ethos Reputation Score">
                            <EthosBadge level={userStats.ethosScore} username={xUsername} style={{ padding: '4px 12px', fontSize: '0.75rem' }} />
                        </div>
                    )}
                    <div className="mono" style={{ padding: '6px 15px', borderRadius: '100px', background: 'var(--bg-inset)', fontSize: '0.8rem' }}>
                        <span className="text-muted">POINTS:</span> <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{userStats?.points?.toFixed(0) || 0}</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-panel animate-fade-in" style={{ marginBottom: '30px' }}>
                <div className="mono label-subtle" style={{ marginBottom: '20px' }}>// QUICK_ACTIONS</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <button onClick={onCheckPayments} className="btn btn-accent" style={{ borderRadius: '16px' }}>
                        CHECK_PAYMENTS
                    </button>
                    <button onClick={onResetTutorial} className="btn btn-primary mobile-fit-btn" style={{ borderRadius: '16px' }}>
                        TUTORIAL
                    </button>
                </div>
            </div>

            {/* Quick Pay / Recently Paid */}
            {recentlyPaid && recentlyPaid.length > 0 && (
                <div className="inset-panel" style={{ padding: '25px', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <div className="engraved" style={{ fontSize: '0.6rem' }}>
                            {payeeSearch ? 'SEARCH RESULTS' : 'QUICK PAY (RECENT)'}
                        </div>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search payees..."
                                value={payeeSearch}
                                onChange={(e) => setPayeeSearch(e.target.value)}
                                style={{
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: '8px',
                                    padding: '6px 12px',
                                    paddingLeft: '30px',
                                    fontSize: '0.75rem',
                                    color: 'var(--text-primary)',
                                    outline: 'none',
                                    width: '180px'
                                }}
                            />
                            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, fontSize: '0.8rem' }}>🔍</span>
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        gap: '15px',
                        overflowX: 'auto',
                        paddingBottom: '10px',
                        marginBottom: '20px',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                    }}>
                        {filteredPayees.map((recipient) => (
                            <button
                                key={recipient.username}
                                onClick={() => setSelectedRecipient(recipient.username)}
                                style={{
                                    flex: '0 0 auto',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px',
                                    background: selectedRecipient === recipient.username ? 'var(--bg-inset)' : 'transparent',
                                    border: selectedRecipient === recipient.username ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                                    borderRadius: '16px',
                                    width: '85px',
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '12px',
                                    background: 'var(--bg-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.2rem',
                                    border: '1px solid var(--border-medium)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    {recipient.profileImage ? (
                                        <img
                                            src={recipient.profileImage}
                                            alt={recipient.username}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerText = recipient.username[0].toUpperCase(); }}
                                        />
                                    ) : (
                                        (recipient.username && recipient.username[0]) ? recipient.username[0].toUpperCase() : 'U'
                                    )}
                                    <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', transform: 'scale(0.7)' }}>
                                        <EthosBadge level={recipient.ethosScore || recipient.ethos_score} username={recipient.username} />
                                    </div>
                                </div>
                                <div className="mono" style={{ fontSize: '0.6rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'center' }}>
                                    @{recipient.username}
                                </div>
                            </button>
                        ))}
                    </div>

                    {selectedRecipient && (
                        <div className="inset-panel animate-fade-in" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: '150px' }}>
                                    <div className="mono label-subtle" style={{ fontSize: '0.6rem', marginBottom: '8px' }}>PAYING: @{selectedRecipient}</div>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 700 }}>$</span>
                                        <input
                                            type="number"
                                            value={quickPayAmount}
                                            onChange={(e) => setQuickPayAmount(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '10px 10px 10px 25px',
                                                background: 'var(--bg-secondary)',
                                                border: '1px solid var(--border-medium)',
                                                borderRadius: '12px',
                                                color: 'var(--text-primary)',
                                                fontSize: '1rem',
                                                fontWeight: 700,
                                                outline: 'none'
                                            }}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleQuickPay}
                                    className="btn btn-accent"
                                    style={{ padding: '12px 25px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                                    </svg>
                                    SEND_USDC
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Achievements */}
            <div className="glass-panel animate-fade-in" style={{ marginBottom: '30px' }}>
                <div className="mono label-subtle" style={{ marginBottom: '20px' }}>// BADGES_UNLOCKED</div>
                <div className="badges-grid">
                    {ACHIEVEMENTS.map(achievement => {
                        const isUnlocked = unlockedAchievements.includes(achievement.id);
                        return (
                            <div
                                key={achievement.id}
                                className={`badge-item ${isUnlocked ? 'unlocked' : 'locked'}`}
                                title={achievement.desc}
                            >
                                <span style={{ fontSize: '2rem', marginBottom: '8px' }}>{achievement.icon}</span>
                                <span className="mono" style={{ fontSize: '0.65rem', fontWeight: 700, textAlign: 'center' }}>{achievement.name.toUpperCase()}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Stats */}
            <div className="glass-panel animate-fade-in" style={{ marginBottom: '30px' }}>
                <div className="mono label-subtle" style={{ marginBottom: '20px' }}>// PERFORMANCE_METRICS</div>
                <div className="stats-grid">
                    <div className="stat-item">
                        <div className="mono label-subtle" style={{ fontSize: '0.6rem', marginBottom: '10px' }}>TOTAL_SENT</div>
                        <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent)' }}>
                            ${(userStats?.totalSent || 0).toFixed(2)}
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="mono label-subtle" style={{ fontSize: '0.6rem', marginBottom: '10px' }}>TOTAL_CLAIMED</div>
                        <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--success)' }}>
                            ${(userStats?.totalClaimed || 0).toFixed(2)}
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="mono label-subtle" style={{ fontSize: '0.6rem', marginBottom: '10px' }}>VOLUME_REWARD</div>
                        <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>
                            {(userStats?.points || 0).toFixed(0)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
