const D = '०१२३४५६७८९';
export const mr = (v) => String(v ?? '').replace(/[0-9]/g, (d) => D[d]);
export const money = (n) => '₹ ' + mr(Number(n || 0).toLocaleString('en-IN'));
export const pad = (n, l) => String(n).padStart(l, '0');
export const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1, 2)}-${pad(d.getDate(), 2)}`; };
export const fmtDate = (iso, opt = { day: 'numeric', month: 'long', year: 'numeric' }) => {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return isNaN(d) ? iso : d.toLocaleDateString('mr-IN', opt);
};
export const weekday = (iso) => fmtDate(iso, { weekday: 'long' });
export function fmtTime(t) {
  if (!t || !t.includes(':')) return '';
  const [h, m] = t.split(':').map(Number);
  const p = h < 12 ? 'सकाळी' : h < 16 ? 'दुपारी' : h < 20 ? 'सायंकाळी' : 'रात्री';
  return `${p} ${mr(h % 12 || 12)}:${mr(pad(m, 2))} वा.`;
}
export const tsMillis = (v) => (v && v.toMillis ? v.toMillis() : typeof v === 'number' ? v : v ? Date.parse(v) || 0 : 0);
export const phoneDigits = (p) => String(p || '').replace(/\D/g, '');
export const waLink = (mobile, text) => {
  let d = phoneDigits(mobile);
  if (d.length === 10) d = '91' + d;
  return `https://wa.me/${d}?text=${encodeURIComponent(text)}`;
};

// ---- Aarti logic (times are stored as "HH:mm" in Firestore) ----
const LIVE_MS = 45 * 60 * 1000;
export function aartiState(a, now) {
  const items = [
    { key: 'morning', name: a.morningName, time: a.morning },
    { key: 'evening', name: a.eveningName, time: a.evening },
  ].filter((i) => i.time && i.time.includes(':'));
  const b = new Date(now);
  let live = null, next = null;
  for (const off of [0, 1]) {
    for (const it of items) {
      const [h, m] = it.time.split(':').map(Number);
      const start = new Date(b.getFullYear(), b.getMonth(), b.getDate() + off, h, m, 0).getTime();
      if (off === 0 && now >= start && now < start + LIVE_MS) live = { ...it, start };
      if (start > now && (!next || start < next.start)) next = { ...it, start };
    }
  }
  return { live, next };
}
export function countdownText(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  return `${d ? mr(d) + ' दिवस ' : ''}${mr(h)} तास ${mr(m)} मि. ${mr(x)} से.`;
}
export const daysUntil = (iso) => Math.ceil((new Date(iso + 'T00:00:00').getTime() - new Date(todayISO() + 'T00:00:00').getTime()) / 86400000);
