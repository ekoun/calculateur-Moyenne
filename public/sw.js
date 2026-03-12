// very basic service worker for caching and installability
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  clients.claim();
});

// optionally cache assets
const CACHE_NAME = 'reatd-cache-v1';
const urlsToCache = ['/', '/index.html'];

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});