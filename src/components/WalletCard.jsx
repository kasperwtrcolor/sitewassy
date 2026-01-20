import { cardStyle, buttonStyle, successButtonStyle, inputStyle, warningBoxStyle, successBoxStyle, errorBoxStyle } from '../constants';

export function WalletCard({
    solanaWallet,
    walletBalance,
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
    if (!solanaWallet) {
        return (
            <div style={{ ...cardStyle, transform: 'rotate(0.5deg)' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '15px', fontSize: '14px', textTransform: 'uppercase' }}>
          // WALLET_STATUS
                </div>
                <div style={{ ...warningBoxStyle, textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>LOADING WALLET...</div>
                    <div style={{ fontSize: '12px', opacity: '0.7' }}>
                        Your embedded Solana wallet is being loaded from Privy.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ ...cardStyle, transform: 'rotate(0.5deg)' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '15px', fontSize: '14px', textTransform: 'uppercase' }}>
        // WALLET_STATUS
            </div>

            {/* Balance */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', opacity: '0.6', marginBottom: '5px' }}>BALANCE</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: "'Work Sans', sans-serif" }}>
                    ${walletBalance.toFixed(2)}
                </div>
                <div style={{ fontSize: '12px', opacity: '0.6' }}>{walletBalance.toFixed(6)} USDC</div>
            </div>

            {/* Address */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', opacity: '0.6', marginBottom: '5px' }}>ADDRESS</div>
                <div style={{ fontSize: '10px', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                    {solanaWallet.address}
                </div>
            </div>

            {/* Authorization Section */}
            {isDelegated ? (
                <div style={{ ...successBoxStyle, marginBottom: '15px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>✓ AUTHORIZED</div>
                    <div style={{ fontSize: '12px' }}>
                        Vault can move up to ${delegationAmount} USDC
                    </div>
                </div>
            ) : (
                <>
                    <div style={{ ...warningBoxStyle, marginBottom: '15px' }}>
                        <div style={{ fontSize: '12px' }}>
                            ⚠ Authorization required before making payments
                        </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontSize: '12px', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            AUTHORIZATION AMOUNT (USDC)
                        </label>
                        <input
                            type="number"
                            value={delegationAmount}
                            onChange={(e) => setDelegationAmount(parseFloat(e.target.value) || 0)}
                            style={inputStyle}
                            placeholder="1000"
                        />
                        <div style={{ fontSize: '10px', opacity: '0.6', marginTop: '5px' }}>
                            Maximum amount vault can move from your wallet
                        </div>
                    </div>

                    <button
                        onClick={() => onAuthorize(delegationAmount)}
                        disabled={isAuthorizing || walletBalance === 0}
                        style={{
                            ...buttonStyle,
                            width: '100%',
                            opacity: isAuthorizing || walletBalance === 0 ? 0.5 : 1,
                            cursor: isAuthorizing || walletBalance === 0 ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isAuthorizing ? '⏳ AUTHORIZING...' : '🔐 AUTHORIZE VAULT'}
                    </button>
                </>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button
                    onClick={onFundWallet}
                    style={{ ...successButtonStyle, flex: 1 }}
                >
                    💰 FUND WALLET
                </button>
                <a
                    href={`https://solscan.io/account/${solanaWallet.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'transparent',
                        border: '1px solid #1a1a1a',
                        color: '#1a1a1a',
                        padding: '12px 20px',
                        fontFamily: "'Courier Prime', monospace",
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        textDecoration: 'none',
                        fontSize: '14px'
                    }}
                >
                    VIEW ON SOLSCAN
                </a>
            </div>

            {/* Manage Wallet Button */}
            {onExportWallet && (
                <button
                    onClick={onExportWallet}
                    style={{ ...buttonStyle, width: '100%', marginTop: '10px' }}
                >
                    👤 MANAGE WALLET
                </button>
            )}

            {/* Error/Success Messages */}
            {error && <div style={errorBoxStyle}>{error}</div>}
            {success && <div style={successBoxStyle}>{success}</div>}
        </div>
    );
}
