import { buttonStyle, dangerButtonStyle } from '../constants';

const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    zIndex: 1000
};

const modalContentStyle = {
    background: '#e8e6e1',
    border: '2px solid #1a1a1a',
    padding: '30px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '15px 15px 0px #1a1a1a',
    fontFamily: "'Courier Prime', monospace"
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
            <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                <h2 style={{
                    fontFamily: "'Work Sans', sans-serif",
                    fontSize: '2rem',
                    textTransform: 'uppercase',
                    marginBottom: '20px',
                    color: '#1a1a1a'
                }}>🏆 LEADERBOARD</h2>

                <p style={{ fontSize: '12px', marginBottom: '20px', opacity: '0.7' }}>
                    Points = Deposited + Sent + Claimed
                </p>

                {sortedUsers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', opacity: '0.5' }}>
                        <div>No users yet</div>
                    </div>
                ) : (
                    <div>
                        {sortedUsers.map((u, idx) => (
                            <div key={u.wallet_address || idx} style={{
                                background: idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : 'white',
                                border: '1px solid #1a1a1a',
                                padding: '15px',
                                marginBottom: '10px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                                        #{idx + 1} @{u.x_username}
                                    </div>
                                    <div style={{ fontSize: '10px', opacity: '0.7' }}>
                                        Deposited: ${(u.total_deposited || 0).toFixed(2)} |
                                        Sent: ${(u.total_sent || 0).toFixed(2)} |
                                        Claimed: ${(u.total_claimed || 0).toFixed(2)}
                                    </div>
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                    {u.points.toFixed(0)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <button onClick={onClose} style={{ ...buttonStyle, width: '100%', marginTop: '20px' }}>
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
            <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                <h2 style={{
                    fontFamily: "'Work Sans', sans-serif",
                    fontSize: '2rem',
                    textTransform: 'uppercase',
                    marginBottom: '20px',
                    color: '#1a1a1a'
                }}>⭐ ACHIEVEMENTS</h2>

                <div style={{ display: 'grid', gap: '15px' }}>
                    {achievements.map((ach) => {
                        const unlocked = unlockedIds.includes(ach.id);
                        return (
                            <div key={ach.id} style={{
                                background: unlocked ? '#d4edda' : '#f5f5f5',
                                border: `2px solid ${unlocked ? '#28a745' : '#1a1a1a'}`,
                                padding: '15px',
                                opacity: unlocked ? 1 : 0.5
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ fontSize: '40px' }}>{ach.icon}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{ach.name}</div>
                                        <div style={{ fontSize: '12px' }}>{ach.desc}</div>
                                        {unlocked && (
                                            <div style={{ fontSize: '10px', color: '#28a745', marginTop: '5px', fontWeight: 'bold' }}>
                                                ✓ UNLOCKED
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button onClick={onClose} style={{ ...buttonStyle, width: '100%', marginTop: '20px' }}>
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
            <div style={{
                ...modalContentStyle,
                maxWidth: '900px',
                border: '2px solid #dc3545',
                boxShadow: '15px 15px 0px #dc3545'
            }} onClick={e => e.stopPropagation()}>
                <h2 style={{
                    fontFamily: "'Work Sans', sans-serif",
                    fontSize: '2rem',
                    textTransform: 'uppercase',
                    marginBottom: '20px',
                    color: '#dc3545'
                }}>👑 ADMIN DASHBOARD</h2>

                {users.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', opacity: '0.5' }}>
                        <div>No users yet</div>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{
                            width: '100%',
                            border: '1px solid #1a1a1a',
                            borderCollapse: 'collapse',
                            fontSize: '12px',
                            background: 'white'
                        }}>
                            <thead>
                                <tr style={{ background: '#1a1a1a', color: 'white' }}>
                                    <th style={{ border: '1px solid #1a1a1a', padding: '10px', textAlign: 'left' }}>USERNAME</th>
                                    <th style={{ border: '1px solid #1a1a1a', padding: '10px', textAlign: 'left' }}>WALLET</th>
                                    <th style={{ border: '1px solid #1a1a1a', padding: '10px', textAlign: 'right' }}>DEPOSITED</th>
                                    <th style={{ border: '1px solid #1a1a1a', padding: '10px', textAlign: 'right' }}>SENT</th>
                                    <th style={{ border: '1px solid #1a1a1a', padding: '10px', textAlign: 'right' }}>CLAIMED</th>
                                    <th style={{ border: '1px solid #1a1a1a', padding: '10px', textAlign: 'right' }}>POINTS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.wallet_address}>
                                        <td style={{ border: '1px solid #1a1a1a', padding: '10px' }}>@{u.x_username}</td>
                                        <td style={{ border: '1px solid #1a1a1a', padding: '10px', fontFamily: 'monospace', fontSize: '10px' }}>
                                            {u.wallet_address?.substring(0, 4)}...{u.wallet_address?.substring(u.wallet_address.length - 4)}
                                        </td>
                                        <td style={{ border: '1px solid #1a1a1a', padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>
                                            ${(u.total_deposited || 0).toFixed(2)}
                                        </td>
                                        <td style={{ border: '1px solid #1a1a1a', padding: '10px', textAlign: 'right', color: '#dc3545' }}>
                                            ${(u.total_sent || 0).toFixed(2)}
                                        </td>
                                        <td style={{ border: '1px solid #1a1a1a', padding: '10px', textAlign: 'right', color: '#28a745' }}>
                                            ${(u.total_claimed || 0).toFixed(2)}
                                        </td>
                                        <td style={{ border: '1px solid #1a1a1a', padding: '10px', textAlign: 'right', fontWeight: 'bold', fontSize: '14px' }}>
                                            {((u.total_deposited || 0) + (u.total_sent || 0) + (u.total_claimed || 0)).toFixed(0)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <button onClick={onClose} style={{ ...dangerButtonStyle, width: '100%', marginTop: '20px' }}>
                    CLOSE
                </button>
            </div>
        </div>
    );
}
