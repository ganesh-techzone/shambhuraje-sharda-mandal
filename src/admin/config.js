import { GALLERY_CATS } from '../data/defaults';

const T = (k, label, extra = {}) => ({ k, label, ...extra });
const PUB = { k: 'published', label: 'प्रकाशित करा', type: 'bool', def: true };

export const NOTICE = [
  T('title', 'सूचनेचे शीर्षक', { req: true }),
  T('body', 'सविस्तर माहिती', { type: 'textarea' }),
  T('priority', 'प्राधान्य', { type: 'select', options: [['normal', 'साधारण'], ['high', 'महत्त्वाची'], ['urgent', 'तातडीची']] }),
  T('expiry', 'मुदत संपण्याची तारीख', { type: 'date', hint: 'रिकामे ठेवल्यास सूचना कायम दिसेल' }),
  PUB,
];
export const EVENT = [
  T('title', 'कार्यक्रमाचे नाव', { req: true }),
  T('date', 'तारीख', { type: 'date', req: true }),
  T('time', 'वेळ', { type: 'time' }),
  T('place', 'ठिकाण'),
  T('info', 'माहिती', { type: 'textarea' }),
  T('imageUrl', 'फोटो', { type: 'image' }),
  T('status', 'स्थिती', { type: 'select', options: [['upcoming', 'आगामी'], ['live', 'सुरू आहे'], ['done', 'पूर्ण'], ['cancelled', 'रद्द']] }),
  PUB,
];
export const MEMBER = [
  T('memberId', 'सदस्य क्रमांक', { ro: true }),
  T('name', 'नाव', { req: true }),
  T('mobile', 'मोबाईल', { type: 'tel' }),
  T('role', 'पद', { def: 'सदस्य' }),
  T('photo', 'फोटो', { type: 'image' }),
  T('year', 'वर्ष', { def: String(new Date().getFullYear()) }),
  T('status', 'स्थिती', { type: 'select', options: [['active', 'सक्रिय'], ['inactive', 'निष्क्रिय']] }),
];
export const COMMITTEE = [
  T('name', 'नाव', { req: true }),
  T('role', 'पद', { req: true }),
  T('category', 'गट', { type: 'select', options: [['पदाधिकारी', 'पदाधिकारी'], ['कार्यकर्ते', 'कार्यकर्ते']] }),
  T('order', 'क्रम', { type: 'number', def: 10, hint: 'लहान क्रमांक आधी दिसतो' }),
  T('mobile', 'मोबाईल', { type: 'tel' }),
  T('showPhone', 'मोबाईल सार्वजनिक दाखवा', { type: 'bool' }),
  T('photo', 'फोटो', { type: 'image' }),
  PUB,
];
export const METHODS = [['cash', 'रोख'], ['upi', 'UPI'], ['bank', 'बँक हस्तांतरण'], ['cheque', 'चेक']];
export const DONATION = [
  T('receiptNo', 'पावती क्रमांक', { ro: true }),
  T('name', 'नाव', { req: true }),
  T('mobile', 'मोबाईल क्रमांक', { type: 'tel' }),
  T('amount', 'रक्कम', { type: 'number', req: true, money: true }),
  T('date', 'तारीख', { type: 'date', req: true }),
  T('method', 'पेमेंट पद्धत', { type: 'select', options: METHODS }),
  T('message', 'संदेश', { type: 'textarea' }),
];
export const GALLERY = [
  T('imageUrl', 'फोटो', { type: 'image', req: true }),
  T('category', 'वर्ग', { type: 'select', options: GALLERY_CATS.map((c) => [c, c]) }),
  T('caption', 'मथळा'),
  PUB,
];
export const VIDEO = [
  T('title', 'शीर्षक', { req: true }),
  T('type', 'प्रकार', { type: 'select', options: [['youtube', 'YouTube'], ['facebook', 'Facebook'], ['live', 'थेट प्रक्षेपण'], ['other', 'इतर']] }),
  T('url', 'लिंक (URL)', { type: 'url', req: true }),
  T('isLive', 'हे थेट दर्शन आहे (वर दाखवा)', { type: 'bool' }),
  PUB,
];
export const NAVRATRI = [
  T('n', 'दिवस क्रमांक', { type: 'number', req: true }),
  T('date', 'तारीख', { type: 'date', req: true }),
  T('devi', 'देवीचे रूप', { req: true }),
  T('color', 'रंगाचे नाव', { req: true }),
  T('hex', 'रंग कोड', { def: '#ff8a1f', hint: 'उदा. #ff8a1f' }),
  T('meaning', 'अर्थ', { type: 'textarea' }),
  T('details', 'अधिक माहिती', { type: 'textarea' }),
  PUB,
];
export const AARTI = [
  T('morningName', 'पहिल्या आरतीचे नाव'), T('morning', 'पहिल्या आरतीची वेळ', { type: 'time' }),
  T('eveningName', 'दुसऱ्या आरतीचे नाव'), T('evening', 'दुसऱ्या आरतीची वेळ', { type: 'time' }),
  T('info', 'आरतीविषयी माहिती', { type: 'textarea' }),
];
export const LIVE = [
  T('prasad', 'प्रसाद', { type: 'select', options: [['available', 'उपलब्ध'], ['closed', 'बंद']] }),
  T('parking', 'पार्किंग', { type: 'select', options: [['available', 'उपलब्ध'], ['limited', 'मर्यादित'], ['closed', 'बंद']] }),
  T('activity', 'सध्याचा उपक्रम'),
  T('message', 'महत्त्वाचा संदेश'),
  T('darshanStatus', 'दर्शन स्थिती'),
  T('decoration', 'आजची सजावट'),
  T('naivedya', 'नैवेद्य'),
  T('darshanImage', 'आजचे दर्शन फोटो', { type: 'image' }),
];
export const AD = [
  T('title', 'जाहिरातीचे शीर्षक'), T('owner', 'मालकाचे नाव'),
  T('text', 'ओळ', { type: 'textarea' }), T('imageUrl', 'फोटो / लोगो', { type: 'image' }),
  T('link', 'लिंक (ऐच्छिक)', { type: 'url' }), T('active', 'जाहिरात दाखवा', { type: 'bool' }),
];
export const SETTINGS = [
  T('arrivalDate', 'देवी आगमन तारीख', { type: 'date' }), T('visarjanDate', 'विसर्जन तारीख', { type: 'date' }),
  T('address', 'पत्ता'), T('pin', 'पिन कोड'), T('mapUrl', 'गुगल नकाशा लिंक', { type: 'url' }),
  T('upi', 'UPI आयडी (ऐच्छिक)'),
  T('showPhones', 'संपर्क क्रमांक सार्वजनिक दाखवा', { type: 'bool', def: true }),
  T('contactsText', 'संपर्क यादी', { type: 'textarea', hint: 'प्रत्येक ओळीत: नाव|मोबाईल' }),
];
