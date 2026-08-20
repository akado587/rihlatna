/* Offline support: cache the core files.
   Strategy: pages + app code load from cache (fast, offline-capable)
   but always fetch the latest version in the background
   (stale-while-revalidate). Only immutable media (images, fonts,
   tickets, PDFs) are cache-first.
   Bump VERSION on every content change so clients pick it up. */
const VERSION = "trip-v9";

const CORE = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/app.js",
  "./js/trip.js",
  "./js/icons.js",
  "./js/qrcode.js",
  "./assets/fonts/fonts.css",
  "./manifest.webmanifest",
];

const IMMUTABLE = ["/assets/img/", "/assets/fonts/", "/assets/icons/", "/tickets/", "/docs/"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  /* Page navigations: network first, cache as offline fallback */
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then((r) => r || caches.match("./index.html")))
    );
    return;
  }

  /* Immutable media: cache first */
  if (IMMUTABLE.some((p) => url.pathname.includes(p))) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
        }
        return res;
      }))
    );
    return;
  }

  /* App code (js/css/manifest): serve from cache, refresh in background */
  e.respondWith(
    caches.match(req).then((cached) => {
      const fresh = fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || fresh;
    })
  );
});
