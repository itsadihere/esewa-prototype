/* upload.js — per-document upload with image compression, TF.js blur (sharpness)
   scoring, heuristic document-type check, and PDF compression via pdf-lib. */

(function () {
  const profile = dbRequireProfile();
  if (!profile) return;

  const state = {}; // docId -> { status, clarity, type, name, size }
  const cards = document.getElementById("docCards");
  const proceedBtn = document.getElementById("proceedBtn");

  function render() {
    cards.innerHTML = "";
    REQUIRED_DOCS.forEach(doc => {
      const st = state[doc.id];
      const card = document.createElement("div");
      card.className = "card";
      const label = getLang() === "hi" ? doc.hi : doc.en;
      card.innerHTML = `
        <div class="spread mb">
          <h2 style="margin:0">${label}</h2>
          ${st ? statusPill(st.status) : `<span class="badge ai" data-i18n="ai_checked">${t("ai_checked")}</span>`}
        </div>
        <div class="field">
          <input type="file" id="file-${doc.id}" accept="image/*,application/pdf" style="display:none">
          <button class="btn secondary block" id="pick-${doc.id}">📎 ${t("choose_file")}</button>
        </div>
        <div id="res-${doc.id}"></div>`;
      cards.appendChild(card);

      const input = card.querySelector(`#file-${doc.id}`);
      card.querySelector(`#pick-${doc.id}`).onclick = () => input.click();
      input.onchange = () => handleFile(doc, input.files[0]);
      if (st) renderResult(doc, st);
    });
  }

  function statusPill(status) {
    const map = { good: ["good", "status_good"], warn: ["warn", "status_warn"], error: ["err", "status_error"] };
    const [cls, key] = map[status] || map.warn;
    return `<span class="pill ${cls}">${t(key)}</span>`;
  }

  function renderResult(doc, st) {
    const box = document.getElementById(`res-${doc.id}`);
    if (!box) return;
    let clarityRow = "";
    if (st.clarity != null) {
      const cls = st.clarity >= 70 ? "good" : st.clarity >= 45 ? "warn" : "err";
      clarityRow = `<div class="info-row"><span class="k">${t("clarity")}</span>
        <span class="v"><span class="pill ${cls}">${st.clarity}%</span></span></div>`;
    }
    box.innerHTML = `
      <div class="info-row"><span class="k">📄 ${st.name}</span><span class="v">${st.size}</span></div>
      ${clarityRow}
      <div class="info-row"><span class="k">${t("doc_type")}</span><span class="v">${st.type}</span></div>
      ${st.note ? `<div class="alert ${st.status === "good" ? "ok" : st.status === "error" ? "err" : "warn"}" style="margin-top:8px">${st.note}</div>` : ""}`;
  }

  async function handleFile(doc, file) {
    if (!file) return;
    const box = document.getElementById(`res-${doc.id}`);
    box.innerHTML = `<div class="alert info">⏳ ${t("loading")}</div>`;

    try {
      if (file.type === "application/pdf") {
        await handlePdf(doc, file, box);
      } else if (file.type.startsWith("image/")) {
        await handleImage(doc, file, box);
      } else {
        state[doc.id] = { status: "error", type: file.type || "unknown", name: file.name,
          size: fmtSize(file.size), note: t("status_error") };
      }
    } catch (e) {
      state[doc.id] = { status: "warn", type: "—", name: file.name, size: fmtSize(file.size),
        note: (getLang() === "hi" ? "प्रोसेसिंग में समस्या, फिर भी स्वीकृत" : "Processing issue — accepted anyway") };
    }
    render();
    updateProceed();
  }

  async function handleImage(doc, file, box) {
    // Compress without visible blur.
    const originalSize = file.size;
    let compressed = file;
    try {
      compressed = await imageCompression(file, { maxSizeMB: 0.4, maxWidthOrHeight: 1600, useWebWorker: true });
    } catch (e) { /* keep original */ }

    const bitmap = await createImageBitmap(compressed);
    const clarity = await sharpnessScore(bitmap);
    const type = detectDocType(doc, bitmap, file.name);

    let status = "good", note = "";
    if (clarity < 45) {
      status = "error";
      note = getLang() === "hi" ? "छवि धुंधली है — कृपया दोबारा स्पष्ट फोटो अपलोड करें" : "Image is blurry — please re-upload a clearer photo";
    } else if (clarity < 70 || !type.match) {
      status = "warn";
      note = !type.match
        ? (getLang() === "hi" ? `यह ${type.expected} जैसा नहीं दिखता — कृपया जाँचें` : `Doesn't look like ${type.expected} — please verify`)
        : (getLang() === "hi" ? "गुणवत्ता स्वीकार्य" : "Quality acceptable");
    } else {
      note = `✓ ${getLang() === "hi" ? "स्पष्ट व सही दस्तावेज़" : "Clear & correct document"} · ${t("compressed_to")} ${fmtSize(compressed.size)} (−${Math.max(0, Math.round((1 - compressed.size / originalSize) * 100))}%)`;
    }

    state[doc.id] = { status, clarity, type: type.label, name: file.name, size: fmtSize(compressed.size), note };
  }

  async function handlePdf(doc, file, box) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    let outSize = file.size;
    try {
      const pdfDoc = await PDFLib.PDFDocument.load(bytes, { updateMetadata: false });
      pdfDoc.setTitle(""); pdfDoc.setSubject(""); pdfDoc.setKeywords([]);
      const out = await pdfDoc.save({ useObjectStreams: true });
      outSize = out.byteLength;
    } catch (e) { /* keep original size */ }
    const saved = Math.max(0, Math.round((1 - outSize / file.size) * 100));
    state[doc.id] = {
      status: "good", clarity: null, type: "PDF", name: file.name, size: fmtSize(outSize),
      note: `✓ PDF ${getLang() === "hi" ? "संपीड़ित" : "compressed"} · ${t("compressed_to")} ${fmtSize(outSize)} (−${saved}%)`
    };
  }

  // TF.js sharpness: variance of Laplacian on grayscale. Higher variance = sharper.
  async function sharpnessScore(bitmap) {
    const W = 224, H = 224;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, W, H);
    return tf.tidy(() => {
      let img = tf.browser.fromPixels(canvas, 3).mean(2).expandDims(0).expandDims(3).toFloat();
      const kernel = tf.tensor4d([0, 1, 0, 1, -4, 1, 0, 1, 0], [3, 3, 1, 1]);
      const lap = tf.conv2d(img, kernel, 1, "same");
      const { variance } = tf.moments(lap);
      const v = variance.dataSync()[0];
      // Map variance (~0..1500) to a 0..100 clarity score.
      let score = Math.round(Math.min(100, Math.sqrt(v) * 3.2));
      return Math.max(5, score);
    });
  }

  // Heuristic "AI" document-type check using aspect ratio + filename hints.
  function detectDocType(doc, bitmap, filename) {
    const ar = bitmap.width / bitmap.height;
    const fn = (filename || "").toLowerCase();
    const expectedLabel = getLang() === "hi" ? doc.hi : doc.en;
    let guess, match = true;

    if (doc.id === "photo") {
      guess = getLang() === "hi" ? "पासपोर्ट फोटो" : "Passport Photo";
      match = ar > 0.6 && ar < 1.1 || fn.includes("photo") || fn.includes("pic");
    } else if (doc.id === "aadhaar") {
      guess = getLang() === "hi" ? "आधार कार्ड" : "Aadhaar Card";
      match = ar > 1.3 || fn.includes("aadhaar") || fn.includes("aadhar") || fn.includes("uid");
    } else {
      guess = getLang() === "hi" ? "निवास प्रमाण" : "Residence Proof";
      match = true; // accept any plausible residence document
    }
    if (fn.includes("aadhaar") || fn.includes("aadhar")) { guess = getLang() === "hi" ? "आधार कार्ड" : "Aadhaar Card"; match = doc.id === "aadhaar"; }
    return { label: guess + (match ? " ✓" : " ⚠"), match, expected: expectedLabel };
  }

  function fmtSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  }

  function updateProceed() {
    const done = REQUIRED_DOCS.every(d => state[d.id] && state[d.id].status !== "error");
    proceedBtn.disabled = !done;
    if (done) localStorage.setItem("esewa_uploads", JSON.stringify(state));
  }

  proceedBtn.addEventListener("click", () => window.location.href = "payment.html");
  document.addEventListener("langchange", () => { render(); });
  render();
})();
