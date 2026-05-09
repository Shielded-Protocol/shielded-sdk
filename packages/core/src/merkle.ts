import { buildPoseidon } from 'circomlibjs';

/**
 * Client-side Merkle tree implementation mirroring the on-chain state.
 * Used for generating inclusion proofs (pathElements, pathIndices).
 */
export class MerkleTree {
  private depth: number;
  private leaves: string[];
  private zeros: string[] = [];
  private poseidon: any;

  constructor(depth: number = 20, leaves: string[] = []) {
    this.depth = depth;
    this.leaves = leaves;
  }

  private async init() {
    if (this.poseidon) return;
    this.poseidon = await buildPoseidon();
    
    // Precompute zeros
    let current = '0';
    this.zeros.push(current);
    for (let i = 0; i < this.depth; i++) {
      current = this.hash(current, current);
      this.zeros.push(current);
    }
  }

  private hash(left: string, right: string): string {
    const res = this.poseidon([left, right]);
    return this.poseidon.F.toString(res);
  }

  /**
   * Adds a commitment to the tree.
   */
  async insert(leaf: string): Promise<number> {
    await this.init();
    this.leaves.push(leaf);
    return this.leaves.length - 1;
  }

  /**
   * Computes the current root of the tree.
   */
  async getRoot(): Promise<string> {
    await this.init();
    let nodes = [...this.leaves];
    
    // Pad with zeros to next power of 2 if needed (for simple implementation)
    // Actually, we can just hash up to the depth.
    
    let currentLevelNodes = nodes;
    for (let i = 0; i < this.depth; i++) {
      const nextLevelNodes: string[] = [];
      for (let j = 0; j < currentLevelNodes.length; j += 2) {
        const left = currentLevelNodes[j];
        const right = j + 1 < currentLevelNodes.length ? currentLevelNodes[j + 1] : this.zeros[i];
        nextLevelNodes.push(this.hash(left, right));
      }
      if (nextLevelNodes.length === 0) {
          nextLevelNodes.push(this.zeros[i+1]);
      }
      currentLevelNodes = nextLevelNodes;
    }
    
    return currentLevelNodes[0];
  }

  /**
   * Generates a Merkle inclusion proof for a leaf at a given index.
   */
  async generateProof(index: number) {
    await this.init();
    const pathElements: string[] = [];
    const pathIndices: number[] = [];
    
    let currentIndex = index;
    let currentLevelNodes = [...this.leaves];
    
    for (let i = 0; i < this.depth; i++) {
      const isRight = currentIndex % 2 === 1;
      const siblingIndex = isRight ? currentIndex - 1 : currentIndex + 1;
      
      const sibling = siblingIndex < currentLevelNodes.length 
        ? currentLevelNodes[siblingIndex] 
        : this.zeros[i];
        
      pathElements.push(sibling);
      pathIndices.push(isRight ? 1 : 0);
      
      // Move to next level
      const nextLevelNodes: string[] = [];
      for (let j = 0; j < currentLevelNodes.length; j += 2) {
        const left = currentLevelNodes[j];
        const right = j + 1 < currentLevelNodes.length ? currentLevelNodes[j + 1] : this.zeros[i];
        nextLevelNodes.push(this.hash(left, right));
      }
      currentLevelNodes = nextLevelNodes;
      currentIndex = Math.floor(currentIndex / 2);
    }
    
    return {
      pathElements,
      pathIndices,
      root: currentLevelNodes[0]
    };
  }
}
