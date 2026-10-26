const CACHE_NAME = 'oyunmasasi-v3';
const FONT_CACHE = 'oyunmasasi-fonts-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/fonts/fonts.css',
  './assets/fonts/font-01.woff2',
  './assets/fonts/font-02.woff2',
  './assets/fonts/font-03.woff2',
  './assets/fonts/font-04.woff2',
  './vendor/firebase/firebase-app-compat.js',
  './vendor/firebase/firebase-database-compat.js',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './img/frombsy-card.png',
  './img/frombsy-square.png',
  './img/hero.webp',
  './img/monopoly-sm.webp',
  './img/monopoly.webp',
  './img/okey-sm.webp',
  './img/okey.webp',
  './img/uno-sm.webp',
  './img/uno.webp'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME && key !== FONT_CACHE)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (url.origin !== location.origin) {
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
      event.respondWith(
        caches.open(FONT_CACHE).then((cache) =>
          cache.match(request).then((cached) => {
            const network = fetch(request).then((response) => {
              if (response.ok || response.type === 'opaque') {
                cache.put(request, response.clone());
              }
              return response;
            }).catch(() => cached);
            return cached || network;
          })
        )
      );
    }
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
