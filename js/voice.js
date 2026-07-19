/* voice.js — thin wrapper over Web Speech API (TTS + STT).
   Degrades gracefully when the browser lacks support. Language follows getLang(). */

(function () {
  const synth = window.speechSynthesis || null;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  let currentRec = null;

  // Pick the best available voice for the current language.
  function pickVoice() {
    if (!synth) return null;
    const want = speechLang(); // hi-IN / en-IN
    const voices = synth.getVoices();
    return voices.find(v => v.lang === want) ||
           voices.find(v => v.lang && v.lang.startsWith(want.slice(0, 2))) ||
           voices[0] || null;
  }

  // Speak text; returns a Promise that resolves when done (or immediately if unsupported).
  window.voiceSpeak = function (text, opts = {}) {
    return new Promise(resolve => {
      if (!synth || !text) { resolve(); return; }
      try {
        synth.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = speechLang();
        const v = pickVoice();
        if (v) u.voice = v;
        u.rate = opts.rate || 0.95;
        u.pitch = opts.pitch || 1;
        u.onend = resolve;
        u.onerror = resolve;
        synth.speak(u);
      } catch (e) { resolve(); }
    });
  };

  window.voiceStop = function () {
    if (synth) synth.cancel();
    if (currentRec) { try { currentRec.abort(); } catch (e) {} currentRec = null; }
  };

  // Listen once. onResult(finalText, alternatives[]) ; onEnd() optional.
  window.voiceListen = function (onResult, onEnd) {
    if (!SR) {
      showToast(getLang() === "hi"
        ? "इस ब्राउज़र में आवाज़ पहचान उपलब्ध नहीं — कृपया टाइप करें"
        : "Voice recognition unavailable in this browser — please type");
      if (onEnd) onEnd();
      return null;
    }
    try { if (synth) synth.cancel(); } catch (e) {}
    const rec = new SR();
    currentRec = rec;
    rec.lang = speechLang();
    rec.interimResults = false;
    rec.maxAlternatives = 5;
    rec.continuous = false;

    rec.onresult = ev => {
      const res = ev.results[0];
      const alts = [];
      for (let i = 0; i < res.length && i < 5; i++) alts.push(res[i].transcript.trim());
      onResult(alts[0], alts);
    };
    rec.onerror = () => { if (onEnd) onEnd(); };
    rec.onend = () => { currentRec = null; if (onEnd) onEnd(); };
    try { rec.start(); } catch (e) {}
    return rec;
  };

  // Convenience: bind a mic button element to listen and reflect listening state.
  window.bindMic = function (micEl, onResult) {
    micEl.addEventListener("click", () => {
      if (micEl.classList.contains("listening")) { voiceStop(); micEl.classList.remove("listening"); return; }
      micEl.classList.add("listening");
      voiceListen(
        (text, alts) => { micEl.classList.remove("listening"); onResult(text, alts); },
        () => micEl.classList.remove("listening")
      );
    });
  };

  // Interpret a spoken yes/no in Hindi or English. Returns "yes" | "no" | null.
  window.interpretYesNo = function (text) {
    if (!text) return null;
    const s = text.toLowerCase();
    if (/\b(yes|yeah|yep|correct|right|sahi|haan|haa|ha|ji|thik|theek|ok)\b/.test(s) ||
        s.includes("हाँ") || s.includes("हा") || s.includes("सही") || s.includes("ठीक")) return "yes";
    if (/\b(no|nope|wrong|nahi|na|galat)\b/.test(s) ||
        s.includes("नहीं") || s.includes("ना") || s.includes("गलत")) return "no";
    return null;
  };

  // Some browsers load voices async.
  if (synth && typeof synth.onvoiceschanged !== "undefined") {
    synth.onvoiceschanged = () => { pickVoice(); };
  }
})();
