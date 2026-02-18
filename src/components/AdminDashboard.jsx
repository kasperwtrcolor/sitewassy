import { useState, useEffect } from 'react';
import { VAULT_ADDRESS } from '../constants';
import '../index.css';

export function AdminDashboard({
    users,
    onClose,
    // Enhanced Lottery props
    currentLottery,
    onCreateLottery,
    onActivateLottery,
    onSetLotteryPrize,
    onDrawLottery,
    onResetVaultCracker,
    onEndVaultCracker,
    onBurnVaultWassy,
    onGetVaultWassyBalance,
    // Unclaimed payments
    unclaimedPayments = [],
    onFetchUnclaimedPayments
}) {
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');

    // Lottery creation form state
    const [newPrize, setNewPrize] = useState(50);
    const [newEndTime, setNewEndTime] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);

    // Vault Cracker management state
    const [vaultPrize, setVaultPrize] = useState(50);
    const [vaultCost, setVaultCost] = useState(50000);
    const [vaultCode, setVaultCode] = useState('000');
    const [isResettingVault, setIsResettingVault] = useState(false);
    const [vaultMessage, setVaultMessage] = useState(null);

    // Burn WASSY state
    const [burnAmount, setBurnAmount] = useState('');
    const [isBurning, setIsBurning] = useState(false);
    const [burnMessage, setBurnMessage] = useState(null);
    const [vaultWassyBalance, setVaultWassyBalance] = useState(null);
    const [loadingBalance, setLoadingBalance] = useState(false);

    // Set default end time to 24 hours from now
    useEffect(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setNewEndTime(tomorrow.toISOString().slice(0, 16)); // Format for datetime-local
    }, []);

    // Fetch unclaimed payments when tab change
    useEffect(() => {
        if (activeTab === 'unclaimed') {
            onFetchUnclaimedPayments?.();
        }
    }, [activeTab, onFetchUnclaimedPayments]);

    // Calculate metrics from users data
    const metrics = {
        totalUsers: users?.length || 0,
        totalVolume: users?.reduce((sum, u) => sum + (u.total_sent || 0) + (u.total_claimed || 0), 0) || 0,
        totalSent: users?.reduce((sum, u) => sum + (u.total_sent || 0), 0) || 0,
        totalClaimed: users?.reduce((sum, u) => sum + (u.total_claimed || 0), 0) || 0,
        activeUsers: (users?.filter(u => (u.total_sent || 0) > 0 || (u.total_claimed || 0) > 0) || []).length
    };

    // Filter users by search
    const filteredUsers = users?.filter(u =>
        u.x_username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.wallet_address?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const filteredUnclaimed = unclaimedPayments?.filter(p =>
        p.username?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    // Eligible users count (users who have sent payments)
    const eligibleUsers = users?.filter(u => (u.total_sent || 0) > 0 || u.has_sent) || [];

    // Total entries calculation - each eligible user counts as 1 entry
    const totalEntries = eligibleUsers.length;

    // Lottery status helpers
    const lotteryStatus = currentLottery?.status || 'none';
    const isLotteryActive = lotteryStatus === 'active';
    const isLotteryCompleted = lotteryStatus === 'completed' || lotteryStatus === 'claimed';
    const hasWinner = !!currentLottery?.winner;

    // Time remaining calculation
    const getTimeRemaining = () => {
        if (!currentLottery?.endTime) return null;
        const endTime = new Date(currentLottery.endTime);
        const now = new Date();
        const diff = endTime - now;

        if (diff <= 0) return 'Ended';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    // Handle lottery creation
    const handleCreateLottery = async () => {
        setIsCreating(true);
        try {
            await onCreateLottery?.(newPrize, newEndTime);
        } finally {
            setIsCreating(false);
        }
    };

    // Handle draw
    const handleDraw = async () => {
        setIsDrawing(true);
        try {
            await onDrawLottery?.();
        } finally {
            setIsDrawing(false);
        }
    };

    const handleResetVault = async () => {
        setIsResettingVault(true);
        setVaultMessage(null);
        try {
            const res = await onResetVaultCracker?.(vaultPrize, vaultCost, vaultCode);
            if (res.success) {
                setVaultMessage({ type: 'success', text: 'Vault Cracker started successfully!' });
            } else {
                setVaultMessage({ type: 'error', text: res.message || 'Start failed' });
            }
        } catch (e) {
            setVaultMessage({ type: 'error', text: 'Error starting vault' });
        } finally {
            setIsResettingVault(false);
        }
    };

    const handleEndVault = async () => {
        if (!window.confirm("Are you sure you want to end the current game?")) return;
        setIsResettingVault(true);
        setVaultMessage(null);
        try {
            const res = await onEndVaultCracker?.();
            if (res.success) {
                setVaultMessage({ type: 'success', text: 'Vault Cracker ended successfully!' });
            } else {
                setVaultMessage({ type: 'error', text: res.message || 'End failed' });
            }
        } catch (e) {
            setVaultMessage({ type: 'error', text: 'Error ending vault' });
        } finally {
            setIsResettingVault(false);
        }
    };

    // Fetch vault WASSY balance
    const fetchVaultWassyBalance = async () => {
        setLoadingBalance(true);
        try {
            const res = await onGetVaultWassyBalance?.();
            if (res?.success) {
                setVaultWassyBalance(res.balance);
            }
        } catch (e) {
            console.error('Error fetching vault balance:', e);
        } finally {
            setLoadingBalance(false);
        }
    };

    // Handle WASSY burn
    const handleBurnWassy = async () => {
        const amount = parseFloat(burnAmount);
        if (!amount || amount <= 0) {
            setBurnMessage({ type: 'error', text: 'Enter a valid amount' });
            return;
        }

        if (!window.confirm(`🔥 Are you sure you want to PERMANENTLY BURN ${amount.toLocaleString()} $WASSY from the vault? This action cannot be undone.`)) {
            return;
        }

        setIsBurning(true);
        setBurnMessage(null);
        try {
            const res = await onBurnVaultWassy?.(amount, VAULT_ADDRESS);
            if (res?.success) {
                setBurnMessage({ type: 'success', text: `🔥 ${amount.toLocaleString()} $WASSY burned! TX: ${res.txSignature?.slice(0, 12)}...` });
                setBurnAmount('');
                setVaultWassyBalance(res.remainingBalance);
            } else {
                setBurnMessage({ type: 'error', text: res?.message || 'Burn failed' });
            }
        } catch (e) {
            setBurnMessage({ type: 'error', text: 'Error burning WASSY' });
        } finally {
            setIsBurning(false);
        }
    };

    const tabs = [
        { id: 'overview', label: '📊 Overview' },
        { id: 'users', label: '👥 Users' },
        { id: 'unclaimed', label: '🎁 Unclaimed' },
        { id: 'lottery', label: '🎰 Lottery' },
        { id: 'vault', label: '🔐 Vault Cracker' },
        { id: 'burn', label: '🔥 Burn WASSY' }
    ];

    return (
        <div className="admin-dashboard animate-fade-in">
            {/* Header */}
            <div className="glass-panel" style={{ padding: '25px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, color: 'var(--accent-gold)' }}>
                        👑 Admin Dashboard
                    </h2>
                    <button onClick={onClose} className="btn" style={{ padding: '8px 16px' }}>
                        ✕ Close
                    </button>
                </div>

                {/* Tab Navigation */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`btn ${activeTab === tab.id ? 'btn-primary' : ''}`}
                            style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="glass-panel" style={{ padding: '25px', marginBottom: '20px' }}>
                    <div className="mono label-subtle" style={{ marginBottom: '20px' }}>// APP_METRICS</div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px' }}>
                        <div className="inset-panel" style={{ padding: '15px', textAlign: 'center' }}>
                            <div className="engraved" style={{ fontSize: '0.65rem', marginBottom: '5px' }}>TOTAL USERS</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--glow)' }}>{metrics.totalUsers}</div>
                        </div>
                        <div className="inset-panel" style={{ padding: '15px', textAlign: 'center' }}>
                            <div className="engraved" style={{ fontSize: '0.65rem', marginBottom: '5px' }}>ACTIVE USERS</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--success)' }}>{metrics.activeUsers}</div>
                        </div>
                        <div className="inset-panel" style={{ padding: '15px', textAlign: 'center' }}>
                            <div className="engraved" style={{ fontSize: '0.65rem', marginBottom: '5px' }}>TOTAL VOLUME</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--accent-gold)' }}>
                                ${metrics.totalVolume.toFixed(0)}
                            </div>
                        </div>
                        <div className="inset-panel" style={{ padding: '15px', textAlign: 'center' }}>
                            <div className="engraved" style={{ fontSize: '0.65rem', marginBottom: '5px' }}>TOTAL SENT</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--danger)' }}>
                                ${metrics.totalSent.toFixed(0)}
                            </div>
                        </div>
                        <div className="inset-panel" style={{ padding: '15px', textAlign: 'center' }}>
                            <div className="engraved" style={{ fontSize: '0.65rem', marginBottom: '5px' }}>TOTAL CLAIMED</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--success)' }}>
                                ${metrics.totalClaimed.toFixed(0)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="glass-panel" style={{ padding: '25px', marginBottom: '20px' }}>
                    <div className="mono label-subtle" style={{ marginBottom: '20px' }}>// USER_DATABASE</div>

                    {/* Search */}
                    <div style={{ marginBottom: '20px' }}>
                        <input
                            type="text"
                            placeholder="Search by username or wallet..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
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
                                    <tr key={u.wallet_address || u.x_username} style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                                        <td style={{ padding: '12px' }}>@{u.x_username}</td>
                                        <td className="mono" style={{ padding: '12px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                            {(u.wallet_address || u.walletAddress || '').slice(0, 6)}...{(u.wallet_address || u.walletAddress || '').slice(-4)}
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
                            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                No users found
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Unclaimed Tab */}
            {activeTab === 'unclaimed' && (
                <div className="glass-panel" style={{ padding: '25px', marginBottom: '20px' }}>
                    <div className="mono label-subtle" style={{ marginBottom: '20px' }}>// UNCLAIMED_PAYMENTS</div>

                    {/* Search */}
                    <div style={{ marginBottom: '20px' }}>
                        <input
                            type="text"
                            placeholder="Search by recipient handle..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'var(--bg-inset)',
                                border: '1px solid var(--border-medium)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>

                    {/* Unclaimed Table */}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)' }}>RECIPIENT</th>
                                    <th style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)' }}>PENDING COUNT</th>
                                    <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-muted)' }}>TOTAL AMOUNT</th>
                                    <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-muted)' }}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUnclaimed.map((p) => (
                                    <tr key={p.username} style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                                        <td style={{ padding: '12px' }}>@{p.username}</td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <span style={{
                                                background: 'var(--bg-inset)',
                                                padding: '2px 8px',
                                                borderRadius: '10px',
                                                border: '1px solid var(--border-medium)'
                                            }}>
                                                {p.count}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: 'var(--success)' }}>
                                            ${p.totalAmount.toFixed(2)}
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right' }}>
                                            <a
                                                href={`https://twitter.com/intent/tweet?text=Hey%20@${p.username},%20you%20have%20${p.count}%20pending%20USDC%20payments%20on%20WassyPay!%20Head%20over%20to%20https://wassy-pay-backend.onrender.com%20to%20claim%20them.%20@bot_wassy`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-primary"
                                                style={{
                                                    padding: '4px 12px',
                                                    fontSize: '0.7rem',
                                                    borderRadius: '6px'
                                                }}
                                            >
                                                REMIND ON X
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUnclaimed.length === 0 && (
                            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                No pending claims found
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Enhanced Lottery Tab */}
            {activeTab === 'lottery' && (
                <div className="glass-panel" style={{ padding: '25px', marginBottom: '20px' }}>
                    <div className="mono label-subtle" style={{ marginBottom: '20px' }}>// LOTTERY_MANAGEMENT</div>

                    {/* Current Lottery Status */}
                    {currentLottery && (
                        <div className="inset-panel" style={{
                            padding: '20px',
                            marginBottom: '20px',
                            background: hasWinner
                                ? 'linear-gradient(135deg, var(--accent-gold) 0%, #f59e0b 100%)'
                                : isLotteryActive
                                    ? 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)'
                                    : 'var(--bg-inset)',
                            color: (hasWinner || isLotteryActive) ? 'black' : 'var(--text-primary)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '5px' }}>
                                        {hasWinner ? '🏆 WINNER SELECTED' : isLotteryActive ? '🔴 LIVE' : lotteryStatus.toUpperCase()}
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                                        {hasWinner
                                            ? `@${currentLottery.winner.username}`
                                            : `$${currentLottery.prizeAmount || 0} USDC`
                                        }
                                    </div>
                                    {hasWinner && (
                                        <div style={{ fontSize: '0.9rem', marginTop: '5px' }}>
                                            Prize: ${currentLottery.prizeAmount} USDC
                                        </div>
                                    )}
                                </div>
                                {isLotteryActive && !hasWinner && (
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>ENDS IN</div>
                                        <div style={{ fontSize: '1.3rem', fontWeight: '700' }}>
                                            {getTimeRemaining()}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Status Actions */}
                            {lotteryStatus === 'draft' && (
                                <button
                                    onClick={() => onActivateLottery?.(currentLottery.id)}
                                    className="btn btn-success"
                                    style={{ marginTop: '15px', width: '100%' }}
                                >
                                    🚀 ACTIVATE LOTTERY
                                </button>
                            )}

                            {isLotteryActive && !hasWinner && (
                                <button
                                    onClick={handleDraw}
                                    disabled={isDrawing}
                                    className="btn btn-gold"
                                    style={{ marginTop: '15px', width: '100%' }}
                                >
                                    {isDrawing ? '⏳ Drawing...' : '🎲 DRAW WINNER'}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Create New Lottery */}
                    {(!currentLottery || isLotteryCompleted) && (
                        <div className="inset-panel" style={{ padding: '20px', marginBottom: '20px' }}>
                            <div className="engraved" style={{ fontSize: '0.7rem', marginBottom: '15px' }}>
                                CREATE NEW LOTTERY
                            </div>

                            <div style={{ display: 'grid', gap: '15px' }}>
                                {/* Prize Amount */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '5px' }}>
                                        Prize Amount (USDC)
                                    </label>
                                    <input
                                        type="number"
                                        value={newPrize}
                                        onChange={(e) => setNewPrize(parseFloat(e.target.value) || 0)}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: 'var(--bg-inset)',
                                            border: '1px solid var(--border-medium)',
                                            borderRadius: '8px',
                                            color: 'var(--text-primary)',
                                            fontSize: '1.2rem',
                                            fontWeight: '700'
                                        }}
                                    />
                                </div>

                                {/* End Time */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '5px' }}>
                                        Draw Date & Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={newEndTime}
                                        onChange={(e) => setNewEndTime(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: 'var(--bg-inset)',
                                            border: '1px solid var(--border-medium)',
                                            borderRadius: '8px',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                </div>

                                <button
                                    onClick={handleCreateLottery}
                                    disabled={isCreating || newPrize <= 0}
                                    className="btn btn-primary"
                                    style={{ padding: '15px' }}
                                >
                                    {isCreating ? '⏳ Creating...' : '✨ CREATE LOTTERY'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Eligible Users */}
                    <div className="inset-panel" style={{ padding: '20px' }}>
                        <div className="engraved" style={{ fontSize: '0.7rem', marginBottom: '15px' }}>
                            ELIGIBLE PARTICIPANTS
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--glow)' }}>
                                    {eligibleUsers.length}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Users</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-gold)' }}>
                                    {totalEntries}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Entries</div>
                            </div>
                        </div>

                        {/* Top participants */}
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {eligibleUsers.slice(0, 10).map((u, i) => (
                                <div key={u.x_username || i} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: '8px 0',
                                    borderBottom: '1px solid var(--border-subtle)',
                                    fontSize: '0.8rem'
                                }}>
                                    <span>@{u.x_username}</span>
                                    <span style={{ color: 'var(--accent-gold)' }}>
                                        1 entry
                                    </span>
                                </div>
                            ))}
                            {eligibleUsers.length > 10 && (
                                <div style={{ padding: '10px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                    +{eligibleUsers.length - 10} more participants
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div style={{ marginTop: '20px', padding: '15px', background: 'var(--bg-warning)', borderRadius: '8px' }}>
                        <div style={{ color: 'var(--text-on-status)', fontSize: '0.8rem' }}>
                            ℹ️ <strong>How it works:</strong> Users qualify for 1 entry by sending any payment.
                            The lottery must be activated for users to see it on the homepage.
                            Winner can be drawn after the end time.
                        </div>
                    </div>
                </div>
            )}

            {/* Vault Cracker Tab */}
            {activeTab === 'vault' && (
                <div className="glass-panel" style={{ padding: '25px', marginBottom: '20px' }}>
                    <div className="mono label-subtle" style={{ marginBottom: '20px' }}>// VAULT_CRACKER_CONTROL</div>

                    <div className="inset-panel" style={{ padding: '20px', marginBottom: '20px' }}>
                        <div className="engraved" style={{ fontSize: '0.7rem', marginBottom: '20px' }}>RESET GAME MECHANISMS</div>

                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div>
                                    <label className="mono" style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '8px' }}>JACKPOT (USDC)</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={vaultPrize}
                                        onChange={(e) => setVaultPrize(parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <div>
                                    <label className="mono" style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '8px' }}>GUESS_COST ($WASSY - FULL NUMBER)</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        placeholder="e.g. 50000"
                                        value={vaultCost}
                                        onChange={(e) => setVaultCost(parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mono" style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '8px' }}>SECRET_CODE (3 DIGITS)</label>
                                <input
                                    type="text"
                                    className="input-field mono"
                                    maxLength="3"
                                    value={vaultCode}
                                    onChange={(e) => setVaultCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                    style={{ fontSize: '1.5rem', textAlign: 'center', letterSpacing: '0.5em' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <button
                                    onClick={handleResetVault}
                                    disabled={isResettingVault || vaultCode.length !== 3}
                                    className="btn btn-primary"
                                    style={{ padding: '15px' }}
                                >
                                    {isResettingVault ? 'PROCESSING...' : 'START / RESET'}
                                </button>
                                <button
                                    onClick={handleEndVault}
                                    disabled={isResettingVault}
                                    className="btn"
                                    style={{ padding: '15px', background: 'var(--error)', color: 'white' }}
                                >
                                    {isResettingVault ? 'ENDING...' : 'END GAME'}
                                </button>
                            </div>

                            {vaultMessage && (
                                <div className="mono" style={{
                                    padding: '10px',
                                    borderRadius: '8px',
                                    fontSize: '0.8rem',
                                    textAlign: 'center',
                                    background: vaultMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: vaultMessage.type === 'success' ? 'var(--success)' : 'var(--error)'
                                }}>
                                    {vaultMessage.text}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="inset-panel" style={{ padding: '20px' }}>
                        <div className="engraved" style={{ fontSize: '0.7rem', marginBottom: '10px' }}>GAMEPLAY GUIDELINES</div>
                        <p className="text-muted" style={{ fontSize: '0.75rem', lineHeight: '1.6' }}>
                            Resetting the game will set a new secret code and update the prize pool.
                            Users' $WASSY will be deducted on each guess.
                            The game remains active until the correct code is guessed or you reset it again.
                        </p>
                    </div>
                </div>
            )}

            {/* Burn WASSY Tab */}
            {activeTab === 'burn' && (
                <div className="glass-panel" style={{ padding: '25px', marginBottom: '20px' }}>
                    <div className="mono label-subtle" style={{ marginBottom: '20px' }}>// VAULT_WASSY_BURN</div>

                    {/* Vault Balance */}
                    <div className="inset-panel" style={{ padding: '20px', marginBottom: '20px' }}>
                        <div className="engraved" style={{ fontSize: '0.7rem', marginBottom: '15px' }}>VAULT $WASSY BALANCE</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--accent-gold)' }}>
                                {vaultWassyBalance !== null ? `${Number(vaultWassyBalance).toLocaleString()} $WASSY` : '—'}
                            </div>
                            <button
                                onClick={fetchVaultWassyBalance}
                                disabled={loadingBalance}
                                className="btn"
                                style={{ padding: '8px 16px', fontSize: '0.75rem' }}
                            >
                                {loadingBalance ? '⏳' : '🔄 Refresh'}
                            </button>
                        </div>
                    </div>

                    {/* Burn Controls */}
                    <div className="inset-panel" style={{ padding: '20px', marginBottom: '20px' }}>
                        <div className="engraved" style={{ fontSize: '0.7rem', marginBottom: '20px' }}>BURN $WASSY FROM VAULT</div>

                        <div style={{ display: 'grid', gap: '15px' }}>
                            <div>
                                <label className="mono" style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '8px' }}>AMOUNT TO BURN</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    placeholder="e.g. 100000"
                                    value={burnAmount}
                                    onChange={(e) => setBurnAmount(e.target.value)}
                                    style={{ fontSize: '1.2rem', fontWeight: '700' }}
                                />
                            </div>

                            {vaultWassyBalance !== null && burnAmount && (
                                <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    Remaining after burn: {Math.max(0, vaultWassyBalance - (parseFloat(burnAmount) || 0)).toLocaleString()} $WASSY
                                </div>
                            )}

                            <button
                                onClick={handleBurnWassy}
                                disabled={isBurning || !burnAmount || parseFloat(burnAmount) <= 0}
                                className="btn"
                                style={{
                                    padding: '15px',
                                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                    color: 'white',
                                    fontSize: '0.9rem',
                                    fontWeight: '700'
                                }}
                            >
                                {isBurning ? '⏳ BURNING...' : '🔥 BURN $WASSY'}
                            </button>

                            {burnMessage && (
                                <div className="mono" style={{
                                    padding: '10px',
                                    borderRadius: '8px',
                                    fontSize: '0.8rem',
                                    textAlign: 'center',
                                    background: burnMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: burnMessage.type === 'success' ? 'var(--success)' : 'var(--error)'
                                }}>
                                    {burnMessage.text}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Warning */}
                    <div style={{ padding: '15px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                        <div style={{ color: 'var(--error)', fontSize: '0.8rem' }}>
                            ⚠️ <strong>Warning:</strong> Burning tokens is permanent and irreversible.
                            Burned $WASSY is removed from the total supply forever.
                            Always refresh the balance before burning to see the latest vault holdings.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
