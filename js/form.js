/* form.js — typeform-style Domicile Certificate application.
   One question per screen, voice-first, autocomplete, fetched-field confirmation,
   Aadhaar mismatch detection, and a "Review All" summary. */

(function () {
  const profile = dbRequireProfile();
  if (!profile) return;

  const s = profile.samagra;
  const verify = dbVerifyAadhaar(profile);
  const mismatchFields = new Set(verify.mismatches.map(m => m.field.toLowerCase()));

  const MP_DISTRICTS = ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Rewa", "Narsinghgarh", "Sehore", "Vidisha"];
  const COMMON_TEHSILS = ["Huzur", "Narsinghgarh", "Sanwer", "Mhow", "Kolar", "Berasia", "Sadar"];

  // Question schema. `fetch` reads from Samagra; `confirm` shows Yes/No readback.
  const REL_OPTIONS = [
    { en: "S/o or D/o (Father)", hi: "आत्मज / आत्मजा (पिता का)" },
    { en: "W/o or H/o (Spouse)", hi: "पति / पत्नी (जीवनसाथी का)" }
  ];
  const regNo = "MP-DOM-REG-" + Math.floor(100000 + Math.random() * 899999);
  const defaultRel = s.gender === "Female" ? REL_OPTIONS[1].en : REL_OPTIONS[0].en;

  // Ordered to mirror the real "स्व प्रमाणित घोषणा-पत्र" (self-certified declaration).
  const QUESTIONS = [
    { id: "registration", labelKey: "q_registration", type: "display", value: regNo },
    { id: "samagra", labelKey: "q_samagra", type: "display", value: profile.samagraId },
    { id: "name", labelKey: "q_name", type: "fetched", value: s.name, confirm: true, aadhaarField: "name" },
    { id: "relation", labelKey: "q_relation", type: "select", required: true, value: defaultRel, options: REL_OPTIONS },
    { id: "father", labelKey: "q_father", type: "fetched", value: s.father, confirm: true },
    { id: "dob", labelKey: "q_dob", type: "fetched", value: s.dob, confirm: true, aadhaarField: "dob" },
    { id: "age", labelKey: "q_age", type: "fetched", value: String(computeAge(s.dob)), confirm: true, inputmode: "numeric" },
    { id: "gender", labelKey: "q_gender", type: "fetched", value: s.gender, confirm: true,
      options: ["Male", "Female", "Other"] },
    { id: "category", labelKey: "q_category", type: "fetched", value: s.category, confirm: true,
      options: ["General", "OBC", "SC", "ST"] },
    { id: "mobile", labelKey: "q_mobile", type: "fetched", value: s.mobile, confirm: true, inputmode: "numeric" },
    { id: "email", labelKey: "q_email", type: "text", inputType: "email", required: true,
      suggest: (v) => emailSuggest(v) },
    { id: "pin", labelKey: "q_pin", type: "fetched", value: s.pin, confirm: true, inputmode: "numeric" },
    { id: "area", labelKey: "q_area", type: "fetched", value: s.area, confirm: true, options: ["Urban", "Rural"] },
    { id: "district", labelKey: "q_district", type: "text", required: true,
      value: guessDistrict(), suggest: (v) => listSuggest(MP_DISTRICTS, v) },
    { id: "tehsil", labelKey: "q_tehsil", type: "text", required: true,
      suggest: (v) => listSuggest(COMMON_TEHSILS, v) },
    { id: "village_ward", labelKey: "q_village_ward", type: "text", required: true },
    { id: "curr_addr", labelKey: "q_curr_addr", type: "fetched", value: s.address, confirm: true, textarea: true },
    { id: "perm_addr", labelKey: "q_perm_addr", type: "textarea", required: true,
      suggest: () => [{ label: t("same_as_current"), value: s.address }] },
    { id: "caste", labelKey: "q_caste", type: "text", required: false },
    { id: "spouse_name", labelKey: "q_spouse_name", type: "text", required: false },
    { id: "spouse_age", labelKey: "q_spouse_age", type: "text", inputType: "number", required: false, inputmode: "numeric" },
    { id: "minor_children", labelKey: "q_minor_children", type: "children" },
    { id: "eligibility", labelKey: "q_eligibility", type: "select", required: true,
      options: ELIGIBILITY_OPTIONS },
    { id: "duration", labelKey: "q_duration", type: "text", inputType: "number", required: true, inputmode: "numeric",
      suggest: (v) => listSuggest(["15", "20", "25", "30", "40"], v) },
    { id: "purpose", labelKey: "q_purpose", type: "select", required: true, options: PURPOSE_OPTIONS },
    { id: "declaration", labelKey: "q_declaration", type: "declaration", required: true },
    { id: "digilocker", labelKey: "q_digilocker", type: "toggle", default: true }
  ];

  function computeAge(dob) {
    const p = (dob || "").split("/").map(Number);
    if (p.length !== 3) return "";
    const [d, m, y] = p;
    const today = new Date();
    let a = today.getFullYear() - y;
    if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) a--;
    return a;
  }

  function guessDistrict() {
    const addr = s.address.toLowerCase();
    return MP_DISTRICTS.find(d => addr.includes(d.toLowerCase())) || "";
  }
  function emailSuggest(v) {
    v = (v || "").trim();
    if (!v || v.includes("@")) {
      const base = s.name.toLowerCase().replace(/[^a-z]/g, "");
      return ["@gmail.com", "@yahoo.com", "@outlook.com"].map(d => ({ label: base + d, value: base + d }));
    }
    return ["@gmail.com", "@yahoo.com", "@outlook.com", "@rediffmail.com"].map(d => ({ label: v + d, value: v + d }));
  }
  function listSuggest(list, v) {
    v = (v || "").toLowerCase();
    return list.filter(x => x.toLowerCase().includes(v)).slice(0, 5).map(x => ({ label: x, value: x }));
  }

  // State
  const answers = JSON.parse(localStorage.getItem("esewa_form") || "{}");
  // Seed fetched defaults so Review shows values even if user Nexts fast.
  QUESTIONS.forEach(q => {
    if (answers[q.id] === undefined) {
      if (q.type === "display") answers[q.id] = q.value;
      else if (q.type === "fetched") answers[q.id] = q.value;
      else if (q.type === "toggle") answers[q.id] = !!q.default;
      else if (q.type === "children") answers[q.id] = [];
      else if (q.type === "declaration") answers[q.id] = false;
      else if (q.value) answers[q.id] = q.value;
    }
  });
  saveAnswers();

  let idx = 0;
  let reviewMode = false;
  const voiceMode = localStorage.getItem("esewa_voicemode") === "1";

  const qInner = document.getElementById("qInner");
  const progFill = document.getElementById("progFill");
  const qNow = document.getElementById("qNow");
  const qTotal = document.getElementById("qTotal");
  const backBtn = document.getElementById("backBtn");
  const nextBtn = document.getElementById("nextBtn");
  qTotal.textContent = QUESTIONS.length;

  function saveAnswers() { localStorage.setItem("esewa_form", JSON.stringify(answers)); }

  function optLabel(opt) {
    if (typeof opt === "string") return opt;
    return getLang() === "hi" ? opt.hi : opt.en;
  }

  function render() {
    voiceStop();
    if (reviewMode) return renderReview();
    const q = QUESTIONS[idx];
    qNow.textContent = idx + 1;
    progFill.style.width = ((idx) / QUESTIONS.length * 100) + "%";
    backBtn.style.visibility = idx === 0 ? "hidden" : "visible";
    nextBtn.textContent = idx === QUESTIONS.length - 1 ? t("review_all") : t("next");

    let html = `<div class="q-index">${idx + 1} / ${QUESTIONS.length}</div>`;
    html += `<div class="q-title">${t(q.labelKey)}</div>`;

    // Aadhaar mismatch banner on affected fetched fields.
    if (q.aadhaarField && mismatchFields.has(q.aadhaarField)) {
      const m = verify.mismatches.find(x => x.field.toLowerCase() === q.aadhaarField);
      html += `<div class="alert err" style="margin-top:10px">
        <span>⚠</span><div><b>${t("mismatch_title")}</b><br>
        Samagra: <b>${m.samagra}</b> · Aadhaar: <b>${m.aadhaar}</b></div></div>`;
    }

    if (q.type === "display") {
      html += `<div class="fetched-box"><div class="lbl">✓ ${t("autofetched")}</div>
        <div class="val">${answers[q.id]}</div></div>`;
    } else if (q.type === "fetched") {
      html += renderFetched(q);
    } else {
      html += renderInput(q);
    }
    qInner.innerHTML = html;
    wire(q);

    if (voiceMode) setTimeout(() => speakQuestion(q), 250);
  }

  function renderFetched(q) {
    const val = answers[q.id];
    return `
      <div class="fetched-box">
        <div class="lbl">✓ ${t("autofetched")}</div>
        <div class="val" id="fetchedVal">${val}</div>
      </div>
      <div class="q-sub">${t("is_correct")}</div>
      <div class="yn-row">
        <button class="btn success" id="ynYes">✓ ${t("yes")}</button>
        <button class="btn secondary" id="ynNo">✎ ${t("no")}</button>
        <button class="mic-btn" id="fieldMic">🎤</button>
      </div>
      <div id="editWrap" class="hidden mt">${renderEditControl(q, val)}</div>
    `;
  }

  function renderEditControl(q, val) {
    if (q.options) {
      return `<select id="qInput">` + q.options.map(o =>
        `<option value="${optRaw(o)}" ${optRaw(o) === val ? "selected" : ""}>${optLabel(o)}</option>`).join("") + `</select>`;
    }
    if (q.textarea) return `<textarea id="qInput" rows="3">${val}</textarea>`;
    return `<input class="input" id="qInput" value="${val || ""}" ${q.inputmode ? `inputmode="${q.inputmode}"` : ""}>`;
  }
  function optRaw(o) { return typeof o === "string" ? o : (o.en); }

  function renderInput(q) {
    let control;
    if (q.type === "select") {
      const rows = q.options.map(o => {
        const raw = optRaw(o), lab = optLabel(o), sel = answers[q.id] === raw;
        return `<div class="opt ${sel ? "sel" : ""}" data-val="${(raw + "").replace(/"/g, "&quot;")}">
          <button class="opt-speak" data-say="${(lab + "").replace(/"/g, "&quot;")}" title="🔊">🔊</button>
          <span class="opt-label">${lab}</span><span class="opt-check">${sel ? "✓" : ""}</span></div>`;
      }).join("");
      return `<div class="q-sub">${getLang() === "hi" ? "विकल्प सुनने हेतु 🔊 दबाएँ · चुनने हेतु टैप करें या 🎤 से बोलें" : "Tap 🔊 to hear an option · tap to choose, or use 🎤 to speak"}</div>
        <div class="opt-list" id="optList">${rows}</div>
        <div class="voice-hint-row"><button class="mic-btn" id="fieldMic">🎤</button><span class="muted">${getLang() === "hi" ? "बोलकर चुनें" : "Choose by voice"}</span></div>
        <div class="field-error hidden" id="qErr">${t("required_field")}</div>`;
    } else if (q.type === "toggle") {
      const on = answers[q.id];
      return `<div class="q-sub">${t("q_digilocker")}</div>
        <div class="yn-row">
          <button class="btn ${on ? "" : "secondary"}" id="tgYes">✓ ${t("yes")}</button>
          <button class="btn ${on ? "secondary" : ""}" id="tgNo">✗ ${t("no")}</button>
        </div>
        ${voiceMode ? `<div class="voice-hint-row"><button class="mic-btn" id="fieldMic">🎤</button><span class="muted">${getLang() === "hi" ? "बोलकर उत्तर दें" : "Answer by voice"}</span></div>` : ""}`;
    } else if (q.type === "children") {
      const kids = answers[q.id] || [];
      const rows = kids.map((c, i) => `
        <div class="input-row" style="margin-bottom:8px">
          <input class="input" data-kid="${i}" data-f="name" placeholder="${t("child_name")}" value="${(c.name || "").replace(/"/g, "&quot;")}">
          <input class="input" data-kid="${i}" data-f="age" inputmode="numeric" style="max-width:90px" placeholder="${t("child_age")}" value="${(c.age || "").toString().replace(/"/g, "&quot;")}">
          <button class="mic-btn" data-del="${i}">✕</button>
        </div>`).join("");
      return `
        <div class="q-sub">${t("no_children")} → ${t("next")}</div>
        <div id="kidRows">${rows}</div>
        <button class="btn secondary block mt" id="addKid">${t("add_child")}</button>`;
    } else if (q.type === "declaration") {
      return `
        <div class="fetched-box" style="background:#fffaf0;border-color:#f2c879">
          <div class="lbl" style="color:var(--amber)">📜 ${t("declaration_preview")}</div>
          <div id="declPreview" style="font-size:14px;line-height:1.6;color:var(--text)"></div>
        </div>
        <div class="alert info">${t("declaration_accept")}</div>
        <div class="switch-row">
          <span><b>${t("declaration_confirm")}</b></span>
          <label class="switch"><input type="checkbox" id="qToggle" ${answers[q.id] ? "checked" : ""}><span class="slider"></span></label>
        </div>
        <div class="field-error hidden" id="qErr">${t("must_accept")}</div>`;
    } else if (q.type === "textarea") {
      control = `<textarea id="qInput" rows="3">${answers[q.id] || ""}</textarea>`;
    } else {
      control = `<input class="input" id="qInput" type="${q.inputType || "text"}" value="${answers[q.id] || ""}"
        ${q.inputmode ? `inputmode="${q.inputmode}"` : ""}>`;
    }
    return `
      <div class="q-sub">${t("mic_hint")}</div>
      <div class="q-input-wrap">${control}<button class="mic-btn" id="fieldMic">🎤</button></div>
      <div class="field-error hidden" id="qErr">${t("required_field")}</div>
      <div id="suggWrap"></div>`;
  }

  function wire(q) {
    if (q.type === "fetched") {
      document.getElementById("ynYes").onclick = () => next();
      document.getElementById("ynNo").onclick = () => {
        document.getElementById("editWrap").classList.remove("hidden");
        const inp = document.getElementById("qInput");
        inp.addEventListener("input", () => { answers[q.id] = inp.value; saveAnswers(); });
        inp.addEventListener("change", () => { answers[q.id] = inp.value; saveAnswers();
          document.getElementById("fetchedVal").textContent = inp.value; });
        inp.focus();
      };
      const mic = document.getElementById("fieldMic");
      if (mic) bindMic(mic, (text, alts) => handleYesNoVoice(q, text, alts));
      return;
    }

    if (q.type === "toggle") {
      const yesB = document.getElementById("tgYes"), noB = document.getElementById("tgNo");
      const setTg = v => {
        answers[q.id] = v; saveAnswers();
        yesB.className = "btn " + (v ? "" : "secondary");
        noB.className = "btn " + (v ? "secondary" : "");
        voiceSpeak(v ? t("yes") : t("no"));
      };
      yesB.onclick = () => setTg(true);
      noB.onclick = () => setTg(false);
      const mic = document.getElementById("fieldMic");
      if (mic) bindMic(mic, (text) => { const yn = interpretYesNo(text); if (yn) setTg(yn === "yes"); });
      return;
    }

    if (q.type === "children") {
      document.getElementById("addKid").onclick = () => {
        answers[q.id] = answers[q.id] || [];
        answers[q.id].push({ name: "", age: "" });
        saveAnswers(); render();
      };
      qInner.querySelectorAll("[data-kid]").forEach(el => el.addEventListener("input", () => {
        const i = +el.dataset.kid, f = el.dataset.f;
        answers[q.id][i][f] = el.value; saveAnswers();
      }));
      qInner.querySelectorAll("[data-del]").forEach(b => b.onclick = () => {
        answers[q.id].splice(+b.dataset.del, 1); saveAnswers(); render();
      });
      return;
    }

    if (q.type === "declaration") {
      const prev = document.getElementById("declPreview");
      if (prev) prev.innerHTML = buildDeclaration();
      const tg = document.getElementById("qToggle");
      tg.addEventListener("change", () => { answers[q.id] = tg.checked; saveAnswers(); });
      return;
    }

    if (q.type === "select") {
      const list = document.getElementById("optList");
      list.querySelectorAll(".opt-speak").forEach(b => b.addEventListener("click", e => {
        e.stopPropagation();
        list.querySelectorAll(".opt-speak").forEach(x => x.classList.remove("playing"));
        b.classList.add("playing");
        voiceSpeak(b.dataset.say).then(() => b.classList.remove("playing"));
      }));
      list.querySelectorAll(".opt").forEach(el => el.addEventListener("click", e => {
        if (e.target.closest(".opt-speak")) return;
        answers[q.id] = el.dataset.val; saveAnswers();
        list.querySelectorAll(".opt").forEach(x => { x.classList.remove("sel"); x.querySelector(".opt-check").textContent = ""; });
        el.classList.add("sel"); el.querySelector(".opt-check").textContent = "✓";
        const er = document.getElementById("qErr"); if (er) er.classList.add("hidden");
        voiceSpeak(el.querySelector(".opt-label").textContent);
      }));
      const mic = document.getElementById("fieldMic");
      if (mic) bindMic(mic, (text) => pickBestOption(q, text));
      return;
    }

    const inp = document.getElementById("qInput");
    if (inp) {
      const commit = () => { answers[q.id] = inp.value; saveAnswers(); if (q.suggest) showSuggest(q); };
      inp.addEventListener("input", commit);
      inp.addEventListener("keydown", e => { if (e.key === "Enter" && q.type !== "textarea") next(); });
      if (q.suggest) showSuggest(q);
    }
    const mic = document.getElementById("fieldMic");
    if (mic) bindMic(mic, (text, alts) => handleVoiceInput(q, text, alts));
  }

  // Build the authentic self-certified declaration text from current answers.
  function buildDeclaration() {
    const relSpouse = (answers.relation || "").indexOf("W/o") === 0 || (answers.relation || "").indexOf("पति") === 0;
    const relWord = getLang() === "hi" ? (relSpouse ? "पति/पत्नी" : "आत्मज/आत्मजा") : (relSpouse ? "S/o·W/o" : "S/o·D/o");
    const kids = (answers.minor_children || []).filter(c => c.name);
    const kidsLine = kids.length
      ? kids.map(c => `${c.name} (${c.age || "?"})`).join(", ")
      : (getLang() === "hi" ? "कोई नहीं" : "None");
    if (getLang() === "hi") {
      return `मैं <b>${answers.name || "—"}</b> ${relWord} श्री <b>${answers.father || "—"}</b>, आयु लगभग <b>${answers.age || "—"}</b> वर्ष, `
        + `निवासी <b>${answers.curr_addr || "—"}</b> शपथपूर्वक घोषणा करता/करती हूँ कि मैं मध्यप्रदेश का/की मूल निवासी हूँ। `
        + `अवयस्क संतान: ${kidsLine}. पात्रता: ${answers.eligibility || "—"}.`;
    }
    return `I, <b>${answers.name || "—"}</b> ${relWord} <b>${answers.father || "—"}</b>, aged about <b>${answers.age || "—"}</b> years, `
      + `resident of <b>${answers.curr_addr || "—"}</b>, do solemnly declare that I am a domicile of Madhya Pradesh. `
      + `Minor children: ${kidsLine}. Eligibility: ${answers.eligibility || "—"}.`;
  }

  function showSuggest(q) {
    const wrap = document.getElementById("suggWrap");
    if (!wrap || !q.suggest) return;
    const cur = (document.getElementById("qInput") || {}).value || "";
    const items = q.suggest(cur).slice(0, 5);
    if (!items.length) { wrap.innerHTML = ""; return; }
    wrap.innerHTML = `<div class="suggestions-label">${t("suggestions")}</div><div class="suggestions">` +
      items.map((it, i) => `<button class="chip" data-v="${(it.value + "").replace(/"/g, "&quot;")}">${it.label}</button>`).join("") +
      `</div>`;
    wrap.querySelectorAll(".chip").forEach(c => c.onclick = () => {
      const inp = document.getElementById("qInput");
      inp.value = c.dataset.v; answers[q.id] = c.dataset.v; saveAnswers(); showSuggest(q);
    });
  }

  // Voice: fetched field readback + yes/no; selects read out all options.
  function speakQuestion(q) {
    if (q.type === "display") { voiceSpeak(t(q.labelKey) + ": " + answers[q.id]); return; }
    if (q.type === "fetched") {
      const phrase = getLang() === "hi"
        ? `आपका ${t(q.labelKey)} ${answers[q.id]} है — क्या सही है?`
        : `Your ${t(q.labelKey)} is ${answers[q.id]} — is this correct?`;
      voiceSpeak(phrase);
    } else if (q.type === "select") {
      const opts = q.options.map((o, i) => (i + 1) + ". " + optLabel(o)).join(", ");
      voiceSpeak(t(q.labelKey) + ". " + (getLang() === "hi" ? "विकल्प" : "Options") + ": " + opts);
    } else {
      voiceSpeak(t(q.labelKey));
    }
  }

  function handleYesNoVoice(q, text, alts) {
    const yn = interpretYesNo(text);
    if (yn === "yes") { showToast(t("yes")); setTimeout(next, 300); }
    else if (yn === "no") { document.getElementById("ynNo").click(); }
    else { showHeard(alts); }
  }

  function handleVoiceInput(q, text, alts) {
    const inp = document.getElementById("qInput");
    if (q.type === "select") { pickBestOption(q, text); return; }
    if (inp) {
      let v = text;
      if (q.inputmode === "numeric" || q.inputType === "number") v = text.replace(/\D/g, "") || text;
      inp.value = v; answers[q.id] = v; saveAnswers();
      if (q.suggest) showSuggest(q);
    }
    showHeard(alts);
  }

  function pickBestOption(q, text) {
    const low = (text || "").toLowerCase();
    let best = null;
    q.options.forEach(o => { if (optLabel(o).toLowerCase().includes(low) || low.includes(optLabel(o).toLowerCase().split(" ")[0])) best = o; });
    if (!best) { voiceSpeak(getLang() === "hi" ? "समझ नहीं आया, कृपया विकल्प चुनें" : "Didn't catch that, please pick an option"); return; }
    answers[q.id] = optRaw(best); saveAnswers();
    const list = document.getElementById("optList");
    if (list) list.querySelectorAll(".opt").forEach(x => {
      const s = x.dataset.val === optRaw(best);
      x.classList.toggle("sel", s); x.querySelector(".opt-check").textContent = s ? "✓" : "";
    });
    const er = document.getElementById("qErr"); if (er) er.classList.add("hidden");
    voiceSpeak(optLabel(best)); showToast(optLabel(best));
  }

  // Show the top-5 heard alternatives as tappable chips.
  function showHeard(alts) {
    if (!alts || alts.length < 2) return;
    const wrap = document.getElementById("suggWrap");
    if (!wrap) return;
    wrap.innerHTML = `<div class="suggestions-label">${t("suggestions")} (🎤)</div><div class="suggestions">` +
      alts.map(a => `<button class="chip" data-v="${a.replace(/"/g, "&quot;")}">${a}</button>`).join("") + `</div>`;
    wrap.querySelectorAll(".chip").forEach(c => c.onclick = () => {
      const inp = document.getElementById("qInput");
      if (inp) { inp.value = c.dataset.v; answers[QUESTIONS[idx].id] = c.dataset.v; saveAnswers(); }
    });
  }

  function validate(q) {
    if (!q.required) return true;
    const v = answers[q.id];
    if (q.type === "declaration") {
      if (v !== true) { const err = document.getElementById("qErr"); if (err) err.classList.remove("hidden"); return false; }
      return true;
    }
    if (v === undefined || v === null || (typeof v === "string" && !v.trim())) {
      const err = document.getElementById("qErr");
      if (err) err.classList.remove("hidden");
      return false;
    }
    return true;
  }

  function next() {
    const q = QUESTIONS[idx];
    // Pull current input value if present.
    const inp = document.getElementById("qInput");
    if (inp && q.type !== "fetched") { answers[q.id] = inp.value; saveAnswers(); }
    if (!validate(q)) return;
    if (idx < QUESTIONS.length - 1) { idx++; render(); }
    else { reviewMode = true; render(); }
  }
  function prev() {
    if (reviewMode) { reviewMode = false; idx = QUESTIONS.length - 1; render(); return; }
    if (idx > 0) { idx--; render(); }
  }

  nextBtn.addEventListener("click", () => { if (reviewMode) submit(); else next(); });
  backBtn.addEventListener("click", prev);

  function renderReview() {
    voiceStop();
    progFill.style.width = "100%";
    qNow.textContent = QUESTIONS.length;
    backBtn.style.visibility = "visible";
    nextBtn.textContent = t("submit");

    let html = `<div class="q-index">✓</div><div class="q-title">${t("review_all")}</div>`;
    if (!verify.match) {
      html += `<div class="alert err"><span>⚠</span><div><b>${t("mismatch_title")}</b><br>${t("mismatch_desc")}</div></div>`;
    }
    html += `<div class="q-sub">${t("simplified")} · ${QUESTIONS.length} ${t("q_of")} ${QUESTIONS.length}</div>`;
    QUESTIONS.forEach((q, i) => {
      let val = answers[q.id];
      if (q.type === "toggle" || q.type === "declaration") val = val ? "✓ " + t("yes") : t("no");
      else if (q.type === "children") {
        const kids = (val || []).filter(c => c.name);
        val = kids.length ? kids.map(c => `${c.name} (${c.age || "?"})`).join(", ") : t("no_children");
      } else if (q.options) {
        // Show localized label for canonical select values.
        const match = q.options.find(o => optRaw(o) === val);
        if (match) val = optLabel(match);
      }
      html += `<div class="review-item">
        <div><div class="rk">${t(q.labelKey)}</div><div class="rv">${val || "—"}</div></div>
        <button class="redit" data-i="${i}">${t("edit")}</button></div>`;
    });
    // Authentic declaration preview on the review screen.
    html += `<div class="fetched-box mt" style="background:#fffaf0;border-color:#f2c879">
      <div class="lbl" style="color:var(--amber)">📜 ${t("declaration_preview")}</div>
      <div style="font-size:14px;line-height:1.6">${buildDeclaration()}</div></div>`;
    qInner.innerHTML = html;
    qInner.querySelectorAll(".redit").forEach(b => b.onclick = () => {
      reviewMode = false; idx = parseInt(b.dataset.i, 10); render();
    });
  }

  function submit() {
    // Build the application record.
    const app = {
      ref: "DOM-2026-" + Math.floor(10000 + Math.random() * 89999),
      samagraId: profile.samagraId,
      name: answers.name,
      mobile: answers.mobile,
      fee: profile.fee,
      bpl: profile.samagra.bpl,
      answers: answers,
      mismatch: !verify.match,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem("esewa_application", JSON.stringify(app));
    window.location.href = "upload.html";
  }

  document.addEventListener("langchange", render);
  render();
})();
