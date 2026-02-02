import { useState, useEffect } from 'react';
import '../index.css';

export function LotteryPage({
    currentLottery,
    lotteryHistory = [],
    eligibleUsers = [],
    userWallet,
    xUsername,
    onClaim,
    onRefresh,
    onFetchHistory,
    isClaiming = false,
    onBack
}) {
    const [timeRemaining, setTimeRemaining] = useState('');
    const [activeTab, setActiveTab] = useState('current');

    // Refetch data on mount
    useEffect(() => {
        onRefresh?.();
        onFetchHistory?.();
    }, []);

    // Update countdown every second
    useEffect(() => {
        if (!currentLottery?.endTime) return;

        // Show winner info if completed
        if (currentLottery.status === 'completed' || currentLottery.status === 'claimed') {
            setTimeRemaining(currentLottery.winner ? `Winner: @${currentLottery.winner.username}` : 'Winner selected!');
            return;
        }

        if (currentLottery.status !== 'active') {
            setTimeRemaining('Draft');
            return;
        }

        const updateTimer = () => {
            const endTime = new Date(currentLottery.endTime);
            const now = new Date();
            const diff = endTime - now;

            if (diff <= 0) {
                setTimeRemaining('Draw pending...');
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (days > 0) {
                setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
            } else if (hours > 0) {
                setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
            } else {
                setTimeRemaining(`${minutes}m ${seconds}s`);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [currentLottery?.endTime, currentLottery?.status, currentLottery?.winner]);

    // Calculate user's entries
    const userStats = eligibleUsers.find(u => {
        const uWallet = (u.wallet_address || u.walletAddress || '').toLowerCase();
        const myWallet = (userWallet || '').toLowerCase();
        const walletMatch = uWallet && myWallet && uWallet === myWallet;

        const uName = (u.x_username || u.xUsername || '').toLowerCase().replace('@', '');
        const myName = (xUsername || '').toLowerCase().replace('@', '');
        const usernameMatch = uName && myName && uName === myName;

        return walletMatch || usernameMatch;
    });
    const userEntries = userStats
        ? Math.floor((userStats.total_sent || userStats.totalSent || 0) / 10) + 1
        : 0;

    // Total entries
    const totalEntries = eligibleUsers.reduce((sum, u) =>
        sum + Math.floor((u.total_sent || u.totalSent || 0) / 10) + 1, 0
    );

    // Is user the winner?
    const isWinner = (() => {
        if (!currentLottery?.winner) return false;

        const wWallet = (currentLottery.winner.walletAddress || '').toLowerCase();
        const myWallet = (userWallet || '').toLowerCase();
        const walletMatch = wWallet && myWallet && wWallet === myWallet;

        const wName = (currentLottery.winner.username || '').toLowerCase().replace('@', '');
        const myName = (xUsername || '').toLowerCase().replace('@', '');
        const usernameMatch = wName && myName && wName === myName;

        return walletMatch || usernameMatch;
    })();
    const canClaim = isWinner && currentLottery?.status === 'completed';

    // Share on X - Winner announcement
    const shareWinnerAnnouncement = () => {
        if (!currentLottery?.winner) return;
        const text = `🎉 @${currentLottery.winner.username} just won $${currentLottery.prizeAmount} USDC in the @WassyPay lottery! 🎰\n\nSend payments to earn entries for the next draw!\n\n#WassyPay #Solana #Crypto`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    };

    // Share on X - Winner's personal share
    const shareMyWinnings = () => {
        const text = `🏆 I just won $${currentLottery?.prizeAmount} USDC in the @WassyPay lottery! 🎰\n\n💰 Prize automatically transferred to my wallet!\n\nSend payments to earn entries for the next draw 👇\n\n#WassyPay #Solana #USDC`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className="lottery-page" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                marginBottom: '25px'
            }}>
                <button
                    onClick={onBack}
                    className="btn"
                    style={{ padding: '8px 12px', fontSize: '1rem' }}
                >
                    ← Back
                </button>
                <h1 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    fontFamily: "'Fredoka', sans-serif",
                    margin: 0
                }}>
                    🎰 Lottery
                </h1>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '20px',
                borderBottom: '2px solid var(--border-medium)',
                paddingBottom: '10px'
            }}>
                <button
                    onClick={() => setActiveTab('current')}
                    className={activeTab === 'current' ? 'btn btn-primary' : 'btn'}
                    style={{ flex: 1, padding: '12px' }}
                >
                    Current Lottery
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={activeTab === 'history' ? 'btn btn-primary' : 'btn'}
                    style={{ flex: 1, padding: '12px' }}
                >
                    History
                </button>
            </div>

            {/* Current Lottery Tab */}
            {activeTab === 'current' && currentLottery && (
                <div className="plate" style={{ padding: '0', overflow: 'hidden' }}>
                    <div className="screw tl"></div>
                    <div className="screw tr"></div>

                    {/* Header */}
                    <div style={{
                        background: currentLottery.winner
                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                            : currentLottery.status === 'active'
                                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                                : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                        padding: '25px',
                        color: 'white',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
                            {currentLottery.winner ? '🏆' : '🎰'}
                        </div>
                        <div style={{
                            fontSize: '2rem',
                            fontWeight: '800',
                            fontFamily: "'Fredoka', sans-serif"
                        }}>
                            ${currentLottery.prizeAmount} USDC
                        </div>
                        <div style={{
                            fontSize: '0.9rem',
                            opacity: 0.9,
                            marginTop: '8px'
                        }}>
                            {currentLottery.status === 'draft' && 'Draft - Not yet active'}
                            {currentLottery.status === 'active' && `Draw in: ${timeRemaining}`}
                            {currentLottery.status === 'completed' && `Winner: @${currentLottery.winner?.username}`}
                            {currentLottery.status === 'claimed' && `Claimed by @${currentLottery.winner?.username}`}
                        </div>
                    </div>

                    {/* Winner Actions */}
                    {currentLottery.winner && (
                        <div style={{
                            padding: '15px 20px',
                            borderBottom: '1px solid var(--border-medium)',
                            display: 'flex',
                            gap: '10px',
                            flexWrap: 'wrap'
                        }}>
                            <button
                                onClick={shareWinnerAnnouncement}
                                className="btn"
                                style={{ flex: 1, padding: '10px', minWidth: '140px' }}
                            >
                                🐦 Share Winner
                            </button>
                            {isWinner && (
                                <button
                                    onClick={shareMyWinnings}
                                    className="btn btn-gold"
                                    style={{ flex: 1, padding: '10px', minWidth: '140px' }}
                                >
                                    🎉 Share My Win
                                </button>
                            )}
                        </div>
                    )}

                    {/* Winner Claim Section */}
                    {canClaim && (
                        <div style={{
                            padding: '20px',
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)',
                            borderBottom: '1px solid var(--border-medium)'
                        }}>
                            <div style={{
                                textAlign: 'center',
                                marginBottom: '15px',
                                color: 'var(--text-primary)'
                            }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>🎉</div>
                                <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                                    Congratulations! You won!
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '5px' }}>
                                    Claim your ${currentLottery.prizeAmount} USDC prize
                                </div>
                            </div>
                            <button
                                onClick={onClaim}
                                disabled={isClaiming}
                                className="btn btn-gold"
                                style={{ width: '100%', padding: '15px', fontSize: '1rem' }}
                            >
                                {isClaiming ? '⏳ Processing...' : '💰 CLAIM PRIZE'}
                            </button>
                        </div>
                    )}

                    {/* Body */}
                    <div style={{ padding: '20px' }}>
                        {/* Your entries */}
                        {userWallet && !currentLottery.winner && currentLottery.status === 'active' && (
                            <div className="inset-panel" style={{
                                padding: '15px',
                                marginBottom: '20px',
                                textAlign: 'center'
                            }}>
                                <div className="engraved" style={{ fontSize: '0.65rem', marginBottom: '5px' }}>
                                    YOUR ENTRIES
                                </div>
                                <div style={{
                                    fontSize: '2.5rem',
                                    fontWeight: '700',
                                    color: 'var(--accent-gold)'
                                }}>
                                    {userEntries}
                                </div>
                                {userEntries === 0 && (
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--text-muted)',
                                        marginTop: '5px'
                                    }}>
                                        Send a payment to enter!
                                    </div>
                                )}
                            </div>
                        )}

                        {/* How entries work */}
                        <div style={{
                            padding: '15px',
                            background: 'var(--bg-warning)',
                            borderRadius: '8px',
                            marginBottom: '20px'
                        }}>
                            <div style={{
                                fontSize: '0.8rem',
                                color: 'var(--text-on-status)'
                            }}>
                                <strong>How entries work:</strong><br />
                                • 1 base entry for any payment<br />
                                • +1 entry per $10 sent
                            </div>
                        </div>

                        {/* Participants */}
                        <div>
                            <div className="engraved" style={{ fontSize: '0.7rem', marginBottom: '10px' }}>
                                TOP PARTICIPANTS ({eligibleUsers.length} total)
                            </div>
                            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                {eligibleUsers.slice(0, 15).map((u, i) => {
                                    const entries = Math.floor((u.total_sent || u.totalSent || 0) / 10) + 1;
                                    const isCurrentUser = (u.wallet_address || u.walletAddress) === userWallet ||
                                        (u.x_username || u.xUsername) === xUsername;

                                    return (
                                        <div key={u.x_username || i} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '12px 10px',
                                            borderBottom: '1px solid var(--border-subtle)',
                                            background: isCurrentUser ? 'rgba(212, 175, 55, 0.1)' : 'transparent'
                                        }}>
                                            <span style={{
                                                fontSize: '0.9rem',
                                                fontWeight: isCurrentUser ? '700' : '400',
                                                color: isCurrentUser ? 'var(--accent-gold)' : 'var(--text-primary)'
                                            }}>
                                                @{u.x_username || u.xUsername}
                                                {isCurrentUser && ' (you)'}
                                            </span>
                                            <span style={{
                                                fontSize: '0.85rem',
                                                color: 'var(--accent-gold)',
                                                fontWeight: '600'
                                            }}>
                                                {entries} {entries === 1 ? 'entry' : 'entries'}
                                            </span>
                                        </div>
                                    );
                                })}

                                {eligibleUsers.length > 15 && (
                                    <div style={{
                                        padding: '12px',
                                        textAlign: 'center',
                                        color: 'var(--text-muted)',
                                        fontSize: '0.8rem'
                                    }}>
                                        +{eligibleUsers.length - 15} more participants
                                    </div>
                                )}

                                {eligibleUsers.length === 0 && (
                                    <div style={{
                                        padding: '25px',
                                        textAlign: 'center',
                                        color: 'var(--text-muted)'
                                    }}>
                                        No participants yet. Be the first!
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Total entries */}
                        <div style={{
                            marginTop: '15px',
                            padding: '12px',
                            textAlign: 'center',
                            background: 'var(--bg-inset)',
                            borderRadius: '8px'
                        }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                Total entries: <strong style={{ color: 'var(--accent-gold)' }}>{totalEntries}</strong>
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* No Current Lottery */}
            {activeTab === 'current' && !currentLottery && (
                <div className="plate" style={{ padding: '40px', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🎰</div>
                    <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                        No active lottery right now
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '10px' }}>
                        Check back later for the next draw!
                    </div>
                </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
                <div>
                    {lotteryHistory.length > 0 ? (
                        lotteryHistory.map((lottery, index) => (
                            <div key={lottery.id || index} className="plate" style={{
                                padding: '15px 20px',
                                marginBottom: '15px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{
                                        fontSize: '1.1rem',
                                        fontWeight: '700',
                                        color: 'var(--accent-gold)'
                                    }}>
                                        ${lottery.prizeAmount} USDC
                                    </div>
                                    <div style={{
                                        fontSize: '0.8rem',
                                        color: 'var(--text-muted)',
                                        marginTop: '3px'
                                    }}>
                                        {lottery.completedAt ? new Date(lottery.completedAt.seconds * 1000).toLocaleDateString() : 'Unknown date'}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        color: lottery.winner?.username === xUsername ? 'var(--accent-gold)' : 'var(--text-primary)'
                                    }}>
                                        🏆 @{lottery.winner?.username || 'Unknown'}
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: lottery.status === 'claimed' ? 'var(--status-success)' : 'var(--text-muted)',
                                        marginTop: '3px'
                                    }}>
                                        {lottery.status === 'claimed' ? '✓ Claimed' : 'Unclaimed'}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="plate" style={{ padding: '40px', textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📜</div>
                            <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                                No lottery history yet
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '10px' }}>
                                Past lottery winners will appear here
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default LotteryPage;
