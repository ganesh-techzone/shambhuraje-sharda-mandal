import { useEffect, useState } from 'react';
export function useNow(ms = 1000) {
  const [n, setN] = useState(Date.now());
  useEffect(() => { const i = setInterval(() => setN(Date.now()), ms); return () => clearInterval(i); }, [ms]);
  return n;
}
export function useReveal() {
  useEffect(() => {
    const root = document.getElementById('root');
    const show = (e) => e.classList.add('in');
    if (!('IntersectionObserver' in window)) { root.querySelectorAll('.rv').forEach(show); return undefined; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }), { threshold: 0.1 });
    const scan = () => root.querySelectorAll('.rv:not(.in):not([data-o])').forEach((e) => { e.setAttribute('data-o', '1'); io.observe(e); });
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(root, { childList: true, subtree: true });
    return () => { mo.disconnect(); io.disconnect(); };
  }, []);
}
