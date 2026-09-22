/* Service Worker — ECO · Decisão de Compra */
const CACHE = 'eco-v3';
const ARQUIVOS = [
  './',
  './index.html',
  './manifest.json',
  './icone.svg'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Instalando e pré-cacheando arquivos...');
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ARQUIVOS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando e limpando caches antigos...');
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((respostaCache) => {
      if (respostaCache) return respostaCache;
      return fetch(event.request)
        .then((respostaRede) => {
          return caches.open(CACHE).then((cache) => {
            cache.put(event.request, respostaRede.clone());
            return respostaRede;
          });
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
