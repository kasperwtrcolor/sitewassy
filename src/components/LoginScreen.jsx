import { useState, useEffect } from 'react';
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
                const speed = (index + 1) * 0.15;
                slice.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.02}deg)`;
            });

            const sections = document.querySelectorAll('section');
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const viewHeight = window.innerHeight;
                const distanceToCenter = Math.abs(rect.top + rect.height / 2 - viewHeight / 2);
                const maxDistance = viewHeight;
                const progress = Math.min(distanceToCenter / maxDistance, 1);

                const scale = 1 - (progress * 0.05);
                const opacity = 1 - (progress * 1.2);

                const element = section.querySelector('.reveal-element');
                if (element && section.id !== 'hero') {
                    element.style.transform = `scale(${scale}) translateY(${progress * 20}px)`;
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
                <div className="aerogel-slice" style={{ width: '80vw', height: '80vw', top: '-20%', left: '-20%', background: 'var(--accent)', opacity: 0.5 }}></div>
                <div className="aerogel-slice" style={{ width: '60vw', height: '60vw', bottom: '0%', right: '-10%', background: 'var(--accent-secondary)', opacity: 0.4 }}></div>
            </div>

            {/* Professional Header */}
            <nav className="glass-panel animate-fade-in" style={{
                position: 'fixed',
                top: '15px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'calc(100% - 30px)',
                maxWidth: '1000px',
                padding: '12px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 100,
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: '1px solid var(--glass-border)'
            }}>
                <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: '1.3rem', color: 'var(--text-primary)' }}>
                    Wassy Pay
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <a href="https://x.com/bot_wassy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }} title="Follow @bot_wassy">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                        </svg>
                    </a>
                    <button
                        onClick={onToggleTheme}
                        className="btn"
                        style={{ background: 'transparent', border: '1px solid var(--border-subtle)', fontSize: '0.75rem', padding: '6px 12px' }}
                    >
                        {theme === 'dark' ? 'Light' : 'Dark'}
                    </button>
                    <button onClick={onLogin} className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.8rem' }}>
                        Login
                    </button>
                </div>
            </nav>

            <main>
                {/* Hero Section */}
                <section id="hero" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 20px 60px', position: 'relative' }}>
                    <div className="reveal-element visible" style={{ maxWidth: '800px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 5.5rem)', lineHeight: 1.1, marginBottom: '1.5rem', fontFamily: "'Fredoka', sans-serif", fontWeight: 700, color: 'var(--text-primary)' }}>
                            Social Payments,<br />Simplified.
                        </h1>
                        <p className="text-secondary" style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', maxWidth: '550px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
                            Send USDC and tokenized stocks ($NVDA, $AAPL, etc.) to anyone on X with a simple post. Fast, secure, cross-chain social payments. Claim on Solana, Ink, or Robinhood Chain.
                        </p>

                        <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '25px', borderRadius: '24px', margin: '0 auto 3rem', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', fontFamily: "'Fredoka', sans-serif" }}>Pay with a post</div>
                            <div className="mono" style={{ background: 'var(--bg-primary)', padding: '15px', borderRadius: '12px', color: 'var(--accent)', fontSize: 'clamp(0.8rem, 3vw, 0.9rem)', textAlign: 'left', wordBreak: 'break-word', border: '1px solid var(--border-subtle)' }}>
                                @bot_wassy send @friend $50
                            </div>
                        </div>

                        <button onClick={onLogin} className="btn btn-primary" style={{ padding: '16px 48px', fontSize: '1.1rem', borderRadius: '100px' }}>
                            Start Sending
                        </button>
                    </div>
                </section>

                {/* How It Works Section */}
                <section id="how-it-works" style={{ padding: '80px 20px' }}>
                    <div className="container reveal-element" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <h2 style={{ marginBottom: '3rem', textAlign: 'center', fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontFamily: "'Fredoka', sans-serif", color: 'var(--text-primary)' }}>How Wassy Pay Works</h2>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
                            <div className="glass-panel" style={{ padding: '40px 25px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '24px', background: 'var(--accent)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '20px' }}>1</div>
                                <h3 style={{ marginBottom: '12px', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Connect & Fund</h3>
                                <p className="text-secondary" style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>Link your X account and deposit USDC into your secure, non-custodial wallet in seconds.</p>
                            </div>

                            <div className="glass-panel" style={{ padding: '40px 25px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '24px', background: 'var(--accent)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '20px' }}>2</div>
                                <h3 style={{ marginBottom: '12px', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Post on X</h3>
                                <p className="text-secondary" style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>Just mention @bot_wassy, the recipient, and the amount (e.g., $5 of $NVDA) to authorize a payment instantly.</p>
                            </div>

                            <div className="glass-panel" style={{ padding: '40px 25px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '24px', background: 'var(--accent)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '20px' }}>3</div>
                                <h3 style={{ marginBottom: '12px', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Instant Claim</h3>
                                <p className="text-secondary" style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>The recipient clicks the link in our automated reply to securely claim their USDC or tokenized stock directly to their preferred chain.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Developer API Section */}
                <section id="developer-api" style={{ padding: '100px 20px', background: 'var(--bg-secondary)' }}>
                    <div className="container reveal-element" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                            <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontFamily: "'Fredoka', sans-serif", marginBottom: '1rem', color: 'var(--text-primary)' }}>Automate with Wassy</h2>
                            <p className="text-secondary" style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.6 }}>
                                Integrate social payments into your own applications, bots, or AI agents using our streamlined developer tools.
                            </p>
                        </div>

                        <div className="glass-panel" style={{ padding: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
                            <div style={{ padding: '15px' }}>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', color: 'var(--text-primary)' }}>Secure Integration</h3>
                                <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>Generate and manage Solana keypairs securely. Link your application's X handle to its native treasury address programmatically.</p>
                                <div style={{ background: '#0a0a0a', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-subtle)', color: 'var(--success)', fontFamily: 'monospace', fontSize: '0.8rem', overflowX: 'auto' }}>
                                    // Public Verification<br />
                                    @bot_wassy Link wallet: HV8i...
                                </div>
                            </div>
                            <div style={{ padding: '15px' }}>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', color: 'var(--text-primary)' }}>Programmatic Payouts</h3>
                                <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>Authorize spending limits on-chain and trigger automated payouts to users directly through X posts.</p>
                                <div style={{ background: '#0a0a0a', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-subtle)', color: 'var(--accent)', fontFamily: 'monospace', fontSize: '0.8rem', overflowX: 'auto' }}>
                                    // Automated Transfer<br />
                                    @bot_wassy send @winner $100
                                </div>
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '30px' }}>
                            <a href="https://www.wassypay.fun/agent-skill.md" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600, borderBottom: '1px solid var(--accent)', paddingBottom: '2px' }}>
                                View Developer Documentation →
                            </a>
                        </div>
                    </div>
                </section>

                {/* Features Highlights */}
                <section style={{ padding: '80px 20px' }}>
                    <div className="container reveal-element" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1px', background: 'var(--border-subtle)', border: '1px solid var(--border-subtle)', borderRadius: '16px', overflow: 'hidden' }}>
                            <div className="glass-panel" style={{ borderRadius: 0, border: 'none', padding: '30px 20px', textAlign: 'center' }}>
                                <p className="text-secondary" style={{ marginBottom: '8px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Settlement</p>
                                <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem' }}>Cross-Chain</h3>
                            </div>
                            <div className="glass-panel" style={{ borderRadius: 0, border: 'none', padding: '30px 20px', textAlign: 'center' }}>
                                <p className="text-secondary" style={{ marginBottom: '8px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Currency</p>
                                <h3 style={{ color: 'var(--accent)', fontSize: '1.2rem' }}>USDC & Stocks</h3>
                            </div>
                            <div className="glass-panel" style={{ borderRadius: 0, border: 'none', padding: '30px 20px', textAlign: 'center' }}>
                                <p className="text-secondary" style={{ marginBottom: '8px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Speed</p>
                                <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem' }}>Near Instant</h3>
                            </div>
                            <div className="glass-panel" style={{ borderRadius: 0, border: 'none', padding: '30px 20px', textAlign: 'center' }}>
                                <p className="text-secondary" style={{ marginBottom: '8px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Security</p>
                                <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem' }}>Non-custodial</h3>
                            </div>
                        </div>

                        <div className="glass-panel" style={{ marginTop: '3rem', padding: '30px', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: '16px', textAlign: 'center' }}>
                            <h3 style={{ marginBottom: '10px', fontSize: '1.2rem' }}>Your keys, your funds.</h3>
                            <p style={{ fontWeight: 500, opacity: 0.9, fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.5 }}>You authorize a spending limit, and the protocol handles transfers only when payments are verified on X. Complete financial sovereignty.</p>
                        </div>
                    </div>
                </section>

                {/* Terms Box (Hidden by default) */}
                <section style={{ padding: '60px 20px', display: showTerms ? 'flex' : 'none', justifyContent: 'center' }}>
                    <div className="container reveal-element glass-panel" style={{ maxWidth: '800px', width: '100%', textAlign: 'left', padding: '30px' }}>
                        <h2 style={{ marginBottom: '1.5rem', fontFamily: "'Fredoka', sans-serif", fontSize: '1.5rem' }}>Terms & Conditions</h2>

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

                        <button onClick={() => setShowTerms(false)} className="btn btn-primary" style={{ width: '100%', marginTop: '2rem', padding: '12px' }}>
                            I Understand
                        </button>
                    </div>
                </section>
            </main>

            {/* Professional Footer */}
            <footer style={{
                padding: '60px 20px 40px',
                borderTop: '1px solid var(--border-subtle)',
                marginTop: '40px',
                textAlign: 'center',
                background: 'rgba(var(--bg-primary-rgb), 0.5)'
            }}>
                <div style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '20px' }}>
                    Wassy Pay
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '30px', flexWrap: 'wrap' }}>
                    <a href="https://x.com/bot_wassy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>X (Twitter)</a>
                    <a href="https://www.wassypay.fun/agent-skill.md" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>Developers</a>
                    <button
                        onClick={() => setShowTerms(true)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, fontSize: '1rem', transition: 'color 0.2s' }}
                    >
                        Terms & Conditions
                    </button>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    © {new Date().getFullYear()} Wassy Pay. Built on Solana.
                </div>
            </footer>
        </div>
    );
}

// Keeping LoadingScreen just in case App.jsx tries to import it (even though it's not used directly by App.jsx anymore after the last fix, it might be used elsewhere or required for the export signature)
export function LoadingScreen({ theme, onToggleTheme }) {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk', sans-serif" }}>
            <div className="animate-fade" style={{ textAlign: 'center' }}>
                <div className="tx-spinner" style={{ width: '40px', height: '40px', margin: '0 auto 20px' }}></div>
                <div className="mono" style={{ color: 'var(--accent-secondary)', fontSize: '0.8rem', letterSpacing: '0.2em' }}>LOADING_WASSY_PAY...</div>
            </div>
        </div>
    );
}
