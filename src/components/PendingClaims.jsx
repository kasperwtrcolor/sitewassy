import '../index.css';

export function PendingClaims({ claims, onClaim, loading }) {
    if (!claims || claims.length === 0) return null;

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

            {claims.map((claim) => (
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
                        </div>
                        <button
                            onClick={() => onClaim(claim)}
                            disabled={loading}
                            className="btn btn-gold"
                            style={{
                                opacity: loading ? 0.7 : 1,
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? '⏳ CLAIMING...' : '💰 CLAIM NOW'}
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
            ))}
        </div>
    );
}
