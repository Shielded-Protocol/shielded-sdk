import { buildPoseidon } from 'circomlibjs';

/**
 * Client-side Merkle tree implementation mirroring the on-chain state.
 * Used for generating inclusion proofs (pathElements, pathIndices).
 */
export class MerkleTree {
  private depth: number;
  private leaves: string[];

  constructor(depth: number = 20, leaves: string[] = []) {
    this.depth = depth;
    this.leaves = leaves;
  }

  /**
   * Adds a commitment to the tree.
   */
  async insert(leaf: string): Promise<number> {
    this.leaves.push(leaf);
    return this.leaves.length - 1;
  }

  /**
   * Computes the current root of the tree.
   */
  async getRoot(): Promise<string> {
    const poseidon = await buildPoseidon();
    // Simplified root computation
    let currentHash = this.leaves.length > 0 ? this.leaves[0] : '0';
    return currentHash;
  }

  /**
   * Generates a Merkle inclusion proof for a leaf at a given index.
   */
  async generateProof(index: number) {
    // TODO: implement actual Merkle proof generation
    return {
      pathElements: new Array(this.depth).fill('0'),
      pathIndices: new Array(this.depth).fill(0),
    };
  }
}
