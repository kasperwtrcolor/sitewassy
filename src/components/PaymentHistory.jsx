import '../index.css';

export function PaymentHistory({ payments, xUsername }) {
    return (
        <div className="plate" style={{ padding: '30px', marginBottom: '20px', position: 'relative' }}>
            <div className="engraved" style={{ marginBottom: '20px' }}>// TRANSACTION_HISTORY</div>

            {payments.length === 0 ? (
                <div className="inset-panel" style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '15px', opacity: 0.3 }}>$</div>
                    <div style={{ color: '#666' }}>No transactions yet</div>
                    <div style={{ fontSize: '0.75rem', color: '#444', marginTop: '8px' }}>
                        Make your first payment by posting on X
                    </div>
                </div>
            ) : (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {payments.map((payment) => {
                        const isSent = payment.sender_username?.toLowerCase() === xUsername?.toLowerCase();
                        return (
                            <div
                                key={payment.id || payment.tweet_id}
                                style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: '12px',
                                    padding: '15px',
                                    marginBottom: '10px'
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '10px'
                                }}>
                                    <div>
                                        <div style={{
                                            fontWeight: '600',
                                            marginBottom: '5px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px'
                                        }}>
                                            <span style={{
                                                color: isSent ? '#ef4444' : '#4ade80',
                                                fontSize: '0.7rem',
                                                padding: '3px 8px',
                                                background: isSent ? 'rgba(239,68,68,0.1)' : 'rgba(74,222,128,0.1)',
                                                borderRadius: '4px'
                                            }}>
                                                {isSent ? '→ SENT' : '← RECEIVED'}
                                            </span>
                                            <span className="mono" style={{ fontSize: '1.2rem' }}>${payment.amount}</span>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#666' }}>
                                            {isSent ? (
                                                <>To: @{payment.recipient_username}</>
                                            ) : (
                                                <>From: @{payment.sender_username}</>
                                            )}
                                        </div>
                                        <div className="mono" style={{ fontSize: '0.65rem', color: '#444', marginTop: '5px' }}>
                                            {new Date(payment.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '1.2rem' }}>
                                        {payment.status === 'completed' && <span style={{ color: '#4ade80' }}>✓</span>}
                                        {payment.status === 'pending' && <span style={{ color: '#f59e0b' }}>⏳</span>}
                                        {payment.status === 'failed' && <span style={{ color: '#ef4444' }}>✗</span>}
                                    </div>
                                </div>

                                {(payment.tx_signature || payment.tweet_url) && (
                                    <div style={{ marginTop: '10px', display: 'flex', gap: '15px' }}>
                                        {payment.tx_signature && (
                                            <a
                                                href={`https://solscan.io/tx/${payment.tx_signature}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ fontSize: '0.65rem', color: '#31d7ff', textDecoration: 'none' }}
                                            >
                                                View TX →
                                            </a>
                                        )}
                                        {payment.tweet_url && (
                                            <a
                                                href={payment.tweet_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ fontSize: '0.65rem', color: '#888', textDecoration: 'none' }}
                                            >
                                                View Tweet →
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
