import { cardStyle } from '../constants';

export function StatsCard({ userStats }) {
    return (
        <div style={{ ...cardStyle, transform: 'rotate(0.3deg)' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '15px', fontSize: '14px', textTransform: 'uppercase' }}>
        // YOUR_STATS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px' }}>
                <div>
                    <div style={{ fontSize: '10px', opacity: '0.6' }}>DEPOSITED</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: "'Work Sans', sans-serif" }}>
                        ${userStats.deposited.toFixed(2)}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: '10px', opacity: '0.6' }}>SENT</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: "'Work Sans', sans-serif", color: '#dc3545' }}>
                        ${userStats.sent.toFixed(2)}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: '10px', opacity: '0.6' }}>CLAIMED</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: "'Work Sans', sans-serif", color: '#28a745' }}>
                        ${userStats.claimed.toFixed(2)}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: '10px', opacity: '0.6' }}>POINTS</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: "'Work Sans', sans-serif", color: '#ff4500' }}>
                        {(userStats.deposited + userStats.sent + userStats.claimed).toFixed(0)}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function HowToPayCard() {
    return (
        <div style={{ ...cardStyle, transform: 'rotate(-0.5deg)' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '15px', fontSize: '14px', textTransform: 'uppercase' }}>
        // HOW_TO_PAY
            </div>
            <div style={{
                background: '#f5f5f5',
                padding: '15px',
                border: '1px solid #1a1a1a',
                marginBottom: '15px',
                fontFamily: 'monospace'
            }}>
                @BOT_WASSY SEND @FRIEND $5
            </div>
            <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
                Post on X: "@BOT_WASSY SEND @USERNAME $AMOUNT" - Payments processed every 10 minutes.
            </div>
        </div>
    );
}

export function Footer() {
    return (
        <div style={{ ...cardStyle, textAlign: 'center', transform: 'rotate(-0.3deg)' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '15px', fontSize: '14px', textTransform: 'uppercase' }}>
        // FOLLOW_US
            </div>
            <a
                href="https://twitter.com/bot_wassy"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#1a1a1a',
                    color: 'white',
                    padding: '10px 20px',
                    textDecoration: 'none',
                    fontFamily: "'Courier Prime', monospace",
                    fontWeight: 'bold',
                    fontSize: '14px'
                }}
            >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                @BOT_WASSY
            </a>
            <div style={{ fontSize: '10px', opacity: '0.5', marginTop: '15px' }}>
                © 2026 Wassy Pay • Built on Solana
            </div>
        </div>
    );
}
