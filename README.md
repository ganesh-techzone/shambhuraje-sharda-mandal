# शंभूराजे नवयुवक शारदा मंडळ — Website + Admin Dashboard

React + Vite + Firebase (Auth, Firestore, Storage) — hosted on Netlify. Public site and admin panel are 100 % Marathi.
All dynamic content (aarti times, notices, events, members, gallery, videos, live status, advertisement, Navratri days) is read from Firestore with realtime listeners (`onSnapshot`) — **no redeploy is needed after the admin changes anything.**

```
npm install
npm run dev        # local
npm run build      # production build -> dist/
```

## Firebase setup (10 steps)
1. **Create project**: https://console.firebase.google.com → Add project.
2. **Authentication** → Get started → Sign-in method → enable **Email/Password**. Do *not* enable public sign-up anywhere else.
3. **Firestore Database** → Create database (production mode, region `asia-south1` Mumbai is a good choice).
4. **Storage** → Get started (production mode). (Storage may need the Blaze plan on newer projects; usage for a mandal site is tiny.)
5. **Project settings → Your apps → Web (`</>`)** → register an app.
6. Copy the shown `firebaseConfig` values.
7. `cp .env.example .env` and paste the six values. Never commit `.env`.
8. **Deploy rules**: `npm i -g firebase-tools && firebase login && firebase use --add && firebase deploy --only firestore:rules,storage.rules`
   (or paste `firestore.rules` / `storage.rules` into the console Rules tabs).
9. **Create the first admin** (below).
10. **Netlify**: add the same six variables (next section).

## First admin (secure, no hard-coded password)
1. Firebase Console → Authentication → Users → **Add user** → email + a strong password of your choice.
2. Copy that user's **User UID**.
3. Firestore → Start collection `admins` → Document ID = the **UID** → add any field (e.g. `name: "प्रशासक"`).
4. Open `https://<your-site>/admin`, log in. Only users that have an `admins/<uid>` document can read private data or write anything; rules enforce this on the server.
5. In the dashboard open **आढावा → मूळ माहिती भरा** once to create default aarti times, Navratri days, committee and advertisement documents.
Admin contact shown in receipts: 9011514551. Add more admins by adding more `admins/<uid>` documents.

## Netlify
- Connect the repo (or drag the project). Build command `npm run build`, publish dir `dist` (already in `netlify.toml`, which also contains the SPA redirect `/* → /index.html`).
- Site settings → Environment variables: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`.
- Firebase Console → Authentication → Settings → **Authorized domains**: add your Netlify domain.
- Firebase web config values are public identifiers by design; security comes from the rules. No Admin SDK key is used anywhere.

## Collections
`committee, members, aarti/main, navratriDays, notices, events, liveStatus/main, gallery, videos, donations, receipts, advertisement/main, settings/main, counters/main (private), admins`

Privacy: `members`, `donations`, `receipts`, `counters` are admin-only. The public site never reads donor or member data. The public "सदस्य" page shows only the `committee` collection (पदाधिकारी / कार्यकर्ते); a committee member's phone is public only if the admin ticks "मोबाईल सार्वजनिक दाखवा". Contact numbers on the public site can be hidden in **सेटिंग्ज**.

## Admin guide (short)
- **पुढील आरती**: change times (24h picker) → जतन करा → public site/countdown updates instantly.
- **आजची माहिती**: प्रसाद, पार्किंग, सध्याचा उपक्रम, महत्त्वाचा संदेश, आजचे दर्शन फोटो/सजावट/नैवेद्य.
- **सूचना / कार्यक्रम / फोटो / व्हिडिओ**: add, edit, delete, publish/unpublish. Notices support priority (साधारण/महत्त्वाची/तातडीची) and expiry date. Paste YouTube/Facebook links; tick "थेट दर्शन" to pin a live stream.
- **सदस्य**: auto ID `SM-0001…`, search + filters, CSV import (headers `नाव, मोबाईल, पद, वर्ष, स्थिती` — download the sample file) and CSV export. Pages load 50 rows at a time, suitable for 500+ members.
- **वर्गणी / देणगी**: saving a donation allocates a unique receipt number (`SM-R-2026-0001`, atomic counter) and creates a `receipts` record. Click **पावती** to view, **PDF डाउनलोड करा**, or **व्हॉट्सअॅपवर पाठवा**.

## WhatsApp
Current behaviour: opens WhatsApp (`wa.me`) with a prefilled message; the admin attaches the downloaded PDF and presses send. This is **not** automatic delivery. `src/services/whatsapp.js` is the single integration point: later add a Cloud Function that calls the WhatsApp Business Cloud API (token stored as a function secret) and call it from there.

## Known limitations
- Not tested against a live Firebase project by the author; follow the steps above and test CRUD once after setup.
- Images are resized in the browser (max 1600 px) before upload; Storage must be enabled.
- Receipt PDF is rendered from the on-screen receipt (so Marathi shaping is correct); it needs an internet connection for the Noto fonts.

## Theme
Palette (see `:root` and the "Theme v2" block in `src/styles/app.css`): Deep Maroon #5A1020, Royal Maroon #7A1F2B, Saffron #E87518, Gold #D4A72C, Light Gold #F2D27A, Cream #FFF8EA, Ivory #FFFDF7, Dark Brown #2B1510.
Note: `package-lock.json` is not included — run `npm install` once to generate it, then commit it.
