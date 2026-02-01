import { useState, useEffect } from 'react';
import '../index.css';

export function AdminDashboard({
    users,
    onClose,
    // Lottery props
    currentLottery,
    onSetLotteryPrize,
    onDrawLottery
}) {
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [localPrize, setLocalPrize] = useState(currentLottery?.prizeAmount || 50);

    // Update local prize when currentLottery changes
    useEffect(() => {
        if (currentLottery?.prizeAmount) {
            setLocalPrize(currentLottery.prizeAmount);
        }
    }, [currentLottery?.prizeAmount]);

    // Calculate metrics from users data
    const metrics = {
        totalUsers: users?.length || 0,
        totalVolume: users?.reduce((sum, u) => sum + (u.total_sent || 0) + (u.total_claimed || 0), 0) || 0,
        totalSent: users?.reduce((sum, u) => sum + (u.total_sent || 0), 0) || 0,
        totalClaimed: users?.reduce((sum, u) => sum + (u.total_claimed || 0), 0) || 0,
        activeUsers: users?.filter(u => (u.total_sent || 0) > 0 || (u.total_claimed || 0) > 0).length || 0
    };

    // Filter users by search
    const filteredUsers = users?.filter(u =>
        u.x_username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.wallet_address?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    // Eligible users count
    const eligibleUsers = users?.filter(u => (u.total_sent || 0) > 0) || [];

    const tabs = [
        { id: 'overview', label: '📊 Overview' },
        { id: 'users', label: '👥 Users' },
        { id: 'lottery', label: '🎰 Lottery' }
    ];

    return (
        <div className="admin-dashboard">
            {/* Header */}
            <div className="plate" style={{ padding: '20px', marginBottom: '20px' }}>
                <div className="screw tl"></div>
                <div className="screw tr"></div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.5rem' }}>👑</span>
                        <span className="engraved" style={{ fontSize: '1rem', color: 'var(--danger)' }}>
                            ADMIN DASHBOARD
                        </span>
                    </div>
                    <button onClick={onClose} className="btn" style={{ padding: '8px 16px' }}>
                        ← BACK
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`btn ${activeTab === tab.id ? 'btn-primary' : ''}`}
                        style={{ padding: '10px 16px', fontSize: '0.8rem' }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="plate" style={{ padding: '25px' }}>
                    <div className="screw tl"></div>
                    <div className="screw tr"></div>
                    <h3 className="engraved" style={{ marginBottom: '20px' }}>APP METRICS</h3>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '15px'
                    }}>
                        <div className="inset-panel" style={{ padding: '20px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--glow)' }}>
                                {metrics.totalUsers}
                            </div>
                            <div className="engraved" style={{ fontSize: '0.7rem' }}>TOTAL USERS</div>
                        </div>
                        <div className="inset-panel" style={{ padding: '20px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--success)' }}>
                                {metrics.activeUsers}
                            </div>
                            <div className="engraved" style={{ fontSize: '0.7rem' }}>ACTIVE USERS</div>
                        </div>
                        <div className="inset-panel" style={{ padding: '20px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--danger)' }}>
                                ${metrics.totalSent.toFixed(2)}
                            </div>
                            <div className="engraved" style={{ fontSize: '0.7rem' }}>TOTAL SENT</div>
                        </div>
                        <div className="inset-panel" style={{ padding: '20px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-gold)' }}>
                                ${metrics.totalClaimed.toFixed(2)}
                            </div>
                            <div className="engraved" style={{ fontSize: '0.7rem' }}>TOTAL CLAIMED</div>
                        </div>
                        <div className="inset-panel" style={{ padding: '20px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                                ${metrics.totalVolume.toFixed(2)}
                            </div>
                            <div className="engraved" style={{ fontSize: '0.7rem' }}>TOTAL VOLUME</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="plate" style={{ padding: '25px' }}>
                    <div className="screw tl"></div>
                    <div className="screw tr"></div>

                    {/* Search */}
                    <div style={{ marginBottom: '20px' }}>
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 15px',
                                background: 'var(--bg-inset)',
                                border: '1px solid var(--border-medium)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>

                    {/* Users Table */}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)' }}>USERNAME</th>
                                    <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)' }}>WALLET</th>
                                    <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-muted)' }}>SENT</th>
                                    <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-muted)' }}>CLAIMED</th>
                                    <th style={{ padding: '12px', textAlign: 'right', color: 'var(--accent-gold)' }}>POINTS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((u) => (
                                    <tr key={u.wallet_address} style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                                        <td style={{ padding: '12px' }}>@{u.x_username}</td>
                                        <td className="mono" style={{ padding: '12px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                            {u.wallet_address?.substring(0, 6)}...{u.wallet_address?.substring(u.wallet_address.length - 4)}
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right', color: 'var(--danger)' }}>${(u.total_sent || 0).toFixed(2)}</td>
                                        <td style={{ padding: '12px', textAlign: 'right', color: 'var(--success)' }}>${(u.total_claimed || 0).toFixed(2)}</td>
                                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: 'var(--accent-gold)' }}>
                                            {((u.total_deposited || 0) + (u.total_sent || 0) + (u.total_claimed || 0)).toFixed(0)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                No users found
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Lottery Tab */}
            {activeTab === 'lottery' && (
                <div className="plate" style={{ padding: '25px' }}>
                    <div className="screw tl"></div>
                    <div className="screw tr"></div>
                    <h3 className="engraved" style={{ marginBottom: '20px' }}>🎰 WEEKLY LOTTERY</h3>

                    {/* Current Lottery Status */}
                    {currentLottery?.winner && (
                        <div className="inset-panel" style={{
                            padding: '20px',
                            marginBottom: '20px',
                            background: 'linear-gradient(135deg, var(--accent-gold) 0%, #f59e0b 100%)',
                            color: 'black'
                        }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '5px' }}>
                                🏆 WINNER: @{currentLottery.winner.username}
                            </div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                                Prize: ${currentLottery.prizeAmount} USDC
                            </div>
                        </div>
                    )}

                    <div className="inset-panel" style={{ padding: '20px', marginBottom: '20px' }}>
                        <div className="engraved" style={{ fontSize: '0.7rem', marginBottom: '10px' }}>
                            PRIZE AMOUNT (USDC)
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="number"
                                value={localPrize}
                                onChange={(e) => setLocalPrize(parseFloat(e.target.value) || 0)}
                                onBlur={() => onSetLotteryPrize?.(localPrize)}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    background: 'var(--bg-inset)',
                                    border: '1px solid var(--border-medium)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)',
                                    fontSize: '1.2rem',
                                    fontWeight: '700'
                                }}
                            />
                            <button
                                onClick={onDrawLottery}
                                className="btn btn-gold"
                                style={{ padding: '12px 24px' }}
                                disabled={currentLottery?.status === 'completed'}
                            >
                                🎲 DRAW WINNER
                            </button>
                        </div>
                    </div>

                    <div className="inset-panel" style={{ padding: '20px' }}>
                        <div className="engraved" style={{ fontSize: '0.7rem', marginBottom: '15px' }}>
                            ELIGIBLE USERS THIS WEEK
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            {eligibleUsers.length} users have sent payments and are eligible
                        </div>
                        <div style={{ marginTop: '10px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                            Total lottery entries: {eligibleUsers.reduce((sum, u) =>
                                sum + Math.floor((u.total_sent || 0) / 10) + 1, 0
                            )}
                        </div>
                    </div>

                    <div style={{ marginTop: '20px', padding: '15px', background: 'var(--bg-warning)', borderRadius: '8px' }}>
                        <div style={{ color: 'var(--text-on-status)', fontSize: '0.8rem' }}>
                            ⚠ Lottery draw will select a random winner from users who sent payments.
                            Entries: 1 base + 1 per $10 sent. Winner receives the lottery_winner badge.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
