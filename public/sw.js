const CACHE_NAME = 'hr-portal-v1';
const OFFLINE_URL = '/';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // Cache essential assets
            return cache.addAll([
                '/',
                '/manifest.json',
                '/dar_logo.png',
                '/favicon.svg',
                '/apple-touch-icon.png'
            ]);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // We only want to handle GET requests
    if (event.request.method !== 'GET') return;

    // For HTML requests, try the network first, fallback to cache, then offline fallback
    if (event.request.headers.get('accept').includes('text/html') || event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    return caches.match(event.request).then((response) => {
                        return response || caches.match(OFFLINE_URL);
                    });
                })
        );
        return;
    }

    // For other assets, try cache first, fallback to network
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then((networkResponse) => {
                // Optionally cache the fetched response here
                return networkResponse;
            });
        })
    );
});
