# eSewa MP — Improved Portal Prototype

A standalone, front-end-only prototype of an **improved Madhya Pradesh eSewa portal**,
built to demonstrate a re-imagined citizen experience for one fully-working service:
**Domicile Certificate (मूल निवास प्रमाण पत्र)**.

No backend, no build tools, no paid APIs. Pure HTML / CSS / JS. Ready for GitHub Pages.

---

## ✨ What's improved (talking points for the demo)

| Feature | Badge shown in UI |
|---|---|
| Auto-fill every field from Samagra ID | ✓ Auto-fetched from Samagra |
| Voice-first form filling (Hindi + English) | ✓ New Feature |
| Typeform-style one-question-per-screen | ✓ Simplified |
| AI document clarity + type check (TensorFlow.js) | ✓ AI Checked |
| Automatic image + PDF compression | ✓ AI Checked |
| Aadhaar ↔ Samagra mismatch detection | ⚠ shown inline |
| SMS-based status tracking | ✓ New Feature |
| Live stage tracking (Patwari → SDM → Approved) | ✓ New Feature |
| Instant Hindi / English toggle on every page | — |

---

## 🎬 Demo script (2 minutes)

1. Open **login.html** → enter `SMGR002` → OTP → any 6 digits → **Verify**.
2. Home shows *"Welcome, Savitri Bai"*. Search **"Domicile"** (or tap the mic).
3. Service Info page → tap **🔊 Read this page aloud** (Hindi voice-over).
4. Tap **🎙️ बातों बातों में फॉर्म भरिये** to enter voice form mode.
5. Fetched fields are confirmed by voice (*"Aapka naam … hai — kya sahi hai?"*).
6. Upload page → drop an Aadhaar image → AI clarity score + auto-compression.
7. Payment shows **₹0** with the BPL waiver explanation.
8. Confirmation → application number, QR code, SMS template, downloadable receipt PDF.
9. Tracking → use the **Demo Controls** to advance Patwari → Verification → SDM → Approved.
10. Press **Ctrl + Shift + P** → switch to **SMGR003 (Mohan)** to show the Aadhaar mismatch state.
11. Press **Ctrl + Shift + P** → **Reset all demo data** for the next viewer.

### Demo profiles
| Samagra ID | Name | Category | Fee |
|---|---|---|---|
| `SMGR001` | Ramesh Kumar | General, Urban | ₹50 |
| `SMGR002` | Savitri Bai | SC, **BPL**, Rural | ₹0 |
| `SMGR003` | Mohan (Aadhaar **mismatch**) | OBC, Urban | ₹30 |

---

## 🎛️ Presenter controls

Press **`Ctrl + Shift + P`** on any page to open the hidden presenter panel:
- **Jump** to any page instantly
- **Switch** between the 3 demo profiles
- **Reset** all demo data to a fresh start

---

## 🚀 Deploy to GitHub Pages

1. Create a new GitHub repository (e.g. `esewa-prototype`).
2. Put the **contents of this folder** at the repo root and push:
   ```bash
   git init
   git add .
   git commit -m "eSewa improved portal prototype"
   git branch -M main
   git remote add origin https://github.com/<you>/esewa-prototype.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Source: `main` / root → Save**.
4. Open `https://<you>.github.io/esewa-prototype/login.html`.

> The prototype is entirely client-side, so it also runs by just opening
> `login.html` in Chrome/Edge. For the Web Speech API (voice) to work,
> serve over `https://` (GitHub Pages) or `http://localhost`, and allow
> microphone access when prompted.

### Run locally
```bash
# from inside the folder
python -m http.server 8000
# then open http://localhost:8000/login.html
```

---

## 🧩 Libraries (all free, loaded via CDN)

| Library | Purpose |
|---|---|
| Web Speech API (browser built-in) | Voice input (STT) + output (TTS) |
| TensorFlow.js | Image sharpness / blur scoring |
| browser-image-compression | Client-side image compression |
| pdf-lib | PDF compression + receipt generation |
| qrcodejs | QR code on confirmation page |

---

## 📁 File structure

```
esewa-prototype/
├── login.html            index.html            service-info.html
├── form.html             upload.html           payment.html
├── confirmation.html     tracking.html
├── css/  style.css  form.css
├── js/   db.js  lang.js  auth.js  voice.js  form.js
│         upload.js  payment.js  tracking.js  presenter.js
└── assets/
```

## 🔒 Notes
- All data is **hardcoded demo data** in `js/db.js`. Nothing is sent anywhere.
- State persists between pages via `localStorage`
  (`esewa_profile`, `esewa_lang`, `esewa_application`, `esewa_stage`, …).
- Best viewed in **Chrome** or **Edge** (Web Speech API support). Voice degrades
  gracefully to typing where unsupported.
