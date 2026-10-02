import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, limit, query, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore';
import { auth, db, configured } from '../firebase/config';
import { useCollection } from '../hooks/useFirestore';
import { Logo } from '../components/Site';
import { ToastProvider, useToast, Modal } from './ui';
import Crud from './Crud';
import Singleton from './Singleton';
import { ReceiptModal } from './Receipt';
import * as C from './config';
import * as D from '../data/defaults';
import { reserveSeq } from '../services/counters';
import { parseCSV, toCSV, download } from '../utils/csv';
import { fmtDate, fmtTime, money, mr, pad, todayISO, tsMillis } from '../utils/mr';

const TABS = [['overview', 'आढावा'], ['today', 'आजची माहिती'], ['aarti', 'पुढील आरती'], ['notices', 'सूचना'], ['events', 'कार्यक्रम'], ['members', 'सदस्य'], ['committee', 'पदाधिकारी'], ['donations', 'वर्गणी / देणगी'], ['receipts', 'पावत्या'], ['gallery', 'फोटो'], ['videos', 'व्हिडिओ'], ['ad', 'जाहिरात'], ['navratri', 'नवरात्री'], ['settings', 'सेटिंग्ज']];

function useAdmin() {
  const [s, setS] = useState({ user: null, admin: false, loading: true });
  useEffect(() => {
    if (!auth) { setS({ user: null, admin: false, loading: false }); return undefined; }
    return onAuthStateChanged(auth, async (u) => {
      if (!u) { setS({ user: null, admin: false, loading: false }); return; }
      let ok = false;
      try { ok = (await getDoc(doc(db, 'admins', u.uid))).exists(); } catch (e) { console.error(e); }
      setS({ user: u, admin: ok, loading: false });
    });
  }, []);
  return s;
}

const AUTH_ERR = { 'auth/invalid-credential': 'ईमेल किंवा पासवर्ड चुकीचा आहे.', 'auth/invalid-email': 'ईमेल योग्य नाही.', 'auth/too-many-requests': 'खूप प्रयत्न झाले. थोड्या वेळाने पुन्हा प्रयत्न करा.', 'auth/network-request-failed': 'इंटरनेट जोडणी तपासा.' };

function Login() {
  const [email, setEmail] = useState(''); const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState('');
  async function go(e) {
    e.preventDefault(); setBusy(true); setMsg('');
    try { await signInWithEmailAndPassword(auth, email.trim(), pw); }
    catch (err) { console.error(err); setMsg(AUTH_ERR[err.code] || 'लॉगिन करताना त्रुटी आली.'); }
    setBusy(false);
  }
  async function reset() {
    if (!email) return setMsg('प्रथम ईमेल लिहा.');
    try { await sendPasswordResetEmail(auth, email.trim()); setMsg('पासवर्ड बदलण्याची लिंक ईमेलवर पाठवली.'); } catch { setMsg('लिंक पाठवता आली नाही.'); }
  }
  return (
    <div className="login">
      <form onSubmit={go} className="lcard">
        <Logo size={110} /><h1>प्रशासक प्रवेश</h1><p>शंभूराजे नवयुवक शारदा मंडळ</p>
        <label className="fld"><span>ईमेल</span><input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label className="fld"><span>पासवर्ड</span><input type="password" required autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} /></label>
        {msg && <p className="lmsg" role="alert">{msg}</p>}
        <button className="btn" disabled={busy}>{busy ? 'प्रवेश होत आहे...' : 'प्रवेश करा'}</button>
        <button type="button" className="lnk" onClick={reset}>पासवर्ड विसरलात?</button>
        <Link className="lnk" to="/">← संकेतस्थळावर परत जा</Link>
      </form>
    </div>
  );
}

async function seedDefaults() {
  for (const [c, d] of [['aarti', D.AARTI], ['liveStatus', D.LIVE], ['advertisement', D.AD], ['settings', D.SETTINGS]]) {
    const s = await getDoc(doc(db, c, 'main'));
    if (!s.exists()) await setDoc(doc(db, c, 'main'), { ...d, updatedAt: serverTimestamp() });
  }
  if ((await getDocs(query(collection(db, 'navratriDays'), limit(1)))).empty) for (const d of D.DAYS) await setDoc(doc(db, 'navratriDays', d.id), d);
  if ((await getDocs(query(collection(db, 'committee'), limit(1)))).empty) for (const c of D.COMMITTEE) await setDoc(doc(db, 'committee', c.id), { ...c, published: true, createdAt: serverTimestamp() });
}

function Overview() {
  const don = useCollection('donations'), mem = useCollection('members'), not = useCollection('notices'), ev = useCollection('events');
  const live = useCollection('liveStatus');
  const toast = useToast(); const [busy, setBusy] = useState(false);
  const st = useMemo(() => {
    const t = todayISO(), ym = t.slice(0, 7);
    const d = don.data;
    const months = Array.from({ length: 6 }, (_, i) => { const x = new Date(); x.setDate(1); x.setMonth(x.getMonth() - 5 + i); return `${x.getFullYear()}-${pad(x.getMonth() + 1, 2)}`; });
    const sum = (f) => d.filter(f).reduce((a, r) => a + Number(r.amount || 0), 0);
    return {
      total: sum(() => true), today: sum((r) => r.date === t), month: sum((r) => (r.date || '').startsWith(ym)),
      donors: new Set(d.map((r) => r.mobile || r.name)).size,
      bars: months.map((m) => [m, sum((r) => (r.date || '').startsWith(m))]),
      recent: [...d].sort((a, b) => tsMillis(b.createdAt) - tsMillis(a.createdAt)).slice(0, 5),
    };
  }, [don.data]);
  const max = Math.max(1, ...st.bars.map((b) => b[1]));
  const L = live.data[0] || {};
  async function seed() {
    setBusy(true);
    try { await seedDefaults(); toast('मूळ माहिती भरली गेली.', 'success'); } catch (e) { console.error(e); toast('मूळ माहिती भरताना त्रुटी आली.', 'error'); }
    setBusy(false);
  }
  const cards = [['एकूण देणगी', money(st.total)], ['एकूण देणगीदार', mr(st.donors)], ['आजची देणगी', money(st.today)], ['मासिक देणगी', money(st.month)], ['एकूण सदस्य', mr(mem.data.length)], ['प्रकाशित सूचना', mr(not.data.filter((n) => n.published).length)], ['कार्यक्रम', mr(ev.data.length)]];
  return (
    <>
      <div className="stats">{cards.map(([a, b]) => <div key={a} className="stat"><small>{a}</small><b>{b}</b></div>)}</div>
      <div className="grid2">
        <section className="panel"><h3>गेल्या ६ महिन्यांची देणगी</h3>
          <div className="bars">{st.bars.map(([m, v]) => <div key={m} className="bar"><i style={{ height: (v / max) * 100 + '%' }} title={money(v)} /><small>{mr(m.slice(5))}/{mr(m.slice(2, 4))}</small></div>)}</div></section>
        <section className="panel"><h3>स्थिती</h3>
          <ul className="stl"><li>प्रसाद: <span className={'pill ' + (L.prasad === 'closed' ? 'no' : 'ok')}>{L.prasad === 'closed' ? 'बंद' : 'उपलब्ध'}</span></li>
            <li>पार्किंग: <span className={'pill ' + (L.parking === 'closed' ? 'no' : L.parking === 'limited' ? 'mid' : 'ok')}>{{ closed: 'बंद', limited: 'मर्यादित' }[L.parking] || 'उपलब्ध'}</span></li></ul>
          <h3>झटपट क्रिया</h3>
          <div className="row wrap">{[['donations', '＋ नवीन देणगी'], ['notices', '＋ नवीन सूचना'], ['events', '＋ नवीन कार्यक्रम'], ['today', 'आजची माहिती'], ['aarti', 'आरतीची वेळ']].map(([k, t]) => <Link key={k} className="btn ghost sm" to={'/admin/' + k}>{t}</Link>)}</div>
        </section>
      </div>
      <section className="panel"><h3>अलीकडील देणग्या</h3>
        {st.recent.length ? <div className="tw"><table><thead><tr><th>नाव</th><th>रक्कम</th><th>तारीख</th><th>पावती</th></tr></thead><tbody>{st.recent.map((r) => <tr key={r.id}><td data-l="नाव">{r.name}</td><td data-l="रक्कम">{money(r.amount)}</td><td data-l="तारीख">{fmtDate(r.date)}</td><td data-l="पावती">{r.receiptNo}</td></tr>)}</tbody></table></div> : <div className="empty">सध्या कोणतीही माहिती उपलब्ध नाही.</div>}</section>
      <section className="panel"><h3>प्रथम सेटअप</h3><p className="hintp">नवीन प्रकल्पात आरती, नवरात्री दिवस, पदाधिकारी आणि जाहिरातीची मूळ माहिती Firestore मध्ये भरण्यासाठी खालील बटण दाबा. आधीची माहिती असल्यास ती बदलली जात नाही.</p>
        <button className="btn" onClick={seed} disabled={busy}>{busy ? 'भरत आहे...' : 'मूळ माहिती भरा'}</button></section>
    </>
  );
}

const ALIAS = { name: ['name', 'नाव'], mobile: ['mobile', 'मोबाईल', 'phone'], role: ['role', 'पद'], year: ['year', 'वर्ष'], status: ['status', 'स्थिती'] };
function MemberTools({ data }) {
  const toast = useToast(); const [busy, setBusy] = useState(false);
  const exportCsv = () => download('सदस्य-यादी.csv', toCSV([['सदस्य क्रमांक', 'नाव', 'मोबाईल', 'पद', 'वर्ष', 'स्थिती'], ...data.map((m) => [m.memberId, m.name, m.mobile, m.role, m.year, m.status === 'inactive' ? 'निष्क्रिय' : 'सक्रिय'])]));
  const sample = () => download('सदस्य-नमुना.csv', toCSV([['नाव', 'मोबाईल', 'पद', 'वर्ष', 'स्थिती'], ['रमेश पाटील', '9876543210', 'सदस्य', '2026', 'सक्रिय']]));
  async function imp(e) {
    const f = e.target.files?.[0]; e.target.value = '';
    if (!f) return;
    setBusy(true); toast('सदस्य आयात होत आहेत...', 'info');
    try {
      const rows = parseCSV(await f.text());
      const head = rows[0].map((h) => h.trim().toLowerCase());
      const idx = Object.fromEntries(Object.entries(ALIAS).map(([k, a]) => [k, head.findIndex((h) => a.includes(h))]));
      if (idx.name < 0) throw new Error('नाव स्तंभ सापडला नाही');
      const list = rows.slice(1).map((r) => ({ name: (r[idx.name] || '').trim(), mobile: idx.mobile >= 0 ? (r[idx.mobile] || '').trim() : '', role: idx.role >= 0 && r[idx.role]?.trim() ? r[idx.role].trim() : 'सदस्य', year: idx.year >= 0 && r[idx.year]?.trim() ? r[idx.year].trim() : String(new Date().getFullYear()), status: idx.status >= 0 && /निष्क्रिय|inactive/i.test(r[idx.status] || '') ? 'inactive' : 'active', photo: '' })).filter((m) => m.name);
      if (!list.length) throw new Error('रिकामी फाइल');
      const start = await reserveSeq('member', list.length);
      for (let i = 0; i < list.length; i += 400) {
        const b = writeBatch(db);
        list.slice(i, i + 400).forEach((m, j) => b.set(doc(collection(db, 'members')), { ...m, memberId: 'SM-' + pad(start + i + j + 1, 4), createdAt: serverTimestamp() }));
        await b.commit();
      }
      toast(`${mr(list.length)} सदस्य यशस्वीरित्या जोडले.`, 'success');
    } catch (err) { console.error(err); toast('आयात करताना त्रुटी आली: ' + err.message, 'error'); }
    setBusy(false);
  }
  return (<>
    <label className={'btn ghost' + (busy ? ' dis' : '')}>CSV आयात<input type="file" accept=".csv,text/csv" hidden onChange={imp} disabled={busy} /></label>
    <button className="btn ghost" onClick={exportCsv} disabled={!data.length}>CSV निर्यात</button>
    <button className="btn ghost" onClick={sample}>नमुना फाइल</button></>);
}

function Donations() {
  const [view, setView] = useState(null);
  const beforeSave = async (d, edit) => {
    if (!edit) { const n = (await reserveSeq('receipt', 1)) + 1; d.receiptNo = `SM-R-${(d.date || todayISO()).slice(0, 4)}-${pad(n, 4)}`; }
    return d;
  };
  const afterSave = async (id, d, edit) => {
    const { receiptNo, ...rest } = d;
    await setDoc(doc(db, 'receipts', id), { ...rest, donationId: id, ...(edit ? { updatedAt: serverTimestamp() } : { receiptNo, createdAt: serverTimestamp() }) }, { merge: true });
  };
  return (<>
    <Crud col="donations" title="वर्गणी / देणगी" fields={C.DONATION} columns={['receiptNo', 'name', 'mobile', 'amount', 'date', 'method']} filters={['method']} sortKey="date" beforeSave={beforeSave} afterSave={afterSave} addLabel="नवीन देणगी"
      rowExtra={(r) => <button className="btn sm" onClick={() => setView(r)}>पावती</button>} />
    {view && <ReceiptModal r={view} onClose={() => setView(null)} />}
  </>);
}

function Receipts() {
  const { data, loading } = useCollection('receipts');
  const [q, setQ] = useState(''); const [view, setView] = useState(null);
  const rows = data.filter((r) => !q || `${r.receiptNo} ${r.name} ${r.mobile}`.toLowerCase().includes(q.toLowerCase())).sort((a, b) => (b.receiptNo || '').localeCompare(a.receiptNo || ''));
  return (
    <section className="panel"><div className="ptop"><h2>पावत्या <small>({mr(rows.length)})</small></h2></div>
      <div className="row filt"><input className="search" type="search" placeholder="पावती क्रमांक, नाव किंवा मोबाईल शोधा..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
      {loading ? <div className="empty">माहिती लोड होत आहे...</div> : !rows.length ? <div className="empty">सध्या कोणतीही माहिती उपलब्ध नाही.</div> :
        <div className="tw"><table><thead><tr><th>पावती क्रमांक</th><th>नाव</th><th>रक्कम</th><th>तारीख</th><th>क्रिया</th></tr></thead>
          <tbody>{rows.slice(0, 200).map((r) => <tr key={r.id}><td data-l="पावती क्रमांक">{r.receiptNo}</td><td data-l="नाव">{r.name}</td><td data-l="रक्कम">{money(r.amount)}</td><td data-l="तारीख">{fmtDate(r.date)}</td><td className="acts"><button className="btn sm" onClick={() => setView(r)}>पावती पहा</button></td></tr>)}</tbody></table></div>}
      {view && <ReceiptModal r={view} onClose={() => setView(null)} />}
    </section>
  );
}

function Panel({ tab }) {
  switch (tab) {
    case 'overview': return <Overview />;
    case 'today': return <Singleton col="liveStatus" title="आजची माहिती (थेट)" fields={C.LIVE} defaults={D.LIVE} note="येथे जतन केलेली माहिती संकेतस्थळावर लगेच दिसते." />;
    case 'aarti': return <Singleton col="aarti" title="आरतीच्या वेळा" fields={C.AARTI} defaults={D.AARTI} note="उदा. रात्रीची आरती ७:३० वरून ८:०० करा आणि जतन करा — संकेतस्थळ आपोआप बदलेल." />;
    case 'notices': return <Crud col="notices" title="सूचना" fields={C.NOTICE} columns={['title', 'priority', 'expiry']} filters={['priority']} addLabel="नवीन सूचना" />;
    case 'events': return <Crud col="events" title="कार्यक्रम" fields={C.EVENT} columns={['title', 'date', 'time', 'place', 'status']} filters={['status']} sortKey="date" addLabel="नवीन कार्यक्रम" />;
    case 'members': return <Crud col="members" title="सदस्य" fields={C.MEMBER} columns={['memberId', 'name', 'mobile', 'role', 'year', 'status']} filters={['role', 'year', 'status']} sortKey="memberId" desc={false} autoId={{ field: 'memberId', key: 'member', prefix: 'SM-', pad: 4 }} tools={(d) => <MemberTools data={d} />} addLabel="नवीन सदस्य" />;
    case 'committee': return <Crud col="committee" title="पदाधिकारी" fields={C.COMMITTEE} columns={['order', 'name', 'role', 'category', 'photo']} sortKey="order" desc={false} addLabel="नवीन पदाधिकारी" />;
    case 'donations': return <Donations />;
    case 'receipts': return <Receipts />;
    case 'gallery': return <Crud col="gallery" title="फोटो" fields={C.GALLERY} columns={['imageUrl', 'category', 'caption']} filters={['category']} addLabel="नवीन फोटो" />;
    case 'videos': return <Crud col="videos" title="व्हिडिओ / थेट दर्शन" fields={C.VIDEO} columns={['title', 'type', 'isLive', 'url']} filters={['type']} addLabel="नवीन व्हिडिओ" />;
    case 'ad': return <Singleton col="advertisement" title="जाहिरात" fields={C.AD} defaults={D.AD} />;
    case 'navratri': return <Crud col="navratriDays" title="नवरात्री दिवस" fields={C.NAVRATRI} columns={['n', 'date', 'devi', 'color']} sortKey="n" desc={false} addLabel="नवीन दिवस" />;
    case 'settings': return <Singleton col="settings" title="सेटिंग्ज" fields={C.SETTINGS} defaults={D.SETTINGS} />;
    default: return <Navigate to="/admin/overview" replace />;
  }
}

function Shell({ user }) {
  const { '*': tab } = useParams();
  const t = tab || 'overview';
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [t]);
  const label = (TABS.find((x) => x[0] === t) || [])[1];
  return (
    <div className="adm">
      <aside className={'side' + (open ? ' open' : '')}>
        <div className="sb"><Logo size={56} /><div><b>शंभूराजे मंडळ</b><small>व्यवस्थापन</small></div></div>
        <nav aria-label="प्रशासक मेनू">{TABS.map(([k, n]) => <Link key={k} to={'/admin/' + k} className={k === t ? 'on' : ''}>{n}</Link>)}</nav>
        <div className="sf"><Link to="/" target="_blank">संकेतस्थळ पहा ↗</Link><button onClick={() => signOut(auth)}>बाहेर पडा</button></div>
      </aside>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <div className="amain">
        <header className="atop"><button className="burger dark" onClick={() => setOpen(!open)} aria-label="मेनू"><i /><i /><i /></button><h1>{label}</h1><small>{user.email}</small></header>
        <div className="abody"><Panel tab={t} /></div>
      </div>
    </div>
  );
}

export default function Admin() {
  const a = useAdmin();
  let body;
  if (!configured) body = <div className="login"><div className="lcard"><h1>Firebase जोडलेले नाही</h1><p><code>.env</code> फाइल तयार करा (README पहा).</p></div></div>;
  else if (a.loading) body = <div className="login"><div className="lcard"><p role="status">लोड होत आहे...</p></div></div>;
  else if (!a.user) body = <Login />;
  else if (!a.admin) body = <div className="login"><div className="lcard"><h1>प्रवेश नाही</h1><p>हे खाते प्रशासक म्हणून नोंदवलेले नाही. README मधील "पहिला प्रशासक" भाग पहा.</p><button className="btn" onClick={() => signOut(auth)}>बाहेर पडा</button></div></div>;
  else body = <Shell user={a.user} />;
  return <ToastProvider><div className="adminroot">{body}</div></ToastProvider>;
}
