import { buildPoseidon } from 'circomlibjs';
import { randomBytes } from 'crypto';
import type { ShieldedNote } from './types';

/** 
 * Creates a new shielded note with a random secret.
 * The commitment is the Poseidon hash of (secret, amount, tokenId).
 * Store the returned note securely — losing the secret means losing funds.
 */
export async function createNote(amount: bigint, tokenId: bigint): Promise<ShieldedNote> {
  const poseidon = await buildPoseidon();
  const secret = BigInt('0x' + randomBytes(31).toString('hex'));
  
  const commitment = poseidon([secret, amount, tokenId]);
  const nullifier = poseidon([secret]);

  return {
    secret,
    amount,
    tokenId,
    commitment: poseidon.F.toString(commitment),
    nullifier: poseidon.F.toString(nullifier),
    index: null,    // set after on-chain deposit confirmed
    spent: false,
  };
}

/**
 * Serializes a note to a string for encrypted storage.
 * Never store this unencrypted.
 */
export function serializeNote(note: ShieldedNote): string {
  return JSON.stringify({
    secret: note.secret.toString(),
    amount: note.amount.toString(),
    tokenId: note.tokenId.toString(),
    index: note.index,
  });
}

export async function deserializeNote(raw: string): Promise<ShieldedNote> {
  const poseidon = await buildPoseidon();
  const parsed = JSON.parse(raw);
  const secret = BigInt(parsed.secret);
  const amount = BigInt(parsed.amount);
  const tokenId = BigInt(parsed.tokenId);
  
  const commitment = poseidon([secret, amount, tokenId]);
  const nullifier = poseidon([secret]);

  return {
    secret,
    amount,
    tokenId,
    commitment: poseidon.F.toString(commitment),
    nullifier: poseidon.F.toString(nullifier),
    index: parsed.index,
    spent: false,
  };
}
