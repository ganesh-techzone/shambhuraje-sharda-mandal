import { doc, runTransaction } from 'firebase/firestore';
import { db } from '../firebase/config';

/** Atomically reserves n sequence numbers; returns the number BEFORE the first reserved one. */
export async function reserveSeq(key, n = 1) {
  const ref = doc(db, 'counters', 'main');
  return runTransaction(db, async (t) => {
    const s = await t.get(ref);
    const cur = (s.exists() && s.data()[key]) || 0;
    t.set(ref, { [key]: cur + n }, { merge: true });
    return cur;
  });
}
