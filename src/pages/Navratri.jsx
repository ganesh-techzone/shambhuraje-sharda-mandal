import { useState } from 'react';
import { useSite } from '../components/Site';
import { fmtDate, weekday, todayISO, daysUntil, mr } from '../utils/mr';

export function NavratriCards() {
  const { days } = useSite();
  const [open, setOpen] = useState(null);
  const today = todayISO();
  return (
    <div className="nav9">
      {days.map((d) => {
        const isToday = d.date === today;
        const isOpen = open === d.id;
        return (
          <article key={d.id} className={'day rv tilt' + (isToday ? ' today' : '') + (isOpen ? ' open' : '')} style={{ '--c': d.hex }}>
            <button onClick={() => setOpen(isOpen ? null : d.id)} aria-expanded={isOpen} aria-label={`${d.devi}, दिवस ${mr(d.n)} — तपशील`}>
              <span className="dn">{mr(d.n)}</span>
              {isToday && <em className="now">आजचा दिवस</em>}
              <h3>{d.devi}</h3>
              <p className="dd">{fmtDate(d.date)} • {weekday(d.date)}</p>
              <p className="dc"><i className="sw" />{d.color}</p>
              <span className="more-i" aria-hidden="true">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && (
              <div className="dx">
                <p>{d.meaning}</p>
                {d.details && <p>{d.details}</p>}
                <p className="dcl">आजचा रंग: <b>{d.color}</b></p>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

export function Journey() {
  const { settings } = useSite();
  const a = daysUntil(settings.arrivalDate), v = daysUntil(settings.visarjanDate);
  const note = (iso, x) => (x > 0 ? `${mr(x)} दिवस बाकी` : x === 0 ? 'आज!' : 'पूर्ण झाले');
  const steps = [
    ['🪔', 'देवी आगमन', fmtDate(settings.arrivalDate), note(settings.arrivalDate, a)],
    ['🙏', '९ दिवसांची भक्ती', 'नऊ रूपांची आराधना', ''],
    ['🎉', 'उत्सव', 'आरती • प्रसाद • कार्यक्रम', ''],
    ['🌊', 'विसर्जन', fmtDate(settings.visarjanDate), note(settings.visarjanDate, v)],
  ];
  return (
    <ol className="journey">
      {steps.map(([i, t, s, c]) => (
        <li key={t} className="rv"><span className="ji">{i}</span><div><h4>{t}</h4><p>{s}</p>{c && <b>{c}</b>}</div></li>
      ))}
    </ol>
  );
}
