import '../index.css';

export function WalletCard({
    solanaWallet,
    evmWallet,
    onExportEvmWallet,
    walletBalance,
    wassyBalance,
    solBalance,
    isDelegated,
    delegationAmount,
    setDelegationAmount,
    isAuthorizing,
    onAuthorize,
    onFundWallet,
    onExportWallet,
    onWithdraw,
}) {
    // Gas sponsorship is enabled, no need for manual SOL check for authorization
    const needsGas = false;

    if (!solanaWallet) {
        return (
            <div className="glass-panel" style={{ padding: '30px', marginBottom: '20px' }}>
                <div className="mono label-subtle" style={{ marginBottom: '15px' }}>// WALLET_STATUS</div>
                <div className="inset-panel" style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="tx-spinner" style={{ margin: '0 auto 15px' }}></div>
                    <div style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>INITIALIZING_SECURE_VAULT...</div>
                    <div className="text-secondary" style={{ fontSize: '0.8rem' }}>
                        Loading your embedded Solana wallet...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-panel wallet-card" style={{ padding: '30px', marginBottom: '20px' }}>
            <div className="mono label-subtle" style={{ marginBottom: '20px' }}>// WALLET_STATUS</div>

            {/* Balance Display */}
            <div className="inset-panel" style={{ marginBottom: '25px' }}>
                <div className="mono label-subtle" style={{ marginBottom: '8px', fontSize: '0.6rem' }}>CONNECTED_BALANCE</div>

                {/* USDC Balance */}
                <div className="mono" style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '5px' }}>
                    ${walletBalance.toFixed(2)}
                    <span className="text-muted" style={{ fontSize: '1rem', marginLeft: '10px' }}>USDC</span>
                </div>

                {/* WASSY Balance */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '2px solid var(--accent)',
                        background: 'var(--bg-inset)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <img src="/favicon.jpg" alt="WASSY" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div className="mono" style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--accent)' }}>
                        {new Intl.NumberFormat().format(Math.floor(wassyBalance))}
                        <span style={{ fontSize: '0.7rem', marginLeft: '5px', opacity: 0.8 }}>$WASSY</span>
                    </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }} className="mono">
                    <span>{walletBalance.toFixed(4)} USDC_NATIVE</span>
                    <span style={{ color: needsGas ? 'var(--error)' : 'var(--text-muted)' }}>GAS: {solBalance.toFixed(4)} SOL</span>
                </div>
            </div>

            {/* SOL Gas Warning */}
            {needsGas && (
                <div className="glass-panel" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'var(--error)', padding: '15px', marginBottom: '20px', borderRadius: '16px' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.8rem', color: 'var(--error)', marginBottom: '4px' }} className="mono">⚠ LOW_FEE_VAULT</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        You need ~0.005 SOL for transaction fees.
                    </div>
                </div>
            )}

            
            {/* Address */}
            <div style={{ marginBottom: '25px' }}>
                <div className="mono label-subtle" style={{ marginBottom: '8px', fontSize: '0.6rem' }}>SOLANA WALLET</div>
                <div className="inset-panel" style={{ padding: '12px 15px', fontSize: '0.7rem' }}>
                    <span className="mono text-glow" style={{ wordBreak: 'break-all' }}>{solanaWallet?.address}</span>
                </div>
                
                {evmWallet && (
                    <>
                        <div className="mono label-subtle" style={{ marginTop: '15px', marginBottom: '8px', fontSize: '0.6rem' }}>EVM WALLET (INK / BASE)</div>
                        <div className="inset-panel" style={{ padding: '12px 15px', fontSize: '0.7rem' }}>
                            <span className="mono text-glow" style={{ wordBreak: 'break-all' }}>{evmWallet.address}</span>
                        </div>
                    </>
                )}
            </div>


            {/* Authorization Section */}
            {isDelegated ? (
                <div className="glass-panel" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'var(--success)', padding: '20px', marginBottom: '20px', borderRadius: '20px' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.8rem', color: 'var(--success)', marginBottom: '8px' }} className="mono">✓ VAULT_AUTHORIZED</div>
                    <div style={{ fontSize: '0.9rem', marginBottom: '15px' }}>
                        Limit: <span className="mono" style={{ fontWeight: '700' }}>${delegationAmount} USDC</span>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(16, 185, 129, 0.2)', paddingTop: '15px' }}>
                        <div className="mono label-subtle" style={{ fontSize: '0.6rem', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                            UPDATE_SPENDING_LIMIT
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="number"
                                value={delegationAmount}
                                onChange={(e) => setDelegationAmount(parseFloat(e.target.value) || 0)}
                                className="mono"
                                style={{
                                    flex: 1,
                                    padding: '10px 15px',
                                    background: 'var(--bg-inset)',
                                    border: '1px solid var(--border-medium)',
                                    borderRadius: '12px',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.9rem'
                                }}
                            />
                            <button
                                onClick={() => onAuthorize(delegationAmount)}
                                disabled={isAuthorizing}
                                className="btn btn-primary"
                                style={{ padding: '0', width: '45px', height: '45px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                                title="Update Spending Limit"
                            >
                                {isAuthorizing ? (
                                    <div className="tx-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="glass-panel" style={{ borderStyle: 'dashed', borderColor: 'var(--accent)', padding: '20px', marginBottom: '20px', borderRadius: '20px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: '700', marginBottom: '15px' }} className="mono">
                        ⚠ LINK_AUTHORIZATION_REQUIRED
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label className="mono label-subtle" style={{ display: 'block', marginBottom: '8px', fontSize: '0.6rem' }}>
                            LIMIT_AMOUNT (USDC)
                        </label>
                        <input
                            type="number"
                            value={delegationAmount}
                            onChange={(e) => setDelegationAmount(parseFloat(e.target.value) || 0)}
                            className="mono"
                            style={{
                                width: '100%',
                                padding: '12px 15px',
                                background: 'var(--bg-inset)',
                                border: '1px solid var(--border-medium)',
                                borderRadius: '12px',
                                color: 'var(--text-primary)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <button
                        onClick={() => onAuthorize(delegationAmount)}
                        disabled={isAuthorizing}
                        className="btn btn-accent"
                        style={{ width: '100%', borderRadius: '12px' }}
                    >
                        {isAuthorizing ? 'AUTHORIZING...' : 'AUTHORIZE VAULT'}
                    </button>
                </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
                
                <div className="mono label-subtle" style={{ fontSize: '0.6rem', textAlign: 'center', marginTop: '10px' }}>SOLANA ACTIONS</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <button onClick={onFundWallet} className="btn btn-accent" style={{ borderRadius: '12px', fontSize: '0.8rem' }}>
                        FUND SOLANA
                    </button>
                    <button onClick={onWithdraw} className="btn btn-primary" style={{ borderRadius: '12px', fontSize: '0.8rem' }}>
                        WITHDRAW SOLANA
                    </button>
                </div>
                {onExportWallet && (
                    <button onClick={onExportWallet} className="btn" style={{ width: '100%', background: 'transparent', border: '1px solid var(--border-medium)', borderRadius: '12px', fontSize: '0.75rem' }}>
                        MANAGE SOLANA KEY
                    </button>
                )}

                <div className="mono label-subtle" style={{ fontSize: '0.6rem', textAlign: 'center', marginTop: '15px' }}>EVM ACTIONS (INK)</div>
                {onExportEvmWallet && (
                    <button onClick={onExportEvmWallet} className="btn" style={{ width: '100%', background: 'transparent', border: '1px solid var(--border-medium)', borderRadius: '12px', fontSize: '0.75rem' }}>
                        EXPORT EVM KEY
                    </button>
                )}
                
            </div>
        </div>
    );
}