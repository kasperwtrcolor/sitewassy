import { useState, useEffect } from 'react';
import { API } from '../constants';
import '../index.css';

export function VaultCracker({
    userWallet,
    xUsername,
    wassyBalance,
    fetchWassyBalance,
    isWassyDelegated,
    onAuthorizeWassy,
    onFetchHistory
}) {
    const [gameStatus, setGameStatus] = useState(null);
    const [history, setHistory] = useState([]);
    const [activeView, setActiveView] = useState('current'); // 'current' or 'history'
    const [digits, setDigits] = useState(['0', '0', '0']);
    const [isGuessing, setIsGuessing] = useState(false);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthorizing, setIsAuthorizing] = useState(false);

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

    const fetchHistory = async () => {
        if (!onFetchHistory) return;
        const res = await onFetchHistory();
        if (res.success) {
            setHistory(res.history || []);
        }
    };

    useEffect(() => {
        fetchStatus();
        fetchHistory();
        const interval = setInterval(fetchStatus, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleDigitChange = (index, delta) => {
        const newDigits = [...digits];
        let val = parseInt(newDigits[index]);
        val = (val + delta + 10) % 10;
        newDigits[index] = val.toString();
        setDigits(newDigits);
        setMessage(null);
    };

    const handleAuthorize = async () => {
        setIsAuthorizing(true);
        try {
            await onAuthorizeWassy?.(10000000); // Authorize 10M $WASSY
        } finally {
            setIsAuthorizing(false);
        }
    };

    const handleGuess = async () => {
        const code = digits.join('');
        if (wassyBalance < (gameStatus?.guessCost || 50000)) {
            setMessage({ type: 'error', text: 'INSUFFICIENT $WASSY' });
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
                    code
                })
            });
            const data = await res.json();

            if (data.success) {
                if (data.isWin) {
                    setMessage({ type: 'success', text: '🎉 CORRECT! THE VAULT IS YOURS!' });
                    fetchStatus();
                } else {
                    setMessage({ type: 'error', text: '❌ INCORRECT SEQUENCE.' });
                }
                fetchWassyBalance?.();
            } else {
                setMessage({ type: 'error', text: data.message || 'Guess failed' });
            }
        } catch (e) {
            setMessage({ type: 'error', text: 'CONNECTION ERROR' });
        } finally {
            setIsGuessing(false);
        }
    };

    const handleClaim = async (gameId = null) => {
        setIsGuessing(true);
        try {
            const res = await fetch(`${API}/api/games/vault/claim`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wallet: userWallet, gameId })
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ type: 'success', text: `Prize claimed! Tx: ${data.txSignature.slice(0, 8)}...` });
                fetchStatus();
                fetchHistory();
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
        return <div className="mono label-subtle" style={{ textAlign: 'center', padding: '40px' }}>INITIALIZING_VAULT_DECODER...</div>;
    }

    const isWinner = gameStatus?.winner?.wallet?.toLowerCase() === userWallet?.toLowerCase();
    const isCompleted = gameStatus?.status === 'completed';
    const isActive = gameStatus?.status === 'active';

    return (
        <div className="vault-cracker-container reveal-element visible">
            {/* View Selectors */}
            <div className="glass-panel" style={{ display: 'flex', gap: '10px', padding: '10px', borderRadius: '100px', marginBottom: '30px' }}>
                <button
                    onClick={() => setActiveView('current')}
                    className="btn"
                    style={{
                        flex: 1,
                        background: activeView === 'current' ? 'var(--text-primary)' : 'transparent',
                        color: activeView === 'current' ? 'var(--bg-primary)' : 'var(--text-primary)',
                        fontSize: '0.75rem'
                    }}
                >
                    CURRENT_SESSION
                </button>
                <button
                    onClick={() => { setActiveView('history'); fetchHistory(); }}
                    className="btn"
                    style={{
                        flex: 1,
                        background: activeView === 'history' ? 'var(--text-primary)' : 'transparent',
                        color: activeView === 'history' ? 'var(--bg-primary)' : 'var(--text-primary)',
                        fontSize: '0.75rem'
                    }}
                >
                    CRACK_HISTORY
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', marginBottom: '30px' }}>
                <div className="mono label-subtle" style={{ color: 'var(--accent)', marginBottom: '15px' }}>// PROJECT_VAULT_CRACKER</div>

                {activeView === 'current' ? (
                    gameStatus?.status === 'inactive' ? (
                        <div style={{ padding: '40px 0' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔒</div>
                            <h2 style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>VAULT_LOCKED</h2>
                            <p className="text-muted" style={{ marginTop: '10px' }}>The game is currently offline. Admin will reactivate it soon.</p>
                        </div>
                    ) : (
                        <>
                            <h2 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>${gameStatus?.prizeAmount} USDC</h2>
                            <p className="text-muted" style={{ fontSize: '0.85rem' }}>Synchronize the 3-digit sequence to unlock the prize.</p>

                            <div style={{ margin: '40px 0' }}>
                                {/* Advanced Dial UI */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '20px',
                                    marginBottom: '30px'
                                }}>
                                    {[0, 1, 2].map(i => (
                                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                            <button
                                                onClick={() => handleDigitChange(i, 1)}
                                                disabled={!isActive || isGuessing}
                                                className="btn"
                                                style={{ width: '40px', padding: '5px', borderRadius: '8px', opacity: isActive ? 1 : 0.3 }}
                                            >
                                                ▲
                                            </button>
                                            <div style={{
                                                width: '70px',
                                                height: '100px',
                                                background: 'linear-gradient(180deg, #111 0%, #222 50%, #111 100%)',
                                                border: '2px solid var(--border-subtle)',
                                                borderRadius: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '3.5rem',
                                                fontWeight: 900,
                                                color: 'var(--text-primary)',
                                                textShadow: '0 0 15px rgba(255,255,255,0.2)'
                                            }}>
                                                {digits[i]}
                                            </div>
                                            <button
                                                onClick={() => handleDigitChange(i, -1)}
                                                disabled={!isActive || isGuessing}
                                                className="btn"
                                                style={{ width: '40px', padding: '5px', borderRadius: '8px', opacity: isActive ? 1 : 0.3 }}
                                            >
                                                ▼
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {isActive ? (
                                    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                                        {!isWassyDelegated ? (
                                            <div style={{ background: 'rgba(var(--accent-rgb), 0.1)', padding: '20px', borderRadius: '16px', border: '1px solid var(--accent)', marginBottom: '20px' }}>
                                                <p className="mono" style={{ fontSize: '0.8rem', marginBottom: '15px' }}>AUTHORIZATION_REQUIRED_TO_SPEND_$WASSY</p>
                                                <button
                                                    onClick={handleAuthorize}
                                                    disabled={isAuthorizing}
                                                    className="btn btn-accent"
                                                    style={{ width: '100%', padding: '12px' }}
                                                >
                                                    {isAuthorizing ? 'AUTHORIZING...' : 'AUTHORIZE_VAULT'}
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={handleGuess}
                                                disabled={isGuessing}
                                                className="btn btn-accent"
                                                style={{ width: '100%', padding: '20px', fontSize: '1.2rem', fontWeight: 800, letterSpacing: '2px' }}
                                            >
                                                {isGuessing ? 'DECODING...' : `CRACK VAULT (${(gameStatus?.guessCost / 1000).toFixed(0)}k $WASSY)`}
                                            </button>
                                        )}
                                        <p className="mono label-subtle" style={{ color: 'var(--error)', marginTop: '15px', fontSize: '0.65rem' }}>
                                            ⚠️ ALL_$WASSY_SPENT_WILL_BE_BURNED
                                        </p>
                                    </div>
                                ) : isCompleted ? (
                                    <div className="glass-panel" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'var(--success)', padding: '25px', position: 'relative' }}>
                                        <div className="mono" style={{ position: 'absolute', top: '-10px', left: '20px', background: 'var(--success)', color: '#000', padding: '2px 10px', fontSize: '0.7rem', fontWeight: 900 }}>VAULT_BREACHED</div>
                                        <h3 className="mono" style={{ color: 'var(--success)', marginBottom: '10px' }}>@{gameStatus.winner.username} CRACKED IT!</h3>
                                        <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '20px' }}>Correct Sequence: {gameStatus.winner.code}</p>
                                        {isWinner && !gameStatus.winner.claimed && (
                                            <button onClick={() => handleClaim()} disabled={isGuessing} className="btn btn-accent" style={{ width: '100%' }}>
                                                {isGuessing ? 'CLAIMING...' : 'COLLECT_PRIZE'}
                                            </button>
                                        )}
                                        {gameStatus.winner.claimed && (
                                            <div className="mono label-subtle" style={{ color: 'var(--success)', fontWeight: 800 }}>✓ BOUNTY_SETTLED</div>
                                        )}
                                    </div>
                                ) : null}
                            </div>

                            {/* Recent Guesses Tracker */}
                            <div style={{ marginTop: '40px' }}>
                                <div className="mono label-subtle" style={{ textAlign: 'left', marginBottom: '15px', fontSize: '0.7rem' }}>// RECENT_ATTEMPTS ({gameStatus?.totalGuesses || 0})</div>
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '8px',
                                    justifyContent: 'center',
                                    maxHeight: '120px',
                                    overflowY: 'auto',
                                    padding: '5px'
                                }}>
                                    {(gameStatus?.recentGuesses || []).map((g, i) => (
                                        <div key={i} className="mono" style={{
                                            padding: '4px 10px',
                                            background: 'var(--bg-inset)',
                                            border: '1px solid var(--border-subtle)',
                                            borderRadius: '6px',
                                            fontSize: '0.7rem',
                                            color: 'var(--text-muted)'
                                        }}>
                                            {g.code}
                                        </div>
                                    ))}
                                    {(!gameStatus?.recentGuesses || gameStatus.recentGuesses.length === 0) && (
                                        <span className="mono label-subtle" style={{ fontSize: '0.65rem' }}>NO_ATTEMPTS_YET</span>
                                    )}
                                </div>
                            </div>
                        </>
                    )
                ) : (
                    <div style={{ textAlign: 'left' }}>
                        <div className="mono label-subtle" style={{ marginBottom: '20px' }}>// ARCHIVED_BREACHES</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {history.length > 0 ? history.map((h, i) => {
                                const amWinner = h.winner?.wallet?.toLowerCase() === userWallet?.toLowerCase();
                                const canClaimOld = amWinner && h.status === 'completed' && !h.winner?.claimed;

                                return (
                                    <div key={i} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px' }}>
                                        <div>
                                            <h3 className="mono" style={{ color: 'var(--accent)', margin: 0 }}>${h.prizeAmount} USDC</h3>
                                            <p className="mono label-subtle" style={{ fontSize: '0.6rem', marginTop: '4px' }}>CODE: {h.winner?.code || '???'}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div className="mono" style={{ fontSize: '0.8rem', fontWeight: 700 }}>@{h.winner?.username}</div>
                                            {canClaimOld ? (
                                                <button
                                                    onClick={() => handleClaim(h.id)}
                                                    disabled={isGuessing}
                                                    className="btn btn-accent"
                                                    style={{ padding: '4px 10px', fontSize: '0.65rem', marginTop: '5px' }}
                                                >
                                                    {isGuessing ? 'WAIT...' : 'CLAIM_PRIZE'}
                                                </button>
                                            ) : (
                                                <div className="mono label-subtle" style={{ fontSize: '0.6rem', marginTop: '5px' }}>
                                                    {h.winner?.claimed ? '✓ SECURED' : 'UNCLAIMED'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div style={{ padding: '40px', textAlign: 'center' }}>
                                    <p className="mono label-subtle">NO_HISTORY_FOUND</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {message && (
                    <div className={`mono animate-fade-in`} style={{
                        fontSize: '0.8rem',
                        padding: '12px',
                        borderRadius: '12px',
                        background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: message.type === 'success' ? 'var(--success)' : 'var(--error)',
                        marginTop: '25px',
                        border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--error)'}`
                    }}>
                        {message.text}
                    </div>
                )}
            </div>

            <div className="glass-panel" style={{ padding: '20px', background: 'rgba(var(--accent-rgb), 0.05)', borderStyle: 'dashed' }}>
                <div className="mono label-subtle" style={{ marginBottom: '10px', color: 'var(--accent)' }}>// VAULT_PROTOCOL_V2</div>
                <ul className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingLeft: '20px' }}>
                    <li>Guess sequence: 3 digits (000-999).</li>
                    <li>Payment: {(gameStatus?.guessCost || 50000).toLocaleString()} $WASSY per attempt.</li>
                    <li>Outcome: All $WASSY tokens spent in this game session are moved to the vault for burning.</li>
                    <li>Winner settlement: Instant on-chain USDC transfer upon claim.</li>
                </ul>
            </div>
        </div>
    );
}

export default VaultCracker;
