// sw.js
const CACHE_NAME = 'silo-build-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  'https://i.ibb.co/wZrCv8bW/Google-AI-Studio-2025-09-29-T00-09-44-063-Z-modified.png',
  'https://i.ibb.co/yFmsLKxR/Generated-Image-October-08-2025-6-21-PM-modified.png',
  'https://i.ibb.co/9HrQSLym/Generated-Image-October-08-2025-6-19-PM-modified.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
