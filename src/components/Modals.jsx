import '../index.css';

const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    zIndex: 1000,
    backdropFilter: 'blur(8px)'
};

export function LeaderboardModal({ show, onClose, users }) {
    if (!show) return null;

    const sortedUsers = [...(users || [])]
        .map(u => ({
            ...u,
            // Use stats.points from Firebase if available, otherwise calculate
            points: u.stats?.points || u.points || ((u.total_deposited || 0) + (u.total_sent || 0) + (u.total_claimed || 0))
        }))
        .sort((a, b) => b.points - a.points)
        .filter(u => u.points > 0);

    return (
        <div style={modalOverlayStyle} onClick={onClose}>
            <div className="plate animate-scale" style={{
                maxWidth: '600px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'auto',
                padding: '30px',
                position: 'relative'
            }} onClick={e => e.stopPropagation()}>
                <div className="screw tl"></div>
                <div className="screw tr"></div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                    <span style={{ fontSize: '1.5rem' }}>🏆</span>
                    <span className="engraved" style={{ fontSize: '0.9rem' }}>LEADERBOARD</span>
                </div>

                {sortedUsers.length === 0 ? (
                    <div className="inset-panel" style={{ textAlign: 'center', padding: '40px' }}>
                        <div style={{ color: 'var(--text-muted)' }}>No users yet</div>
                    </div>
                ) : (
                    <div>
                        {sortedUsers.slice(0, 10).map((u, idx) => (
                            <div key={u.wallet_address || idx} style={{
                                background: idx === 0 ? 'var(--bg-warning)' :
                                    idx === 1 ? 'var(--bg-secondary)' :
                                        idx === 2 ? 'var(--bg-inset)' : 'var(--bg-inset)',
                                border: idx === 0 ? '2px solid var(--accent-gold)' : 'var(--border-subtle)',
                                borderRadius: '10px',
                                padding: '15px',
                                marginBottom: '10px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{
                                        width: '30px',
                                        height: '30px',
                                        background: 'var(--bg-secondary)',
                                        border: '1px solid var(--border-medium)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: '700',
                                        fontSize: '0.8rem',
                                        color: idx < 3 ? 'var(--accent-gold)' : 'var(--text-muted)'
                                    }}>
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>@{u.x_username}</div>
                                        <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                            ${(u.total_deposited || 0).toFixed(0)} + ${(u.total_sent || 0).toFixed(0)} + ${(u.total_claimed || 0).toFixed(0)}
                                        </div>
                                    </div>
                                </div>
                                <div className="mono" style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--accent-gold)' }}>
                                    {u.points.toFixed(0)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <button onClick={onClose} className="btn" style={{ width: '100%', marginTop: '20px' }}>
                    CLOSE
                </button>
            </div>
        </div>
    );
}

export function AchievementsModal({ show, onClose, achievements, unlockedIds }) {
    if (!show) return null;

    return (
        <div style={modalOverlayStyle} onClick={onClose}>
            <div className="plate animate-scale" style={{
                maxWidth: '500px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'auto',
                padding: '30px',
                position: 'relative'
            }} onClick={e => e.stopPropagation()}>
                <div className="screw tl"></div>
                <div className="screw tr"></div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                    <span style={{ fontSize: '1.5rem' }}>⭐</span>
                    <span className="engraved" style={{ fontSize: '0.9rem' }}>ACHIEVEMENTS</span>
                </div>

                <div style={{ display: 'grid', gap: '15px' }}>
                    {achievements.map((ach) => {
                        const unlocked = unlockedIds.includes(ach.id);
                        return (
                            <div key={ach.id} style={{
                                background: unlocked ? 'var(--bg-success)' : 'var(--bg-inset)',
                                border: unlocked ? 'var(--border-success)' : 'var(--border-subtle)',
                                borderRadius: '12px',
                                padding: '15px',
                                opacity: unlocked ? 1 : 0.5,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px'
                            }}>
                                <div style={{ fontSize: '2rem' }}>{ach.icon}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600', marginBottom: '4px', color: 'var(--text-primary)' }}>{ach.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ach.desc}</div>
                                </div>
                                {unlocked && (
                                    <div style={{ color: 'var(--success)', fontWeight: '700' }}>✓</div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <button onClick={onClose} className="btn" style={{ width: '100%', marginTop: '20px' }}>
                    CLOSE
                </button>
            </div>
        </div>
    );
}

export function AdminModal({ show, onClose, users }) {
    if (!show) return null;

    return (
        <div style={modalOverlayStyle} onClick={onClose}>
            <div className="plate animate-scale" style={{
                maxWidth: '900px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'auto',
                padding: '30px',
                position: 'relative'
            }} onClick={e => e.stopPropagation()}>
                <div className="screw tl"></div>
                <div className="screw tr"></div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                    <span style={{ fontSize: '1.5rem' }}>👑</span>
                    <span className="engraved" style={{ fontSize: '0.9rem', color: 'var(--danger)' }}>ADMIN DASHBOARD</span>
                </div>

                {users.length === 0 ? (
                    <div className="inset-panel" style={{ textAlign: 'center', padding: '40px' }}>
                        <div style={{ color: 'var(--text-muted)' }}>No users yet</div>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '0.75rem'
                        }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)' }}>USERNAME</th>
                                    <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)' }}>WALLET</th>
                                    <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-muted)' }}>DEPOSITED</th>
                                    <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-muted)' }}>SENT</th>
                                    <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-muted)' }}>CLAIMED</th>
                                    <th style={{ padding: '12px', textAlign: 'right', color: 'var(--accent-gold)' }}>POINTS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.wallet_address} style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                                        <td style={{ padding: '12px' }}>@{u.x_username}</td>
                                        <td className="mono" style={{ padding: '12px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                            {u.wallet_address?.substring(0, 6)}...{u.wallet_address?.substring(u.wallet_address.length - 4)}
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right' }}>${(u.total_deposited || 0).toFixed(2)}</td>
                                        <td style={{ padding: '12px', textAlign: 'right', color: 'var(--danger)' }}>${(u.total_sent || 0).toFixed(2)}</td>
                                        <td style={{ padding: '12px', textAlign: 'right', color: 'var(--success)' }}>${(u.total_claimed || 0).toFixed(2)}</td>
                                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: 'var(--accent-gold)' }}>
                                            {((u.total_deposited || 0) + (u.total_sent || 0) + (u.total_claimed || 0)).toFixed(0)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <button onClick={onClose} className="btn btn-danger" style={{ width: '100%', marginTop: '20px' }}>
                    CLOSE
                </button>
            </div>
        </div>
    );
}

// Stats Modal - shows user stats in popup
export function StatsModal({ show, onClose, userStats }) {
    if (!show) return null;

    const sent = userStats?.totalSent || 0;
    const claimed = userStats?.totalClaimed || 0;
    const points = userStats?.points || 0;

    return (
        <div style={modalOverlayStyle} onClick={onClose}>
            <div className="plate animate-scale" style={{
                maxWidth: '400px',
                width: '100%',
                padding: '30px',
                position: 'relative'
            }} onClick={e => e.stopPropagation()}>
                <div className="screw tl"></div>
                <div className="screw tr"></div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                    <span style={{ fontSize: '1.5rem' }}>📊</span>
                    <span className="engraved" style={{ fontSize: '0.9rem' }}>YOUR STATS</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                    <div className="inset-panel" style={{ textAlign: 'center', padding: '20px' }}>
                        <div className="engraved" style={{ fontSize: '0.55rem', marginBottom: '8px' }}>SENT</div>
                        <div className="mono" style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--danger)' }}>
                            ${sent.toFixed(2)}
                        </div>
                    </div>
                    <div className="inset-panel" style={{ textAlign: 'center', padding: '20px' }}>
                        <div className="engraved" style={{ fontSize: '0.55rem', marginBottom: '8px' }}>CLAIMED</div>
                        <div className="mono" style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--success)' }}>
                            ${claimed.toFixed(2)}
                        </div>
                    </div>
                    <div className="inset-panel" style={{ textAlign: 'center', padding: '20px' }}>
                        <div className="engraved" style={{ fontSize: '0.55rem', marginBottom: '8px' }}>POINTS</div>
                        <div className="mono" style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-gold)' }}>
                            {points.toFixed(0)}
                        </div>
                    </div>
                </div>

                <button onClick={onClose} className="btn" style={{ width: '100%', marginTop: '20px' }}>
                    CLOSE
                </button>
            </div>
        </div>
    );
}

// History Modal - shows transaction history in popup
export function HistoryModal({ show, onClose, payments, xUsername }) {
    if (!show) return null;

    const username = xUsername?.toLowerCase();

    return (
        <div style={modalOverlayStyle} onClick={onClose}>
            <div className="plate animate-scale" style={{
                maxWidth: '600px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'auto',
                padding: '30px',
                position: 'relative'
            }} onClick={e => e.stopPropagation()}>
                <div className="screw tl"></div>
                <div className="screw tr"></div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                    <span style={{ fontSize: '1.5rem' }}>📜</span>
                    <span className="engraved" style={{ fontSize: '0.9rem' }}>TRANSACTION HISTORY</span>
                </div>

                {(!payments || payments.length === 0) ? (
                    <div className="inset-panel" style={{ textAlign: 'center', padding: '40px' }}>
                        <div style={{ color: 'var(--text-muted)' }}>No transactions yet</div>
                    </div>
                ) : (
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {payments.slice(0, 20).map((p, idx) => {
                            const isSender = p.sender_username === username;
                            const isRecipient = p.recipient_username === username;

                            return (
                                <div key={p.id || idx} style={{
                                    background: 'var(--bg-inset)',
                                    border: 'var(--border-subtle)',
                                    borderRadius: '10px',
                                    padding: '12px 15px',
                                    marginBottom: '10px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    color: 'var(--text-primary)'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                                            {isSender ? (
                                                <span>Sent to <span style={{ color: 'var(--glow)' }}>@{p.recipient_username}</span></span>
                                            ) : isRecipient ? (
                                                <span>Received from <span style={{ color: 'var(--glow)' }}>@{p.sender_username}</span></span>
                                            ) : (
                                                <span>@{p.sender_username} → @{p.recipient_username}</span>
                                            )}
                                        </div>
                                        <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                            {p.status === 'completed' ? '✅ Completed' : '⏳ Pending'}
                                        </div>
                                    </div>
                                    <div className="mono" style={{
                                        fontSize: '1.1rem',
                                        fontWeight: '700',
                                        color: isSender ? 'var(--danger)' : isRecipient ? 'var(--success)' : 'var(--text-muted)'
                                    }}>
                                        {isSender ? '-' : isRecipient ? '+' : ''}${(p.amount || 0).toFixed(2)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <button onClick={onClose} className="btn" style={{ width: '100%', marginTop: '20px' }}>
                    CLOSE
                </button>
            </div>
        </div>
    );
}
