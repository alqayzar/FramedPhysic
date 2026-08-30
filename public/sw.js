const CACHE_NAME = 'framed-v1'
const APP_ROOT = new URL('./', self.registration.scope).href

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.add(APP_ROOT)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok && new URL(event.request.url).origin === self.location.origin) {
          void caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()))
        }
        return response
      })
      .catch(async () => {
        if (event.request.mode === 'navigate') return caches.match(APP_ROOT)
        return caches.match(event.request)
      }),
  )
})
