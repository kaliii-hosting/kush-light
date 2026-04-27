const CACHE_NAME = 'brand-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Video URLs to prefetch
const videoUrls = [
  'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Vending_Machine_2g_-_Final_1752609373737_pcxiien.mp4',
  'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Dspsbls_2g_Clouds_1752609365908_u9ruqcu.mp4',
  'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/Gashapon_Prerolls_1752609450843_t53l74h.mp4',
  'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/1g_8bit_1752609356871_v8m7poa.mp4'
];

// Install event - cache all assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Cache basic files first
        return cache.addAll(urlsToCache)
          .then(() => {
            // Then prefetch videos
            return Promise.all(
              videoUrls.map(url => 
                fetch(url, { mode: 'no-cors' })
                  .then(response => cache.put(url, response))
                  .catch(err => console.log('Failed to cache video:', url, err))
              )
            );
          });
      })
  );
  // Force the waiting service worker to become active
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Special handling for videos
  if (event.request.url.includes('.mp4')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          // Clone the request
          const fetchRequest = event.request.clone();
          
          return fetch(fetchRequest).then(response => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          });
        })
    );
    return;
  }
  
  // Network first, cache fallback for API calls
  if (event.request.url.includes('/api/') || event.request.url.includes('firebase')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // Cache first for everything else
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

// Message event for cache updates
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});