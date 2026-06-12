// sw.js — service worker: full offline support (cache-first app shell).
// Bump CACHE_VERSION on every release so clients pick up new files.

const CACHE_VERSION = 'parthograph-v1.0.0';

const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/app.css',
  './icons/icon.svg',
  './js/app.js', './js/store.js', './js/db.js', './js/ui.js', './js/i18n.js',
  './js/ethiopic.js', './js/protocol.js', './js/alerts.js', './js/wizard.js',
  './js/chart.js', './js/fhir.js', './js/demo.js',
  './js/views/dashboard.js', './js/views/admission.js', './js/views/patient.js',
  './js/views/delivery.js', './js/views/referral.js', './js/views/reports.js',
  './js/views/settings.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      // opportunistically cache same-origin responses
      if (res.ok && new URL(e.request.url).origin === location.origin) {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match('./index.html'))),
  );
});
