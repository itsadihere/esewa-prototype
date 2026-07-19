/* presenter.js — global helpers (showToast) + hidden presenter panel (Ctrl+Shift+P).
   Loaded on every page. Provides page jumping, profile switching, and demo reset. */

// ---- Global toast (used across all pages) ----
window.showToast = function (msg) {
  let el = document.getElementById("esewaToast");
  if (!el) {
    el = document.createElement("div");
    el.id = "esewaToast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 2600);
};

(function () {
  const PAGES = [
    ["login.html", "Login"],
    ["index.html", "Home"],
    ["service-info.html", "Service Info"],
    ["form.html", "Form"],
    ["upload.html", "Upload"],
    ["payment.html", "Payment"],
    ["confirmation.html", "Confirmation"],
    ["tracking.html", "Tracking"]
  ];
  const PROFILES = ["SMGR001", "SMGR002", "SMGR003"];
  const PROFILE_LABELS = {
    SMGR001: "Ramesh Kumar — General ₹50",
    SMGR002: "Savitri Bai — BPL/SC ₹0",
    SMGR003: "Mohan (Mismatch) — OBC ₹30"
  };

  const here = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  function resetJourney() {
    ["esewa_application", "esewa_stage", "esewa_form", "esewa_uploads",
     "esewa_voicemode", "esewa_digilocker"].forEach(k => localStorage.removeItem(k));
  }

  function buildPanel() {
    const active = dbGetActiveProfile && dbGetActiveProfile();
    const activeId = active ? active.samagraId : null;

    const overlay = document.createElement("div");
    overlay.className = "presenter-overlay";
    overlay.id = "presenterOverlay";
    overlay.innerHTML = `
      <div class="presenter-panel" role="dialog" aria-label="Presenter Controls">
        <h3><span>🎬 ${t("presenter_title")}</span>
          <button class="pbtn" id="presClose" style="width:auto;padding:6px 12px">✕ ${t("close")}</button></h3>

        <div class="grp">
          <span>${t("jump_to")}</span>
          <div class="pbtn-grid" id="jumpGrid">
            ${PAGES.map(p => `<button class="pbtn ${p[0] === here ? "active" : ""}" data-go="${p[0]}">${p[1]}</button>`).join("")}
          </div>
        </div>

        <div class="grp">
          <span>${t("switch_profile")}</span>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${PROFILES.map(id => `<button class="pbtn ${id === activeId ? "active" : ""}" data-profile="${id}" style="text-align:left">${PROFILE_LABELS[id]}</button>`).join("")}
          </div>
        </div>

        <div class="grp">
          <button class="pbtn danger" id="resetDemo" style="width:100%" data-reset>♻ ${t("reset_demo")}</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
    overlay.querySelector("#presClose").onclick = close;

    overlay.querySelectorAll("[data-go]").forEach(b => b.onclick = () => {
      location.href = b.dataset.go;
    });

    overlay.querySelectorAll("[data-profile]").forEach(b => b.onclick = () => {
      const id = b.dataset.profile;
      dbSetActiveProfile(id);
      resetJourney();
      showToast("Switched: " + PROFILE_LABELS[id]);
      // Reload sensibly: stay on informational pages, else go home.
      const stay = ["index.html", "service-info.html", "form.html", "login.html"];
      location.href = stay.includes(here) ? here : "index.html";
    });

    overlay.querySelector("[data-reset]").onclick = () => {
      resetJourney();
      localStorage.removeItem("esewa_profile");
      showToast(t("reset_demo"));
      setTimeout(() => location.href = "login.html", 600);
    };
  }

  function ensurePanel() {
    if (!document.getElementById("presenterOverlay")) buildPanel();
  }
  function open() { ensurePanel(); document.getElementById("presenterOverlay").classList.add("open"); }
  function close() {
    const o = document.getElementById("presenterOverlay");
    if (o) o.classList.remove("open");
  }
  function toggle() {
    const o = document.getElementById("presenterOverlay");
    if (o && o.classList.contains("open")) close(); else open();
  }

  // Rebuild panel on language change so labels update.
  document.addEventListener("langchange", () => {
    const o = document.getElementById("presenterOverlay");
    if (o) { const wasOpen = o.classList.contains("open"); o.remove(); if (wasOpen) open(); }
  });

  document.addEventListener("keydown", e => {
    if (e.ctrlKey && e.shiftKey && (e.key === "P" || e.key === "p")) {
      e.preventDefault();
      toggle();
    }
  });

  // Expose for optional on-screen trigger.
  window.openPresenter = open;
})();
