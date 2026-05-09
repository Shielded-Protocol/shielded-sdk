import { createNote } from '../src/commitment';

describe('Commitment', () => {
  it('should create a valid note with commitment and nullifier', async () => {
    const amount = 100n;
    const tokenId = 1n;
    const note = await createNote(amount, tokenId);

    expect(note.amount).toBe(amount);
    expect(note.tokenId).toBe(tokenId);
    expect(note.commitment).toBeDefined();
    expect(note.nullifier).toBeDefined();
    expect(note.secret).toBeDefined();
    
    // Commitment should be a hex string starting with 0x (or just hex)
    expect(typeof note.commitment).toBe('string');
  });
});
