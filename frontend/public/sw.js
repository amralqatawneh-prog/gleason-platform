// Replaced with content-hashed compiled assets by pwaPrecache.ts during build.
const { cacheName, urls } = __PRECACHE_MANIFEST__;
const CACHE_PREFIX = 'gleason-shell-';

self.addEventListener('install', (event) => {
  // Atomic install: a missing script/style prevents a broken offline update.
  // Wait for existing clients to close before replacing their active worker.
  event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(urls)));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys
    .filter((key) => key.startsWith(CACHE_PREFIX) && key !== cacheName)
    .map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(async () => {
      const cache = await caches.open(cacheName);
      return await cache.match('/') || await cache.match('/offline.html');
    }));
    return;
  }
  event.respondWith(caches.open(cacheName).then(async (cache) => {
    const cached = await cache.match(event.request);
    return cached || fetch(event.request);
  }));
});
