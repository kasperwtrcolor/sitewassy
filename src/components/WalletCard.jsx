import '../index.css';

export function WalletCard({
    solanaWallet,
    walletBalance,
    solBalance,
    isDelegated,
    delegationAmount,
    setDelegationAmount,
    isAuthorizing,
    onAuthorize,
    onFundWallet,
    onExportWallet,
    error,
    success
}) {
    const needsGas = solBalance < 0.005; // Less than 0.005 SOL is too low for gas
    if (!solanaWallet) {
        return (
            <div className="plate" style={{ padding: '30px', marginBottom: '20px', position: 'relative' }}>
                <div className="screw tl"></div>
                <div className="screw tr"></div>

                <div className="engraved" style={{ marginBottom: '15px' }}>// WALLET_STATUS</div>

                <div className="inset-panel" style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="status-light" style={{ marginBottom: '15px', background: 'var(--glow)', boxShadow: 'var(--glow-shadow)' }}></div>
                    <div style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>LOADING WALLET...</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Your embedded Solana wallet is being loaded from Privy.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="plate wallet-card" style={{ padding: '30px', marginBottom: '20px', position: 'relative' }}>
            <div className="screw tl"></div>
            <div className="screw tr"></div>

            <div className="engraved" style={{ marginBottom: '20px' }}>// WALLET_STATUS</div>

            {/* Balance Display */}
            <div className="inset-panel" style={{ marginBottom: '20px' }}>
                <div className="engraved" style={{ marginBottom: '8px', fontSize: '0.6rem' }}>BALANCE</div>
                <div className="amount-display">
                    ${walletBalance.toFixed(2)}
                    <span className="currency">USDC</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '5px' }} className="mono">
                    {walletBalance.toFixed(6)} USDC
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }} className="mono">
                    SOL: {solBalance.toFixed(4)}
                </div>
            </div>

            {/* SOL Gas Warning */}
            {needsGas && (
                <div style={{
                    background: 'var(--bg-danger)',
                    border: 'var(--border-danger)',
                    borderRadius: '12px',
                    padding: '15px',
                    marginBottom: '20px'
                }}>
                    <div style={{ fontWeight: '600', marginBottom: '5px', color: 'var(--text-on-status)' }}>⚠ LOW SOL BALANCE</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-on-status)', opacity: 0.9 }}>
                        You need at least 0.005 SOL for transaction fees. Send a small amount of SOL to your wallet address.
                    </div>
                </div>
            )}

            {/* Address */}
            <div className="ledger-item">
                <span className="label">WALLET ADDRESS</span>
                <span className="value mono" style={{ fontSize: '0.7rem' }}>{solanaWallet.address}</span>
            </div>

            {/* Authorization Section */}
            {isDelegated ? (
                <div style={{
                    background: 'var(--bg-success)',
                    border: 'var(--border-success)',
                    borderRadius: '12px',
                    padding: '15px',
                    marginBottom: '20px'
                }}>
                    <div style={{ fontWeight: '600', marginBottom: '5px', color: 'var(--text-on-status)' }}>✓ AUTHORIZED</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-on-status)', marginBottom: '12px', opacity: 0.9 }}>
                        Spending limit: <span style={{ fontWeight: '700' }}>${delegationAmount} USDC</span>
                    </div>

                    {/* Re-authorize section */}
                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                        <div className="engraved" style={{ fontSize: '0.6rem', marginBottom: '8px' }}>
                            INCREASE / UPDATE LIMIT
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="number"
                                value={delegationAmount}
                                onChange={(e) => setDelegationAmount(parseFloat(e.target.value) || 0)}
                                style={{
                                    flex: 1,
                                    padding: '8px 12px',
                                    background: 'var(--bg-inset)',
                                    border: '1px solid var(--border-medium)',
                                    borderRadius: '6px',
                                    color: 'var(--text-primary)',
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: '0.9rem'
                                }}
                                placeholder="New amount"
                            />
                            <button
                                onClick={() => onAuthorize(delegationAmount)}
                                disabled={isAuthorizing}
                                className="btn update-limit-btn"
                                style={{
                                    padding: '8px 12px',
                                    fontSize: '0.7rem',
                                    opacity: isAuthorizing ? 0.5 : 1,
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {isAuthorizing ? '⏳' : '🔄'}
                            </button>

                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div style={{
                        background: 'var(--bg-warning)',
                        border: 'var(--border-warning)',
                        borderRadius: '12px',
                        padding: '15px',
                        marginBottom: '20px'
                    }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-on-status)', fontWeight: '600' }}>
                            ⚠ Authorization required before making payments
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label className="engraved" style={{ display: 'block', marginBottom: '8px', fontSize: '0.6rem' }}>
                            AUTHORIZATION AMOUNT (USDC)
                        </label>
                        <input
                            type="number"
                            value={delegationAmount}
                            onChange={(e) => setDelegationAmount(parseFloat(e.target.value) || 0)}
                            style={{
                                width: '100%',
                                padding: '12px 15px',
                                background: 'var(--bg-inset)',
                                border: '1px solid var(--border-medium)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: '1rem'
                            }}
                            placeholder="1000"
                        />
                    </div>

                    <button
                        onClick={() => onAuthorize(delegationAmount)}
                        disabled={isAuthorizing || solBalance === 0}
                        className="btn"
                        style={{
                            width: '100%',
                            opacity: isAuthorizing || solBalance === 0 ? 0.5 : 1,
                            cursor: isAuthorizing || solBalance === 0 ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isAuthorizing ? '⏳ AUTHORIZING...' : (solBalance === 0 ? '⛽ GAS REQUIRED' : '🔐 AUTHORIZE VAULT')}
                    </button>
                </>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '20px' }}>
                <button onClick={onFundWallet} className="btn btn-success">
                    💰 FUND
                </button>
                <a
                    href={`https://solscan.io/account/${solanaWallet.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{ textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    SOLSCAN ↗
                </a>
            </div>

            {/* Manage Wallet Button */}
            {onExportWallet && (
                <button onClick={onExportWallet} className="btn" style={{ width: '100%', marginTop: '12px' }}>
                    👤 MANAGE WALLET
                </button>
            )}
        </div>
    );
}

