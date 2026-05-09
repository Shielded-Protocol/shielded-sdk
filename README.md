# shielded-sdk

> TypeScript SDK for Shielded Protocol.

Part of [Shielded Protocol](https://github.com/Shielded-Protocol) —
private, compliant DeFi on Stellar.

[![CI](https://github.com/Shielded-Protocol/shielded-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/Shielded-Protocol/shielded-sdk/actions/workflows/ci.yml)
[![Stellar Wave](https://img.shields.io/badge/Stellar-Wave-blue)](https://drips.network/wave/stellar)
[![Issues](https://img.shields.io/github/issues/Shielded-Protocol/shielded-sdk)](https://github.com/Shielded-Protocol/shielded-sdk/issues)

---

## Packages

| Package | Version | Description |
|---|---|---|
| `@shielded/core` | 0.1.0 | Proof generation, commitments, Merkle tree, crypto utilities |
| `@shielded/react` | 0.1.0 | React hooks: useDeposit, useWithdraw, useShieldedBalance |
| `@shielded/compliance` | 0.1.0 | Viewing key management + `shielded audit` CLI |

---

## Quickstart

```bash
# Install (requires pnpm)
npm install -g pnpm
git clone https://github.com/Shielded-Protocol/shielded-sdk
cd shielded-sdk
pnpm install

# Run tests
pnpm test

# Type check
pnpm typecheck

# Build all packages
pnpm build
```

---

## Usage — @shielded/core

```typescript
import { createNote, serializeNote, deriveCommitment } from '@shielded/core';

// Create a new shielded note (random secret generated internally)
const note = await createNote(
  1_000_000n,  // 1 USDC (6 decimals)
  1n           // tokenId for USDC
);

console.log(note.commitment);  // safe to publish on-chain
console.log(note.nullifier);   // used when withdrawing
// note.secret — NEVER share this

// Serialize for encrypted storage
const stored = serializeNote(note);
localStorage.setItem('my-note', JSON.stringify(stored));
```

---

## Usage — @shielded/react

```tsx
import { ShieldedProvider, useDeposit, useShieldedBalance } from '@shielded/react';

function App() {
  return (
    <ShieldedProvider
      networkPassphrase={Networks.TESTNET}
      poolAddress="C...contractAddress"
    >
      <DepositButton />
    </ShieldedProvider>
  );
}

function DepositButton() {
  const { deposit, status } = useDeposit();

  return (
    <button onClick={() => deposit(1_000_000n, 1n, USDC_ADDRESS)}>
      {status === 'idle' ? 'Shield 1 USDC' : status}
    </button>
  );
}
```

---

## Usage — compliance CLI

```bash
# Install globally
npm install -g @shielded/compliance

# Audit positions with a viewing key
shielded audit --viewing-key "vk:abc123..." --format table

# Verify a commitment exists on-chain
shielded verify-commitment --commitment "12345..." --network testnet
```

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

Browse [Wave-ready issues](https://github.com/Shielded-Protocol/shielded-sdk/issues?q=label%3Astatus%3Awave-ready+state%3Aopen).

---

## License

MIT
