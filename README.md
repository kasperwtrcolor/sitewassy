# 💸 Wassy Pay 2.0

A simplified, non-custodial payment platform where users login with X (via Privy), get an embedded Solana wallet, and make USDC payments by posting on X.

## 🚀 Features

- **Privy Integration**: Seamless X login with auto-created Solana wallets
- **Non-Custodial**: Users maintain full control of their funds via SPL Token delegation
- **Social Payments**: Pay anyone on X by tweeting `@wassypay send 5 to @friend`
- **Real-time Updates**: Balance and payment history refresh automatically
- **Secure**: Delegation-based transfers with configurable allowances

## 📋 Prerequisites

- Node.js 18+ and npm
- X (Twitter) account
- Solana wallet with SOL for gas fees (for vault operations)

## 🔧 Setup

### Frontend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env.local` file:**
   ```bash
   cp .env.example .env.local
   ```

3. **Configure environment variables:**
   ```env
   VITE_PRIVY_APP_ID=cmjucu149007bl70cn1lo06od
   VITE_VAULT_ADDRESS=Hu7wMzbwR5RSTXk2bF5CEDhdSAN1mzX9vTiqbQJWESxE
   VITE_USDC_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
   VITE_SOLANA_RPC=https://rpc.dev.fun/699840f631c97306a0c4
   VITE_API_URL=https://wassy-pay-backend.onrender.com
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

### Vercel Deployment

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add the following variables:
   - `VITE_PRIVY_APP_ID` = `cmjucu149007bl70cn1lo06od`
   - `VITE_VAULT_ADDRESS` = `Hu7wMzbwR5RSTXk2bF5CEDhdSAN1mzX9vTiqbQJWESxE`
   - `VITE_USDC_MINT` = `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
   - `VITE_SOLANA_RPC` = `https://rpc.dev.fun/699840f631c97306a0c4`
   - `VITE_API_URL` = `https://wassy-pay-backend.onrender.com`
4. Redeploy the project

## 🎯 User Flow

1. **Login**: User visits wassypay.fun and clicks "Login with X"
2. **Wallet Creation**: Privy automatically creates a Solana wallet for the user
3. **Fund Wallet**: User sends USDC to their wallet address (via Phantom, exchange, etc.)
4. **Authorize**: User authorizes Wassy vault to move funds (one-time setup)
5. **Pay**: User posts on X: `@wassypay send 5 to @friend`
6. **Execute**: Backend monitors X, detects payment, and executes delegated transfer
7. **Confirm**: Both users see payment in their dashboard

## 🏗️ Architecture

### Frontend Stack
- **Framework**: React + Vite
- **Authentication**: Privy (@privy-io/react-auth)
- **Blockchain**: Solana (@solana/web3.js, @solana/spl-token)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

### Backend Stack
- **Server**: Express.js
- **Database**: SQLite
- **X API**: Twitter API v2
- **Blockchain**: Solana Web3.js

### Database Schema

#### `users` table
- `id`: Auto-increment primary key
- `x_username`: Unique X handle
- `x_user_id`: X user ID
- `wallet_address`: Solana wallet address
- `is_delegated`: Boolean indicating authorization status
- `delegation_amount`: Maximum USDC that can be moved
- `created_at`: Timestamp
- `last_login`: Timestamp

#### `payments` table
- `id`: Auto-increment primary key
- `sender_username`: X handle of sender
- `sender_wallet`: Sender's Solana address
- `recipient_username`: X handle of recipient
- `recipient_wallet`: Recipient's Solana address
- `amount`: Payment amount in USDC
- `tweet_id`: Unique tweet ID
- `tweet_url`: Link to payment tweet
- `status`: pending, completed, or failed
- `tx_signature`: Solana transaction signature
- `error_message`: Error details if failed
- `created_at`: Timestamp
- `executed_at`: Timestamp when transfer completed

## 🔐 Security

### Delegation Model
- Users grant Wassy vault permission to move USDC (SPL Token approval)
- Users set maximum allowance (e.g., $1000)
- Vault can only move funds within allowance
- Users remain in full control and can revoke anytime

### Best Practices
- Private keys never stored on frontend
- Vault private key secured via environment variables
- All transfers require prior delegation approval
- Transaction signatures stored for auditing

## 🛠️ API Endpoints

### `POST /api/login`
Register or login user
```json
{
  "x_username": "alice",
  "x_user_id": "123456",
  "wallet_address": "..."
}
```

### `POST /api/authorize`
Record delegation authorization
```json
{
  "wallet": "...",
  "amount": 1000,
  "signature": "..."
}
```

### `GET /api/payments/:username`
Get payment history for a user

### `GET /api/wallet/:address`
Get wallet balance and delegation status

### `GET /health`
Health check endpoint

## 📝 Payment Command Format

Users post on X with this format:
```
@wassypay send [amount] to @[recipient]
```

**Examples:**
- `@wassypay send 5 to @alice`
- `@wassypay send 10.50 to @bob`

## ⚙️ Configuration

### Frontend Environment Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_PRIVY_APP_ID` | Privy application ID | `cmjucu149007bl70cn1lo06od` |
| `VITE_VAULT_ADDRESS` | Solana vault address | `Hu7w...ESxE` |
| `VITE_USDC_MINT` | USDC token mint address | `EPjF...Dt1v` |
| `VITE_SOLANA_RPC` | Solana RPC endpoint | `https://rpc.dev.fun/...` |
| `VITE_API_URL` | Backend API URL | `https://...onrender.com` |

### Backend Environment Variables
See backend repository for configuration details.

## 🐛 Troubleshooting

### Privy Not Showing
- Ensure `VITE_PRIVY_APP_ID` is set in Vercel environment variables
- Redeploy after adding environment variables

### Wallet Balance Shows $0
- User needs to fund wallet with USDC first
- Check wallet address on Solscan
- Ensure using correct USDC mint address

### Authorization Fails
- User must have USDC in wallet before authorizing
- Check console for detailed error messages

### Payment Not Processing
- Both sender and recipient must be registered
- Sender must have authorized delegation
- Sender must have sufficient USDC balance
- Backend monitors every 10 minutes (check logs)

## 📊 Monitoring

Backend logs show:
- New mentions detected
- Payments being processed
- Transfer execution status
- Error details

Check backend logs on Render dashboard for real-time monitoring.

## 🚦 Status Indicators

### Payment Status
- **Pending** (🕐): Waiting to be processed
- **Completed** (✅): Successfully executed on-chain
- **Failed** (❌): Error occurred (see error message)

## 🔗 Links

- **Frontend**: https://wassypay.fun
- **Backend**: https://wassy-pay-backend.onrender.com
- **Privy Dashboard**: https://dashboard.privy.io
- **Solscan**: https://solscan.io

## 📚 Documentation

- [FRESH_PRIVY_PLAN.md](./FRESH_PRIVY_PLAN.md) - Complete architectural plan
- [PRIVY_INTEGRATION.md](./PRIVY_INTEGRATION.md) - Old integration docs (deprecated)

## 🎉 What's New in v2.0

- ✅ **Simplified Architecture**: Removed dual provider setup
- ✅ **X Login Only**: Single authentication method via Privy
- ✅ **Auto Wallet Creation**: Privy creates wallet on first login
- ✅ **Cleaner UI**: Modern, streamlined dashboard
- ✅ **Better Error Handling**: Clear error messages for all edge cases
- ✅ **Allowance Tracking**: Backend tracks and decrements delegation allowance
- ✅ **Fresh Database Schema**: Clean tables designed for this flow

## 🤝 Contributing

This is a private project. Contact the maintainer for access.

## 📄 License

All rights reserved.
