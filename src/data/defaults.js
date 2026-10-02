// Fallbacks ONLY (used until the admin saves real data to Firestore). Live data always wins.
export const MANDAL = 'शंभूराजे नवयुवक शारदा मंडळ';
export const AARTI = { morning: '08:00', evening: '19:30', morningName: 'सकाळची आरती', eveningName: 'रात्रीची आरती', info: 'सर्व भाविकांनी आरतीस उपस्थित राहावे. प्रसाद आरतीनंतर वाटप होईल.' };
export const LIVE = { prasad: 'available', parking: 'available', activity: '', message: '', darshanImage: '', decoration: '', naivedya: '', darshanStatus: 'दर्शन सुरू आहे' };
export const AD = { title: 'Shiv Kiran Store', owner: 'किशोर मोरे', text: 'दर्जेदार किराणा • योग्य दर • विश्वासाची सेवा', imageUrl: '', link: '', active: true };
export const SETTINGS = {
  arrivalDate: '2026-10-11', visarjanDate: '2026-10-22', upi: '', showPhones: true,
  contactsText: 'किशोर मोरे|8806279053\nसुरज कामठेवाड|9730070998\nराहुल गोरे|7887807257\nमंडळ प्रशासक|9011514551',
  address: 'दत्त चौक, शिव किराणा दुकानाजवळ', pin: '442506', mapUrl: 'https://maps.app.goo.gl/uMXckVWRF1L4QdpT7',
};
export const DAYS = [
  { n: 1, date: '2026-10-11', color: 'केशरी', hex: '#ff8a1f', devi: 'माता शैलपुत्री', meaning: 'पर्वतराज हिमालयाची कन्या; शक्ती, स्थैर्य आणि निर्धाराचे प्रतीक.' },
  { n: 2, date: '2026-10-12', color: 'पांढरा', hex: '#f4f1ea', devi: 'माता ब्रह्मचारिणी', meaning: 'तप, संयम आणि वैराग्याचे प्रतीक; साधनेची प्रेरणा देणारी देवी.' },
  { n: 3, date: '2026-10-13', color: 'लाल', hex: '#d62828', devi: 'माता चंद्रघंटा', meaning: 'शौर्य आणि शांततेचे रूप; भक्तांच्या भयाचा नाश करणारी.' },
  { n: 4, date: '2026-10-14', color: 'राजेशाही निळा', hex: '#2748c9', devi: 'माता कुष्मांडा', meaning: 'सृष्टीची निर्माती; आरोग्य, तेज आणि ऊर्जा देणारी देवी.' },
  { n: 5, date: '2026-10-15', color: 'पिवळा', hex: '#f6c90e', devi: 'माता स्कंदमाता', meaning: 'कार्तिकेयाची माता; वात्सल्य आणि मातृत्वाचे प्रतीक.' },
  { n: 6, date: '2026-10-16', color: 'हिरवा', hex: '#2f9e44', devi: 'माता कात्यायनी', meaning: 'धैर्य आणि विजयाची देवी; अन्यायाविरुद्ध शक्ती देणारी.' },
  { n: 7, date: '2026-10-17', color: 'करडा', hex: '#8d8d8d', devi: 'माता कालरात्री', meaning: 'अज्ञान आणि भीतीचा अंधकार दूर करणारी उग्र पण शुभंकरी देवी.' },
  { n: 8, date: '2026-10-18', color: 'जांभळा', hex: '#7b2cbf', devi: 'माता महागौरी', meaning: 'पावित्र्य, शांती आणि करुणेचे प्रतीक; पापांचा नाश करणारी.' },
  { n: 9, date: '2026-10-19', color: 'मोरपंखी हिरवा', hex: '#0f8b8d', devi: 'माता सिद्धिदात्री', meaning: 'सर्व सिद्धी आणि आशीर्वाद देणारी; नवरात्रीची पूर्णाहुती.' },
].map((d) => ({ ...d, id: 'day' + d.n, published: true }));
export const COMMITTEE = [
  { id: 'c1', name: 'देवदत्त (जान) मोरे', role: 'अध्यक्ष', order: 1, category: 'पदाधिकारी' },
  { id: 'c2', name: 'राहुल गोरे', role: 'उपाध्यक्ष', order: 2, category: 'पदाधिकारी' },
  { id: 'c3', name: 'करण गंधपवाड', role: 'सचिव', order: 3, category: 'पदाधिकारी' },
];
export const GALLERY_CATS = ['देवी दर्शन', 'नवरात्री', 'आरती', 'सजावट', 'कार्यक्रम', 'विसर्जन', 'मंडळाचे क्षण'];
export const parseContacts = (t) => String(t || '').split('\n').map((l) => l.split('|').map((x) => x.trim())).filter((x) => x[0] && x[1]).map(([name, phone]) => ({ name, phone }));
