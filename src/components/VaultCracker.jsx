import { useState, useEffect } from 'react';
import { API } from '../constants';
import '../index.css';

export function VaultCracker({
    userWallet,
    xUsername,
    wassyBalance,
    fetchWassyBalance
}) {
    const [gameStatus, setGameStatus] = useState(null);
    const [guess, setGuess] = useState('');
    const [isGuessing, setIsGuessing] = useState(false);
    const [message, setMessage] = useState(null);
    const [isWin, setIsWin] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchStatus = async () => {
        try {
            const res = await fetch(`${API}/api/games/vault`);
            const data = await res.json();
            if (data.success) {
                setGameStatus(data.game);
            }
        } catch (e) {
            console.error('Failed to fetch game status', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        // Poll every 10 seconds for game status updates
        const interval = setInterval(fetchStatus, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleGuess = async () => {
        if (guess.length !== 3 || isNaN(guess)) {
            setMessage({ type: 'error', text: 'Enter a 3-digit code' });
            return;
        }

        if (wassyBalance < (gameStatus?.guessCost || 50000)) {
            setMessage({ type: 'error', text: 'Insufficient $WASSY balance' });
            return;
        }

        setIsGuessing(true);
        setMessage(null);

        try {
            const res = await fetch(`${API}/api/games/vault/guess`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    wallet: userWallet,
                    username: xUsername,
                    code: guess
                })
            });
            const data = await res.json();

            if (data.success) {
                if (data.isWin) {
                    setIsWin(true);
                    setMessage({ type: 'success', text: '🎉 CORRECT! YOU CRACKED THE VAULT!' });
                    fetchStatus();
                } else {
                    setMessage({ type: 'error', text: '❌ INCORRECT CODE. TRY AGAIN!' });
                }
                fetchWassyBalance?.(); // Update balance after cost
            } else {
                setMessage({ type: 'error', text: data.message || 'Guess failed' });
            }
        } catch (e) {
            setMessage({ type: 'error', text: 'Connection error' });
        } finally {
            setIsGuessing(false);
        }
    };

    const handleClaim = async () => {
        setIsGuessing(true);
        try {
            const res = await fetch(`${API}/api/games/vault/claim`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wallet: userWallet })
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ type: 'success', text: `Prize claimed! Tx: ${data.txSignature.slice(0, 8)}...` });
                fetchStatus();
            } else {
                setMessage({ type: 'error', text: data.message || 'Claim failed' });
            }
        } catch (e) {
            setMessage({ type: 'error', text: 'Claim error' });
        } finally {
            setIsGuessing(false);
        }
    };

    if (loading) {
        return <div className="mono label-subtle" style={{ textAlign: 'center', padding: '40px' }}>LOADING_VAULT_MECHANISMS...</div>;
    }

    const isWinner = gameStatus?.winner?.wallet?.toLowerCase() === userWallet?.toLowerCase();
    const isCompleted = gameStatus?.status === 'completed';
    const isActive = gameStatus?.status === 'active';

    return (
        <div className="vault-cracker-container reveal-element visible">
            <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', marginBottom: '30px' }}>
                <div className="mono label-subtle" style={{ color: 'var(--accent)', marginBottom: '15px' }}>// PROJECT_VAULT_CRACKER</div>

                {gameStatus?.status === 'inactive' ? (
                    <div style={{ padding: '40px 0' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔒</div>
                        <h2 style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>VAULT_LOCKED</h2>
                        <p className="text-muted" style={{ marginTop: '10px' }}>The game is currently offline. Admin will reactivate it soon.</p>
                    </div>
                ) : (
                    <>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>${gameStatus?.prizeAmount} USDC</h2>
                        <p className="text-muted" style={{ fontSize: '0.85rem' }}>Guess the 3-digit code set by Wassy Admin. {gameStatus?.totalGuesses || 0} attempts so far.</p>

                        <div style={{ margin: '30px 0' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '15px',
                                marginBottom: '20px'
                            }}>
                                {[0, 1, 2].map(i => (
                                    <div key={i} style={{
                                        width: '60px',
                                        height: '80px',
                                        background: 'var(--bg-inset)',
                                        border: '2px solid var(--border-subtle)',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '2.5rem',
                                        fontWeight: 800,
                                        color: guess[i] ? 'var(--text-primary)' : 'rgba(255,255,255,0.1)'
                                    }}>
                                        {guess[i] || '0'}
                                    </div>
                                ))}
                            </div>

                            {isActive ? (
                                <div style={{ maxWidth: '300px', margin: '0 auto' }}>
                                    <input
                                        type="text"
                                        maxLength="3"
                                        placeholder="###"
                                        className="input-field mono"
                                        value={guess}
                                        onChange={(e) => setGuess(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                        disabled={isGuessing}
                                        style={{ textAlign: 'center', fontSize: '1.2rem', tracking: '0.5em', marginBottom: '15px' }}
                                    />
                                    <button
                                        onClick={handleGuess}
                                        disabled={isGuessing || guess.length !== 3}
                                        className="btn btn-accent"
                                        style={{ width: '100%', padding: '15px' }}
                                    >
                                        {isGuessing ? 'CRACKING...' : `GUESS CODE (${(gameStatus?.guessCost / 1000).toFixed(0)}k $WASSY)`}
                                    </button>
                                </div>
                            ) : isCompleted ? (
                                <div className="glass-panel" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'var(--success)', padding: '20px' }}>
                                    <h3 className="mono" style={{ color: 'var(--success)' }}>VAULT_CRACKED</h3>
                                    <p style={{ fontSize: '0.9rem', margin: '10px 0' }}>Winner: @{gameStatus.winner.username} (Code: {gameStatus.winner.code})</p>
                                    {isWinner && !gameStatus.winner.claimed && (
                                        <button onClick={handleClaim} className="btn btn-accent" style={{ width: '100%', marginTop: '10px' }}>
                                            CLAIM_PRIZE
                                        </button>
                                    )}
                                    {gameStatus.winner.claimed && (
                                        <div className="mono label-subtle" style={{ color: 'var(--success)', marginTop: '10px' }}>✓ PRIZE_SETTLED</div>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    </>
                )}

                {message && (
                    <div className={`mono animate-fade-in`} style={{
                        fontSize: '0.8rem',
                        padding: '10px',
                        borderRadius: '8px',
                        background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: message.type === 'success' ? 'var(--success)' : 'var(--error)',
                        marginTop: '15px'
                    }}>
                        {message.text}
                    </div>
                )}
            </div>

            <div className="glass-panel" style={{ padding: '20px', background: 'rgba(var(--accent-rgb), 0.05)', borderStyle: 'dashed' }}>
                <div className="mono label-subtle" style={{ marginBottom: '10px', color: 'var(--accent)' }}>// TERMINAL_RULES</div>
                <ul className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingLeft: '20px' }}>
                    <li>Guesses cost {(gameStatus?.guessCost || 50000).toLocaleString()} $WASSY each.</li>
                    <li>First player to enter the correct 3-digit code wins the jackpot.</li>
                    <li>The vault is reset manually by Admin with a new code and prize.</li>
                    <li>Good luck, Wassy.</li>
                </ul>
            </div>
        </div>
    );
}

export default VaultCracker;
