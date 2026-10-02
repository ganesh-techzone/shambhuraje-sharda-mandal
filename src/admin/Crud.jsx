import { useMemo, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useCollection } from '../hooks/useFirestore';
import { uploadImage, removeImage } from '../services/storage';
import { reserveSeq } from '../services/counters';
import { fmtDate, fmtTime, money, mr, pad, tsMillis } from '../utils/mr';
import { Modal, Confirm, useToast } from './ui';

export const SAVING = 'माहिती जतन होत आहे...';
export const SAVED = 'माहिती यशस्वीरित्या जतन झाली.';
export const SAVE_ERR = 'माहिती जतन करताना त्रुटी आली.';

function ImageInput({ v, set, folder }) {
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  async function pick(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    try { set(await uploadImage(f, folder)); toast('फोटो अपलोड झाला.', 'success'); }
    catch (err) { console.error(err); toast('फोटो अपलोड करताना त्रुटी आली.', 'error'); }
    setBusy(false);
  }
  return (
    <div className="imgin">
      {v && <img src={v} alt="निवडलेला फोटो" />}
      <input type="file" accept="image/*" onChange={pick} disabled={busy} />
      {busy && <small>अपलोड होत आहे...</small>}
      {v && !busy && <button type="button" className="btn ghost sm" onClick={() => set('')}>फोटो काढा</button>}
    </div>
  );
}

export function FieldInput({ f, v, set, folder }) {
  const id = 'f_' + f.k;
  if (f.type === 'bool') return <label className="chk"><input type="checkbox" checked={!!v} onChange={(e) => set(e.target.checked)} /> {f.label}</label>;
  return (
    <label htmlFor={id} className="fld">
      <span>{f.label}{f.req && ' *'}</span>
      {f.type === 'textarea' ? <textarea id={id} rows={4} value={v ?? ''} onChange={(e) => set(e.target.value)} />
        : f.type === 'select' ? <select id={id} value={v ?? ''} onChange={(e) => set(e.target.value)}>{f.options.map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select>
        : f.type === 'image' ? <ImageInput v={v} set={set} folder={folder} />
        : <input id={id} type={f.type || 'text'} inputMode={f.type === 'number' ? 'decimal' : undefined} value={v ?? ''} onChange={(e) => set(e.target.value)} required={f.req} min={f.type === 'number' ? 0 : undefined} step={f.type === 'number' ? 'any' : undefined} />}
      {f.hint && <small>{f.hint}</small>}
    </label>
  );
}

export const initial = (fields) => Object.fromEntries(fields.filter((f) => !f.ro).map((f) => [f.k, f.def ?? (f.type === 'bool' ? false : f.type === 'select' ? f.options[0][0] : '')]));

function cell(f, r) {
  const v = r[f.k];
  if (f.type === 'bool') return v ? 'होय' : 'नाही';
  if (f.type === 'select') return (f.options.find((o) => o[0] === v) || [])[1] || v || '—';
  if (f.type === 'image') return v ? <img className="thumb" src={v} alt="" loading="lazy" /> : '—';
  if (f.type === 'date') return fmtDate(v) || '—';
  if (f.type === 'time') return fmtTime(v) || '—';
  if (f.type === 'number' && f.money) return money(v);
  return v === undefined || v === '' ? '—' : String(v);
}

/**
 * Generic realtime CRUD table backed by a Firestore collection.
 * props: col, title, fields, columns, filters, autoId{field,key,prefix,pad}, sortKey, desc, tools(data),
 *        rowExtra(row), beforeSave(data,isEdit), afterSave(id,data,isEdit), addLabel
 */
export default function Crud({ col, title, fields, columns, filters = [], autoId, sortKey = 'createdAt', desc = true, tools, rowExtra, beforeSave, afterSave, addLabel = 'नवीन जोडा', searchable = true }) {
  const { data, loading, error } = useCollection(col);
  const toast = useToast();
  const [q, setQ] = useState('');
  const [fv, setFv] = useState({});
  const [limit, setLimit] = useState(50);
  const [form, setForm] = useState(null);
  const [vals, setVals] = useState({});
  const [busy, setBusy] = useState(false);
  const [del, setDel] = useState(null);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    const val = (r) => { const x = r[sortKey]; return typeof x === 'number' ? x : x?.toMillis ? tsMillis(x) : x ?? ''; };
    return data
      .filter((r) => filters.every((k) => !fv[k] || String(r[k] ?? '') === fv[k]))
      .filter((r) => !s || fields.some((f) => ['text', 'tel', undefined, 'number', 'textarea'].includes(f.type) && String(r[f.k] ?? '').toLowerCase().includes(s)))
      .sort((a, b) => { const x = val(a), y = val(b); const c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y)); return desc ? -c : c; });
  }, [data, q, fv, filters, fields, sortKey, desc]);

  const open = (r) => { setForm(r || {}); setVals(r ? { ...initial(fields), ...r } : initial(fields)); };
  const imgField = fields.find((f) => f.type === 'image');

  async function save(e) {
    e.preventDefault();
    setBusy(true); toast(SAVING, 'info');
    try {
      let d = { ...vals };
      fields.forEach((f) => { if (f.ro) delete d[f.k]; if (f.type === 'number' && d[f.k] !== '' && d[f.k] != null) d[f.k] = Number(d[f.k]); });
      delete d.id; delete d.createdAt; delete d.updatedAt;
      if (beforeSave) d = await beforeSave(d, !!form.id);
      if (form.id) { await updateDoc(doc(db, col, form.id), { ...d, updatedAt: serverTimestamp() }); if (afterSave) await afterSave(form.id, d, true); }
      else {
        if (autoId) { const n = (await reserveSeq(autoId.key, 1)) + 1; d[autoId.field] = autoId.prefix + pad(n, autoId.pad); }
        const ref = await addDoc(collection(db, col), { ...d, createdAt: serverTimestamp() });
        if (afterSave) await afterSave(ref.id, d, false);
      }
      toast(SAVED, 'success'); setForm(null);
    } catch (err) { console.error(err); toast(err.userMessage || SAVE_ERR, 'error'); }
    setBusy(false);
  }
  async function remove() {
    setBusy(true);
    try { await deleteDoc(doc(db, col, del.id)); if (imgField) await removeImage(del[imgField.k]); toast('माहिती हटवली.', 'success'); setDel(null); }
    catch (err) { console.error(err); toast('माहिती हटवताना त्रुटी आली.', 'error'); }
    setBusy(false);
  }
  async function togglePublish(r) {
    try { await updateDoc(doc(db, col, r.id), { published: !r.published }); toast(r.published ? 'अप्रकाशित केले.' : 'प्रकाशित केले.', 'success'); }
    catch (err) { console.error(err); toast(SAVE_ERR, 'error'); }
  }

  const colFields = columns.map((k) => fields.find((f) => f.k === k)).filter(Boolean);
  const hasPub = fields.some((f) => f.k === 'published');

  return (
    <section className="panel">
      <div className="ptop">
        <h2>{title} <small>({mr(rows.length)})</small></h2>
        <div className="row">
          {tools && tools(data)}
          <button className="btn" onClick={() => open(null)}>＋ {addLabel}</button>
        </div>
      </div>
      <div className="row filt">
        {searchable && <input className="search" type="search" placeholder="शोधा..." aria-label="शोधा" value={q} onChange={(e) => { setQ(e.target.value); setLimit(50); }} />}
        {filters.map((k) => {
          const f = fields.find((x) => x.k === k);
          const opts = f.type === 'select' ? f.options.map((o) => [o[0], o[1]]) : [...new Set(data.map((r) => r[k]).filter(Boolean))].sort().map((x) => [x, x]);
          return <select key={k} aria-label={f.label} value={fv[k] || ''} onChange={(e) => setFv({ ...fv, [k]: e.target.value })}><option value="">{f.label}: सर्व</option>{opts.map(([a, b]) => <option key={a} value={a}>{b}</option>)}</select>;
        })}
      </div>
      {loading ? <div className="empty">माहिती लोड होत आहे...</div>
        : error ? <div className="empty err">माहिती आणताना त्रुटी आली ({error}).</div>
        : !rows.length ? <div className="empty">सध्या कोणतीही माहिती उपलब्ध नाही.</div>
        : (<div className="tw"><table>
          <thead><tr>{colFields.map((f) => <th key={f.k}>{f.label}</th>)}{hasPub && <th>स्थिती</th>}<th>क्रिया</th></tr></thead>
          <tbody>{rows.slice(0, limit).map((r) => (
            <tr key={r.id}>{colFields.map((f) => <td key={f.k} data-l={f.label}>{cell(f, r)}</td>)}
              {hasPub && <td data-l="स्थिती"><span className={'pill ' + (r.published ? 'ok' : 'no')}>{r.published ? 'प्रकाशित' : 'अप्रकाशित'}</span></td>}
              <td className="acts">{rowExtra && rowExtra(r)}
                {hasPub && <button className="btn ghost sm" onClick={() => togglePublish(r)}>{r.published ? 'अप्रकाशित करा' : 'प्रकाशित करा'}</button>}
                <button className="btn ghost sm" onClick={() => open(r)}>बदल करा</button>
                <button className="btn danger sm" onClick={() => setDel(r)}>हटवा</button></td></tr>))}</tbody></table>
          {rows.length > limit && <div className="row end"><button className="btn ghost" onClick={() => setLimit(limit + 100)}>अधिक दाखवा ({mr(rows.length - limit)})</button></div>}
        </div>)}
      {form && (
        <Modal title={form.id ? 'बदल करा' : addLabel} onClose={() => !busy && setForm(null)}>
          <form onSubmit={save} className="form">
            {fields.filter((f) => !f.ro).map((f) => <FieldInput key={f.k} f={f} v={vals[f.k]} set={(x) => setVals((p) => ({ ...p, [f.k]: x }))} folder={col} />)}
            <div className="row end"><button type="button" className="btn ghost" onClick={() => setForm(null)} disabled={busy}>रद्द करा</button><button className="btn" disabled={busy}>{busy ? 'जतन होत आहे...' : 'जतन करा'}</button></div>
          </form>
        </Modal>)}
      {del && <Confirm text="ही माहिती कायमची हटवायची आहे का? ही क्रिया परत घेता येणार नाही." onYes={remove} onNo={() => setDel(null)} busy={busy} />}
    </section>
  );
}
