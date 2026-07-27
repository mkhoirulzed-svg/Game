(() => {
  const KEYS = {
    stats: "langkahJuaraStats",
    history: "langkahJuaraHistory",
    progress: "langkahJuaraProgress",
    profile: "langkahJuaraProfile",
    settings: "langkahJuaraSettings"
  };

  const read = (key, fallback = {}) => {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch { return fallback; }
  };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

  const stats = () => ({ games: 0, wins: 0, lessons: 0, streak: 0, ...read(KEYS.stats) });
  const profile = () => ({ name: "Calon Juara", age: "", ...read(KEYS.profile) });
  const settings = () => ({ sound: true, coach: true, theme: "classic", ...read(KEYS.settings) });
  const progress = () => read(KEYS.progress, { completed: [] });
  const history = () => read(KEYS.history, []);

  function formatDate(value) {
    if (!value) return "Belum pernah";
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
  }

  function hydrate() {
    const currentStats = stats();
    const currentProfile = profile();
    const currentProgress = progress();
    document.querySelectorAll("[data-stat]").forEach(el => {
      const key = el.dataset.stat;
      if (key === "winrate") el.textContent = currentStats.games ? Math.round((currentStats.wins / currentStats.games) * 100) + "%" : "0%";
      else el.textContent = Number(currentStats[key] || 0);
    });
    document.querySelectorAll("[data-profile-name]").forEach(el => el.textContent = currentProfile.name || "Calon Juara");
    document.querySelectorAll("[data-last-played]").forEach(el => el.textContent = formatDate(currentStats.lastPlayed));
    document.querySelectorAll("[data-lesson-count]").forEach(el => el.textContent = currentProgress.completed.length);
    document.querySelectorAll("[data-level]").forEach(el => {
      const points = currentStats.wins * 40 + currentStats.games * 10 + currentProgress.completed.length * 50;
      el.textContent = Math.max(1, Math.floor(points / 150) + 1);
    });
  }

  function showToast(message) {
    let toast = document.getElementById("appToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "appToast";
      toast.className = "toast";
      toast.setAttribute("role", "status");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(window.__ljToast);
    window.__ljToast = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  window.LangkahJuara = {
    KEYS, read, write, stats, profile, settings, progress, history, formatDate, hydrate, showToast,
    saveProfile(value) { write(KEYS.profile, { ...profile(), ...value }); hydrate(); },
    saveSettings(value) { write(KEYS.settings, { ...settings(), ...value }); },
    completeLesson(id) {
      const value = progress();
      if (!value.completed.includes(id)) value.completed.push(id);
      write(KEYS.progress, value);
      const currentStats = stats();
      currentStats.lessons = value.completed.length;
      write(KEYS.stats, currentStats);
      hydrate();
    },
    clearProgress() {
      [KEYS.stats, KEYS.history, KEYS.progress].forEach(key => localStorage.removeItem(key));
      hydrate();
    }
  };

  document.addEventListener("DOMContentLoaded", hydrate);
  const appScript = document.currentScript;
  if ("serviceWorker" in navigator && appScript) {
    window.addEventListener("load", () => navigator.serviceWorker.register(new URL("sw.js", appScript.src)).catch(() => {}));
  }
})();