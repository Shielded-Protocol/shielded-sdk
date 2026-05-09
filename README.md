# shielded-sdk

> TypeScript SDK for the Shielded Protocol.

Part of [shielded-protocol](https://github.com/Shielded-Protocol) — 
private, compliant DeFi on Stellar.

[![CI](https://github.com/Shielded-Protocol/shielded-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/Shielded-Protocol/shielded-sdk/actions)
[![Stellar Wave](https://img.shields.io/badge/Stellar-Wave-blue)](https://drips.network/wave/stellar)

## What this does

The Shielded SDK provides the tools necessary to interact with the Shielded Protocol from TypeScript environments. It handles commitment creation, ZK proof generation, and communication with Soroban smart contracts.

The SDK is organized as a pnpm monorepo:
- `@shielded/core`: Core logic for commitments and proofs.
- `@shielded/react`: React hooks and providers for easy integration.
- `@shielded/compliance`: Tools for regulatory compliance and auditing.

## Quickstart

```bash
pnpm install
pnpm build
pnpm test
```

## Architecture

[Link to shielded-docs](https://github.com/Shielded-Protocol/shielded-docs)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).  
Browse [Wave-ready issues](../../issues?q=label%3Astatus%3Awave-ready).

## License

MIT
