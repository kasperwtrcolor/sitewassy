import { buttonStyle } from '../constants';

export function LoginScreen({ onLogin }) {
    return (
        <div style={{
            minHeight: '100vh',
            background: '#e8e6e1',
            backgroundImage: 'radial-gradient(#1a1a1a 0.5px, transparent 0.5px)',
            backgroundSize: '20px 20px',
            padding: '40px 20px',
            fontFamily: "'Courier Prime', monospace"
        }}>
            <div style={{
                maxWidth: '800px',
                margin: 'auto',
                position: 'relative',
                border: '2px solid #1a1a1a',
                padding: '40px',
                boxShadow: '15px 15px 0px #1a1a1a',
                background: '#e8e6e1'
            }}>
                {/* Tape mark */}
                <div style={{
                    position: 'absolute',
                    width: '100px',
                    height: '30px',
                    background: 'rgba(220, 210, 160, 0.4)',
                    top: '-15px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    borderLeft: '2px solid rgba(0,0,0,0.1)',
                    borderRight: '2px solid rgba(0,0,0,0.1)'
                }} />

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <img
                        src="https://i.imgur.com/ZQXqN0L.png"
                        alt="Wassy Pay"
                        style={{ width: '100px', height: '100px', objectFit: 'contain', marginBottom: '20px' }}
                    />
                    <h1 style={{
                        fontFamily: "'Work Sans', sans-serif",
                        fontSize: 'clamp(3rem, 10vw, 5rem)',
                        textTransform: 'uppercase',
                        lineHeight: '0.8',
                        letterSpacing: '-4px',
                        transform: 'rotate(-1deg)',
                        color: '#1a1a1a',
                        margin: '0'
                    }}>
                        WASSY<br />PAY<br />V2
                    </h1>
                </div>

                {/* Card 1 */}
                <div style={{
                    background: 'white',
                    border: '1px solid #1a1a1a',
                    padding: '20px',
                    marginTop: '20px',
                    position: 'relative',
                    transform: 'rotate(1.5deg)',
                    boxShadow: '5px 5px 0px #ff4500'
                }}>
                    <div style={{
                        width: '100%',
                        height: '200px',
                        background: 'repeating-conic-gradient(#1a1a1a 0% 25%, transparent 0% 50%) 50% / 2px 2px',
                        opacity: '0.2',
                        marginBottom: '15px'
                    }} />
                    <p style={{ margin: '0 0 15px 0', lineHeight: '1.6' }}>
            // ARTIFACT_01: Non-custodial payments via X. Post "@BOT_WASSY SEND @FRIEND $5"
                        and the blockchain handles the rest. No banks. No intermediaries. Pure delegation.
                    </p>
                    <button
                        onClick={onLogin}
                        style={buttonStyle}
                    >
                        Login with X
                    </button>
                </div>

                {/* Card 2 */}
                <div style={{
                    background: 'white',
                    border: '1px solid #1a1a1a',
                    padding: '20px',
                    marginTop: '20px',
                    position: 'relative',
                    transform: 'rotate(-1deg)',
                    boxShadow: '5px 5px 0px #ff4500'
                }}>
                    <p style={{ margin: '0', lineHeight: '1.6' }}>
            // ARTIFACT_02: Privy creates your Solana wallet. You authorize once.
                        Payments execute automatically. The friction is removed, but the control remains yours.
                    </p>
                </div>
            </div>
        </div>
    );
}

export function LoadingScreen() {
    return (
        <div style={{
            minHeight: '100vh',
            background: '#e8e6e1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Courier Prime', monospace"
        }}>
            <div style={{ fontSize: '20px', color: '#1a1a1a' }}>⏳ Loading...</div>
        </div>
    );
}
