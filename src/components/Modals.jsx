import '../index.css';

const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    zIndex: 1000,
    backdropFilter: 'blur(4px)'
};

export function LeaderboardModal({ show, onClose, users }) {
    if (!show) return null;

    const sortedUsers = [...(users || [])]
        .map(u => ({
            ...u,
            points: (u.total_deposited || 0) + (u.total_sent || 0) + (u.total_claimed || 0)
        }))
        .sort((a, b) => b.points - a.points);

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
                        <div style={{ color: '#666' }}>No users yet</div>
                    </div>
                ) : (
                    <div>
                        {sortedUsers.slice(0, 10).map((u, idx) => (
                            <div key={u.wallet_address || idx} style={{
                                background: idx === 0 ? 'rgba(212, 175, 55, 0.1)' :
                                    idx === 1 ? 'rgba(192, 192, 192, 0.1)' :
                                        idx === 2 ? 'rgba(205, 127, 50, 0.1)' : 'rgba(255,255,255,0.02)',
                                border: `1px solid ${idx === 0 ? 'rgba(212, 175, 55, 0.3)' : 'rgba(255,255,255,0.05)'}`,
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
                                        background: 'linear-gradient(145deg, #2a2a2a, #161616)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: '700',
                                        fontSize: '0.8rem',
                                        color: idx < 3 ? '#d4af37' : '#666'
                                    }}>
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600' }}>@{u.x_username}</div>
                                        <div className="mono" style={{ fontSize: '0.65rem', color: '#666' }}>
                                            ${(u.total_deposited || 0).toFixed(0)} + ${(u.total_sent || 0).toFixed(0)} + ${(u.total_claimed || 0).toFixed(0)}
                                        </div>
                                    </div>
                                </div>
                                <div className="mono" style={{ fontSize: '1.2rem', fontWeight: '700', color: '#d4af37' }}>
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
                                background: unlocked ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255,255,255,0.02)',
                                border: `1px solid ${unlocked ? 'rgba(74, 222, 128, 0.3)' : 'rgba(255,255,255,0.05)'}`,
                                borderRadius: '12px',
                                padding: '15px',
                                opacity: unlocked ? 1 : 0.5,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px'
                            }}>
                                <div style={{ fontSize: '2rem' }}>{ach.icon}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>{ach.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{ach.desc}</div>
                                </div>
                                {unlocked && (
                                    <div style={{ color: '#4ade80', fontWeight: '700' }}>✓</div>
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
                position: 'relative',
                borderColor: 'rgba(239, 68, 68, 0.3)'
            }} onClick={e => e.stopPropagation()}>
                <div className="screw tl"></div>
                <div className="screw tr"></div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                    <span style={{ fontSize: '1.5rem' }}>👑</span>
                    <span className="engraved" style={{ fontSize: '0.9rem', color: '#ef4444' }}>ADMIN DASHBOARD</span>
                </div>

                {users.length === 0 ? (
                    <div className="inset-panel" style={{ textAlign: 'center', padding: '40px' }}>
                        <div style={{ color: '#666' }}>No users yet</div>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '0.75rem'
                        }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', color: '#666' }}>USERNAME</th>
                                    <th style={{ padding: '12px', textAlign: 'left', color: '#666' }}>WALLET</th>
                                    <th style={{ padding: '12px', textAlign: 'right', color: '#666' }}>DEPOSITED</th>
                                    <th style={{ padding: '12px', textAlign: 'right', color: '#666' }}>SENT</th>
                                    <th style={{ padding: '12px', textAlign: 'right', color: '#666' }}>CLAIMED</th>
                                    <th style={{ padding: '12px', textAlign: 'right', color: '#d4af37' }}>POINTS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.wallet_address} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                        <td style={{ padding: '12px' }}>@{u.x_username}</td>
                                        <td className="mono" style={{ padding: '12px', fontSize: '0.65rem', color: '#666' }}>
                                            {u.wallet_address?.substring(0, 6)}...{u.wallet_address?.substring(u.wallet_address.length - 4)}
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right' }}>${(u.total_deposited || 0).toFixed(2)}</td>
                                        <td style={{ padding: '12px', textAlign: 'right', color: '#ef4444' }}>${(u.total_sent || 0).toFixed(2)}</td>
                                        <td style={{ padding: '12px', textAlign: 'right', color: '#4ade80' }}>${(u.total_claimed || 0).toFixed(2)}</td>
                                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: '#d4af37' }}>
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

    const deposited = userStats?.totalDeposited || 0;
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="inset-panel" style={{ textAlign: 'center', padding: '20px' }}>
                        <div className="engraved" style={{ fontSize: '0.55rem', marginBottom: '8px' }}>DEPOSITED</div>
                        <div className="mono" style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                            ${deposited.toFixed(2)}
                        </div>
                    </div>
                    <div className="inset-panel" style={{ textAlign: 'center', padding: '20px' }}>
                        <div className="engraved" style={{ fontSize: '0.55rem', marginBottom: '8px' }}>SENT</div>
                        <div className="mono" style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>
                            ${sent.toFixed(2)}
                        </div>
                    </div>
                    <div className="inset-panel" style={{ textAlign: 'center', padding: '20px' }}>
                        <div className="engraved" style={{ fontSize: '0.55rem', marginBottom: '8px' }}>CLAIMED</div>
                        <div className="mono" style={{ fontSize: '1.5rem', fontWeight: '700', color: '#4ade80' }}>
                            ${claimed.toFixed(2)}
                        </div>
                    </div>
                    <div className="inset-panel" style={{ textAlign: 'center', padding: '20px' }}>
                        <div className="engraved" style={{ fontSize: '0.55rem', marginBottom: '8px' }}>POINTS</div>
                        <div className="mono" style={{ fontSize: '1.5rem', fontWeight: '700', color: '#d4af37' }}>
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
                        <div style={{ color: '#666' }}>No transactions yet</div>
                    </div>
                ) : (
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {payments.slice(0, 20).map((p, idx) => {
                            const isSender = p.sender_username === username;
                            const isRecipient = p.recipient_username === username;

                            return (
                                <div key={p.id || idx} style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: '10px',
                                    padding: '12px 15px',
                                    marginBottom: '10px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                                            {isSender ? (
                                                <span>Sent to <span style={{ color: '#31d7ff' }}>@{p.recipient_username}</span></span>
                                            ) : isRecipient ? (
                                                <span>Received from <span style={{ color: '#31d7ff' }}>@{p.sender_username}</span></span>
                                            ) : (
                                                <span>@{p.sender_username} → @{p.recipient_username}</span>
                                            )}
                                        </div>
                                        <div className="mono" style={{ fontSize: '0.65rem', color: '#666' }}>
                                            {p.status === 'completed' ? '✅ Completed' : '⏳ Pending'}
                                        </div>
                                    </div>
                                    <div className="mono" style={{
                                        fontSize: '1.1rem',
                                        fontWeight: '700',
                                        color: isSender ? '#ef4444' : isRecipient ? '#4ade80' : '#888'
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
