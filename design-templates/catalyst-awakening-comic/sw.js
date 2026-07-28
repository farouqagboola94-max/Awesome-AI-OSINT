'use strict';

const CACHE = 'catalyst-v5';
const IMG_CACHE = 'catalyst-img-v5';
const IMG_CACHE_MAX = 60;
const PRECACHE = [
  '/styles.css',
  '/script.js',
  '/favicon.svg',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/apple-touch-icon.png',
  '/assets/bayo-bridge.webp',
  '/assets/cover-issue1.webp',
  '/assets/cover-issue2.webp',
  '/assets/cover-issue3.webp',
  '/assets/cover-issue4.webp',
  '/assets/bayo-portrait.webp',
  '/assets/zara-portrait.webp',
  '/assets/amara-portrait.webp',
  '/assets/ikenna-portrait.webp',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    Promise.all([
      caches.keys().then(keys => Promise.all(
        keys.filter(k => k !== CACHE && k !== IMG_CACHE).map(k => caches.delete(k))
      )),
      // Navigation preload: browser starts the network fetch in parallel
      // with SW boot, shaving ~100-300ms off cold navigations
      self.registration.navigationPreload
        ? self.registration.navigationPreload.enable()
        : Promise.resolve(),
    ]).then(() => self.clients.claim())
  );
});

// Keep the image cache bounded so it never grows unchecked on mobile
async function trimImageCache() {
  const cache = await caches.open(IMG_CACHE);
  const keys = await cache.keys();
  if (keys.length <= IMG_CACHE_MAX) return;
  const excess = keys.length - IMG_CACHE_MAX;
  for (let i = 0; i < excess; i++) await cache.delete(keys[i]);
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const dest = e.request.destination;

  // HTML: network-first (with navigation preload), cache fallback
  if (dest === 'document') {
    e.respondWith((async () => {
      try {
        const preloaded = await e.preloadResponse;
        const r = preloaded || await fetch(e.request);
        const c = r.clone();
        caches.open(CACHE).then(ch => ch.put(e.request, c));
        return r;
      } catch (err) {
        return (await caches.match(e.request)) || (await caches.match('/')) || Response.error();
      }
    })());
    return;
  }

  // CSS/JS: cache-first with background refresh, so styles.css/script.js
  // work offline and don't get re-fetched from the network on every load
  if (dest === 'style' || dest === 'script') {
    e.respondWith((async () => {
      const cached = await caches.match(e.request);
      const net = fetch(e.request).then(r => {
        if (r.ok) {
          const c = r.clone();
          caches.open(CACHE).then(ch => ch.put(e.request, c));
        }
        return r;
      }).catch(() => cached);
      return cached || net;
    })());
    return;
  }

  // Images: cache-first with background refresh, bounded cache
  if (dest === 'image') {
    e.respondWith((async () => {
      const cached = (await caches.match(e.request)) || null;
      const net = fetch(e.request).then(r => {
        if (r.ok) {
          const c = r.clone();
          caches.open(IMG_CACHE)
            .then(ch => ch.put(e.request, c))
            .then(trimImageCache);
        }
        return r;
      }).catch(() => cached);
      return cached || net;
    })());
    return;
  }
});
