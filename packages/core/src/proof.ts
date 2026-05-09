import * as snarkjs from 'snarkjs';
import type { WithdrawParams, ProofResult } from './types';

const WITHDRAW_WASM_PATH = './circuits/withdraw_js/withdraw.wasm';
const WITHDRAW_ZKEY_PATH = './circuits/withdraw_final.zkey';

/**
 * Generates a Groth16 withdrawal proof.
 * Runs in a WebWorker in browser environments to avoid blocking the UI.
 * @param params - Withdrawal parameters including the shielded note and recipient
 * @returns Proof and public signals for on-chain submission
 */
export async function generateWithdrawProof(params: WithdrawParams): Promise<ProofResult> {
  const { note, recipient, relayer, fee, merkleTree } = params;
  
  // Build Merkle path for the note
  const pathElements: string[] = [];
  const pathIndices: number[] = [];
  // TODO: implement actual Merkle path computation from merkleTree state
  
  const input = {
    secret: note.secret.toString(),
    amount: note.amount.toString(),
    tokenId: note.tokenId.toString(),
    pathElements,
    pathIndices,
    root: merkleTree.root,
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
 * Packs pi_a, pi_b, pi_c into a single Bytes object.
 */
export function serializeProofForSoroban(proof: ProofResult['proof']): Uint8Array {
  // Encode as: [pi_a (64 bytes)] [pi_b (128 bytes)] [pi_c (64 bytes)]
  // Each coordinate is a 32-byte big-endian field element
  const encoded: number[] = [];
  // TODO: implement proper BN254 point serialization
  let _ = (proof, encoded);
  return new Uint8Array(encoded);
}
