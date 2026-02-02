import { useState, useEffect } from 'react';
import '../index.css';

export function LotteryModal({
    show,
    onClose,
    lottery,
    eligibleUsers = [],
    userWallet,
    xUsername,
    onClaim,
    isClaiming = false
}) {
    const [timeRemaining, setTimeRemaining] = useState('');

    // Update countdown every second
    useEffect(() => {
        if (!lottery?.endTime) return;

        // If lottery is completed or claimed, show winner info
        if (lottery.status === 'completed' || lottery.status === 'claimed') {
            setTimeRemaining(lottery.winner ? `Winner: @${lottery.winner.username}` : 'Winner selected!');
            return;
        }

        if (lottery.status !== 'active') return;

        const updateTimer = () => {
            const endTime = new Date(lottery.endTime);
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
    }, [lottery?.endTime, lottery?.status, lottery?.winner]);

    if (!show || !lottery) return null;

    // Calculate user's entries - check wallet AND username
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
        if (!lottery?.winner) return false;

        const wWallet = (lottery.winner.walletAddress || '').toLowerCase();
        const myWallet = (userWallet || '').toLowerCase();
        const walletMatch = wWallet && myWallet && wWallet === myWallet;

        const wName = (lottery.winner.username || '').toLowerCase().replace('@', '');
        const myName = (xUsername || '').toLowerCase().replace('@', '');
        const usernameMatch = wName && myName && wName === myName;

        return walletMatch || usernameMatch;
    })();
    const canClaim = isWinner && lottery.status === 'completed';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content plate animate-pop-in"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '450px', padding: '0' }}
            >
                <div className="screw tl"></div>
                <div className="screw tr"></div>

                {/* Header */}
                <div style={{
                    background: lottery.winner
                        ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                        : 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                    padding: '25px',
                    color: 'white',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
                        {lottery.winner ? '🏆' : '🎰'}
                    </div>
                    <div style={{
                        fontSize: '1.8rem',
                        fontWeight: '800',
                        fontFamily: "'Fredoka', sans-serif"
                    }}>
                        ${lottery.prizeAmount} USDC
                    </div>
                    <div style={{
                        fontSize: '0.85rem',
                        opacity: 0.9,
                        marginTop: '5px'
                    }}>
                        {lottery.winner
                            ? `Winner: @${lottery.winner.username}`
                            : lottery.status === 'active'
                                ? `Draw in: ${timeRemaining}`
                                : 'Lottery ended'
                        }
                    </div>
                </div>

                {/* Winner Claim Section */}
                {canClaim && (
                    <div style={{
                        padding: '20px',
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.2) 100%)',
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
                                Claim your ${lottery.prizeAmount} USDC prize
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
                    {userWallet && !lottery.winner && (
                        <div className="inset-panel" style={{
                            padding: '15px',
                            marginBottom: '20px',
                            textAlign: 'center'
                        }}>
                            <div className="engraved" style={{ fontSize: '0.65rem', marginBottom: '5px' }}>
                                YOUR ENTRIES
                            </div>
                            <div style={{
                                fontSize: '2rem',
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
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {eligibleUsers.slice(0, 10).map((u, i) => {
                                const entries = Math.floor((u.total_sent || u.totalSent || 0) / 10) + 1;
                                const isCurrentUser = u.wallet_address === userWallet || u.walletAddress === userWallet;

                                return (
                                    <div key={u.x_username || i} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '10px 8px',
                                        borderBottom: '1px solid var(--border-subtle)',
                                        background: isCurrentUser ? 'rgba(212, 175, 55, 0.1)' : 'transparent'
                                    }}>
                                        <span style={{
                                            fontSize: '0.85rem',
                                            fontWeight: isCurrentUser ? '700' : '400',
                                            color: isCurrentUser ? 'var(--accent-gold)' : 'var(--text-primary)'
                                        }}>
                                            @{u.x_username || u.xUsername}
                                            {isCurrentUser && ' (you)'}
                                        </span>
                                        <span style={{
                                            fontSize: '0.8rem',
                                            color: 'var(--accent-gold)',
                                            fontWeight: '600'
                                        }}>
                                            {entries} {entries === 1 ? 'entry' : 'entries'}
                                        </span>
                                    </div>
                                );
                            })}

                            {eligibleUsers.length > 10 && (
                                <div style={{
                                    padding: '10px',
                                    textAlign: 'center',
                                    color: 'var(--text-muted)',
                                    fontSize: '0.75rem'
                                }}>
                                    +{eligibleUsers.length - 10} more participants
                                </div>
                            )}

                            {eligibleUsers.length === 0 && (
                                <div style={{
                                    padding: '20px',
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
                        padding: '10px',
                        textAlign: 'center',
                        background: 'var(--bg-inset)',
                        borderRadius: '8px'
                    }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            Total entries: <strong style={{ color: 'var(--accent-gold)' }}>{totalEntries}</strong>
                        </span>
                    </div>
                </div>

                {/* Close button */}
                <div style={{ padding: '0 20px 20px' }}>
                    <button
                        onClick={onClose}
                        className="btn"
                        style={{ width: '100%', padding: '12px' }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LotteryModal;
