import { useSite, Empty } from '../components/Site';
import { useNow } from '../hooks/useNow';
import { aartiState, countdownText, fmtTime, fmtDate, mr } from '../utils/mr';

export function Ad() {
  const { ad } = useSite();
  if (!ad.active) return null;
  const Tag = ad.link ? 'a' : 'div';
  const props = ad.link ? { href: ad.link, target: '_blank', rel: 'noopener noreferrer' } : {};
  return (
    <Tag className="ad rv tilt" {...props} aria-label="जाहिरात">
      <span className="ad-l">जाहिरात</span>
      {ad.imageUrl && <img src={ad.imageUrl} alt={ad.title} loading="lazy" />}
      <div><h3>{ad.title}</h3><p className="owner">{ad.owner}</p>{ad.text && <p>{ad.text}</p>}</div>
    </Tag>
  );
}

export function NoticeList({ items }) {
  return (
    <div className="notices">
      {items.map((n) => (
        <article key={n.id} className={'notice rv ' + (n.priority || 'normal')}>
          <div className="nbadge">{n.priority === 'urgent' ? '🚨 तातडीची सूचना' : n.priority === 'high' ? '⭐ महत्त्वाची सूचना' : '📢 सूचना'}</div>
          <h3>{n.title}</h3>
          {n.body && <p>{n.body}</p>}
          {n.expiry && <small>पर्यंत: {fmtDate(n.expiry)}</small>}
        </article>
      ))}
    </div>
  );
}

export function AartiBox({ big = false }) {
  const { aarti } = useSite();
  const now = useNow();
  const { live, next } = aartiState(aarti, now);
  const rows = [[aarti.morningName, aarti.morning, 'morning'], [aarti.eveningName, aarti.evening, 'evening']];
  return (
    <div className={'aartibox' + (big ? ' big' : '')}>
      <div className="aarti-now">
        {live ? <><span className="pulse">● थेट — सध्याची आरती</span><h3>{live.name}</h3><p>सुरुवात: {fmtTime(live.time)}</p></>
          : next ? <><small>पुढील आरती</small><h3>{next.name}</h3><p className="time">{fmtTime(next.time)}</p><p className="cd" aria-live="off">{countdownText(next.start - now)}</p></> : <Empty />}
      </div>
      <ul className="aarti-times">
        {rows.map(([n, t, k]) => <li key={k} className={(live?.key === k ? 'live ' : '') + (next?.key === k && !live ? 'nx' : '')}><span>{n}</span><b>{fmtTime(t)}</b></li>)}
      </ul>
    </div>
  );
}

const PRASAD = { available: ['उपलब्ध', 'ok'], closed: ['बंद', 'no'] };
const PARK = { available: ['उपलब्ध', 'ok'], limited: ['मर्यादित', 'mid'], closed: ['बंद', 'no'] };

export function TodayBoard() {
  const { live, notices, events } = useSite();
  const now = useNow();
  const { aarti } = useSite();
  const { live: lv, next } = aartiState(aarti, now);
  const n = notices[0];
  const ev = events.find((e) => e.status !== 'done' && e.status !== 'cancelled');
  const p = PRASAD[live.prasad] || PRASAD.closed, k = PARK[live.parking] || PARK.closed;
  return (
    <>
      {live.message && <div className="notice high rv"><div className="nbadge">📢 महत्त्वाचा संदेश</div><h3>{live.message}</h3></div>}
      <div className="board">
        <div className="bc rv tilt"><small>🪔 पुढील आरती</small><b>{lv ? lv.name + ' (सुरू)' : next ? next.name : '—'}</b><span>{next && !lv ? fmtTime(next.time) : lv ? fmtTime(lv.time) : ''}</span></div>
        <div className="bc rv tilt"><small>📢 सूचना</small><b>{n ? n.title : 'सध्या सूचना नाही'}</b></div>
        <div className="bc rv tilt"><small>🍛 प्रसाद</small><b className={'st ' + p[1]}>{p[0]}</b></div>
        <div className="bc rv tilt"><small>🅿️ पार्किंग</small><b className={'st ' + k[1]}>{k[0]}</b></div>
        <div className="bc rv tilt"><small>📅 कार्यक्रम</small><b>{ev ? ev.title : 'सध्या कार्यक्रम नाही'}</b>{ev && <span>{fmtDate(ev.date)}</span>}</div>
        {live.activity && <div className="bc rv tilt wide"><small>🎯 सध्याचा उपक्रम</small><b>{live.activity}</b></div>}
      </div>
    </>
  );
}
