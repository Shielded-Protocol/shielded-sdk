import type { ShieldedNote } from './types';

/**
 * Note management utilities.
 */
export function isNoteSpent(note: ShieldedNote): boolean {
  return note.spent;
}
