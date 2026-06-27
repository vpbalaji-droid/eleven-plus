// Service worker — network-first so fresh code ships without manual cache clears.
// BUMP THIS VERSION ON EVERY CHANGE.
const CACHE = "ep-v5";
const ASSETS = [
  "./", "./index.html", "./styles.css", "./app.js", "./store.js",
  "./data/questions.js", "./data/engine.js",
  "./manifest.webmanifest", "./icons/icon.svg", "./img/nvr-placeholder.svg"
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network-first, bypassing the HTTP cache; fall back to cache when offline.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request, { cache: "no-store" })
      .then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return resp;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("./index.html")))
  );
});
