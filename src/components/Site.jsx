import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useCollection, useDocument } from '../hooks/useFirestore';
import { useReveal } from '../hooks/useNow';
import { tsMillis, todayISO, mr } from '../utils/mr';
import * as D from '../data/defaults';

const Ctx = createContext(null);
export const useSite = () => useContext(Ctx);

const RANK = { urgent: 0, high: 1, normal: 2 };

export function SiteProvider({ children }) {
  const a = useDocument('aarti', 'main');
  const l = useDocument('liveStatus', 'main');
  const s = useDocument('settings', 'main');
  const ad = useDocument('advertisement', 'main');
  const n = useCollection('notices', { publicOnly: true });
  const e = useCollection('events', { publicOnly: true });
  const nv = useCollection('navratriDays');
  const c = useCollection('committee', { publicOnly: true });
  const g = useCollection('gallery', { publicOnly: true });
  const v = useCollection('videos', { publicOnly: true });

  const value = useMemo(() => {
    const today = todayISO();
    const notices = n.data
      .filter((x) => !x.expiry || x.expiry >= today)
      .sort((p, q) => (RANK[p.priority] ?? 2) - (RANK[q.priority] ?? 2) || tsMillis(q.createdAt) - tsMillis(p.createdAt));
    const events = [...e.data].sort((p, q) => (p.date || '').localeCompare(q.date || ''));
    const days = (nv.data.length ? nv.data : D.DAYS).filter((x) => x.published !== false).sort((p, q) => p.n - q.n);
    const committee = [...(c.data.length ? c.data : D.COMMITTEE)].sort((p, q) => (p.order ?? 99) - (q.order ?? 99));
    const settings = { ...D.SETTINGS, ...(s.data || {}) };
    const all = [a, l, s, ad, n, e, nv, c, g, v];
    return {
      aarti: { ...D.AARTI, ...(a.data || {}) },
      live: { ...D.LIVE, ...(l.data || {}) },
      settings,
      contacts: D.parseContacts(settings.contactsText),
      ad: { ...D.AD, ...(ad.data || {}) },
      notices, events, days, committee,
      gallery: [...g.data].sort((p, q) => tsMillis(q.createdAt) - tsMillis(p.createdAt)),
      videos: [...v.data].sort((p, q) => Number(!!q.isLive) - Number(!!p.isLive) || tsMillis(q.createdAt) - tsMillis(p.createdAt)),
      loading: all.some((x) => x.loading),
      configError: all.some((x) => x.error === 'config'),
    };
  }, [a, l, s, ad, n, e, nv, c, g, v]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const NAV = [
  ['/', 'मुखपृष्ठ'], ['/darshan', 'दर्शन'], ['/aarti', 'आरती'], ['/navratri', 'नवरात्रीचे ९ दिवस'],
  ['/mandal', 'मंडळ'], ['/sadasya', 'सदस्य'], ['/vargani', 'वर्गणी / देणगी'], ['/photos', 'फोटो'],
  ['/videos', 'व्हिडिओ / थेट दर्शन'], ['/suchana', 'सूचना'], ['/karyakram', 'कार्यक्रम'], ['/sampark', 'संपर्क'],
];

export function Logo({ size = 56, className = '' }) {
  return <img className={'logo ' + className} src="/logo.webp" width={size} height={size} alt="शंभूराजे नवयुवक शारदा मंडळ — अधिकृत बोधचिन्ह" />;
}

function Header() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  useEffect(() => { setOpen(false); }, [loc.pathname]);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);
  return (
    <header className="hdr">
      <div className="hdr-in">
        <Link to="/" className="brand" aria-label="मुखपृष्ठ">
          <Logo size={52} />
          <span><b>शंभूराजे</b><small>नवयुवक शारदा मंडळ</small></span>
        </Link>
        <nav className={'nav' + (open ? ' open' : '')} aria-label="मुख्य मेनू">
          {NAV.map(([to, t]) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'on' : '')}>{t}</NavLink>)}
        </nav>
        <button className="burger" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? 'मेनू बंद करा' : 'मेनू उघडा'}>
          <i /><i /><i />
        </button>
      </div>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
    </header>
  );
}

function Footer() {
  const { settings } = useSite();
  return (
    <footer className="ftr">
      <div className="wrap ftr-in">
        <Logo size={96} />
        <h3>शंभूराजे नवयुवक शारदा मंडळ</h3>
        <p>{settings.address} • {mr(settings.pin)}</p>
        <div className="ftr-links">{NAV.slice(0, 6).map(([to, t]) => <Link key={to} to={to}>{t}</Link>)}</div>
        <p className="copy">© {mr(2026)} शंभूराजे नवयुवक शारदा मंडळ</p>
        <p className="dev">Developed by Ganesh Gore</p>
      </div>
    </footer>
  );
}

export function PublicLayout() {
  const loc = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);
  useReveal();
  return (
    <SiteProvider>
      <a className="skip" href="#main">मुख्य मजकुराकडे जा</a>
      <Header />
      <ConfigBanner />
      <main id="main"><Outlet /></main>
      <Footer />
    </SiteProvider>
  );
}

function ConfigBanner() {
  const { configError } = useSite();
  if (!configError) return null;
  return <div className="banner" role="alert">Firebase जोडलेले नाही. कृपया <code>.env</code> फाइल तयार करा (README पहा).</div>;
}

export function Head({ t, s }) {
  return (
    <div className="head rv">
      <span className="orn" aria-hidden="true">❖</span>
      <h2>{t}</h2>
      {s && <p>{s}</p>}
    </div>
  );
}
export const Empty = ({ t = 'सध्या कोणतीही माहिती उपलब्ध नाही.' }) => <div className="empty">{t}</div>;
export const Loading = ({ t = 'माहिती लोड होत आहे...' }) => <div className="empty" role="status">{t}</div>;
