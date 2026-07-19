/* auth.js — login tabs + simulated OTP / password / biometric.
   Any 6-digit OTP, any password, any biometric scan succeeds in demo mode. */

(function () {
  const tabs = document.getElementById("loginTabs");
  const panes = {
    otp: document.getElementById("pane-otp"),
    password: document.getElementById("pane-password"),
    biometric: document.getElementById("pane-biometric")
  };
  const samagraInput = document.getElementById("samagraInput");
  const err = document.getElementById("err");

  function showErr(key) {
    err.textContent = t(key);
    err.classList.remove("hidden");
  }
  function clearErr() { err.classList.add("hidden"); }

  function currentId() {
    return samagraInput.value.trim().toUpperCase();
  }

  function validId() {
    const id = currentId();
    if (!dbGetProfile(id)) { showErr("invalid_samagra"); return null; }
    clearErr();
    return id;
  }

  function loginSuccess(id) {
    dbSetActiveProfile(id);
    // Fresh journey: clear any prior application/stage state.
    localStorage.removeItem("esewa_application");
    localStorage.removeItem("esewa_stage");
    localStorage.removeItem("esewa_form");
    localStorage.removeItem("esewa_uploads");
    window.location.href = "index.html";
  }

  // Tab switching
  tabs.addEventListener("click", e => {
    const btn = e.target.closest("button[data-tab]");
    if (!btn) return;
    tabs.querySelectorAll("button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    Object.values(panes).forEach(p => p.classList.add("hidden"));
    panes[btn.dataset.tab].classList.remove("hidden");
    clearErr();
  });

  // ----- OTP flow -----
  const otpBox = document.getElementById("otpBox");
  const otpMsg = document.getElementById("otpMsg");
  document.getElementById("sendOtpBtn").addEventListener("click", () => {
    const id = validId();
    if (!id) return;
    const rec = dbGetProfile(id);
    const masked = "XXXXXX" + rec.samagra.mobile.slice(-3);
    otpMsg.textContent = t("otp_sent") + " (" + masked + ")";
    otpBox.classList.remove("hidden");
    document.getElementById("otpInput").focus();
  });
  document.getElementById("verifyOtpBtn").addEventListener("click", () => {
    const id = validId();
    if (!id) return;
    const otp = document.getElementById("otpInput").value.trim();
    if (!/^\d{6}$/.test(otp)) { showErr("enter_otp"); return; }
    loginSuccess(id);
  });

  // ----- Password flow -----
  document.getElementById("pwLoginBtn").addEventListener("click", () => {
    const id = validId();
    if (!id) return;
    if (!document.getElementById("pwInput").value) { showErr("password_ph"); return; }
    loginSuccess(id);
  });

  // ----- Biometric flow -----
  document.getElementById("bioBtn").addEventListener("click", () => {
    const id = validId();
    if (!id) return;
    const finger = document.getElementById("fingerScan");
    finger.textContent = "✅";
    setTimeout(() => loginSuccess(id), 700);
  });

  // Enter key submits the active OTP pane.
  samagraInput.addEventListener("keydown", e => {
    if (e.key === "Enter") document.getElementById("sendOtpBtn").click();
  });
})();
