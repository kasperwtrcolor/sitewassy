# Devbase Schema Update Prompt

## Purpose
This document contains the prompt you should use to update your Devbase schema to add the `delegations` entity for tracking Privy wallet authorization status.

**Note:** This is **OPTIONAL**. The current implementation uses localStorage for delegation tracking, which works fine. Only add this if you want server-side tracking.

---

## Prompt to Send to DevFun

```
Please add the following entity to the Devbase schema for app 699840f631c97306a0c4:

Entity Name: delegations

Fields:
- userId (String): The user's Solana wallet address
- delegate (String): The delegate address (vault address)
- allowance (Number): The approved USDC amount in dollars
- status (String): "active" or "revoked"
- createdAt (String): ISO timestamp of when delegation was created
- signature (String): The Solana transaction signature of the approval

Rules:
- create: Only the user can create their own delegation ($USER_ID === $newData.userId)
- list: Anyone can list delegations (for backend checking)
- get: Only the user can get their own delegation ($USER_ID === $data.userId)

Full Schema:

{
  "delegations": {
    "fields": {
      "userId": "String",
      "delegate": "String",
      "allowance": "Number",
      "status": "String",
      "createdAt": "String",
      "signature": "String"
    },
    "rules": {
      "create": "$USER_ID === $newData.userId",
      "list": "true",
      "get": "$USER_ID === $data.userId"
    }
  }
}
```

---

## After Schema is Added

If you add this entity, update the frontend code to sync with Devbase:

### In `handleAuthorizeDelegation()` function (src/App.jsx ~line 210):

Replace:
```javascript
// Store delegation status in localStorage
const delegationData = {
  authorized: true,
  allowance: 1000,
  walletAddress: solanaAddress,
  timestamp: Date.now(),
  signature: signature
};
localStorage.setItem(`delegation_${solanaAddress}`, JSON.stringify(delegationData));
```

With:
```javascript
// Store delegation status in Devbase
await devbaseClient.createEntity('delegations', {
  userId: solanaAddress,
  delegate: VAULT_ADDRESS,
  allowance: 1000,
  status: 'active',
  createdAt: new Date().toISOString(),
  signature: signature
});

// Also keep in localStorage for offline access
const delegationData = {
  authorized: true,
  allowance: 1000,
  walletAddress: solanaAddress,
  timestamp: Date.now(),
  signature: signature
};
localStorage.setItem(`delegation_${solanaAddress}`, JSON.stringify(delegationData));
```

### In the delegation check useEffect (src/App.jsx ~line 232):

Replace:
```javascript
useEffect(() => {
  if (privyWallet && privyWallet.address) {
    const storedDelegation = localStorage.getItem(`delegation_${privyWallet.address}`);
    if (storedDelegation) {
      try {
        const data = JSON.parse(storedDelegation);
        setIsDelegationAuthorized(data.authorized || false);
        setDelegationAllowance(data.allowance || 0);
      } catch (e) {
        console.error("Error parsing delegation data:", e);
      }
    }
  }
}, [privyWallet]);
```

With:
```javascript
useEffect(() => {
  const checkDelegation = async () => {
    if (privyWallet && privyWallet.address && devbaseClient) {
      try {
        // Check Devbase first
        const delegations = await devbaseClient.listEntities('delegations', {
          userId: privyWallet.address,
          status: 'active'
        });

        if (delegations.length > 0) {
          const delegation = delegations[0];
          setIsDelegationAuthorized(true);
          setDelegationAllowance(delegation.allowance || 0);
          return;
        }

        // Fallback to localStorage
        const storedDelegation = localStorage.getItem(`delegation_${privyWallet.address}`);
        if (storedDelegation) {
          const data = JSON.parse(storedDelegation);
          setIsDelegationAuthorized(data.authorized || false);
          setDelegationAllowance(data.allowance || 0);
        }
      } catch (e) {
        console.error("Error checking delegation:", e);
      }
    }
  };

  checkDelegation();
}, [privyWallet, devbaseClient]);
```

---

## Backend Usage

If you add the Devbase entity, your backend can check delegation status:

```javascript
// In server.js, before executing transfer
const delegationResponse = await fetch(
  `https://devbase.dev.fun/api/v1/app/699840f631c97306a0c4/eval`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-devbase-secret': process.env.DEVBASE_SECRET
    },
    body: JSON.stringify({
      expression: `$ENTITY('delegations').list({ userId: "${senderWallet}", status: "active" })`
    })
  }
);

const { data: delegations } = await delegationResponse.json();

if (delegations.length === 0) {
  console.log(`⚠️ User ${senderWallet} has not authorized delegation`);
  continue;
}

const delegation = delegations[0];
if (delegation.allowance < parsed.amount) {
  console.log(`⚠️ Insufficient delegation allowance`);
  continue;
}

// Proceed with transfer...
```

---

## Why This is Optional

**Current Implementation (localStorage):**
- ✅ Works immediately without schema changes
- ✅ No Devbase dependency
- ✅ Fast local checking
- ❌ Not synced across devices
- ❌ Can be cleared by user

**With Devbase Entity:**
- ✅ Synced across all devices
- ✅ Backend can verify delegation
- ✅ Persistent and reliable
- ❌ Requires schema update
- ❌ Network call needed to check

**Recommendation:** Start with localStorage, add Devbase entity later if needed.
