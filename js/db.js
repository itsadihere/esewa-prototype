/* db.js — Demo database for eSewa prototype.
   Three unified profiles: each maps a Samagra ID to an Aadhaar record.
   Profile 3 intentionally has Samagra vs Aadhaar mismatches to demo the error state. */

const ESEWA_DB = {
  SMGR001: {
    samagraId: "SMGR001",
    aadhaarId: "ADHR001",
    // Samagra record
    samagra: {
      name: "Ramesh Kumar",
      dob: "15/03/1985",
      gender: "Male",
      category: "General",
      bpl: false,
      address: "45 Gandhi Nagar, Bhopal, MP",
      pin: "462001",
      area: "Urban",
      mobile: "9876543210",
      father: "Suresh Kumar"
    },
    // Aadhaar record (used for cross-verification)
    aadhaar: {
      name: "Ramesh Kumar",
      dob: "15/03/1985",
      gender: "Male"
    },
    fee: 50
  },

  SMGR002: {
    samagraId: "SMGR002",
    aadhaarId: "ADHR002",
    samagra: {
      name: "Savitri Bai",
      dob: "22/07/1978",
      gender: "Female",
      category: "SC",
      bpl: true,
      address: "Village Pipariya, Narsinghgarh, MP",
      pin: "464551",
      area: "Rural",
      mobile: "9654321087",
      father: "Ramnarayan"
    },
    aadhaar: {
      name: "Savitri Bai",
      dob: "22/07/1978",
      gender: "Female"
    },
    fee: 0 // BPL waiver
  },

  SMGR003: {
    samagraId: "SMGR003",
    aadhaarId: "ADHR003",
    samagra: {
      name: "Mohan Lal",
      dob: "10/04/1990",
      gender: "Male",
      category: "OBC",
      bpl: false,
      address: "12 Shivaji Nagar, Indore, MP",
      pin: "452001",
      area: "Urban",
      mobile: "9321456780",
      father: "Kishan Lal"
    },
    aadhaar: {
      name: "Mohan Singh", // mismatch
      dob: "10/04/1991",   // mismatch
      gender: "Male"
    },
    fee: 30
  }
};

// Eligibility criteria for Domicile Certificate (8 options).
const ELIGIBILITY_OPTIONS = [
  { en: "Continuous residence in MP for 15+ years", hi: "म.प्र. में 15+ वर्ष से निरंतर निवास" },
  { en: "Born in Madhya Pradesh", hi: "मध्य प्रदेश में जन्म" },
  { en: "Permanent Government employee of MP", hi: "म.प्र. का स्थायी शासकीय कर्मचारी" },
  { en: "Owns immovable property in MP", hi: "म.प्र. में अचल संपत्ति का स्वामी" },
  { en: "Spouse of an MP domicile holder", hi: "म.प्र. मूल निवासी का जीवनसाथी" },
  { en: "Dependent of MP Government employee", hi: "म.प्र. शासकीय कर्मचारी पर आश्रित" },
  { en: "Studying in an MP institution 3+ years", hi: "म.प्र. संस्थान में 3+ वर्ष से अध्ययनरत" },
  { en: "Other (specify)", hi: "अन्य (निर्दिष्ट करें)" }
];

// Purpose options for the certificate.
const PURPOSE_OPTIONS = [
  { en: "Education / Admission", hi: "शिक्षा / प्रवेश" },
  { en: "Government Job Application", hi: "शासकीय नौकरी आवेदन" },
  { en: "Scholarship", hi: "छात्रवृत्ति" },
  { en: "Caste Certificate linkage", hi: "जाति प्रमाण पत्र हेतु" },
  { en: "Other", hi: "अन्य" }
];

// Documents required for Domicile Certificate.
const REQUIRED_DOCS = [
  { id: "aadhaar", en: "Aadhaar Card", hi: "आधार कार्ड" },
  { id: "residence", en: "Residence Proof", hi: "निवास प्रमाण" },
  { id: "photo", en: "Passport Photograph", hi: "पासपोर्ट फोटो" }
];

// --- Helper functions used across pages ---

function dbGetProfile(samagraId) {
  return ESEWA_DB[samagraId] || null;
}

// Returns { match: bool, fields: [ {field, samagra, aadhaar} ] } for mismatched fields.
function dbVerifyAadhaar(record) {
  const mismatches = [];
  const s = record.samagra, a = record.aadhaar;
  if (s.name !== a.name) mismatches.push({ field: "Name", samagra: s.name, aadhaar: a.name });
  if (s.dob !== a.dob) mismatches.push({ field: "DOB", samagra: s.dob, aadhaar: a.dob });
  if (s.gender !== a.gender) mismatches.push({ field: "Gender", samagra: s.gender, aadhaar: a.gender });
  return { match: mismatches.length === 0, mismatches };
}

// Persist the active profile (called after successful OTP).
function dbSetActiveProfile(samagraId) {
  const rec = dbGetProfile(samagraId);
  if (!rec) return false;
  localStorage.setItem("esewa_profile", JSON.stringify(rec));
  return true;
}

function dbGetActiveProfile() {
  const raw = localStorage.getItem("esewa_profile");
  return raw ? JSON.parse(raw) : null;
}

// Guard: redirect to login if no active profile. Call on protected pages.
function dbRequireProfile() {
  const p = dbGetActiveProfile();
  if (!p) {
    window.location.href = "login.html";
    return null;
  }
  return p;
}
