export interface ShieldedNote {
  secret: bigint;
  amount: bigint;
  tokenId: bigint;
  commitment: string;
  nullifier: string;
  index: number | null;
  spent: boolean;
}

export interface DepositParams {
  note: ShieldedNote;
  tokenAddress: string;
}

export interface WithdrawParams {
  note: ShieldedNote;
  recipient: string;
  relayer?: string;
  fee?: bigint;
  merkleTree: MerkleTreeState;
}

export interface MerkleTreeState {
  root: string;
  leaves: string[];
  depth: number;
}

export interface ProofResult {
  proof: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
  };
  publicSignals: string[];
}

export interface ViewingKey {
  key: string;
  derivedFrom: string;   // commitment hash it corresponds to
  grantedAt: number;     // timestamp
  grantedTo?: string;    // auditor address, if specific
}
