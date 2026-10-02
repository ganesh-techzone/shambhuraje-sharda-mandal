import { waLink } from '../utils/mr';

/**
 * WhatsApp delivery layer.
 * Today: opens WhatsApp with a prefilled message (wa.me). This is NOT automatic API delivery;
 * the admin presses "send" in WhatsApp, and attaches the downloaded PDF manually.
 * Later: implement `sendViaCloudApi(receipt)` with a Cloud Function that calls the
 * WhatsApp Business Cloud API (token kept server-side) and switch `provider` below.
 */
export const provider = 'link';
export function openReceiptOnWhatsApp(r, mandalName) {
  const text = `🙏 ${mandalName}\nवर्गणी / देणगी पावती\nपावती क्र.: ${r.receiptNo}\nनाव: ${r.name}\nरक्कम: ₹${r.amount}\nतारीख: ${r.date}\n\nआपल्या सहकार्याबद्दल मनःपूर्वक धन्यवाद! 🚩`;
  window.open(waLink(r.mobile, text), '_blank', 'noopener');
}
