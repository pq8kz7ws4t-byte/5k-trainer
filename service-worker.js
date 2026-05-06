const CACHE_NAME = "5k-trainer-v2";

// Only cache core app shell
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json"
];

// ---------------- INSTALL ----------------
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );

  // Force immediate activation (IMPORTANT FIX)
  self.skipWaiting();
});

// ---------------- ACTIVATE ----------------
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          // delete old versions
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );

  // Take control immediately
  self.clients.claim();
});

// ---------------- FETCH STRATEGY ----------------
// Network-first (THIS FIXES UPDATE PROBLEMS)
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone and store fresh version
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => {
        // Offline fallback
        return caches.match(event.request).then(res => {
          return res || caches.match("./index.html");
        });
      })
  );
});
