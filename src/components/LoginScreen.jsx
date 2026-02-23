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
                <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                    WASSY PAY
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <a href="https://x.com/bot_wassy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }} title="Follow @bot_wassy">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                        </svg>
                    </a>
                    <button
                        onClick={onToggleTheme}
                        className="btn"
                        style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)', fontSize: '0.75rem', padding: '8px 16px' }}
                    >
                        {theme === 'dark' ? 'LIGHT_MODE' : 'DARK_MODE'}
                    </button>
                </div>
            </nav>

            <main>
                {/* Hero Section */}
                <section id="hero" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 20px' }}>
                    <div className="reveal-element visible">
                        <h1 style={{ fontSize: 'clamp(3rem, 10vw, 7rem)', lineHeight: 0.9, marginBottom: '1.5rem' }}>WASSY PAY</h1>
                        <p className="text-secondary" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.4rem)', maxWidth: '600px', margin: '0 auto 3rem' }}>
                            Send USDC to anyone on X with a simple post. No banks, no accounts, no friction.
                        </p>

                        <div style={{ position: 'relative', width: 'clamp(200px, 60vw, 280px)', height: 'clamp(200px, 60vw, 280px)', margin: '0 auto 4rem' }}>
                            <div className="glass-panel" style={{ width: '100%', height: '100%', borderRadius: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 40px 100px var(--glow)' }}>
                                <div style={{ width: '120px', height: '70px', background: '#111', borderRadius: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                                    <div className="mascot-eye"></div>
                                    <div className="mascot-eye"></div>
                                </div>
                                <div style={{ fontSize: '2rem', marginTop: '20px', fontWeight: 900, color: 'var(--text-primary)' }}>X</div>
                            </div>
                            <div className="mono glass-panel hero-floater-right" style={{ position: 'absolute', top: '-10px', right: '-40px', padding: '10px 15px', borderRadius: '12px', background: 'var(--accent-secondary)', color: '#fff', fontSize: '0.7rem', border: 'none', boxShadow: '0 10px 30px rgba(29, 155, 240, 0.3)', zIndex: 10 }}>
                                @bot_wassy send @friend $100
                            </div>
                            <div className="mono glass-panel hero-floater-left" style={{ position: 'absolute', bottom: '20px', left: '-40px', padding: '10px 15px', borderRadius: '12px', background: 'var(--success)', color: '#fff', fontSize: '0.7rem', border: 'none', boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)', zIndex: 10 }}>
                                @bot_wassy claim
                            </div>
                        </div>

                        <button onClick={onLogin} className="btn btn-primary" style={{ padding: '16px 48px', fontSize: '1.1rem' }}>
                            LOGIN WITH X
                        </button>
                    </div>
                </section>

                {/* AI Agent Demo Section */}
                <section id="agent-demo" style={{ padding: '80px 20px', background: 'var(--bg-secondary)' }}>
                    <div className="container reveal-element" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <h2 className="mono label-subtle" style={{ marginBottom: '2rem', textAlign: 'center' }}>// AI_AGENT_INTEGRATION</h2>
                        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                            <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Bring Your Own Agent</h3>
                            <p className="text-secondary" style={{ maxWidth: '600px', margin: '0 auto' }}>
                                AI Agents don't have browsers. They manage their own keys. Link your AI's X handle to its native Solana wallet programmatically to receive gasless USDC payments from humans.
                            </p>
                        </div>

                        <div className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>
                                {/* Step 1: Generate & Sign */}
                                <div style={{ background: '#0a0a0a', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                                    <div className="mono text-muted" style={{ marginBottom: '15px', fontSize: '0.8rem', color: '#888' }}>1. LOCAL_KEY_GENERATION</div>
                                    <p style={{ fontSize: '0.9rem', marginBottom: '15px', color: '#e5e7eb' }}>Your agent generates a Solana Keypair and signs its X handle.</p>
                                    <div className="mono" style={{ background: '#000', padding: '15px', borderRadius: '8px', fontSize: '0.75rem', color: '#34d399', overflowX: 'auto', border: '1px solid #222' }}>
                                        $ node generate_keys.js<br /><br />
                                        Public Key: <span style={{ color: '#fff' }}>HV8i...</span><br />
                                        Signature: <span style={{ color: '#fff' }}>27gR...</span>
                                    </div>
                                </div>

                                {/* Step 2: Verification Tweet */}
                                <div style={{ background: '#0a0a0a', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                                    <div className="mono text-muted" style={{ marginBottom: '15px', fontSize: '0.8rem', color: '#888' }}>2. PUBLIC_VERIFICATION</div>
                                    <p style={{ fontSize: '0.9rem', marginBottom: '15px', color: '#e5e7eb' }}>The agent posts the exact verification string to X and tags <span style={{ color: 'var(--accent)' }}>@bot_wassy</span>. Our background indexer will parse the math and auto-link your agent instantly!</p>
                                    <div className="glass-panel" style={{ padding: '15px', borderRadius: '8px', fontSize: '0.8rem', border: '1px solid var(--accent-secondary)', background: '#111' }}>
                                        <div style={{ fontWeight: 700, marginBottom: '5px', color: '#fff' }}>@your_ai_agent</div>
                                        <div style={{ color: '#a1a1aa' }}><span style={{ color: 'var(--accent)' }}>@bot_wassy</span> Initializing WassyPay module. My designated treasury address is HV8i... Verify signature: 27gR...</div>
                                    </div>
                                </div>

                                {/* Step 3: Outbound Payments */}
                                <div style={{ background: '#0a0a0a', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                                    <div className="mono text-muted" style={{ marginBottom: '15px', fontSize: '0.8rem', color: '#888' }}>3. SENDING_USDC</div>
                                    <p style={{ fontSize: '0.9rem', marginBottom: '15px', color: '#e5e7eb' }}>Agents can pay humans or other bots! First, delegate spending to the vault programmatically on-chain via <span className="mono">createApproveInstruction</span>, then tweet a payment command.</p>
                                    <div className="glass-panel" style={{ padding: '15px', borderRadius: '8px', fontSize: '0.8rem', border: '1px solid #c084fc', background: '#111' }}>
                                        <div style={{ fontWeight: 700, marginBottom: '5px', color: '#fff' }}>@your_ai_agent</div>
                                        <div style={{ color: '#a1a1aa' }}><span style={{ color: 'var(--accent)' }}>@bot_wassy</span> send @human_developer $50</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                                <p className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    Building an agent? Feed it our official integration protocol:
                                    <br />
                                    <a href="https://www.wassypay.fun/agent-skill.md" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline', marginTop: '5px', display: 'inline-block' }}>
                                        https://www.wassypay.fun/agent-skill.md
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How it Works Strata */}
                <section id="how-it-works" style={{ padding: '100px 20px' }}>
                    <div className="container reveal-element" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <h2 className="mono label-subtle" style={{ marginBottom: '4rem', textAlign: 'center' }}>// HOW_IT_WORKS</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                            <div className="glass-panel how-it-works-grid">
                                <div className="step-number">1</div>
                                <div className="step-title">
                                    <h3 style={{ marginBottom: '8px' }}>FUND</h3>
                                    <p className="mono text-muted">INITIATE_WALLET_LINK</p>
                                </div>
                                <p className="step-desc text-secondary">Connect your X account and Solana wallet. Deposit USDC to start sending payments instantly without leaving your timeline.</p>
                            </div>

                            <div className="glass-panel how-it-works-grid">
                                <div className="step-number">2</div>
                                <div className="step-title">
                                    <h3 style={{ marginBottom: '8px' }}>TAG</h3>
                                    <p className="mono text-muted">COMMAND_POST_TRIGGER</p>
                                </div>
                                <p className="step-desc text-secondary">Post on X: <span style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>"@bot_wassy send @username $amount"</span> — that's it. No apps to download, no forms to fill.</p>
                            </div>

                            <div className="glass-panel how-it-works-grid">
                                <div className="step-number">3</div>
                                <div className="step-title">
                                    <h3 style={{ marginBottom: '8px' }}>CLAIM</h3>
                                    <p className="mono text-muted">SETTLEMENT_COMPLETION</p>
                                </div>
                                <p className="step-desc text-secondary">Recipient sees the payment notification, clicks claim, and USDC transfers instantly on the Solana blockchain.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Poster Carousel */}
                <section style={{ padding: '80px 20px', overflow: 'hidden' }}>
                    <div className="container reveal-element" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <h2 className="mono label-subtle" style={{ marginBottom: '4rem', textAlign: 'center' }}>// $WASSY_CAMPAIGN</h2>
                        <div className="poster-carousel-container">
                            <div className="poster-track">
                                <img src="/posters/poster1.png" alt="Wassy Poster 1" />
                                <img src="/posters/poster2.png" alt="Wassy Poster 2" />
                                <img src="/posters/poster3.png" alt="Wassy Poster 3" />
                                <img src="/posters/poster4.png" alt="Wassy Poster 4" />
                                <img src="/posters/poster5.png" alt="Wassy Poster 5" />
                                {/* Duplicate for seamless loop */}
                                <img src="/posters/poster1.png" alt="Wassy Poster 1 clone" />
                                <img src="/posters/poster2.png" alt="Wassy Poster 2 clone" />
                                <img src="/posters/poster3.png" alt="Wassy Poster 3 clone" />
                                <img src="/posters/poster4.png" alt="Wassy Poster 4 clone" />
                                <img src="/posters/poster5.png" alt="Wassy Poster 5 clone" />
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
