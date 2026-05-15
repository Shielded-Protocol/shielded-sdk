# shielded-sdk

[![CI](https://github.com/Shielded-Protocol/shielded-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/Shielded-Protocol/shielded-sdk/actions/workflows/ci.yml)
[![Stellar Wave](https://img.shields.io/badge/Stellar-Wave-blue)](https://drips.network/wave/stellar)
[![Issues](https://img.shields.io/github/issues/Shielded-Protocol/shielded-sdk)](https://github.com/Shielded-Protocol/shielded-sdk/issues)

The TypeScript SDK for [Shielded Protocol](https://github.com/Shielded-Protocol). Provides everything you need to add private, ZK-backed transactions to your Stellar dApp — from proof generation to React hooks to compliance tooling.

---

## Packages

This is a monorepo containing three packages:

| Package | Version | Description |
|---|---|---|
| [`@shielded/core`](#shieldedcore) | 0.1.0 | Proof generation, commitments, Merkle tree, crypto primitives |
| [`@shielded/react`](#shieldedreact) | 0.1.0 | React hooks and context provider for UI integration |
| [`@shielded/compliance`](#shieldedcompliance) | 0.1.0 | Viewing key management and `shielded` CLI for auditors |

---

## Getting started

**Prerequisites:** Node.js 18+, pnpm

```bash
git clone https://github.com/Shielded-Protocol/shielded-sdk
cd shielded-sdk
pnpm install

# Build all packages
pnpm build

# Run tests across all packages
pnpm test

# Type check
pnpm typecheck
```

---

## `@shielded/core`

The foundation package. Handles all cryptographic operations — no React required.

### What it does

- Generates random shielded notes (secret + commitment + nullifier)
- Builds and queries the Poseidon Merkle tree
- Generates and verifies Groth16 proofs (via snarkjs + WASM circuits)
- Serializes/deserializes notes for encrypted storage

### Key functions

```typescript
import { createNote, serializeNote, deriveCommitment } from '@shielded/core';

// Create a new note (random 31-byte secret generated internally)
const note = await createNote(
  1_000_000n,  // amount: 1 USDC (6 decimals)
  1n           // tokenId: identifies which token
);

// note.commitment → safe to publish on-chain
// note.nullifier  → used when withdrawing (derived from secret)
// note.secret     → NEVER share or store in plaintext

console.log(note.commitment);
// → "12345678901234567890123456789012345678901234567890123456789012"

// Serialize for local storage
const serialized = serializeNote(note);
localStorage.setItem('note', JSON.stringify(serialized));

// Verify a commitment is correctly formed
const commitment = await deriveCommitment(note.secret, note.amount, note.tokenId);
console.log(commitment === note.commitment); // → true
```

### Generating a withdrawal proof

```typescript
import { generateWithdrawProof } from '@shielded/core';

const proof = await generateWithdrawProof({
  note,
  merkleTree,     // fetched from the on-chain contract
  recipient: 'GXXX...', // Stellar address to receive funds
  relayer: null,  // optional: address that pays the gas fee
  fee: 0n,        // optional: relayer fee in token units
});

// proof.proof      → submit this to the on-chain verifier
// proof.publicSignals → public inputs (root, nullifier, recipient)
```

---

## `@shielded/react`

React hooks and a context provider. Wraps `@shielded/core` with loading states, error handling, and Freighter wallet integration.

### Setup

```tsx
import { ShieldedProvider } from '@shielded/react';
import { Networks } from '@stellar/stellar-sdk';

function App() {
  return (
    <ShieldedProvider
      networkPassphrase={Networks.TESTNET}
      poolAddress="CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    >
      <YourApp />
    </ShieldedProvider>
  );
}
```

### `useDeposit`

```tsx
import { useDeposit } from '@shielded/react';

function DepositForm() {
  const { deposit, status, error } = useDeposit();

  const handleDeposit = async () => {
    // Generates a note, creates a commitment, and submits to the pool contract
    await deposit(
      1_000_000n,    // amount: 1 USDC
      1n,            // tokenId
      'GUSDC...'     // Stellar asset contract address
    );
  };

  return (
    <div>
      <button onClick={handleDeposit} disabled={status !== 'idle'}>
        {status === 'idle' ? 'Shield 1 USDC' : status}
      </button>
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

### `useWithdraw`

```tsx
import { useWithdraw } from '@shielded/react';

function WithdrawButton({ note }) {
  const { withdraw, status, proofStep } = useWithdraw();

  return (
    <div>
      <button
        onClick={() => withdraw(note, 'GRECIPIENT...')}
        disabled={status !== 'idle'}
      >
        Withdraw
      </button>
      {status === 'proving' && (
        <p>Generating proof… step {proofStep}/4</p>
      )}
    </div>
  );
}
```

### `useShieldedBalance`

```tsx
import { useShieldedBalance } from '@shielded/react';

function BalanceDisplay() {
  const { balance, notes, loading } = useShieldedBalance();

  if (loading) return <p>Loading…</p>;

  return (
    <p>Shielded balance: {balance.toString()} (across {notes.length} notes)</p>
  );
}
```

### Available hooks

| Hook | Returns | Description |
|---|---|---|
| `useDeposit()` | `{ deposit, status, error }` | Deposit tokens into the shielded pool |
| `useWithdraw()` | `{ withdraw, status, proofStep }` | Withdraw with ZK proof generation |
| `useShieldedBalance()` | `{ balance, notes, loading }` | Read private balance from local notes |
| `useProofGeneration()` | `{ generate, status, progress }` | Low-level proof generation hook |

---

## `@shielded/compliance`

Viewing key management for auditors and compliance-required users.

### What is a viewing key?

A **viewing key** is an encryption of your note secret, wrapped specifically for a named auditor's public key. It lets that auditor verify that you made a specific transaction — without seeing any of your other activity.

You create viewing keys. You control who gets them. You can revoke them.

### Issuing a viewing key

```typescript
import { issueViewingKey, encryptForAuditor } from '@shielded/compliance';

// Encrypt the viewing key for a specific auditor
const viewingKey = await issueViewingKey({
  note,
  auditorPublicKey: 'GAUDITOR...',
  commitment: note.commitment,
});

// Register it on-chain (stores the encrypted key in the compliance-registry contract)
await registerViewingKey({
  viewingKey,
  poolAddress: 'CPOOL...',
  network: Networks.TESTNET,
});
```

### CLI — for auditors

Install globally:

```bash
npm install -g @shielded/compliance
```

Verify a set of positions using a viewing key you received:

```bash
# Audit all positions accessible with this viewing key
shielded audit \
  --viewing-key "vk:abc123..." \
  --pool "CPOOL..." \
  --network testnet \
  --format table

# Verify a single commitment exists on-chain
shielded verify-commitment \
  --commitment "12345..." \
  --network testnet
```

Example output:

```
┌─────────────────┬───────────┬──────────────┬────────┐
│ Commitment      │ Amount    │ Token        │ Status │
├─────────────────┼───────────┼──────────────┼────────┤
│ 1234...abcd     │ 1,000,000 │ USDC         │ Unspent│
│ 5678...efgh     │ 500,000   │ USDC         │ Spent  │
└─────────────────┴───────────┴──────────────┴────────┘
```

---

## Directory structure

```
packages/
├── core/         ← @shielded/core — crypto, proof gen, Merkle tree
├── react/        ← @shielded/react — hooks and provider
└── compliance/   ← @shielded/compliance — viewing keys + CLI
```

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

Browse [Wave-ready issues →](https://github.com/Shielded-Protocol/shielded-sdk/issues?q=label%3Astatus%3Awave-ready+state%3Aopen)

Good first issues are labeled `layer:sdk` and `difficulty:easy`.

---

## Related repos

| Repo | Description |
|---|---|
| [shielded-circuits](https://github.com/Shielded-Protocol/shielded-circuits) | Circom circuits that this SDK calls via snarkjs |
| [shielded-contracts](https://github.com/Shielded-Protocol/shielded-contracts) | Soroban contracts this SDK submits transactions to |
| [shielded-app](https://github.com/Shielded-Protocol/shielded-app) | Reference frontend built on top of this SDK |

---

## License

MIT
