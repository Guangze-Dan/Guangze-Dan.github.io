/* Service worker: keeps the site instant on hosts with slow first-byte
   (GitHub Pages from mainland China). The whole app is one inlined document,
   so caching the shell makes repeat visits effectively offline-fast.

   Strategy:
   - navigations: serve the cached shell immediately, refresh it in the
     background (stale-while-revalidate)
   - static assets: cache-first, fill on miss
   - /prototype and /evidence stream large media: never intercepted
*/
const CACHE = 'gd-site-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((c) => c.add('/')).catch(() => {}));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch { return; }
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith('/prototype') || url.pathname.startsWith('/evidence')) return;

  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match('/');
      const network = fetch(req).then((res) => {
        if (res && res.ok) cache.put('/', res.clone());
        return res;
      }).catch(() => null);
      if (!cached) {
        const fresh = await network;
        return fresh || new Response('Offline', { status: 503, headers: { 'content-type': 'text/plain' } });
      }
      event.waitUntil(network);
      return cached;
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req);
    if (hit) return hit;
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  })());
});
