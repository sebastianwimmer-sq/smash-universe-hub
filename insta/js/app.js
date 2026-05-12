/**
 * 🏔️ Smash IG Manager - Core App Logic
 * Shared functions: Auth, Storage, Helpers
 */

// App-Version — bump bei jedem Feature-Push (MINOR) oder Polish (PATCH)
// Wird automatisch in alle Elemente mit id="appVersion" oder [data-app-version] gesetzt
window.APP_VERSION = 'v1.5.0';

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#appVersion, [data-app-version]').forEach(el => {
      el.textContent = window.APP_VERSION;
    });
  });
}

const SmashApp = (function() {
  
  // SHA-256 Password-Hash. Bei PW-Wechsel im Browser-Console neu generieren:
  // crypto.subtle.digest('SHA-256', new TextEncoder().encode(NEUES_PW)).then(h =>
  //   console.log(Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2,'0')).join('')))
  const PASSWORD_HASH = "3c1ebcc7778d422c056ee4447d05915087782d1e080c36d399e53227bbc17e0c";

  // Admin-Layer: 2. Passwort fuer /admin Backstage (separater Hash).
  const ADMIN_PASSWORD_HASH = "21c74da7767acab0b475ab89514860ff7ab7e354733a28f985b4db4aaab738c7";
  const ADMIN_SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 Tage

  const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24h
  const STORAGE_PREFIX = 'smash:';

  // ============ MULTI-ACCOUNT ============
  // Sebi pflegt 2 Insta-Accounts: vegetarianhulk (Hauptaccount) + peakingworld (PEAKING-Tool-Brand)
  // Daten werden pro Account separat in localStorage gehalten via Prefix smash:<account>:<key>

  const ACCOUNTS = {
    vegetarianhulk: {
      key: 'vegetarianhulk',
      handle: '@vegetarianhulk',
      emoji: '🏔️',
      label: 'Outdoor + Plant-Based',
      color: '#10b981'
    },
    peakingworld: {
      key: 'peakingworld',
      handle: '@peakingworld',
      emoji: '🚀',
      label: 'AI + Creator Tools (BIP)',
      color: '#FFA94D'
    }
  };

  // Keys die NICHT account-spezifisch sind (global)
  const GLOBAL_KEYS = ['auth', 'currentAccount'];

  function getCurrentAccount() {
    const stored = localStorage.getItem(STORAGE_PREFIX + 'currentAccount');
    if (ACCOUNTS[stored]) return stored;
    // Fallback: smash:profile.defaultAccount (Settings → Profile)
    try {
      const profile = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'profile') || '{}');
      if (profile.defaultAccount && ACCOUNTS[profile.defaultAccount]) return profile.defaultAccount;
    } catch (e) {}
    return 'vegetarianhulk';
  }

  function getProfile() {
    try { return JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'profile') || '{}'); } catch(e) { return {}; }
  }

  function getPref(key, fallback) {
    try {
      const v = localStorage.getItem(STORAGE_PREFIX + 'pref:' + key);
      return v === null ? fallback : JSON.parse(v);
    } catch (e) { return fallback; }
  }

  function switchAccount(accountKey) {
    if (!ACCOUNTS[accountKey]) return false;
    localStorage.setItem(STORAGE_PREFIX + 'currentAccount', accountKey);
    return true;
  }

  function getAccount(accountKey) {
    return ACCOUNTS[accountKey || getCurrentAccount()];
  }

  function _storageKey(rawKey) {
    if (GLOBAL_KEYS.includes(rawKey)) return STORAGE_PREFIX + rawKey;
    return STORAGE_PREFIX + getCurrentAccount() + ':' + rawKey;
  }

  // Migration: existing pre-Multi-Account data (smash:reels etc.) → smash:vegetarianhulk:reels
  function _migrateLegacyData() {
    const migrationDoneFlag = STORAGE_PREFIX + 'migrationV2Done';
    if (localStorage.getItem(migrationDoneFlag)) return;

    const legacyKeys = ['reels', 'ideas', 'calendar', 'captionsCustom', 'settings'];
    const targetAccount = 'vegetarianhulk'; // Default-Account fuer Legacy-Daten

    legacyKeys.forEach(key => {
      const oldKey = STORAGE_PREFIX + key;
      const newKey = STORAGE_PREFIX + targetAccount + ':' + key;
      const oldData = localStorage.getItem(oldKey);
      // Migrate only if old exists and new doesn't yet
      if (oldData !== null && localStorage.getItem(newKey) === null) {
        localStorage.setItem(newKey, oldData);
        // Keep old data for 1 release as safety-fallback (no removal)
      }
    });

    localStorage.setItem(migrationDoneFlag, '1');
  }
  // Run migration immediately
  try { _migrateLegacyData(); } catch (e) { console.error('Migration error:', e); }

  // ============ AUTH ============

  // SHA-256 with fallback for HTTP-only contexts (iOS Safari blocks crypto.subtle on non-HTTPS)
  async function sha256(text) {
    // Try Web Crypto API first (HTTPS only on iOS Safari)
    try {
      if (window.crypto && window.crypto.subtle && window.isSecureContext) {
        const buf = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
        return Array.from(new Uint8Array(buf))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      }
    } catch (e) {
      console.warn('crypto.subtle failed, using pure-JS fallback');
    }
    // Pure-JS fallback (works on HTTP — Sha256 by Brillout, MIT, inline)
    return sha256Pure(text);
  }

  // Pure-JS SHA-256 — works in any context (no crypto.subtle, no HTTPS needed)
  // Adapted from: https://geraintluff.github.io/sha256/ (Public Domain)
  function sha256Pure(ascii) {
    function rightRotate(value, amount) { return (value >>> amount) | (value << (32 - amount)); }
    var mathPow = Math.pow;
    var maxWord = mathPow(2, 32);
    var lengthProperty = 'length';
    var i, j;
    var result = '';
    var words = [];
    var asciiBitLength = ascii[lengthProperty] * 8;
    var hash = sha256Pure.h = sha256Pure.h || [];
    var k = sha256Pure.k = sha256Pure.k || [];
    var primeCounter = k[lengthProperty];
    var isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (i = 0; i < 313; i += candidate) { isComposite[i] = candidate; }
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }
    ascii += '\x80';
    while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
    for (i = 0; i < ascii[lengthProperty]; i++) {
      j = ascii.charCodeAt(i);
      if (j >> 8) return; // ASCII check: only accept characters in range 0-255
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
    words[words[lengthProperty]] = (asciiBitLength);
    for (j = 0; j < words[lengthProperty];) {
      var w = words.slice(j, j += 16);
      var oldHash = hash;
      hash = hash.slice(0, 8);
      for (i = 0; i < 64; i++) {
        var w15 = w[i - 15], w2 = w[i - 2];
        var a = hash[0], e = hash[4];
        var temp1 = hash[7]
          + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
          + ((e & hash[5]) ^ ((~e) & hash[6]))
          + k[i]
          + (w[i] = (i < 16) ? w[i] : (
              w[i - 16]
              + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
              + w[i - 7]
              + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
            ) | 0
          );
        var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
          + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
      }
      for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
    }
    for (i = 0; i < 8; i++) {
      for (j = 3; j + 1; j--) {
        var b = (hash[i] >> (j * 8)) & 255;
        result += ((b < 16) ? 0 : '') + b.toString(16);
      }
    }
    return result;
  }

  async function login(password) {
    const hash = await sha256(password);
    if (hash === PASSWORD_HASH) {
      localStorage.setItem(STORAGE_PREFIX + 'auth', JSON.stringify({
        loggedIn: true,
        expires: Date.now() + SESSION_DURATION_MS
      }));
      return true;
    }
    return false;
  }

  function logout() {
    localStorage.removeItem(STORAGE_PREFIX + 'auth');
    window.location.href = 'index.html';
  }

  function isAuthenticated() {
    try {
      const auth = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'auth') || '{}');
      return auth.loggedIn && auth.expires > Date.now();
    } catch (e) {
      return false;
    }
  }

  function requireAuth() {
    if (!isAuthenticated()) {
      window.location.href = 'index.html';
    }
  }

  // ============ ADMIN-AUTH (2nd Layer) ============

  async function adminLogin(password) {
    const hash = await sha256(password);
    if (hash === ADMIN_PASSWORD_HASH) {
      localStorage.setItem(STORAGE_PREFIX + 'adminAuth', JSON.stringify({
        loggedIn: true,
        expires: Date.now() + ADMIN_SESSION_DURATION_MS
      }));
      return true;
    }
    return false;
  }

  function adminLogout() {
    localStorage.removeItem(STORAGE_PREFIX + 'adminAuth');
  }

  function isAdminAuthenticated() {
    try {
      const auth = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'adminAuth') || '{}');
      return auth.loggedIn && auth.expires > Date.now();
    } catch (e) {
      return false;
    }
  }

  function hasEverBeenAdmin() {
    return localStorage.getItem(STORAGE_PREFIX + 'adminAuth') !== null;
  }

  // ============ STORAGE (Account-aware) ============

  function getData(key, fallback = null) {
    try {
      const data = localStorage.getItem(_storageKey(key));
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.error('Storage read error:', e);
      return fallback;
    }
  }

  function setData(key, value) {
    try {
      localStorage.setItem(_storageKey(key), JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage write error:', e);
      return false;
    }
  }

  function removeData(key) {
    localStorage.removeItem(_storageKey(key));
  }

  // Read data from a SPECIFIC account (for cross-account dashboards)
  function getDataForAccount(accountKey, key, fallback = null) {
    if (!ACCOUNTS[accountKey]) return fallback;
    if (GLOBAL_KEYS.includes(key)) return getData(key, fallback);
    try {
      const data = localStorage.getItem(STORAGE_PREFIX + accountKey + ':' + key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  // Write data to a SPECIFIC account (for cross-posting from one account into another's data)
  function setDataForAccount(accountKey, key, value) {
    if (!ACCOUNTS[accountKey]) return false;
    if (GLOBAL_KEYS.includes(key)) return setData(key, value);
    try {
      localStorage.setItem(STORAGE_PREFIX + accountKey + ':' + key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  // ============ PILLARS (Account-Aware) ============
  // PILLAR_INFO ist ein dynamischer Getter (returns pillars for currently active account)
  // SmashApp.PILLAR_INFO[r.pillar] returns immer die richtige Account-spezifische Definition

  const PILLARS_BY_ACCOUNT = {
    vegetarianhulk: {
      outdoor:    { emoji: '🏔️', name: 'Outdoor',     color: '#10b981', target: 40 },
      gym:        { emoji: '💪', name: 'Gym/Fitness', color: '#f59e0b', target: 25 },
      mindset:    { emoji: '🧠', name: 'Mindset',     color: '#8b5cf6', target: 20 },
      plantbased: { emoji: '🌿', name: 'Plant-Based', color: '#84cc16', target: 15 }
    },
    peakingworld: {
      tools:     { emoji: '🛠️', name: 'Tools',             color: '#FFA94D', target: 35 },
      bip:       { emoji: '📊', name: 'Building-in-Public', color: '#FF6B6B', target: 30 },
      marketing: { emoji: '🧠', name: 'Marketing',          color: '#FFD43B', target: 25 },
      bts:       { emoji: '🚀', name: 'Behind-the-Scenes',  color: '#a78bfa', target: 10 }
    }
  };

  function getPillarInfo() {
    const acc = getCurrentAccount();
    const custom = getData('customPillars', null);
    if (custom && typeof custom === 'object' && Object.keys(custom).length) return custom;
    return PILLARS_BY_ACCOUNT[acc] || PILLARS_BY_ACCOUNT.vegetarianhulk;
  }

  function getPillarInfoForAccount(accountKey) {
    const custom = getDataForAccount(accountKey, 'customPillars', null);
    if (custom && typeof custom === 'object' && Object.keys(custom).length) return custom;
    return PILLARS_BY_ACCOUNT[accountKey] || PILLARS_BY_ACCOUNT.vegetarianhulk;
  }

  function setCustomPillars(pillarsObj) {
    return setData('customPillars', pillarsObj);
  }

  function resetPillarsToDefault() {
    removeData('customPillars');
  }

  // ============ POSTING PLANS (Account-Aware) ============
  const POSTING_PLANS_BY_ACCOUNT = {
    vegetarianhulk: {
      // 2026-Algo-Update: Cluster Mo/Mi/Fr/Sa (Sa statt So — Algo-Studie 2026)
      Mo: { emoji: '💪', name: 'Gym-Reel',              pillar: 'gym' },
      Mi: { emoji: '🏔️', name: 'Outdoor-Reel',          pillar: 'outdoor' },
      Fr: { emoji: '🧠', name: 'Mindset-Reel',          pillar: 'mindset' },
      Sa: { emoji: '🌿', name: 'Plant-Based / Outdoor', pillar: 'plantbased' }
    },
    peakingworld: {
      Di: { emoji: '🛠️', name: 'Tools-Reel',     pillar: 'tools' },
      Do: { emoji: '📊', name: 'BIP-Reel',       pillar: 'bip' },
      Sa: { emoji: '🧠', name: 'Marketing-Reel', pillar: 'marketing' }
    }
  };

  function getPostingPlan() {
    const custom = getData('customPostingPlan', null);
    if (custom && typeof custom === 'object' && Object.keys(custom).length) return custom;
    return POSTING_PLANS_BY_ACCOUNT[getCurrentAccount()] || POSTING_PLANS_BY_ACCOUNT.vegetarianhulk;
  }

  function setCustomPostingPlan(planObj) {
    return setData('customPostingPlan', planObj);
  }

  function resetPostingPlanToDefault() {
    removeData('customPostingPlan');
  }

  // ============ HELPERS ============

  function formatNumber(n) {
    if (n === null || n === undefined) return '0';
    return Number(n).toLocaleString('de-DE');
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function getDayOfWeek(dateStr) {
    const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    return days[new Date(dateStr).getDay()];
  }

  function exportJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJSON(callback) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          callback(JSON.parse(evt.target.result));
        } catch (err) {
          alert('Datei konnte nicht gelesen werden: ' + err.message);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  // ============ ANALYTICS ============
  
  function getPillarStats(reels) {
    const stats = {};
    const PILLAR_INFO = getPillarInfo();
    Object.keys(PILLAR_INFO).forEach(p => {
      stats[p] = { count: 0, views: 0, avgViews: 0, percentage: 0 };
    });

    reels.forEach(r => {
      if (stats[r.pillar]) {
        stats[r.pillar].count++;
        stats[r.pillar].views += (r.views || 0);
      }
    });

    const total = reels.length;
    Object.keys(stats).forEach(p => {
      stats[p].avgViews = stats[p].count > 0 ? Math.round(stats[p].views / stats[p].count) : 0;
      stats[p].percentage = total > 0 ? Math.round((stats[p].count / total) * 100) : 0;
    });

    return stats;
  }

  function getStreak(reels) {
    if (reels.length === 0) return 0;
    
    const sorted = [...reels].sort((a, b) => new Date(b.date) - new Date(a.date));
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const reel of sorted) {
      const reelDate = new Date(reel.date);
      reelDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((currentDate - reelDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= streak + 2) {
        streak++;
        currentDate = reelDate;
      } else {
        break;
      }
    }
    
    return streak;
  }

  function getThisWeekPostCount(reels) {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
    weekStart.setHours(0, 0, 0, 0);
    
    return reels.filter(r => new Date(r.date) >= weekStart).length;
  }

  // ============ PUBLIC API ============
  
  return {
    // Auth
    login,
    logout,
    isAuthenticated,
    requireAuth,
    adminLogin,
    adminLogout,
    isAdminAuthenticated,
    hasEverBeenAdmin,

    // Storage
    getData,
    setData,
    removeData,
    getDataForAccount,
    setDataForAccount,

    // Multi-Account
    ACCOUNTS,
    getCurrentAccount,
    switchAccount,
    getAccount,

    // Profile + Prefs (Basics)
    getProfile,
    getPref,

    // Helpers (PILLAR_INFO is a dynamic getter — returns pillars for current account)
    get PILLAR_INFO() { return getPillarInfo(); },
    PILLARS_BY_ACCOUNT,
    getPillarInfo,
    getPillarInfoForAccount,
    setCustomPillars,
    resetPillarsToDefault,
    POSTING_PLANS_BY_ACCOUNT,
    getPostingPlan,
    setCustomPostingPlan,
    resetPostingPlanToDefault,
    formatNumber,
    formatDate,
    getDayOfWeek,
    exportJSON,
    importJSON,

    // Analytics
    getPillarStats,
    getStreak,
    getThisWeekPostCount
  };
})();


// ============ v24 UPDATE-BANNER ============
// Zeigt sunrise-Banner wenn Service-Worker neue Version detected.
// User tappt Reload -> window.location.reload() -> fetch neueste Files.
(function setupPeakingUpdateBanner() {
  if (!('serviceWorker' in navigator)) return;
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  let bannerShown = false;
  let lastShownVersion = null;
  try { lastShownVersion = localStorage.getItem('peaking_lastSeenSWVersion'); } catch(e) {}

  function showBanner(version) {
    if (bannerShown) return;
    if (version && version === lastShownVersion) return; // already dismissed this version
    bannerShown = true;

    if (!document.getElementById('peakingUpdateBannerStyles')) {
      const s = document.createElement('style');
      s.id = 'peakingUpdateBannerStyles';
      s.textContent = '@keyframes peakingBnrSlide{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes peakingBnrPulse{0%,100%{box-shadow:0 4px 16px rgba(255,169,77,.5)}50%{box-shadow:0 4px 24px rgba(255,169,77,.75)}}';
      document.head.appendChild(s);
    }

    const banner = document.createElement('div');
    banner.id = 'peakingUpdateBanner';
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;padding:12px 16px;background:linear-gradient(135deg,#FF6B6B,#FFA94D,#FFD43B);color:#0f172a;display:flex;align-items:center;justify-content:space-between;gap:12px;font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;font-size:13px;font-weight:700;animation:peakingBnrSlide .35s cubic-bezier(.16,1,.3,1),peakingBnrPulse 2.5s ease-in-out infinite;padding-top:max(12px,env(safe-area-inset-top))';
    banner.innerHTML = '<div style="flex:1;display:flex;align-items:center;gap:8px"><span style="font-size:18px">⛰️</span><span><b>Neue Version verfügbar</b><span style="opacity:.7;margin-left:6px">— tap zum Reload</span></span></div><button id="peakingUpdateReload" style="background:rgba(15,23,42,.85);color:#FFA94D;border:0;padding:8px 16px;border-radius:10px;font-weight:800;cursor:pointer;font-family:inherit;font-size:13px">Reload →</button><button id="peakingUpdateDismiss" style="background:transparent;border:0;color:#0f172a;font-size:20px;cursor:pointer;padding:0 6px;line-height:1;font-weight:900">×</button>';
    document.body.appendChild(banner);

    document.getElementById('peakingUpdateReload').onclick = () => {
      try { localStorage.setItem('peaking_lastSeenSWVersion', version || ''); } catch(e) {}
      window.location.reload();
    };
    document.getElementById('peakingUpdateDismiss').onclick = () => {
      try { localStorage.setItem('peaking_lastSeenSWVersion', version || ''); } catch(e) {}
      banner.style.animation = 'peakingBnrSlide .3s cubic-bezier(.16,1,.3,1) reverse';
      setTimeout(() => banner.remove(), 300);
    };
  }

  // Listen for SW-postMessage
  navigator.serviceWorker.addEventListener('message', e => {
    if (e.data && e.data.type === 'SW_UPDATED') {
      showBanner(e.data.version);
    }
  });

  // Listen for controllerchange (neue SW übernimmt)
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    showBanner('controller-change');
  });

  // Also detect updatefound on registration
  navigator.serviceWorker.ready.then(reg => {
    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showBanner('updatefound-' + Date.now());
          }
        });
      }
    });
  }).catch(()=>{});
})();
