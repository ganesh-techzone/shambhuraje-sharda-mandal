import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const T = createContext(() => {});
export const useToast = () => useContext(T);

export function ToastProvider({ children }) {
  const [list, setList] = useState([]);
  const push = useCallback((text, kind = 'info') => {
    const id = Math.random();
    setList((l) => [...l.slice(-3), { id, text, kind }]);
    setTimeout(() => setList((l) => l.filter((x) => x.id !== id)), kind === 'error' ? 6000 : 3200);
  }, []);
  return (
    <T.Provider value={push}>
      {children}
      <div className="toasts" role="status" aria-live="polite">{list.map((t) => <div key={t.id} className={'toast ' + t.kind}>{t.text}</div>)}</div>
    </T.Provider>
  );
}

export function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="mback" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={'modal' + (wide ? ' wide' : '')} role="dialog" aria-modal="true" aria-label={title}>
        <header><h3>{title}</h3><button className="x" onClick={onClose} aria-label="बंद करा">✕</button></header>
        <div className="mbody">{children}</div>
      </div>
    </div>
  );
}

export function Confirm({ text, onYes, onNo, busy }) {
  return (
    <Modal title="खात्री करा" onClose={onNo}>
      <p>{text}</p>
      <div className="row end"><button className="btn ghost" onClick={onNo}>रद्द करा</button><button className="btn danger" disabled={busy} onClick={onYes}>{busy ? 'हटवत आहे...' : 'हटवा'}</button></div>
    </Modal>
  );
}
