const CACHE_NAME = 'blackjack-pwa-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/blackjack.css',
  '/blackjack.js',
  '/deck.js',
  // Add all card images
  ...Array.from({length: 52}, (_, i) => `/cards/${['A','2','3','4','5','6','7','8','9','10','J','Q','K'][i%13]}-${['C','D','H','S'][Math.floor(i/13)]}.png`),
  '/cards/BACK.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
