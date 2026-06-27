// Persistence layer. localStorage now; Firebase-ready seam for cross-device sync.
// window.Store exposes a small async-ish API so swapping in Firestore later is
// a one-file change (the app already awaits these).
(function () {
  const KEY = "ep_attempts_v1";
  const PROFILE_KEY = "ep_profile_v1";

  function loadAttempts() {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
    catch (e) { return []; }
  }
  function saveAttempts(list) {
    localStorage.setItem(KEY, JSON.stringify(list));
  }

  const Store = {
    // --- attempts (test history) ---
    async getAttempts() { return loadAttempts(); },
    async addAttempt(attempt) {
      const list = loadAttempts();
      list.unshift(attempt);
      saveAttempts(list);
      // FIREBASE SEAM: when sync is enabled, also write to
      // firestore: users/{uid}/attempts/{attempt.id}
      return attempt;
    },
    async clearAttempts() { saveAttempts([]); },

    // --- profile (child name + which region they're preparing for) ---
    getProfile() {
      try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}"); }
      catch (e) { return {}; }
    },
    setProfile(p) { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); },
    // Merge a patch into the existing profile (e.g. set name without losing region).
    updateProfile(patch) {
      const next = Object.assign({}, this.getProfile(), patch);
      localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
      return next;
    }
  };

  window.Store = Store;
})();
