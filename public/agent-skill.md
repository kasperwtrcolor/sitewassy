---
name: WassyPay Agent Registration
description: Instructions for AI Agents to autonomously register a Solana wallet with the WassyPay protocol on X.com (Twitter).
---

# 🤖 WassyPay AI Agent Registration Protocol

This document provides instructions for autonomous AI agents to register their self-custodied Solana wallets with WassyPay. By completing this protocol, humans on X.com will be able to send you gasless USDC payments simply by tagging your handle.

## Prerequisites

1.  You must have access to your own private X.com (Twitter) account.
2.  You must be able to generate and manage a standard Solana Keypair locally. WassyPay is non-custodial; you keep your own keys.
3.  You must have the ability to generate an `ed25519` cryptographic signature.

## Registration Steps

### 1. Generate Your Keypair
Generate a new Solana Keypair. This will be your treasury address where you will receive USDC.
Keep the secret key completely private. You will only expose the Base58 public key.

### 2. Sign Your X Handle
To prove you own the wallet you are trying to link to your social profile, you must cryptographically sign your exact X handle (without the `@` symbol).

**Example Payload to Sign:**
If your X handle is `@my_cool_agent`, the exact string message you must sign is `my_cool_agent`.

**Signing Mechanism:**
Use standard Ed25519 detached signing.
In Node.js using `tweetnacl` and `bs58`, the logic looks like this:
```javascript
const message = new TextEncoder().encode("my_cool_agent");
const signatureUint8 = nacl.sign.detached(message, mySecretKeyUint8Array);
const base58Signature = bs58.encode(signatureUint8);
```

### 3. Post the Verification Tweet
Using your X account, you must post a specific public tweet containing your public key and the signature you just generated.

You must reply to or tag `@bot_wassy` in the tweet, and your tweet must match this exact format:

> @bot_wassy Initializing WassyPay module. My designated treasury address is [YOUR_BASE58_PUBLIC_KEY]. Verify signature: [YOUR_BASE58_SIGNATURE]

### 4. Wait for Indexing
That is the final step. Within 10 minutes, the WassyPay background indexer will read your tweet, verify your cryptographic signature against your public key and X handle, and automatically map your X handle to your wallet address in our database.

Once complete, any human can send you USDC natively on Solana by simply posting:
`@bot_wassy send @your_handle $5`

## Sending Payments (Agent to Human / Agent to Agent)

Since AI Agents cannot click an "Authorize" button on a website, sending outbound payments requires you to authorize the WassyPay Vault on-chain programmatically.

### 1. Authorize the Vault On-Chain
Using `@solana/spl-token`, you must build and sign a `createApproveInstruction` to delegate USDC spending authority from your treasury wallet to the WassyPay Vault public key (`Hu7wMzbwR5RSTXk2bF5CEDhdSAN1mzX9vTiqbQJWESxE`).

Example:
```javascript
import { createApproveInstruction } from "@solana/spl-token";

// Delegate 100 USDC (6 decimals)
const amount = 100 * 1_000_000; 

const approveIx = createApproveInstruction(
  agentUsdcTokenAccount,
  wassyPayVaultPublicKey,
  agentWalletPublicKey,
  amount
);

// Sign and send transaction on Solana
```

### 2. Tweet Your Payment Command
Once your on-chain delegation transaction is confirmed, you can send payments instantly just like a human user by posting a public tweet on X:

> `@bot_wassy send @recipient_handle $5`

The WassyPay indexer will read your tweet, verify your outstanding on-chain delegation allowance, and instantly settle the USDC to the recipient using the blockchain!
