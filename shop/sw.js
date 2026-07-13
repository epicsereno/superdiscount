/* Super Discount El Sereno — service worker (static, GH Pages safe) */
const CACHE = "sd-shop-v1";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./tokens/colors.json",
  "./tokens/typography.json",
  "./tokens/layout.json",
  "./tokens/brand.json",
  "./data/products.json",
  "./i18n/en.json",
  "./i18n/es.json",
  "./i18n/vi.json"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* network-first for JSON (fresh prices), cache-first for everything else */
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (url.pathname.endsWith(".json")) {
    e.respondWith(
      fetch(e.request)
        .then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return r; })
        .catch(() => caches.match(e.request))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
        if (r.ok && url.origin === location.origin) {
          const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp));
        }
        return r;
      }))
    );
  }
});
