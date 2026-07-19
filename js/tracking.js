/* tracking.js — 5-stage progress with demo controls to advance stages.
   Stage index persisted in esewa_stage. Each stage carries date/time/officer + SMS. */

(function () {
  const profile = dbRequireProfile();
  if (!profile) return;
  const app = JSON.parse(localStorage.getItem("esewa_application") || "null");

  document.getElementById("trackRef").textContent = app && app.ref ? app.ref : "—";

  const STAGES = [
    { key: "stage_submitted", officer: { en: "System", hi: "सिस्टम" },
      sms: { en: "Your Domicile application {ref} has been submitted.", hi: "आपका मूल निवास आवेदन {ref} जमा हो गया है।" } },
    { key: "stage_patwari", officer: { en: "Patwari, Halka 12", hi: "पटवारी, हल्का 12" },
      sms: { en: "Application {ref} forwarded to Patwari for field verification.", hi: "आवेदन {ref} पटवारी को क्षेत्र सत्यापन हेतु भेजा गया।" } },
    { key: "stage_verify", officer: { en: "Patwari, Halka 12", hi: "पटवारी, हल्का 12" },
      sms: { en: "Field verification for {ref} is in progress.", hi: "{ref} का क्षेत्र सत्यापन प्रगति पर है।" } },
    { key: "stage_sdm", officer: { en: "SDM Office", hi: "एसडीएम कार्यालय" },
      sms: { en: "Application {ref} is under SDM review.", hi: "आवेदन {ref} एसडीएम समीक्षा में है।" } },
    { key: "stage_approved", officer: { en: "SDM (Signing Authority)", hi: "एसडीएम (हस्ताक्षर प्राधिकारी)" },
      sms: { en: "Congratulations! Certificate for {ref} is APPROVED. Download from eSewa/DigiLocker.", hi: "बधाई! {ref} का प्रमाण पत्र स्वीकृत। eSewa/डिजिलॉकर से डाउनलोड करें।" } }
  ];

  function getStage() { return parseInt(localStorage.getItem("esewa_stage") || "0", 10); }
  function setStage(n) { localStorage.setItem("esewa_stage", String(Math.max(0, Math.min(STAGES.length - 1, n)))); render(); }

  // Deterministic-ish timestamps per stage (submitted = createdAt, others +1 day each).
  function stageDate(i) {
    const base = app && app.createdAt ? new Date(app.createdAt) : new Date();
    const d = new Date(base); d.setDate(d.getDate() + i);
    d.setHours(10 + i, 15 + i * 7, 0, 0);
    return d;
  }
  function fmt(d) {
    return d.toLocaleDateString(getLang() === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "short" }) +
      ", " + d.toLocaleTimeString(getLang() === "hi" ? "hi-IN" : "en-IN", { hour: "2-digit", minute: "2-digit" });
  }
  function txt(o) { return getLang() === "hi" ? o.hi : o.en; }
  function smsText(i) { return txt(STAGES[i].sms).replace("{ref}", app && app.ref ? app.ref : "DOM-2026-XXXXX"); }

  function render() {
    const cur = getStage();

    // Progress steps
    const steps = document.getElementById("steps");
    steps.innerHTML = STAGES.map((st, i) => {
      const cls = i < cur ? "done" : i === cur ? "active" : "";
      const mark = i < cur ? "✓" : (i + 1);
      return `<div class="step ${cls}"><div class="dot">${mark}</div><div class="lbl">${t(st.key)}</div></div>`;
    }).join("");

    // Timeline (only up to current stage)
    const tl = document.getElementById("timeline");
    tl.innerHTML = STAGES.map((st, i) => {
      if (i > cur) return `<li><span class="muted">${t(st.key)}</span></li>`;
      const cls = i === cur ? "active" : "done";
      return `<li class="${cls}"><b>${t(st.key)}</b>
        <div class="meta">${fmt(stageDate(i))} · ${t("officer")}: ${txt(st.officer)}</div></li>`;
    }).join("");

    // SMS log up to current stage
    const log = document.getElementById("smsLog");
    log.innerHTML = STAGES.slice(0, cur + 1).map((st, i) =>
      `<div class="alert ok" style="margin-bottom:8px">📱 <b>${fmt(stageDate(i))}</b><br>${smsText(i)}</div>`).join("");

    document.getElementById("advBtn").disabled = cur >= STAGES.length - 1;
  }

  document.getElementById("advBtn").addEventListener("click", () => {
    const cur = getStage();
    if (cur < STAGES.length - 1) {
      setStage(cur + 1);
      showToast(t(STAGES[getStage()].key));
      if (localStorage.getItem("esewa_voicemode") === "1") voiceSpeak(smsText(getStage()));
    }
  });
  document.getElementById("resetBtn").addEventListener("click", () => setStage(0));
  document.addEventListener("langchange", render);

  render();
})();
