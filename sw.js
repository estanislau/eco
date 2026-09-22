/* Service Worker — ECO · Decisão de Compra */
const CACHE = 'eco-v6';
const ARQUIVOS = [
  './',
  './index.html',
  './manifest.json',
  './icone.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ARQUIVOS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
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

  // Não interceptar requisições de outros domínios
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((respostaCache) => {
      if (respostaCache) return respostaCache;

      return fetch(event.request)
        .then((respostaRede) => {
          // Só cachear respostas válidas
          if (!respostaRede || respostaRede.status !== 200 || respostaRede.type === 'opaque') {
            return respostaRede;
          }
          const clone = respostaRede.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, clone));
          return respostaRede;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
