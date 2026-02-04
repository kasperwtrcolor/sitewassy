import { useState, useEffect, useRef } from 'react';
import '../index.css';

export function LoginScreen({ onLogin, theme, onToggleTheme }) {
    const [showTerms, setShowTerms] = useState(false);

    // Immersive Scroll Animation Logic
    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -10% 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                } else {
                    entry.target.classList.remove('visible');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal-element').forEach(el => observer.observe(el));

        // Parallax & Dynamic Scaling on Scroll
        const handleScroll = () => {
            const scrolled = window.pageYOffset;
            const slices = document.querySelectorAll('.aerogel-slice');

            slices.forEach((slice, index) => {
                const speed = (index + 1) * 0.2;
                slice.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.05}deg)`;
            });

            const sections = document.querySelectorAll('section');
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const viewHeight = window.innerHeight;
                const distanceToCenter = Math.abs(rect.top + rect.height / 2 - viewHeight / 2);
                const maxDistance = viewHeight;
                const progress = Math.min(distanceToCenter / maxDistance, 1);

                const scale = 1 - (progress * 0.1);
                const opacity = 1 - (progress * 1.2);

                const element = section.querySelector('.reveal-element');
                if (element && section.id !== 'hero') {
                    element.style.transform = `scale(${scale}) translateY(${progress * 40}px)`;
                    element.style.opacity = Math.max(opacity, 0);
                }
            });
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className="immersive-container">
            {/* Background Slices */}
            <div className="strata-bg">
                <div className="aerogel-slice" style={{ width: '60vw', height: '60vw', top: '-10%', left: '-10%', background: 'var(--accent)' }}></div>
                <div className="aerogel-slice" style={{ width: '40vw', height: '40vw', bottom: '10%', right: '-5%', background: 'var(--accent-secondary)' }}></div>
            </div>

            {/* Navigation */}
            <nav style={{
                position: 'fixed',
                top: 0,
                width: '100%',
                padding: '1.5rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 100,
                backdropFilter: 'blur(10px)',
                background: 'rgba(var(--bg-primary-rgb), 0.5)',
                borderBottom: '1px solid var(--border-subtle)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 700, fontSize: '1.2rem' }}>
                    <div style={{ width: '32px', height: '32px', background: 'var(--accent)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: '#000', fontWeight: 900 }}>W</div>
                    WASSY PAY
                </div>
                <div className="mono text-muted" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="status-light"></span> SOLANA_MAINNET
                </div>
                <button
                    onClick={onToggleTheme}
                    className="btn"
                    style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', fontSize: '0.75rem', padding: '8px 16px' }}
                >
                    {theme === 'dark' ? 'LIGHT MODE' : 'DARK MODE'}
                </button>
            </nav>

            <main>
                {/* Hero Section */}
                <section id="hero" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 20px' }}>
                    <div className="reveal-element visible">
                        <p className="mono label-subtle" style={{ marginBottom: '1rem' }}>// SOCIAL PAYMENTS REIMAGINED</p>
                        <h1 style={{ fontSize: 'clamp(3rem, 10vw, 7rem)', lineHeight: 0.9, marginBottom: '1.5rem' }}>WASSY PAY</h1>
                        <p className="text-secondary" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.4rem)', maxWidth: '600px', margin: '0 auto 3rem' }}>
                            Send USDC to anyone on X with a simple post. No banks, no accounts, no friction.
                        </p>

                        <div style={{ position: 'relative', width: '280px', height: '280px', margin: '0 auto 4rem' }}>
                            <div className="glass-panel" style={{ width: '100%', height: '100%', borderRadius: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 40px 100px var(--glow)' }}>
                                <div style={{ width: '120px', height: '70px', background: '#111', borderRadius: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                                    <div style={{ width: '12px', height: '12px', background: 'var(--accent)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent)' }}></div>
                                    <div style={{ width: '12px', height: '12px', background: 'var(--accent)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent)' }}></div>
                                </div>
                                <div style={{ fontSize: '2rem', marginTop: '20px', fontWeight: 900, color: 'var(--text-primary)' }}>X</div>
                            </div>
                            <div className="mono glass-panel" style={{ position: 'absolute', top: '-10px', right: '-80px', padding: '10px 15px', borderRadius: '12px', background: 'var(--accent-secondary)', color: '#fff', fontSize: '0.7rem', border: 'none', boxShadow: '0 10px 30px rgba(29, 155, 240, 0.3)' }}>
                                @bot_wassy send @friend $100
                            </div>
                            <div className="mono glass-panel" style={{ position: 'absolute', bottom: '20px', left: '-80px', padding: '10px 15px', borderRadius: '12px', background: 'var(--success)', color: '#fff', fontSize: '0.7rem', border: 'none', boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)' }}>
                                @bot_wassy claim
                            </div>
                        </div>

                        <button onClick={onLogin} className="btn btn-primary" style={{ padding: '16px 48px', fontSize: '1.1rem' }}>
                            LOGIN WITH X
                        </button>
                    </div>
                </section>

                {/* How it Works Strata */}
                <section id="how-it-works" style={{ padding: '100px 20px' }}>
                    <div className="container reveal-element" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <h2 className="mono label-subtle" style={{ marginBottom: '4rem', textAlign: 'center' }}>// HOW_IT_WORKS</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                            <div className="glass-panel" style={{ display: 'grid', gridTemplateColumns: 'minmax(60px, auto) 1fr 1.5fr', gap: '40px', alignItems: 'start' }}>
                                <div style={{ fontSize: '4rem', fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>1</div>
                                <div>
                                    <h3 style={{ marginBottom: '8px' }}>FUND</h3>
                                    <p className="mono text-muted">INITIATE_WALLET_LINK</p>
                                </div>
                                <p className="text-secondary">Connect your X account and Solana wallet. Deposit USDC to start sending payments instantly without leaving your timeline.</p>
                            </div>

                            <div className="glass-panel" style={{ display: 'grid', gridTemplateColumns: 'minmax(60px, auto) 1fr 1.5fr', gap: '40px', alignItems: 'start' }}>
                                <div style={{ fontSize: '4rem', fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>2</div>
                                <div>
                                    <h3 style={{ marginBottom: '8px' }}>TAG</h3>
                                    <p className="mono text-muted">COMMAND_POST_TRIGGER</p>
                                </div>
                                <p className="text-secondary">Post on X: <span style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>"@bot_wassy send @username $amount"</span> — that's it. No apps to download, no forms to fill.</p>
                            </div>

                            <div className="glass-panel" style={{ display: 'grid', gridTemplateColumns: 'minmax(60px, auto) 1fr 1.5fr', gap: '40px', alignItems: 'start' }}>
                                <div style={{ fontSize: '4rem', fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>3</div>
                                <div>
                                    <h3 style={{ marginBottom: '8px' }}>CLAIM</h3>
                                    <p className="mono text-muted">SETTLEMENT_COMPLETION</p>
                                </div>
                                <p className="text-secondary">Recipient sees the payment notification, clicks claim, and USDC transfers instantly on the Solana blockchain.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section style={{ padding: '100px 20px' }}>
                    <div className="container reveal-element" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <h2 className="mono label-subtle" style={{ marginBottom: '4rem' }}>// PROTOCOL_FEATURES</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1px', background: 'var(--border-subtle)', border: '1px solid var(--border-subtle)' }}>
                            <div className="glass-panel" style={{ borderRadius: 0, border: 'none' }}>
                                <p className="mono label-subtle" style={{ marginBottom: '1rem' }}>SETTLEMENT LAYER</p>
                                <h3 style={{ color: 'var(--text-primary)' }}>Solana Mainnet</h3>
                            </div>
                            <div className="glass-panel" style={{ borderRadius: 0, border: 'none' }}>
                                <p className="mono label-subtle" style={{ marginBottom: '1rem' }}>CURRENCY</p>
                                <h3 style={{ color: 'var(--accent)' }}>USDC (SPL Token)</h3>
                            </div>
                            <div className="glass-panel" style={{ borderRadius: 0, border: 'none' }}>
                                <p className="mono label-subtle" style={{ marginBottom: '1rem' }}>SCAN INTERVAL</p>
                                <h3 style={{ color: 'var(--text-primary)' }}>30 Minutes</h3>
                            </div>
                            <div className="glass-panel" style={{ borderRadius: 0, border: 'none' }}>
                                <p className="mono label-subtle" style={{ marginBottom: '1rem' }}>SECURITY</p>
                                <h3 style={{ color: 'var(--text-primary)' }}>Non-custodial delegation</h3>
                            </div>
                        </div>

                        <div className="glass-panel" style={{ marginTop: '4rem', padding: '40px', background: 'var(--accent)', color: '#000', border: 'none' }}>
                            <h3 style={{ marginBottom: '10px' }}>Funds stay in YOUR wallet until claimed.</h3>
                            <p style={{ fontWeight: 500, opacity: 0.9 }}>You authorize a spending limit, and the protocol handles transfers only when payments are verified on X. Total sovereignty.</p>
                        </div>
                    </div>
                </section>

                {/* Architecture & Flow */}
                <section style={{ padding: '100px 20px' }}>
                    <div className="container reveal-element" style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
                        <h2 className="mono label-subtle" style={{ marginBottom: '4rem' }}>// SYSTEM_ARCHITECTURE</h2>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <div className="glass-panel" style={{ padding: '15px 30px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 700 }}>X_PROTOCOL</div>
                            <div style={{ color: 'var(--text-muted)' }}>→</div>
                            <div className="glass-panel" style={{ padding: '15px 30px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 700 }}>SCANNER_ENGINE</div>
                            <div style={{ color: 'var(--text-muted)' }}>→</div>
                            <div className="glass-panel" style={{ padding: '15px 30px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 700 }}>SOL_NETWORK</div>
                            <div style={{ color: 'var(--text-muted)' }}>→</div>
                            <div className="glass-panel" style={{ padding: '15px 30px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 700 }}>USDC_SETTLEMENT</div>
                        </div>
                        <div style={{ marginTop: '60px', opacity: 0.5 }} className="mono">
                            @bot_wassy • Built on Solana • © 2026
                        </div>
                    </div>
                </section>

                {/* Terms Box */}
                <section style={{ padding: '100px 20px', display: showTerms ? 'flex' : 'none' }}>
                    <div className="container reveal-element glass-panel" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left', maxHeight: '70vh', overflowY: 'auto' }}>
                        <h2 className="mono label-subtle" style={{ marginBottom: '2rem' }}>// TERMS_AND_CONDITIONS</h2>

                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            <h4 style={{ color: 'var(--accent)', marginTop: '20px', marginBottom: '8px' }}>1. Service Description</h4>
                            <p>WassyPay is a non-custodial social payment service built on Solana. Users maintain full control of their wallets and funds at all times.</p>

                            <h4 style={{ color: 'var(--accent)', marginTop: '20px', marginBottom: '8px' }}>2. No Financial Advice</h4>
                            <p>This service does not provide financial, investment, or legal advice. Users are responsible for their own financial decisions.</p>

                            <h4 style={{ color: 'var(--accent)', marginTop: '20px', marginBottom: '8px' }}>3. Risk Acknowledgment</h4>
                            <p>Cryptocurrency transactions are irreversible. Users acknowledge the risks associated with blockchain transactions including but not limited to: network fees, transaction failures, and price volatility.</p>

                            <h4 style={{ color: 'var(--accent)', marginTop: '20px', marginBottom: '8px' }}>4. User Responsibility</h4>
                            <p>Users are responsible for securing their wallet credentials, ensuring sufficient funds, and verifying recipient addresses before sending.</p>
                        </div>

                        <button onClick={() => setShowTerms(false)} className="btn btn-primary" style={{ width: '100%', marginTop: '3rem' }}>
                            I UNDERSTAND
                        </button>
                    </div>
                </section>

                <div style={{ textAlign: 'center', paddingBottom: '60px' }}>
                    <button onClick={() => setShowTerms(true)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}>
                        Terms & Conditions
                    </button>
                </div>
            </main>
        </div>
    );
}

export function LoadingScreen({ theme, onToggleTheme }) {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk', sans-serif" }}>
            <div className="animate-fade" style={{ textAlign: 'center' }}>
                <div className="tx-spinner" style={{ width: '40px', height: '40px', margin: '0 auto 20px' }}></div>
                <div className="mono" style={{ color: 'var(--accent-secondary)', fontSize: '0.8rem', letterSpacing: '0.2em' }}>INITIALIZING_SECURE_LAYER...</div>
            </div>
        </div>
    );
}
