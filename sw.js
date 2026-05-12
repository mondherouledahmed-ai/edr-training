/* SecOps Academy — Service Worker
   Stratégie : cache-first pour assets statiques, network-first pour HTML (fallback cache si offline). */
const CACHE = 'secops-v3';
const CORE = [
  './',
  'dashboard.html',
  'revision.html',
  'progress.html',
  'soc-alerts.html',
  'soc-qa.html',
  'soc-interview.html',
  'soc-l1-l2.html',
  'edr.html',
  'soar.html',
  'pam.html',
  'pentest.html',
  'splunk.html',
  'events.html',
  'linux.html',
  'apache.html',
  'star.html',
  'interview.html',
  'assets/css/app.css',
  'assets/js/app.js',
  'assets/js/star.js',
  'assets/js/scenarios.js',
  'assets/js/quiz-data.js',
  'assets/js/quiz-engine.js',
  'assets/js/pwa-install.js',
  'manifest.webmanifest'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // network-first pour HTML — pour avoir les MAJ contenu
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match('dashboard.html')))
    );
    return;
  }

  // cache-first pour le reste (CSS, JS, fonts, icons)
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      if (res.ok && (url.origin === location.origin || /fonts\.googleapis|fonts\.gstatic|cdnjs\.cloudflare/.test(url.host))) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      }
      return res;
    }).catch(() => cached))
  );
});
