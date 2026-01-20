// API and Solana constants
export const API = import.meta.env.VITE_API_URL || "https://wassy-pay-backend.onrender.com";
export const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID;
export const VAULT_ADDRESS = import.meta.env.VITE_VAULT_ADDRESS;
export const USDC_MINT = import.meta.env.VITE_USDC_MINT || "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const SOLANA_RPC = import.meta.env.VITE_SOLANA_RPC || "https://rpc.dev.fun/699840f631c97306a0c4";
export const ADMIN_WALLET = '6SxLVfFovSjR2LAFcJ5wfT6RFjc8GxsscRekGnLq8BMe';

// Common styles
export const cardStyle = {
    background: 'white',
    border: '1px solid #1a1a1a',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '5px 5px 0px #ff4500'
};

export const buttonStyle = {
    background: '#1a1a1a',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    fontFamily: "'Courier Prime', monospace",
    fontWeight: 'bold',
    cursor: 'pointer',
    textTransform: 'uppercase',
    fontSize: '14px',
    transition: 'all 0.1s'
};

export const primaryButtonStyle = {
    ...buttonStyle,
    background: '#ff4500'
};

export const successButtonStyle = {
    ...buttonStyle,
    background: '#28a745'
};

export const dangerButtonStyle = {
    ...buttonStyle,
    background: '#dc3545'
};

export const inputStyle = {
    width: '100%',
    padding: '10px',
    border: '1px solid #1a1a1a',
    fontFamily: "'Courier Prime', monospace",
    fontSize: '14px'
};

export const errorBoxStyle = {
    background: '#f8d7da',
    border: '1px solid #dc3545',
    padding: '10px',
    marginTop: '15px',
    fontSize: '12px'
};

export const successBoxStyle = {
    background: '#d4edda',
    border: '1px solid #28a745',
    padding: '10px',
    marginTop: '15px',
    fontSize: '12px'
};

export const warningBoxStyle = {
    background: '#fff3cd',
    border: '1px solid #ffc107',
    padding: '15px'
};
