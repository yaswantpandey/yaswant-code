/**
 * Yaswant Code — Service Worker
 * Strategy: Cache-First for static assets, Network-First for API/HTML,
 * Stale-While-Revalidate for fonts/images.
 */

const CACHE_VERSION = 'v7';
const STATIC_CACHE = `yaswant-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `yaswant-dynamic-${CACHE_VERSION}`;
const FONT_CACHE = `yaswant-fonts-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/favicon.svg',
  '/logo-icon.svg',
  '/logo.svg',
  '/og-image.svg',
  '/manifest.json',
];

const NEVER_CACHE = [
  '/api/',
  'chrome-extension',
  'extension',
  '__vite',
  '.hot-update.',
];

// ── Install: precache static shell ────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ── Activate: delete old caches ───────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter(
            (key) =>
              key.startsWith('yaswant-') &&
              key !== STATIC_CACHE &&
              key !== DYNAMIC_CACHE &&
              key !== FONT_CACHE
          )
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: routing logic ───────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and never-cache patterns
  if (request.method !== 'GET') return;
  if (NEVER_CACHE.some((p) => request.url.includes(p))) return;
  if (url.protocol === 'chrome-extension:') return;

  // Google Fonts → Stale-While-Revalidate (fast + stays fresh)
  if (
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  ) {
    event.respondWith(staleWhileRevalidate(FONT_CACHE, request));
    return;
  }

  // HTML navigation → Network-First (always try live page, fall back to cache)
  if (request.mode === 'navigate' || request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }

  // JS/CSS/images (hashed filenames from Vite) → Cache-First (immutable after hash)
  if (
    url.pathname.match(/\.(js|css|woff2?|ttf|otf|eot)$/) ||
    url.pathname.includes('/assets/')
  ) {
    event.respondWith(cacheFirst(STATIC_CACHE, request));
    return;
  }

  // SVG/images → Stale-While-Revalidate
  if (url.pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|avif)$/)) {
    event.respondWith(staleWhileRevalidate(DYNAMIC_CACHE, request));
    return;
  }

  // Everything else → Network-First
  event.respondWith(networkFirst(DYNAMIC_CACHE, request));
});

// ── Strategy: Cache-First ─────────────────────────────────────────────────────
async function cacheFirst(cacheName, request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return caches.match('/offline.html');
  }
}

// ── Strategy: Network-First ───────────────────────────────────────────────────
async function networkFirst(cacheName, request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return (await caches.match(request)) || caches.match('/offline.html');
  }
}

// ── Strategy: Network-First for HTML with offline fallback ────────────────────
async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Try cached version of this specific URL first
    const cached = await caches.match(request);
    if (cached) return cached;
    // Fall back to root SPA shell (React router handles the route client-side)
    const root = await caches.match('/');
    if (root) return root;
    return caches.match('/offline.html');
  }
}

// ── Strategy: Stale-While-Revalidate ─────────────────────────────────────────
async function staleWhileRevalidate(cacheName, request) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  return cached || fetchPromise || caches.match('/offline.html');
}
