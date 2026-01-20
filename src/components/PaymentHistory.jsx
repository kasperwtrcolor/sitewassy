import { cardStyle } from '../constants';

export function PaymentHistory({ payments, xUsername }) {
    return (
        <div style={{ ...cardStyle, transform: 'rotate(0.5deg)' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '15px', fontSize: '14px', textTransform: 'uppercase' }}>
        // PAYMENT_HISTORY
            </div>

            {payments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', opacity: '0.5' }}>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>$</div>
                    <div>No payments yet</div>
                    <div style={{ fontSize: '12px', marginTop: '5px' }}>
                        Make your first payment by posting on X
                    </div>
                </div>
            ) : (
                <div>
                    {payments.map((payment) => (
                        <div
                            key={payment.id || payment.tweet_id}
                            style={{
                                background: '#f5f5f5',
                                border: '1px solid #1a1a1a',
                                padding: '15px',
                                marginBottom: '10px'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '10px',
                                flexWrap: 'wrap',
                                gap: '10px'
                            }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                                        {payment.sender_username?.toLowerCase() === xUsername?.toLowerCase() ? (
                                            <span style={{ color: '#dc3545' }}>→ SENT</span>
                                        ) : (
                                            <span style={{ color: '#28a745' }}>← RECEIVED</span>
                                        )}
                                        <span style={{ marginLeft: '10px' }}>${payment.amount}</span>
                                    </div>
                                    <div style={{ fontSize: '12px', opacity: '0.7' }}>
                                        {payment.sender_username?.toLowerCase() === xUsername?.toLowerCase() ? (
                                            <>To: @{payment.recipient_username}</>
                                        ) : (
                                            <>From: @{payment.sender_username}</>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '10px', opacity: '0.5', marginTop: '5px' }}>
                                        {new Date(payment.created_at).toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    {payment.status === 'completed' && <span style={{ color: '#28a745' }}>✓</span>}
                                    {payment.status === 'pending' && <span style={{ color: '#ffc107' }}>⏳</span>}
                                    {payment.status === 'failed' && <span style={{ color: '#dc3545' }}>✗</span>}
                                </div>
                            </div>

                            {payment.tx_signature && (
                                <a
                                    href={`https://solscan.io/tx/${payment.tx_signature}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        fontSize: '10px',
                                        color: '#1a1a1a',
                                        textDecoration: 'underline',
                                        display: 'block',
                                        marginTop: '5px'
                                    }}
                                >
                                    View transaction →
                                </a>
                            )}

                            {payment.tweet_url && (
                                <a
                                    href={payment.tweet_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        fontSize: '10px',
                                        color: '#1a1a1a',
                                        textDecoration: 'underline',
                                        display: 'block',
                                        marginTop: '5px'
                                    }}
                                >
                                    View tweet →
                                </a>
                            )}

                            {payment.error_message && (
                                <div style={{
                                    fontSize: '10px',
                                    color: '#dc3545',
                                    marginTop: '10px',
                                    padding: '5px',
                                    background: '#f8d7da',
                                    border: '1px solid #dc3545'
                                }}>
                                    Error: {payment.error_message}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
