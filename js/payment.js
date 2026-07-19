/* payment.js — demo payment. Fee from profile; BPL => ₹0 with waiver note.
   Any input succeeds; animated success then advance to confirmation. */

(function () {
  const profile = dbRequireProfile();
  if (!profile) return;

  const fee = profile.fee;
  const isBpl = profile.samagra.bpl || fee === 0;

  document.getElementById("amount").textContent = "₹" + fee;

  const bplNote = document.getElementById("bplNote");
  const payArea = document.getElementById("payArea");

  function applyLang() {
    if (isBpl) {
      bplNote.textContent = t("bpl_waiver");
      bplNote.classList.remove("hidden");
    }
    document.getElementById("amount").textContent = "₹" + fee;
  }
  applyLang();
  document.addEventListener("langchange", applyLang);

  // BPL: no payment UI, just continue.
  if (isBpl) {
    payArea.innerHTML = "";
    const b = document.createElement("button");
    b.className = "btn block success";
    b.textContent = t("no_fee_continue");
    b.onclick = () => finish();
    payArea.appendChild(b);
    document.addEventListener("langchange", () => b.textContent = t("no_fee_continue"));
    voiceHint(t("bpl_waiver"));
  } else {
    // Payment tabs
    const tabs = document.getElementById("payTabs");
    tabs.addEventListener("click", e => {
      const btn = e.target.closest("button[data-pay]");
      if (!btn) return;
      tabs.querySelectorAll("button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".paypane").forEach(p => p.classList.add("hidden"));
      document.getElementById("pane-" + btn.dataset.pay).classList.remove("hidden");
    });
    document.getElementById("payBtn").addEventListener("click", () => processPay());
    document.getElementById("lskBtn").addEventListener("click", () => processPay(true));
  }

  function voiceHint(text) {
    if (localStorage.getItem("esewa_voicemode") === "1") setTimeout(() => voiceSpeak(text), 400);
  }

  function processPay(lsk) {
    const btn = document.getElementById("payBtn");
    if (btn) { btn.disabled = true; btn.textContent = t("loading"); }
    setTimeout(finish, 600, lsk);
  }

  function finish(lsk) {
    payArea.classList.add("hidden");
    const card = document.getElementById("successCard");
    card.classList.remove("hidden");
    const paid = lsk
      ? (getLang() === "hi" ? "लोक सेवा केंद्र पर भुगतान चयनित" : "Pay at Lok Seva Kendra selected")
      : (isBpl ? t("bpl_waiver") : "₹" + fee + " " + (getLang() === "hi" ? "प्राप्त" : "received"));
    document.getElementById("paidLine").textContent = paid;

    // Record payment on the application.
    const app = JSON.parse(localStorage.getItem("esewa_application") || "{}");
    app.paid = true; app.payMode = lsk ? "LSK" : (isBpl ? "WAIVER" : "ONLINE");
    localStorage.setItem("esewa_application", JSON.stringify(app));

    voiceHint(t("pay_success"));
    setTimeout(() => window.location.href = "confirmation.html", 1400);
  }
})();
