'use strict';

const CACHE = 'catalyst-v2';
const PRECACHE = [
  '/favicon.svg',
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
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const dest = e.request.destination;

  // HTML: network-first, stale-while-revalidate
  if (dest === 'document') {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          const c = r.clone();
          caches.open(CACHE).then(ch => ch.put(e.request, c));
          return r;
        })
        .catch(() => caches.match(e.request) || caches.match('/'))
    );
    return;
  }

  // Images: cache-first with background refresh
  if (dest === 'image') {
    e.respondWith(
      caches.match(e.request).then(cached => {
        const net = fetch(e.request).then(r => {
          if (r.ok) {
            const c = r.clone();
            caches.open(CACHE).then(ch => ch.put(e.request, c));
          }
          return r;
        }).catch(() => cached);
        return cached || net;
      })
    );
    return;
  }
});
