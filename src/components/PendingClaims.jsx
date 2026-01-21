import '../index.css';

export function PendingClaims({ claims, onClaim, loading }) {
    if (!claims || claims.length === 0) return null;

    // Helper to determine sender fund status
    const getSenderStatus = (claim) => {
        // Check if sender fund info is available from backend
        if (claim.sender_authorized === false) {
            return { ok: false, message: 'Sender needs to authorize vault' };
        }
        if (claim.sender_balance !== undefined && claim.sender_balance < claim.amount) {
            return { ok: false, message: 'Sender has insufficient funds' };
        }
        if (claim.sender_authorized === true && claim.sender_balance >= claim.amount) {
            return { ok: true, message: 'Sender is funded' };
        }
        // Status unknown (backend doesn't provide this info yet)
        return null;
    };

    return (
        <div className="plate" style={{
            padding: '30px',
            marginBottom: '20px',
            position: 'relative',
            borderColor: 'rgba(212, 175, 55, 0.3)'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px'
            }}>
                <span style={{ fontSize: '1.5rem' }}>💸</span>
                <span className="engraved" style={{ color: '#d4af37', fontSize: '0.8rem' }}>
                    PENDING CLAIMS ({claims.length})
                </span>
            </div>

            {claims.map((claim) => {
                const senderStatus = getSenderStatus(claim);
                const canClaim = !senderStatus || senderStatus.ok;

                return (
                    <div key={claim.tweet_id} className="inset-panel" style={{ marginBottom: '15px', padding: '20px' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '15px'
                        }}>
                            <div>
                                <div className="amount-display" style={{ fontSize: '2rem' }}>
                                    ${claim.amount}
                                    <span className="currency">USDC</span>
                                </div>
                                <div className="handle-badge" style={{ marginTop: '10px' }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '6px' }}>
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                                    </svg>
                                    @{claim.sender || claim.sender_username}
                                </div>

                                {/* Sender Fund Status */}
                                {senderStatus && (
                                    <div style={{
                                        marginTop: '10px',
                                        fontSize: '0.75rem',
                                        padding: '6px 10px',
                                        borderRadius: '6px',
                                        background: senderStatus.ok
                                            ? 'rgba(74, 222, 128, 0.1)'
                                            : 'rgba(245, 158, 11, 0.1)',
                                        border: `1px solid ${senderStatus.ok
                                            ? 'rgba(74, 222, 128, 0.3)'
                                            : 'rgba(245, 158, 11, 0.3)'}`,
                                        color: senderStatus.ok ? '#4ade80' : '#f59e0b'
                                    }}>
                                        {senderStatus.ok ? '✓' : '⚠'} {senderStatus.message}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => onClaim(claim)}
                                disabled={loading || !canClaim}
                                className="btn btn-gold"
                                style={{
                                    opacity: (loading || !canClaim) ? 0.7 : 1,
                                    cursor: (loading || !canClaim) ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {loading ? '⏳ CLAIMING...' : (canClaim ? '💰 CLAIM NOW' : '⏳ WAITING')}
                            </button>
                        </div>

                        {claim.tweet_id && (
                            <a
                                href={`https://twitter.com/i/status/${claim.tweet_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'inline-block',
                                    marginTop: '12px',
                                    fontSize: '0.7rem',
                                    color: '#31d7ff',
                                    textDecoration: 'none'
                                }}
                            >
                                View source tweet →
                            </a>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
