import { Link } from 'react-router-dom';
import { useSite, Head, Empty } from '../components/Site';
import { useNow } from '../hooks/useNow';
import { aartiState, countdownText, fmtTime, fmtDate, todayISO, mr } from '../utils/mr';
import { NavratriCards, Journey } from './Navratri';
import { Ad, NoticeList, AartiBox, TodayBoard } from './Parts';

const nextEvent = (events) => events.find((e) => e.status !== 'done' && e.status !== 'cancelled' && (e.date || '') >= todayISO());

function Petals() {
  return (
    <div className="petals" aria-hidden="true">
      {Array.from({ length: 16 }, (_, i) => (
        <span key={i} style={{ left: ((i * 37) % 100) + '%', animationDelay: (i % 8) * -1.7 + 's', animationDuration: 11 + (i % 5) * 2 + 's', '--s': 0.6 + (i % 4) * 0.25 }} />
      ))}
    </div>
  );
}

function Hero() {
  const { aarti, notices, events } = useSite();
  const now = useNow();
  const { live, next } = aartiState(aarti, now);
  const n = notices[0];
  const ev = nextEvent(events);
  return (
    <section className="hero">
      <div className="hero-bg" style={{ backgroundImage: 'url(/bg.jpg)' }} role="img" aria-label="शारदा देवीची सुशोभित मूर्ती" />
      <div className="hero-ov" /><div className="glow g1" /><div className="glow g2" /><Petals />
      <div className="wrap hero-in">
        <h1>
          <span className="t1">शंभूराजे</span>
          <span className="t2">नवयुवक शारदा मंडळ</span>
          <span className="t3">दत्त चौक</span>
        </h1>
        <p className="tag">२५+ वर्षांची परंपरा • एकजुटीची ओळख • मित्रांची साथ • कर्तव्यदक्ष कार्यकर्ते</p>
        <div className="cards3">
          <Link to="/aarti" className="lc tilt">
            <small>🪔 पुढील आरती</small>
            {live ? <><b>{live.name} सुरू आहे</b><span className="pulse">● थेट</span></>
              : next ? <><b>{next.name} — {fmtTime(next.time)}</b><span>{countdownText(next.start - now)}</span></> : <b>—</b>}
          </Link>
          <Link to="/suchana" className={'lc tilt' + (n?.priority === 'urgent' ? ' urgent' : '')}>
            <small>📢 ताजी सूचना</small>
            {n ? <><b>{n.title}</b><span>{n.priority === 'urgent' ? 'तातडीची सूचना' : 'सर्व सूचना पहा'}</span></> : <b>सध्या सूचना नाही</b>}
          </Link>
          <Link to="/karyakram" className="lc tilt">
            <small>📅 पुढील कार्यक्रम</small>
            {ev ? <><b>{ev.title}</b><span>{fmtDate(ev.date)} {ev.time ? '• ' + fmtTime(ev.time) : ''}</span></> : <b>सध्या कार्यक्रम नाही</b>}
          </Link>
        </div>
      </div>
      <div className="scroll-hint" aria-hidden="true">⌄</div>
    </section>
  );
}

export function About() {
  return (
    <section className="sec about">
      <div className="wrap">
        <Head t="आमच्या मंडळाविषयी" />
        <div className="about-grid">
          <div className="about-txt rv">
            <p className="lead">शंभूराजे नवयुवक शारदा मंडळ हे केवळ एक मंडळ नाही, तर २५+ वर्षांची परंपरा, संस्कृती आणि एकजुटीची ओळख आहे.</p>
            <p>गावातील उत्सवाला भक्तीची, संस्कृतीला नव्या पिढीची आणि समाजाला एकत्र आणण्याची परंपरा मंडळाने जपली आहे.</p>
            <p>मित्रांची साथ, कार्यकर्त्यांची निष्ठा आणि एकजुटीची ताकद हीच मंडळाची खरी ओळख आहे.</p>
            <p>वर्षानुवर्षे कर्तव्यदक्ष कार्यकर्त्यांची मेहनत, निस्वार्थ सेवा आणि प्रत्येक सदस्याचा सहभाग यामुळे मंडळाने गावाच्या सामाजिक व सांस्कृतिक जीवनात आपले वेगळे स्थान निर्माण केले आहे.</p>
          </div>
          <ul className="pillars rv">
            {[['🤝', 'मित्रांची साथ'], ['🔥', 'कार्यकर्त्यांची जिद्द'], ['🚩', 'एकजुटीची ताकद'], ['🛕', 'संस्कृतीची परंपरा']].map(([i, t]) => (
              <li key={t} className="tilt"><span>{i}</span><b>{t}</b></li>
            ))}
          </ul>
        </div>
        <p className="strip rv">मित्रांची साथ • कार्यकर्त्यांची जिद्द • एकजुटीची ताकद • संस्कृतीची परंपरा</p>
      </div>
    </section>
  );
}

export default function Home() {
  const { notices } = useSite();
  return (
    <>
      <Hero />
      <About />
      <section className="sec alt"><div className="wrap"><Head t="आज मंडळात काय आहे?" s="सर्व माहिती थेट अद्ययावत होते" /><TodayBoard /></div></section>
      <section className="sec"><div className="wrap"><Head t="नवरात्रीचे ९ दिवस" s="रोजचा रंग आणि देवीचे रूप" /><NavratriCards /><Journey /></div></section>
      <section className="sec alt"><div className="wrap"><Head t="सूचना" />{notices.length ? <NoticeList items={notices.slice(0, 3)} /> : <Empty />}<p className="more"><Link className="btn ghost" to="/suchana">सर्व सूचना पहा</Link></p></div></section>
      <section className="sec"><div className="wrap"><Ad /></div></section>
    </>
  );
}
