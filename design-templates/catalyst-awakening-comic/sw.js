'use strict';

// Bump CACHE whenever styles.css / script.js / precached assets change, so the
// activate handler below evicts the previous generation. IMG_CACHE is versioned
// separately and deliberately left behind: image bytes are immutable per URL, so
// there's no reason to make returning visitors re-download them on a code change.
const CACHE = 'catalyst-v17';
const IMG_CACHE = 'catalyst-img-v5';
const IMG_CACHE_MAX = 60;
const PRECACHE = [
  '/styles.css',
  // Issue pages load this instead: styles.css minus the rules that
  // cannot match there. See tools/split_css.py.
  '/issue.css',
  '/script.js',
  '/favicon.svg',
  // The two faces above the fold; the rest arrive on demand per unicode-range
  '/assets/fonts/bebas-neue-400-normal-latin.woff2',
  '/assets/fonts/space-grotesk-400-normal-latin.woff2',
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

  // CSS/JS: network-first with cache fallback — deliberately NOT cache-first.
  // index.html references these as plain `styles.css` / `script.js` with no
  // content hash or version query, and the document handler above is
  // network-first. Under a cache-first policy a returning visitor gets fresh
  // HTML paired with last-deploy's CSS/JS, so any newly added section renders
  // as unstyled, non-functional markup until a second reload. Network-first
  // keeps code in lockstep with the HTML that references it; the cache
  // fallback preserves full offline support.
  if (dest === 'style' || dest === 'script') {
    e.respondWith((async () => {
      try {
        const r = await fetch(e.request);
        if (r.ok) {
          const c = r.clone();
          caches.open(CACHE).then(ch => ch.put(e.request, c));
        }
        return r;
      } catch (err) {
        return (await caches.match(e.request)) || Response.error();
      }
    })());
    return;
  }

  // Fonts: cache-first and never revalidated. Filenames encode family,
  // weight, style and subset, so a given URL's bytes never change — there
  // is nothing to check for. Lives in the versioned CSS cache so a cache
  // bump still evicts them if the set ever changes.
  if (dest === 'font') {
    e.respondWith((async () => {
      const cached = await caches.match(e.request);
      if (cached) return cached;
      try {
        const r = await fetch(e.request);
        if (r.ok) {
          const c = r.clone();
          caches.open(CACHE).then(ch => ch.put(e.request, c));
        }
        return r;
      } catch (err) {
        return Response.error();
      }
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
