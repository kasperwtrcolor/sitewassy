import { cardStyle, buttonStyle, successButtonStyle } from '../constants';

export function PendingClaims({ claims, onClaim, loading }) {
    if (!claims || claims.length === 0) return null;

    return (
        <div style={{
            ...cardStyle,
            border: '2px solid #ff4500',
            transform: 'rotate(-0.3deg)',
            boxShadow: '8px 8px 0px #ff4500'
        }}>
            <div style={{
                fontWeight: 'bold',
                marginBottom: '15px',
                fontSize: '14px',
                textTransform: 'uppercase',
                color: '#ff4500'
            }}>
                💸 PENDING CLAIMS ({claims.length})
            </div>

            {claims.map((claim) => (
                <div key={claim.tweet_id} style={{
                    background: '#fff3cd',
                    border: '1px solid #ffc107',
                    padding: '15px',
                    marginBottom: '10px'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '10px',
                        flexWrap: 'wrap',
                        gap: '10px'
                    }}>
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: '5px' }}>
                                ${claim.amount}
                            </div>
                            <div style={{ fontSize: '12px', opacity: '0.7' }}>
                                From: @{claim.sender || claim.sender_username}
                            </div>
                        </div>
                        <button
                            onClick={() => onClaim(claim)}
                            disabled={loading}
                            style={{
                                ...successButtonStyle,
                                opacity: loading ? 0.7 : 1,
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? '⏳ CLAIMING...' : '💰 CLAIM'}
                        </button>
                    </div>

                    {claim.tweet_id && (
                        <a
                            href={`https://twitter.com/i/status/${claim.tweet_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                fontSize: '10px',
                                color: '#1a1a1a',
                                textDecoration: 'underline'
                            }}
                        >
                            View tweet →
                        </a>
                    )}
                </div>
            ))}
        </div>
    );
}
