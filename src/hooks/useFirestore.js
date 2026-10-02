import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

/** Realtime collection. publicOnly adds where('published','==',true) (required by security rules). */
export function useCollection(name, { publicOnly = false } = {}) {
  const [s, setS] = useState({ data: [], loading: true, error: null });
  useEffect(() => {
    if (!db) { setS({ data: [], loading: false, error: 'config' }); return undefined; }
    const ref = publicOnly ? query(collection(db, name), where('published', '==', true)) : collection(db, name);
    return onSnapshot(
      ref,
      (snap) => setS({ data: snap.docs.map((d) => ({ id: d.id, ...d.data() })), loading: false, error: null }),
      (err) => { console.error(name, err); setS({ data: [], loading: false, error: err.code || 'error' }); }
    );
  }, [name, publicOnly]);
  return s;
}

/** Realtime single document. data === null when it does not exist yet. */
export function useDocument(col, id) {
  const [s, setS] = useState({ data: null, loading: true, error: null });
  useEffect(() => {
    if (!db) { setS({ data: null, loading: false, error: 'config' }); return undefined; }
    return onSnapshot(
      doc(db, col, id),
      (d) => setS({ data: d.exists() ? d.data() : null, loading: false, error: null }),
      (err) => { console.error(col, err); setS({ data: null, loading: false, error: err.code || 'error' }); }
    );
  }, [col, id]);
  return s;
}
