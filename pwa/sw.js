// BudgetWise service worker (production builds only; see pwa/plugin.js).
// The app opens offline and shows the data it last loaded, read-only.
// Nothing is written offline. __BUILD__ and __PRECACHE__ are filled in at
// build time, so every deploy ships a new worker with its own file list.
const BUILD = __BUILD__;
const PRECACHE = __PRECACHE__;

const SHELL = `bw-shell-${BUILD}`; // index.html, icons, this build's assets
const API = "bw-api"; // last GET answers; the app clears it on sign-in/out
const SHELL_FILES = ["/", "/manifest.webmanifest", ...PRECACHE];
// Never stored: private files, sign-in, admin
const NO_CACHE = /\/receipt$|^\/api\/(login|logout|signup|password|admin)\b/;

self.addEventListener("install", (event) => {
  // Waits (no skipWaiting) until the app says the user chose to reload,
  // so an open tab never loses the files it was built with
  event.waitUntil(caches.open(SHELL).then((c) => c.addAll(SHELL_FILES)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("bw-shell-") && k !== SHELL)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "skip-waiting") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    // every app URL serves the same index.html
    event.respondWith(networkFirst(req, SHELL, "/"));
  } else if (url.pathname.startsWith("/api/")) {
    if (!NO_CACHE.test(url.pathname)) {
      event.respondWith(networkFirst(req, API));
    }
  } else {
    event.respondWith(cacheFirst(req));
  }
});

// Online: the network (and remember the answer). Offline: the last answer.
async function networkFirst(req, cacheName, key = req) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(key, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(key);
    if (hit) return hit;
    throw err;
  }
}

// Hashed build files never change: the cache first
async function cacheFirst(req) {
  const hit = await caches.match(req);
  return hit || fetch(req);
}
