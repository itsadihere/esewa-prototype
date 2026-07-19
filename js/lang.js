/* lang.js — Bilingual (Hindi / English) string table + instant toggle.
   Usage:
     - Add data-i18n="key" to any element; its text is set on load & toggle.
     - Add data-i18n-ph="key" for input placeholders.
     - t("key") returns the string in the current language.
     - getLang() -> "hi" | "en"; setLang(l) persists + re-renders. */

const I18N = {
  // Generic / shared
  portal_name:        { en: "eSewa Madhya Pradesh", hi: "ई-सेवा मध्य प्रदेश" },
  portal_tag:         { en: "Public Service Delivery Portal", hi: "लोक सेवा प्रदाय पोर्टल" },
  govt_mp:            { en: "Government of Madhya Pradesh", hi: "मध्य प्रदेश शासन" },
  lang_label:         { en: "हिंदी", hi: "English" }, // shows the OTHER language to switch to
  voice_form_btn:     { en: "🎙️ Fill form by talking", hi: "🎙️ बातों बातों में फॉर्म भरिये" },
  new_feature:        { en: "New", hi: "नया" },
  simplified:         { en: "Simplified", hi: "सरल" },
  ai_checked:         { en: "AI Checked", hi: "AI जाँचित" },
  autofetched:        { en: "Auto-fetched from Samagra", hi: "समग्र से स्वतः प्राप्त" },
  yes:                { en: "Yes", hi: "हाँ" },
  no:                 { en: "No", hi: "नहीं" },
  next:               { en: "Next", hi: "आगे" },
  back:               { en: "Back", hi: "पीछे" },
  continue:           { en: "Continue", hi: "आगे बढ़ें" },
  submit:             { en: "Submit", hi: "जमा करें" },
  confirm:            { en: "Confirm", hi: "पुष्टि करें" },
  edit:               { en: "Edit", hi: "बदलें" },
  loading:            { en: "Loading…", hi: "लोड हो रहा है…" },

  // Login
  login_title:        { en: "Citizen Login", hi: "नागरिक लॉगिन" },
  login_otp:          { en: "OTP", hi: "ओटीपी" },
  login_password:     { en: "Password", hi: "पासवर्ड" },
  login_biometric:    { en: "Biometric", hi: "बायोमेट्रिक" },
  samagra_id:         { en: "Samagra ID", hi: "समग्र आईडी" },
  samagra_ph:         { en: "Enter Samagra ID (e.g. SMGR002)", hi: "समग्र आईडी दर्ज करें (जैसे SMGR002)" },
  send_otp:           { en: "Send OTP", hi: "ओटीपी भेजें" },
  enter_otp:          { en: "Enter 6-digit OTP", hi: "6 अंकों का ओटीपी दर्ज करें" },
  otp_sent:           { en: "OTP sent to registered mobile", hi: "पंजीकृत मोबाइल पर ओटीपी भेजा गया" },
  verify_login:       { en: "Verify & Login", hi: "सत्यापित कर लॉगिन करें" },
  password_ph:        { en: "Enter password", hi: "पासवर्ड दर्ज करें" },
  biometric_sim:      { en: "Place finger on scanner", hi: "स्कैनर पर उँगली रखें" },
  scan_now:           { en: "Simulate Scan", hi: "स्कैन सिम्युलेट करें" },
  invalid_samagra:    { en: "Samagra ID not found. Try SMGR001, SMGR002 or SMGR003.", hi: "समग्र आईडी नहीं मिली। SMGR001, SMGR002 या SMGR003 आज़माएँ।" },

  // Home
  welcome:            { en: "Welcome", hi: "स्वागत है" },
  search_ph:          { en: "Search for a service…", hi: "सेवा खोजें…" },
  popular_services:   { en: "Popular Services", hi: "लोकप्रिय सेवाएँ" },
  svc_domicile:       { en: "Domicile Certificate", hi: "मूल निवास प्रमाण पत्र" },
  svc_income:         { en: "Income Certificate", hi: "आय प्रमाण पत्र" },
  svc_caste:          { en: "Caste Certificate", hi: "जाति प्रमाण पत्र" },
  svc_birth:          { en: "Birth Certificate", hi: "जन्म प्रमाण पत्र" },
  svc_land:           { en: "Land Records (Khasra)", hi: "भू-अभिलेख (खसरा)" },
  svc_ration:         { en: "Ration Card", hi: "राशन कार्ड" },
  coming_soon:        { en: "Coming soon", hi: "जल्द आ रहा है" },
  logout:             { en: "Logout", hi: "लॉगआउट" },

  // Service info
  svc_info_title:     { en: "Domicile Certificate", hi: "मूल निवास प्रमाण पत्र" },
  sla_label:          { en: "Service Guarantee (SLA)", hi: "सेवा गारंटी (SLA)" },
  sla_value:          { en: "7 working days", hi: "7 कार्य दिवस" },
  lok_seva_ref:       { en: "Under MP Lok Seva Guarantee Act, 2010", hi: "म.प्र. लोक सेवाओं के प्रदान की गारंटी अधिनियम, 2010 के अंतर्गत" },
  timeline_label:     { en: "Processing Timeline", hi: "प्रक्रिया समयरेखा" },
  fee_slabs:          { en: "Fee by Category", hi: "श्रेणी अनुसार शुल्क" },
  docs_required:      { en: "Documents Required", hi: "आवश्यक दस्तावेज़" },
  read_page:          { en: "🔊 Read this page aloud", hi: "🔊 यह पृष्ठ पढ़कर सुनाएँ" },
  read_docs:          { en: "🔊 Read documents list", hi: "🔊 दस्तावेज़ सूची सुनाएँ" },
  digilocker_connect: { en: "🔗 Connect DigiLocker", hi: "🔗 डिजिलॉकर जोड़ें" },
  digilocker_done:    { en: "✓ DigiLocker Connected", hi: "✓ डिजिलॉकर जुड़ा" },
  consent_q:          { en: "Do you want to proceed? Say Yes or No.", hi: "क्या आप आगे बढ़ना चाहते हैं? हाँ या नहीं बोलिए।" },
  listen_consent:     { en: "🎤 Give voice consent", hi: "🎤 आवाज़ से सहमति दें" },

  // Fee slab rows
  fee_general:        { en: "General", hi: "सामान्य" },
  fee_obc:            { en: "OBC", hi: "अन्य पिछड़ा वर्ग" },
  fee_scst:           { en: "SC / ST", hi: "अनुसूचित जाति / जनजाति" },
  fee_bpl:            { en: "BPL (Waiver)", hi: "बीपीएल (छूट)" },

  // Form
  form_title:         { en: "Domicile Application", hi: "मूल निवास आवेदन" },
  review_all:         { en: "Review All Answers", hi: "सभी उत्तर देखें" },
  is_correct:         { en: "Is this correct?", hi: "क्या यह सही है?" },
  q_of:               { en: "of", hi: "में से" },
  mic_hint:           { en: "Tap mic to answer by voice", hi: "आवाज़ से उत्तर देने हेतु माइक दबाएँ" },
  suggestions:        { en: "Suggestions", hi: "सुझाव" },
  required_field:     { en: "This field is required", hi: "यह फ़ील्ड आवश्यक है" },

  // Form questions (label = short, q = spoken question)
  q_samagra:          { en: "Samagra ID", hi: "समग्र आईडी" },
  q_name:             { en: "Full Name", hi: "पूरा नाम" },
  q_dob:              { en: "Date of Birth", hi: "जन्म तिथि" },
  q_gender:           { en: "Gender", hi: "लिंग" },
  q_category:         { en: "Category", hi: "श्रेणी" },
  q_father:           { en: "Father / Husband Name", hi: "पिता / पति का नाम" },
  q_mobile:           { en: "Mobile Number", hi: "मोबाइल नंबर" },
  q_email:            { en: "Email Address", hi: "ईमेल पता" },
  q_pin:              { en: "PIN Code", hi: "पिन कोड" },
  q_area:             { en: "Area Type", hi: "क्षेत्र प्रकार" },
  q_curr_addr:        { en: "Current Address", hi: "वर्तमान पता" },
  q_perm_addr:        { en: "Permanent Address", hi: "स्थायी पता" },
  q_district:         { en: "District", hi: "जिला" },
  q_tehsil:           { en: "Tehsil", hi: "तहसील" },
  q_village_ward:     { en: "Village / Ward", hi: "गाँव / वार्ड" },
  q_eligibility:      { en: "Eligibility Criterion", hi: "पात्रता का आधार" },
  q_duration:         { en: "Duration of stay in MP (years)", hi: "म.प्र. में निवास अवधि (वर्ष)" },
  q_purpose:          { en: "Purpose of Certificate", hi: "प्रमाण पत्र का प्रयोजन" },
  q_caste:            { en: "Caste / Sub-caste", hi: "जाति / उपजाति" },
  q_digilocker:       { en: "Deliver certificate to DigiLocker?", hi: "प्रमाण पत्र डिजिलॉकर में भेजें?" },
  same_as_current:    { en: "Same as current address", hi: "वर्तमान पते के समान" },

  // Real declaration-form fields (स्व प्रमाणित घोषणा-पत्र)
  q_registration:     { en: "Registration Number", hi: "रजिस्ट्रेशन नम्बर" },
  q_relation:         { en: "Applicant is (relation)", hi: "आवेदक है (संबंध)" },
  rel_father:         { en: "S/o or D/o — of Father (आत्मज/आत्मजा)", hi: "आत्मज / आत्मजा (पिता का)" },
  rel_spouse:         { en: "W/o or H/o — of Spouse (पति/पत्नी)", hi: "पति / पत्नी (जीवनसाथी का)" },
  q_age:              { en: "Age (approx. years)", hi: "आयु (लगभग वर्ष)" },
  q_spouse_name:      { en: "Spouse Name (if married)", hi: "पति/पत्नी का नाम (यदि विवाहित)" },
  q_spouse_age:       { en: "Spouse Age (approx. years)", hi: "पति/पत्नी की आयु (लगभग वर्ष)" },
  q_minor_children:   { en: "Minor Sons / Daughters", hi: "अवयस्क पुत्र / पुत्री" },
  add_child:          { en: "+ Add child", hi: "+ बच्चा जोड़ें" },
  child_name:         { en: "Name", hi: "नाम" },
  child_age:          { en: "Age", hi: "आयु" },
  no_children:        { en: "None / Not applicable", hi: "कोई नहीं / लागू नहीं" },
  q_declaration:      { en: "Self-Certified Declaration", hi: "स्व-प्रमाणित घोषणा" },
  declaration_accept: { en: "I solemnly declare the above information is true to my knowledge; I understand false information invites criminal action and withdrawal of benefits.",
                        hi: "मैं शपथपूर्वक घोषणा करता/करती हूँ कि उपरोक्त जानकारी मेरे ज्ञान अनुसार सत्य है; असत्य जानकारी पर आपराधिक कार्यवाही व लाभ वापसी होगी।" },
  declaration_confirm:{ en: "I accept the declaration", hi: "मैं घोषणा स्वीकार करता/करती हूँ" },
  declaration_preview:{ en: "Declaration Preview (स्व प्रमाणित घोषणा-पत्र)", hi: "घोषणा-पत्र पूर्वावलोकन" },
  must_accept:        { en: "You must accept the declaration to submit", hi: "जमा करने हेतु घोषणा स्वीकार करना आवश्यक है" },

  // Upload
  upload_title:       { en: "Upload Documents", hi: "दस्तावेज़ अपलोड करें" },
  upload_hint:        { en: "Accepted: PDF, JPG, PNG. Auto-compressed & AI-checked.", hi: "स्वीकार्य: PDF, JPG, PNG। स्वतः संपीड़ित व AI-जाँचित।" },
  choose_file:        { en: "Choose file", hi: "फ़ाइल चुनें" },
  clarity:            { en: "Clarity", hi: "स्पष्टता" },
  doc_type:           { en: "Detected type", hi: "पहचाना गया प्रकार" },
  status_good:        { en: "Good", hi: "अच्छा" },
  status_warn:        { en: "Warning", hi: "चेतावनी" },
  status_error:       { en: "Error", hi: "त्रुटि" },
  compressed_to:      { en: "Compressed to", hi: "संपीड़ित" },
  all_docs_ok:        { en: "All documents look good. Continue.", hi: "सभी दस्तावेज़ ठीक हैं। आगे बढ़ें।" },
  proceed_payment:    { en: "Proceed to Payment", hi: "भुगतान हेतु आगे बढ़ें" },

  // Payment
  payment_title:      { en: "Payment", hi: "भुगतान" },
  amount_payable:     { en: "Amount Payable", hi: "देय राशि" },
  bpl_waiver:         { en: "You are in the BPL category — your fee is waived.", hi: "आप बीपीएल श्रेणी में हैं — आपका शुल्क माफ़ है।" },
  pay_upi:            { en: "UPI", hi: "यूपीआई" },
  pay_netbank:        { en: "Net Banking", hi: "नेट बैंकिंग" },
  pay_card:           { en: "Debit Card", hi: "डेबिट कार्ड" },
  pay_lsk:            { en: "Pay at Lok Seva Kendra", hi: "लोक सेवा केंद्र पर भुगतान" },
  pay_now:            { en: "Pay Now", hi: "अभी भुगतान करें" },
  pay_success:        { en: "Payment Successful", hi: "भुगतान सफल" },
  no_fee_continue:    { en: "No fee — Continue", hi: "कोई शुल्क नहीं — आगे बढ़ें" },
  demo_mode:          { en: "Demo mode — any input is accepted", hi: "डेमो मोड — कोई भी इनपुट स्वीकार्य" },

  // Confirmation
  confirm_title:      { en: "Application Submitted", hi: "आवेदन जमा हुआ" },
  app_number:         { en: "Application Number", hi: "आवेदन क्रमांक" },
  expected_delivery:  { en: "Expected Delivery", hi: "अपेक्षित वितरण" },
  download_receipt:   { en: "⬇ Download Receipt", hi: "⬇ रसीद डाउनलोड करें" },
  sms_sent:           { en: "SMS sent to", hi: "एसएमएस भेजा गया" },
  digilocker_deliver: { en: "Deliver to DigiLocker", hi: "डिजिलॉकर में भेजें" },
  sms_track_title:    { en: "Track by SMS", hi: "एसएमएस से ट्रैक करें" },
  sms_track_intro:    { en: "To know your status, send SMS:", hi: "अपना status जानने के लिए SMS करें:" },
  send_to:            { en: "Send to", hi: "इस नंबर पर भेजें" },
  track_status:       { en: "Track Status", hi: "स्थिति देखें" },
  read_confirm:       { en: "🔊 Read confirmation aloud", hi: "🔊 पुष्टि पढ़कर सुनाएँ" },

  // Tracking
  track_title:        { en: "Application Status", hi: "आवेदन की स्थिति" },
  stage_submitted:    { en: "Submitted", hi: "जमा हुआ" },
  stage_patwari:      { en: "Forwarded to Patwari", hi: "पटवारी को अग्रेषित" },
  stage_verify:       { en: "Verification", hi: "सत्यापन" },
  stage_sdm:          { en: "SDM Review", hi: "एसडीएम समीक्षा" },
  stage_approved:     { en: "Approved", hi: "स्वीकृत" },
  demo_controls:      { en: "Demo Controls — Not visible to citizen", hi: "डेमो कंट्रोल — नागरिक को नहीं दिखता" },
  advance_stage:      { en: "Advance to next stage", hi: "अगले चरण पर जाएँ" },
  reset_stage:        { en: "Reset to Submitted", hi: "जमा पर रीसेट करें" },
  sms_at_stage:       { en: "SMS received by citizen", hi: "नागरिक को प्राप्त एसएमएस" },
  officer:            { en: "Officer", hi: "अधिकारी" },

  // Presenter
  presenter_title:    { en: "Presenter Controls", hi: "प्रस्तुतकर्ता नियंत्रण" },
  jump_to:            { en: "Jump to page", hi: "पृष्ठ पर जाएँ" },
  switch_profile:     { en: "Switch profile", hi: "प्रोफ़ाइल बदलें" },
  reset_demo:         { en: "Reset all demo data", hi: "सभी डेमो डेटा रीसेट करें" },
  close:              { en: "Close", hi: "बंद करें" },

  // Mismatch banner
  mismatch_title:     { en: "⚠ Aadhaar–Samagra Mismatch Detected", hi: "⚠ आधार–समग्र बेमेल पाया गया" },
  mismatch_desc:      { en: "The following fields do not match Aadhaar records. Application may require manual verification.", hi: "निम्न फ़ील्ड आधार रिकॉर्ड से मेल नहीं खाते। आवेदन हेतु मैन्युअल सत्यापन आवश्यक हो सकता है।" }
};

function getLang() {
  return localStorage.getItem("esewa_lang") || "hi";
}

function setLang(l) {
  localStorage.setItem("esewa_lang", l);
  applyI18n();
  // Let pages react (e.g. re-render dynamic content, restart voice prompts).
  document.dispatchEvent(new CustomEvent("langchange", { detail: { lang: l } }));
}

function toggleLang() {
  setLang(getLang() === "hi" ? "en" : "hi");
}

function t(key) {
  const entry = I18N[key];
  if (!entry) return key;
  return entry[getLang()] || entry.en || key;
}

// BCP-47 tag for Web Speech API.
function speechLang() {
  return getLang() === "hi" ? "hi-IN" : "en-IN";
}

function applyI18n(root = document) {
  root.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  root.querySelectorAll("[data-i18n-ph]").forEach(el => {
    el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
  });
  // Keep every language toggle's label in sync however setLang was triggered.
  document.querySelectorAll(".lang-toggle").forEach(b => b.textContent = t("lang_label"));
  document.documentElement.lang = getLang();
  // Stop Chrome/Google Translate from auto-translating this bilingual app,
  // which would otherwise overwrite our Hindi text with English.
  document.documentElement.setAttribute("translate", "no");
  document.documentElement.classList.add("notranslate");
}

// Wire up any element with class .lang-toggle to flip language.
function initLangToggle() {
  document.querySelectorAll(".lang-toggle").forEach(btn => {
    btn.textContent = t("lang_label");
    btn.addEventListener("click", () => {
      toggleLang();
      document.querySelectorAll(".lang-toggle").forEach(b => b.textContent = t("lang_label"));
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  applyI18n();
  initLangToggle();
});
