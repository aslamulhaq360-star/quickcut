/* =========================================================
   QuickCut Progressive Web App Service Worker
   Offline Cache & Safe Network-First / Cache-Fallback
   100% Client-Side Local Operations (Zero Video Caching)
   ========================================================= */

const CACHE_NAME = 'quickcut-cache-v1';

// Essential assets required for offline app functionality
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.webmanifest',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './icon-192-maskable.png',
  './icon-512-maskable.png',
  './vendor/react.min.js',
  './vendor/react-dom.min.js'
];

// Install Event: pre-cache static assets
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

// Activate Event: delete stale caches
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

// Fetch Event: Safe cache strategy (never cache user videos or blob URLs)
self.addEventListener('fetch', function (event) {
  const request = event.request;
  const url = new URL(request.url);

  // Never intercept or cache non-HTTP requests, POSTs, or blob/data URLs
  if (request.method !== 'GET' || url.protocol.startsWith('blob') || url.protocol.startsWith('data')) {
    return;
  }

  // Never cache large media/video requests
  const dest = request.destination;
  if (dest === 'video' || dest === 'audio') {
    return;
  }

  // Network-First with Cache Fallback for HTML/JS/CSS assets
  event.respondWith(
    fetch(request).then(function (networkResponse) {
      // Only cache valid local responses
      if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(request, responseToCache);
        });
      }
      return networkResponse;
    }).catch(function () {
      // Fallback to cache when offline
      return caches.match(request).then(function (cachedResponse) {
        if (cachedResponse) {
          return cachedResponse;
        }
        // If navigation request fails, return cached index.html
        if (request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
