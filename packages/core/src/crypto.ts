import { buildPoseidon } from 'circomlibjs';

/**
 * Poseidon hash implementation wrapper.
 */
export async function poseidonHash(inputs: bigint[]): Promise<string> {
  const poseidon = await buildPoseidon();
  const hash = poseidon(inputs);
  return poseidon.F.toString(hash);
}

/**
 * Derives a nullifier from a secret.
 */
export async function deriveNullifier(secret: bigint): Promise<string> {
  return poseidonHash([secret, BigInt(1)]);
}
