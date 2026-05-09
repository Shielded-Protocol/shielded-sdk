import * as snarkjs from 'snarkjs';
import type { WithdrawParams, ProofResult } from './types';
import { MerkleTree } from './merkle';

const WITHDRAW_WASM_PATH = './circuits/withdraw_js/withdraw.wasm';
const WITHDRAW_ZKEY_PATH = './circuits/withdraw_final.zkey';

/**
 * Generates a Groth16 withdrawal proof.
 * Runs in a WebWorker in browser environments to avoid blocking the UI.
 * @param params - Withdrawal parameters including the shielded note and recipient
 * @returns Proof and public signals for on-chain submission
 */
export async function generateWithdrawProof(params: WithdrawParams): Promise<ProofResult> {
  const { note, recipient, relayer, fee, merkleTree: treeState } = params;
  
  if (note.index === null) {
      throw new Error('Note index is required for Merkle proof generation');
  }

  // Build Merkle path for the note
  const tree = new MerkleTree(treeState.depth, treeState.leaves);
  const { pathElements, pathIndices, root } = await tree.generateProof(note.index);
  
  const input = {
    secret: note.secret.toString(),
    amount: note.amount.toString(),
    tokenId: note.tokenId.toString(),
    pathElements,
    pathIndices,
    root,
    nullifierHash: note.nullifier,
    recipient,
    relayer: relayer ?? '0',
    fee: (fee ?? 0n).toString(),
    refund: '0',
  };

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    WITHDRAW_WASM_PATH,
    WITHDRAW_ZKEY_PATH,
  );

  return { proof, publicSignals };
}

/**
 * Serializes a proof for submission to the Soroban verifier contract.
 * Packs pi_a, pi_b, pi_c into a single 256-byte Uint8Array.
 * Format: [pi_a (64)] [pi_b (128)] [pi_c (64)]
 */
export function serializeProofForSoroban(proof: ProofResult['proof']): Uint8Array {
  const encoded = new Uint8Array(256);
  
  // Helper to write a big-endian 32-byte field element
  const writeFE = (fe: string, offset: number) => {
    const hex = BigInt(fe).toString(16).padStart(64, '0');
    for (let i = 0; i < 32; i++) {
      encoded[offset + i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
  };

  // pi_a: x, y
  writeFE(proof.pi_a[0], 0);
  writeFE(proof.pi_a[1], 32);

  // pi_b: [[re, im], [re, im], [1, 1]] -> [x_re, x_im, y_re, y_im]
  writeFE(proof.pi_b[0][1], 64);  // x_re
  writeFE(proof.pi_b[0][0], 96);  // x_im
  writeFE(proof.pi_b[1][1], 128); // y_re
  writeFE(proof.pi_b[1][0], 160); // y_im

  // pi_c: x, y
  writeFE(proof.pi_c[0], 192);
  writeFE(proof.pi_c[1], 224);

  return encoded;
}
