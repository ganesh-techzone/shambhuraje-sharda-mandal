import { useEffect, useState } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useDocument } from '../hooks/useFirestore';
import { FieldInput, initial, SAVING, SAVED, SAVE_ERR } from './Crud';
import { useToast } from './ui';

/** Realtime editor for one Firestore document (aarti/main, liveStatus/main ...). */
export default function Singleton({ col, id = 'main', title, fields, defaults = {}, note }) {
  const { data, loading, error } = useDocument(col, id);
  const [v, setV] = useState(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  useEffect(() => { if (!loading) setV({ ...initial(fields), ...defaults, ...(data || {}) }); }, [loading, data]); // eslint-disable-line
  async function save(e) {
    e.preventDefault(); setBusy(true); toast(SAVING, 'info');
    try { await setDoc(doc(db, col, id), { ...v, updatedAt: serverTimestamp() }, { merge: true }); toast(SAVED, 'success'); }
    catch (err) { console.error(err); toast(SAVE_ERR, 'error'); }
    setBusy(false);
  }
  if (loading || !v) return <div className="empty">माहिती लोड होत आहे...</div>;
  if (error) return <div className="empty err">माहिती आणताना त्रुटी आली ({error}).</div>;
  return (
    <section className="panel">
      <div className="ptop"><h2>{title}</h2></div>
      {note && <p className="hintp">{note}</p>}
      <form onSubmit={save} className="form two">
        {fields.map((f) => <FieldInput key={f.k} f={f} v={v[f.k]} set={(x) => setV((p) => ({ ...p, [f.k]: x }))} folder={col} />)}
        <div className="row end full"><button className="btn" disabled={busy}>{busy ? 'जतन होत आहे...' : 'जतन करा'}</button></div>
      </form>
    </section>
  );
}
