// PEAKING — Service Worker für Offline-Capability
// Einfaches Cache-First mit Network-Fallback. iOS-tauglich.

const CACHE_NAME = 'peaking-v18';
const ASSETS = [
  './',
  './index.html',
  './dashboard.html',
  './manifest.json',
  './js/app.js',
  './js/coach.js',
  './assets/logo.svg',
  './assets/effects.css',
  './assets/BRAND.md',
  './data/seed-ideas.json',
  './modules/tracker.html',
  './modules/builder.html',
  './modules/ideas.html',
  './modules/captions.html',
  './modules/calendar.html',
  './modules/analytics.html',
  './modules/growth.html',
  './modules/instagram-pb.html',
  './modules/recorder.html',
  './modules/bip.html',
  './modules/inspiration.html',
  './modules/settings.html',
  './modules/goals.html',
  './modules/replies.html',
  './modules/series.html',
  './modules/hooks.html',
  './modules/achievements.html',
  './modules/cross-post.html',
  './modules/story-pack.html',
  './modules/coach.html',
  './links.html',
  './changelog.html',
  './admin.html'
];

// Install: cache wichtigste Files
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      // addAll fails hard — wir machen einzeln + log Fehler
      Promise.all(ASSETS.map(url =>
        cache.add(url).catch(err => console.warn('SW cache fail:', url, err))
      ))
    ).then(() => self.skipWaiting())
  );
});

// Activate: alte Caches aufräumen
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: Network-First für HTML (immer frisch wenn online), Cache-First für Assets
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Skip cross-origin (CDNs etc.) — sollen normal laden
  if (url.origin !== self.location.origin) return;

  // Skip non-GET
  if (e.request.method !== 'GET') return;

  const isHTML = e.request.destination === 'document' || url.pathname.endsWith('.html') || url.pathname === '/';

  if (isHTML) {
    // Network-First für HTML (immer aktuelle Version wenn online)
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    // Cache-First für Assets
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          }
          return res;
        });
      })
    );
  }
});
