const CACHE_NAME = "5k-trainer-v1";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json"
];

// -------------------- INSTALL --------------------
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// -------------------- ACTIVATE --------------------
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// -------------------- FETCH (OFFLINE SUPPORT) --------------------
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      }).catch(() => {
        // fallback if offline and not cached
        if (event.request.mode === "navigate") {
          return caches.match("./index.html");
        }
      });
    })
  );
});