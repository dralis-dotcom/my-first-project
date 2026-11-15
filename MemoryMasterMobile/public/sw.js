// Simple offline support: pages are fetched fresh when online and fall back to the
// last saved copy when offline; other files of this site are saved the first time they load.
const CACHE = 'memorymaster-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('app-shell', copy));
          return res;
        })
        .catch(() => caches.open(CACHE).then((c) => c.match('app-shell'))),
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE).then(async (c) => {
      const hit = await c.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) c.put(req, res.clone());
      return res;
    }),
  );
});
