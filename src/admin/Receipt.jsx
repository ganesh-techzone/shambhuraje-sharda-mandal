import { forwardRef, useEffect, useRef, useState } from 'react';
import { Logo } from '../components/Site';
import { Modal, useToast } from './ui';
import { fmtDate, money, mr } from '../utils/mr';
import { METHODS } from './config';
import { openReceiptOnWhatsApp } from '../services/whatsapp';
import { MANDAL } from '../data/defaults';

export const Receipt = forwardRef(function Receipt({ r }, ref) {
  const [qr, setQr] = useState('');
  useEffect(() => {
    let live = true;
    import('qrcode').then((Q) => Q.toDataURL(`SHAMBHURAJE-SHARDA-MANDAL|${r.receiptNo}|${r.amount}|${r.date}`, { margin: 1, width: 180, color: { dark: '#5a0f14', light: '#fbf3e0' } })).then((u) => live && setQr(u)).catch(() => {});
    return () => { live = false; };
  }, [r.receiptNo, r.amount, r.date]);
  const m = (METHODS.find((x) => x[0] === r.method) || [])[1] || r.method || '—';
  return (
    <div ref={ref} className="receipt">
      <div className="r-in">
        <div className="r-head"><Logo size={92} /><div><h2>{MANDAL}</h2><p>दत्त चौक, शिव किराणा दुकानाजवळ • {mr(442506)}</p></div></div>
        <div className="r-title">वर्गणी / देणगी पावती</div>
        <div className="r-meta"><span>पावती क्रमांक: <b>{r.receiptNo}</b></span><span>तारीख: <b>{fmtDate(r.date)}</b></span></div>
        <table className="r-tab"><tbody>
          <tr><th>देणगीदाराचे नाव</th><td>{r.name}</td></tr>
          {r.mobile && <tr><th>मोबाईल</th><td>{mr(r.mobile)}</td></tr>}
          <tr><th>पेमेंट पद्धत</th><td>{m}</td></tr>
          {r.message && <tr><th>संदेश</th><td>{r.message}</td></tr>}
        </tbody></table>
        <div className="r-amt"><span>स्वीकारलेली रक्कम</span><b>{money(r.amount)}</b></div>
        <p className="r-thanks">आपल्या उदार सहकार्याबद्दल मनःपूर्वक धन्यवाद! 🚩</p>
        <div className="r-foot">
          <div className="r-qr">{qr && <img src={qr} alt="पावती पडताळणी QR" width="84" height="84" />}<small>पडताळणीसाठी</small></div>
          <div className="r-sign"><i /><small>अधिकृत स्वाक्षरी</small><small>संपर्क: {mr(9011514551)}</small></div>
        </div>
      </div>
    </div>
  );
});

export async function receiptPdf(node, file) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
  const canvas = await html2canvas(node, { scale: 2, backgroundColor: '#fbf3e0', useCORS: true });
  const pdf = new jsPDF({ unit: 'mm', format: 'a5', orientation: 'portrait' });
  const w = 148, h = (canvas.height * w) / canvas.width;
  pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, w, Math.min(h, 210));
  pdf.save(file);
}

export function ReceiptModal({ r, onClose }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  async function dl() {
    setBusy(true);
    try { await receiptPdf(ref.current, `${r.receiptNo}.pdf`); toast('पावती डाउनलोड झाली.', 'success'); }
    catch (e) { console.error(e); toast('पावती तयार करताना त्रुटी आली.', 'error'); }
    setBusy(false);
  }
  return (
    <Modal title={'पावती — ' + r.receiptNo} onClose={onClose} wide>
      <div className="rscroll"><Receipt ref={ref} r={r} /></div>
      <div className="row end">
        <button className="btn ghost" onClick={() => openReceiptOnWhatsApp({ ...r, date: fmtDate(r.date) }, MANDAL)} disabled={!r.mobile} title={r.mobile ? '' : 'मोबाईल क्रमांक नाही'}>व्हॉट्सअॅपवर पाठवा</button>
        <button className="btn" onClick={dl} disabled={busy}>{busy ? 'तयार होत आहे...' : 'PDF डाउनलोड करा'}</button>
      </div>
      <p className="hintp">व्हॉट्सअॅप उघडल्यावर संदेश तयार असतो; PDF जोडून "पाठवा" दाबावे लागते (स्वयंचलित पाठवणी नाही).</p>
    </Modal>
  );
}
