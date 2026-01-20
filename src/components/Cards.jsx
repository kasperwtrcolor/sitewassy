import '../index.css';

export function StatsCard({ userStats }) {
    return (
        <div className="plate" style={{ padding: '30px', marginBottom: '20px', position: 'relative' }}>
            <div className="engraved" style={{ marginBottom: '20px' }}>// YOUR_STATS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '20px' }}>
                <div className="inset-panel" style={{ textAlign: 'center', padding: '20px' }}>
                    <div className="engraved" style={{ fontSize: '0.55rem', marginBottom: '8px' }}>DEPOSITED</div>
                    <div className="mono" style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                        ${userStats.deposited.toFixed(2)}
                    </div>
                </div>
                <div className="inset-panel" style={{ textAlign: 'center', padding: '20px' }}>
                    <div className="engraved" style={{ fontSize: '0.55rem', marginBottom: '8px' }}>SENT</div>
                    <div className="mono" style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>
                        ${userStats.sent.toFixed(2)}
                    </div>
                </div>
                <div className="inset-panel" style={{ textAlign: 'center', padding: '20px' }}>
                    <div className="engraved" style={{ fontSize: '0.55rem', marginBottom: '8px' }}>CLAIMED</div>
                    <div className="mono" style={{ fontSize: '1.5rem', fontWeight: '700', color: '#4ade80' }}>
                        ${userStats.claimed.toFixed(2)}
                    </div>
                </div>
                <div className="inset-panel" style={{ textAlign: 'center', padding: '20px' }}>
                    <div className="engraved" style={{ fontSize: '0.55rem', marginBottom: '8px' }}>POINTS</div>
                    <div className="mono" style={{ fontSize: '1.5rem', fontWeight: '700', color: '#d4af37' }}>
                        {(userStats.deposited + userStats.sent + userStats.claimed).toFixed(0)}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function HowToPayCard() {
    return (
        <div className="plate" style={{ padding: '30px', marginBottom: '20px', position: 'relative' }}>
            <div className="engraved" style={{ marginBottom: '20px' }}>// HOW_TO_PAY</div>
            <div className="inset-panel" style={{ textAlign: 'center', padding: '20px', marginBottom: '15px' }}>
                <span className="mono" style={{ fontSize: '1rem' }}>
                    <span style={{ color: '#31d7ff' }}>@bot_wassy</span>
                    <span style={{ color: '#888' }}> send </span>
                    <span style={{ color: '#d4af37' }}>@friend</span>
                    <span style={{ color: '#4ade80' }}> $5</span>
                </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#666', textAlign: 'center', lineHeight: 1.6 }}>
                Post on X with the format above. Payments are scanned every 30 minutes.
            </p>
        </div>
    );
}

export function Footer() {
    return (
        <div style={{ textAlign: 'center', padding: '30px', color: '#444' }}>
            <a
                href="https://twitter.com/bot_wassy"
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{ marginBottom: '15px' }}
            >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="white" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                @BOT_WASSY
            </a>
            <div className="mono" style={{ fontSize: '0.65rem', marginTop: '15px' }}>
                © 2026 WASSY PAY • BUILT ON SOLANA
            </div>
        </div>
    );
}
