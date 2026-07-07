// Bump this version string on every deploy so old caches are invalidated
// and clients pick up the new build automatically.
const CACHE_VERSION = 'v2';
const CACHE_NAME = `property-masters-${CACHE_VERSION}`;
const STATIC_ASSETS = ['./manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(STATIC_ASSETS)));
  // Don't force-activate immediately; wait for the page to tell us to (via SKIP_WAITING)
  // so we don't yank the UI out from under an active session.
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // Network-first for the app shell (index.html / navigations) so users always
  // get the latest code; fall back to cache only when offline.
  const isNavigation = req.mode === 'navigate' || req.url.endsWith('/index.html') || req.url.endsWith('/');
  if (isNavigation) {
    e.respondWith(
      fetch(req).then(resp => {
        const clone = resp.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, clone));
        return resp;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // Cache-first for static assets (fonts, manifest, images) — low risk of staleness.
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(resp => {
      if (resp.status === 200) {
        const clone = resp.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, clone));
      }
      return resp;
    }).catch(() => cached))
  );
});
