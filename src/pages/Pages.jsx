import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSite, Head, Empty, Logo } from '../components/Site';
import { NavratriCards, Journey } from './Navratri';
import { NoticeList, AartiBox, Ad } from './Parts';
import { About } from './Home';
import { fmtDate, fmtTime, mr, phoneDigits, todayISO } from '../utils/mr';
import { GALLERY_CATS } from '../data/defaults';

const Page = ({ t, s, children }) => (
  <section className="sec page"><div className="wrap"><Head t={t} s={s} />{children}</div></section>
);

export function Darshan() {
  const { live, aarti } = useSite();
  return (
    <Page t="आजचे शारदा दर्शन" s={live.darshanStatus}>
      <div className="darshan">
        <figure className="frame rv"><img src={live.darshanImage || '/bg.jpg'} alt="आजचे शारदा देवी दर्शन" loading="lazy" /><figcaption>{live.darshanStatus}</figcaption></figure>
        <div className="dinfo rv">
          <div className="bc"><small>🌸 आजची सजावट</small><b>{live.decoration || 'लवकरच अद्ययावत होईल'}</b></div>
          <div className="bc"><small>🍚 नैवेद्य</small><b>{live.naivedya || 'लवकरच अद्ययावत होईल'}</b></div>
          <AartiBox />
          {aarti.info && <p className="note">{aarti.info}</p>}
        </div>
      </div>
    </Page>
  );
}

export function AartiPage() {
  const { aarti } = useSite();
  return (
    <Page t="आरती" s="वेळेत बदल झाल्यास येथे आपोआप दिसेल">
      <AartiBox big />
      {aarti.info && <p className="note rv">{aarti.info}</p>}
      <p className="note rv">🔔 आरतीची आठवण: कृपया आपल्या फोनमध्ये आरतीच्या वेळेचा अलार्म लावा.</p>
    </Page>
  );
}

export const NavratriPage = () => (
  <Page t="नवरात्रीचे ९ दिवस" s="कार्डवर टॅप करा — देवीचे रूप आणि अर्थ पहा"><NavratriCards /><Head t="नवरात्रीचा प्रवास" /><Journey /></Page>
);

export const MandalPage = () => (<><About /><section className="sec alt"><div className="wrap"><Head t="नवरात्रीचा प्रवास" /><Journey /></div></section></>);

export function Sadasya() {
  const { committee } = useSite();
  const groups = useMemo(() => {
    const o = committee.filter((x) => (x.category || 'पदाधिकारी') === 'पदाधिकारी');
    const r = committee.filter((x) => x.category === 'कार्यकर्ते');
    return [['पदाधिकारी', o], ['कार्यकर्ते', r]].filter((g) => g[1].length);
  }, [committee]);
  return (
    <Page t="मंडळाचे सदस्य" s="सध्याची कार्यकारिणी">
      {groups.length ? groups.map(([g, l]) => (
        <div key={g}><h3 className="gh">{g}</h3>
          <div className="people">{l.map((p) => (
            <article key={p.id} className="person rv tilt">
              {p.photo ? <img src={p.photo} alt={p.name} loading="lazy" /> : <div className="ph"><Logo size={72} /></div>}
              <h4>{p.name}</h4><b>{p.role}</b>
              {p.showPhone && p.mobile && <a href={'tel:' + phoneDigits(p.mobile)}>{mr(p.mobile)}</a>}
            </article>))}</div></div>
      )) : <Empty />}
    </Page>
  );
}

export function Vargani() {
  const { settings, contacts } = useSite();
  return (
    <Page t="वर्गणी / देणगी" s="आपल्या सहकार्यामुळेच उत्सव यशस्वी होतो">
      <div className="vg">
        <div className="bc rv"><h3>वर्गणी कशी द्यावी?</h3>
          <p>वर्गणी रोख, UPI किंवा बँकेद्वारे देता येते. वर्गणी दिल्यानंतर मंडळाचे कार्यकर्ते आपल्याला अधिकृत पावती देतील.</p>
          {settings.upi && <p className="upi">UPI: <b>{settings.upi}</b> <button className="btn ghost sm" onClick={() => navigator.clipboard?.writeText(settings.upi)}>कॉपी करा</button></p>}
        </div>
        <div className="bc rv"><h3>संपर्क करा</h3>
          {settings.showPhones && contacts.length ? contacts.map((c) => (<p key={c.phone}>{c.name}: <a href={'tel:' + c.phone}>{mr(c.phone)}</a></p>)) : <p>कृपया मंडळाच्या कार्यकर्त्यांशी प्रत्यक्ष संपर्क साधा.</p>}
        </div>
      </div>
      <p className="note rv">🔒 देणगीदारांची वैयक्तिक माहिती सार्वजनिक केली जात नाही.</p>
    </Page>
  );
}

export function Photos() {
  const { gallery } = useSite();
  const [cat, setCat] = useState('सर्व');
  const [lb, setLb] = useState(null);
  const list = cat === 'सर्व' ? gallery : gallery.filter((g) => g.category === cat);
  return (
    <Page t="फोटो गॅलरी" s="मंडळाचे सुंदर क्षण">
      <div className="chips" role="tablist">{['सर्व', ...GALLERY_CATS].map((c) => <button key={c} role="tab" aria-selected={cat === c} className={cat === c ? 'on' : ''} onClick={() => setCat(c)}>{c}</button>)}</div>
      {list.length ? <div className="masonry">{list.map((g) => (
        <button key={g.id} className="mi rv" onClick={() => setLb(g)} aria-label={g.caption || 'फोटो मोठा करा'}>
          <img src={g.imageUrl} alt={g.caption || g.category} loading="lazy" />{g.caption && <span>{g.caption}</span>}
        </button>))}</div> : <Empty />}
      {lb && <div className="lb" role="dialog" aria-modal="true" onClick={() => setLb(null)}><button className="x" aria-label="बंद करा">✕</button><img src={lb.imageUrl} alt={lb.caption || ''} />{lb.caption && <p>{lb.caption}</p>}</div>}
    </Page>
  );
}

export function embedUrl(url = '', type) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (u.hostname.includes('youtube.com')) {
      if (u.pathname.startsWith('/embed/')) return url;
      if (u.pathname.startsWith('/live/')) return `https://www.youtube.com/embed/${u.pathname.split('/')[2]}`;
      const v = u.searchParams.get('v'); if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (u.hostname.includes('facebook.com') || u.hostname.includes('fb.watch')) return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;
  } catch { /* fallthrough */ }
  return null;
}

export function Videos() {
  const { videos } = useSite();
  return (
    <Page t="व्हिडिओ / थेट दर्शन" s="थेट प्रक्षेपण आणि मंडळाचे व्हिडिओ">
      {videos.length ? <div className="vids">{videos.map((v) => {
        const src = embedUrl(v.url, v.type);
        return (<article key={v.id} className="vid rv">
          {v.isLive && <span className="pulse live-tag">● थेट दर्शन</span>}
          {src ? <div className="vwrap"><iframe src={src} title={v.title} loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen /></div>
            : <a className="btn" href={v.url} target="_blank" rel="noopener noreferrer">▶ व्हिडिओ पहा</a>}
          <h3>{v.title}</h3></article>);
      })}</div> : <Empty />}
    </Page>
  );
}

export function Suchana() {
  const { notices } = useSite();
  return <Page t="सूचना" s="मंडळाच्या ताज्या सूचना">{notices.length ? <NoticeList items={notices} /> : <Empty />}</Page>;
}

export function Karyakram() {
  const { events } = useSite();
  const today = todayISO();
  const up = events.filter((e) => (e.date || '') >= today && e.status !== 'done');
  const past = events.filter((e) => !up.includes(e)).reverse();
  const Card = ({ e }) => (
    <article className={'event rv tilt ' + (e.status || '')}>
      {e.imageUrl && <img src={e.imageUrl} alt={e.title} loading="lazy" />}
      <div><span className="est">{{ upcoming: 'आगामी', live: 'सुरू आहे', done: 'पूर्ण', cancelled: 'रद्द' }[e.status] || 'आगामी'}</span>
        <h3>{e.title}</h3><p>📅 {fmtDate(e.date)} {e.time && '• ' + fmtTime(e.time)}</p>{e.place && <p>📍 {e.place}</p>}{e.info && <p>{e.info}</p>}</div>
    </article>);
  return (
    <Page t="कार्यक्रम" s="आगामी कार्यक्रम आणि बैठका">
      {up.length ? <div className="events">{up.map((e) => <Card key={e.id} e={e} />)}</div> : <Empty />}
      {past.length > 0 && <><h3 className="gh">मागील कार्यक्रम</h3><div className="events">{past.map((e) => <Card key={e.id} e={e} />)}</div></>}
    </Page>
  );
}

export function Sampark() {
  const { settings, contacts } = useSite();
  return (
    <Page t="संपर्क" s="आम्हाला भेटा">
      <div className="vg">
        <div className="bc rv"><h3>📍 पत्ता</h3><p>{settings.address}</p><p>पिन: {mr(settings.pin)}</p>
          <a className="btn" href={settings.mapUrl} target="_blank" rel="noopener noreferrer">गुगल नकाशावर पहा</a></div>
        <div className="bc rv"><h3>📞 संपर्क</h3>
          {settings.showPhones && contacts.length ? contacts.map((c) => (
            <p key={c.phone}>{c.name}<br /><a href={'tel:' + c.phone}>{mr(c.phone)}</a></p>)) : <p>संपर्क क्रमांक सध्या उपलब्ध नाहीत.</p>}</div>
      </div>
      <Ad />
    </Page>
  );
}

export function NotFound() {
  return <section className="sec page"><div className="wrap"><Head t="पृष्ठ सापडले नाही" /><p className="more"><Link className="btn" to="/">मुखपृष्ठावर जा</Link></p></div></section>;
}
