import { useState, useEffect, useRef } from 'react';
import '../index.css';
import { TermsModal } from './Cards';

export function LoginScreen({ onLogin, theme, onToggleTheme }) {
    const [showTerms, setShowTerms] = useState(false);
    const howItWorksRef = useRef(null);

    // Scroll animation observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        // Observe all scroll-animated elements
        const elements = document.querySelectorAll('.scroll-fade-in, .scroll-slide-left, .scroll-slide-right');
        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-primary)',
            backgroundImage: 'radial-gradient(circle at 50% 50%, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
            padding: '40px 20px',
            fontFamily: "'Space Grotesk', sans-serif",
            overflow: 'hidden'
        }}>
            {/* Theme Toggle */}
            <button className="theme-toggle" onClick={onToggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

                {/* Main Hero Plate */}
                <div className="plate animate-fade-in" style={{ padding: '60px 40px', marginBottom: '40px', position: 'relative' }}>
                    {/* Screws */}
                    <div className="screw tl"></div>
                    <div className="screw tr"></div>
                    <div className="screw bl"></div>
                    <div className="screw br"></div>

                    {/* Background Label */}
                    <div style={{
                        position: 'absolute',
                        bottom: '-50px',
                        right: '-20px',
                        fontSize: '12rem',
                        fontWeight: '900',
                        color: theme === 'dark' ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.02)',
                        pointerEvents: 'none',
                        userSelect: 'none'
                    }}>WASSY</div>

                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                        <div style={{
                            fontFamily: "'Fredoka', sans-serif",
                            fontWeight: 700,
                            fontSize: '1.4rem',
                            letterSpacing: '0.02em',
                            color: 'var(--text-primary)'
                        }}>
                            Wassy Pay
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '10px', letterSpacing: '2px', color: '#31d7ff' }}>
                            <span className="status-light" style={{ marginRight: '8px' }}></span>
                            SOLANA_MAINNET
                        </div>
                    </div>

                    {/* Hero Content */}
                    <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                        <h1 className="animate-fade-in delay-1" style={{
                            fontSize: 'clamp(2.5rem, 8vw, 5rem)',
                            fontWeight: 700,
                            lineHeight: 0.9,
                            marginBottom: '20px',
                            color: 'var(--text-primary)',
                            fontFamily: "'JetBrains Mono', monospace"
                        }}>
                            SOCIAL PAYMENTS<br />
                            <span style={{ color: '#d4af37' }}>REIMAGINED</span>
                        </h1>

                        <p className="animate-fade-in delay-2" style={{
                            color: 'var(--text-secondary)',
                            fontSize: '1.1rem',
                            maxWidth: '600px',
                            margin: '0 auto 30px',
                            lineHeight: 1.6
                        }}>
                            Send USDC to anyone on X with a simple post. No banks, no accounts, no friction.
                            Just tag <span style={{ color: '#31d7ff' }}>@bot_wassy</span> and your payment flows through Solana.
                        </p>

                        {/* Command Preview */}
                        <div className="animate-scale delay-3" style={{
                            background: 'var(--bg-inset)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '12px',
                            padding: '20px 30px',
                            display: 'inline-block',
                            marginBottom: '30px',
                            boxShadow: theme === 'dark' ? 'inset 4px 4px 8px rgba(0,0,0,0.6), inset -2px -2px 5px rgba(255,255,255,0.02)' : 'none'
                        }}>
                            <span className="mono" style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                                <span style={{ color: 'var(--glow)' }}>@bot_wassy</span> send <span style={{ color: 'var(--accent-gold)' }}>@friend</span> <span style={{ color: 'var(--success)' }}>$100</span>
                            </span>
                        </div>

                        <br />

                        <button onClick={onLogin} className="btn btn-gold animate-fade-in delay-4" style={{ fontSize: '1rem', padding: '18px 48px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '10px', verticalAlign: 'middle' }}>
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                            </svg>
                            Login with X
                        </button>
                    </div>
                </div>

                {/* How It Works Section */}
                <div style={{ marginBottom: '40px' }}>
                    <h2 className="engraved scroll-fade-in" style={{ textAlign: 'center', marginBottom: '30px', fontSize: '0.8rem' }}>
            // HOW_IT_WORKS
                    </h2>

                    <div className="grid-2">
                        {/* Left Column - Flow Steps */}
                        <div>
                            {/* Step 1: FUND */}
                            <div className="flow-step scroll-slide-left scroll-delay-1">
                                <div className="step-number">1</div>
                                <div className="step-content">
                                    <h4 style={{ color: 'var(--glow)', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>FUND</h4>
                                    <p style={{ color: 'var(--text-secondary)' }}>Connect your X account and Solana wallet. Deposit USDC to start sending payments.</p>
                                </div>
                            </div>

                            {/* Step 2: TAG */}
                            <div className="flow-step scroll-slide-left scroll-delay-2">
                                <div className="step-number">2</div>
                                <div className="step-content">
                                    <h4 style={{ color: 'var(--accent-gold)', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>TAG</h4>
                                    <p style={{ color: 'var(--text-secondary)' }}>Post on X: "@bot_wassy send @username $amount" — that's it. No apps, no forms.</p>
                                </div>
                            </div>

                            {/* Step 3: CLAIM */}
                            <div className="flow-step scroll-slide-left scroll-delay-3">
                                <div className="step-number">3</div>
                                <div className="step-content">
                                    <h4 style={{ color: 'var(--success)', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>CLAIM</h4>
                                    <p style={{ color: 'var(--text-secondary)' }}>Recipient sees the payment, clicks claim, and USDC transfers instantly on Solana.</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Features */}
                        <div className="plate animate-slide-right delay-2" style={{ padding: '30px' }}>
                            <h3 className="engraved" style={{ marginBottom: '20px' }}>// PROTOCOL_FEATURES</h3>

                            <div className="ledger-item">
                                <span className="label">Settlement Layer</span>
                                <span className="value highlight">Solana Mainnet</span>
                            </div>

                            <div className="ledger-item">
                                <span className="label">Currency</span>
                                <span className="value" style={{ color: '#d4af37' }}>USDC (SPL Token)</span>
                            </div>

                            <div className="ledger-item">
                                <span className="label">Scan Interval</span>
                                <span className="value">Every 30 minutes</span>
                            </div>

                            <div className="ledger-item">
                                <span className="label">Security</span>
                                <span className="value">Non-custodial delegation</span>
                            </div>

                            <div className="ledger-item">
                                <span className="label">Spam Protection</span>
                                <span className="value">Duplicate + RT filtering</span>
                            </div>

                            <div style={{
                                marginTop: '20px',
                                padding: '15px',
                                background: 'var(--bg-inset)',
                                borderRadius: '8px',
                                border: '1px solid var(--border-subtle)'
                            }}>
                                <p className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                    Funds stay in YOUR wallet until claimed. You authorize a spending limit, and the protocol
                                    handles transfers when payments are verified on X.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Architecture Visual */}
                <div className="plate animate-fade-in" style={{ padding: '40px', textAlign: 'center' }}>
                    <h3 className="engraved" style={{ marginBottom: '30px' }}>// ARCHITECTURE</h3>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '20px',
                        flexWrap: 'wrap'
                    }}>
                        {/* X Platform */}
                        <div className="inset-panel" style={{ textAlign: 'center', minWidth: '120px' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>𝕏</div>
                            <div className="engraved">X Post</div>
                        </div>

                        <div style={{ color: 'var(--glow)', fontSize: '1.5rem' }}>→</div>

                        {/* Backend */}
                        <div className="inset-panel" style={{ textAlign: 'center', minWidth: '120px' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⚙️</div>
                            <div className="engraved">Scanner</div>
                        </div>

                        <div style={{ color: 'var(--accent-gold)', fontSize: '1.5rem' }}>→</div>

                        {/* Solana */}
                        <div className="inset-panel" style={{ textAlign: 'center', minWidth: '120px' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>◎</div>
                            <div className="engraved">Solana</div>
                        </div>

                        <div style={{ color: 'var(--success)', fontSize: '1.5rem' }}>→</div>

                        {/* USDC */}
                        <div className="inset-panel" style={{ textAlign: 'center', minWidth: '120px' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💵</div>
                            <div className="engraved">USDC Sent</div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    <a
                        href="https://twitter.com/bot_wassy"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--glow)', textDecoration: 'none' }}
                    >
                        @bot_wassy
                    </a>
                    <span style={{ margin: '0 15px' }}>•</span>
                    Built on Solana
                    <span style={{ margin: '0 15px' }}>•</span>
                    © 2026
                    <div style={{ marginTop: '15px' }}>
                        <button
                            onClick={() => setShowTerms(true)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                textDecoration: 'underline'
                            }}
                        >
                            Terms & Conditions
                        </button>
                    </div>
                </div>
            </div>

            {/* Terms Modal */}
            <TermsModal show={showTerms} onClose={() => setShowTerms(false)} />
        </div>
    );
}

export function LoadingScreen({ theme, onToggleTheme }) {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Space Grotesk', sans-serif"
        }}>
            {/* Theme Toggle */}
            <button className="theme-toggle" onClick={onToggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <div className="animate-scale" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>◎</div>
                <div style={{ color: 'var(--glow)', fontSize: '0.8rem', letterSpacing: '0.2em' }}>INITIALIZING...</div>
            </div>
        </div>
    );
}
