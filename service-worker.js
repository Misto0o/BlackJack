const CACHE_NAME = 'blackjack-pwa-v7';

const urlsToCache = [
  '/',
  '/index.html?v=5',
  '/blackjack.css?v=5',
  '/blackjack.js?v=5',
  // Add all card images
  ...Array.from({ length: 52 }, (_, i) => `/cards/${['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'][i % 13]}-${['C', 'D', 'H', 'S'][Math.floor(i / 13)]}.png`),
  '/cards/BACK.png'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing & caching shell…');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); // ⚡ Activate immediately
});

// Activate: nuke all old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating & cleaning old caches…');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) {
          console.log('[SW] Deleting old cache:', key);
          return caches.delete(key);
        }
      }))
    ).then(() => self.clients.claim()) // ⚡ Take control
  );
});

// Fetch: cache-first with background update
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetchPromise = fetch(event.request)
        .then(networkRes => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkRes.clone());
            return networkRes;
          });
        }).catch(() => { });

      // Serve cached, update in background
      return cached || fetchPromise;
    })
  );
});