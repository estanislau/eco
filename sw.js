/* ============================================================
   Service Worker — ECO · Decisão de Compra
   ============================================================ */

const CACHE = 'eco-v1';

/* Arquivos que ficam disponíveis offline */
const ARQUIVOS = [
  './',
  './index.html',
  './manifest.json',
  './icone.svg'
];

/* ---------- INSTALL ----------
   Roda UMA vez, na primeira visita.
   Baixa tudo e guarda no cache. */
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando e pré-cacheando arquivos...');
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ARQUIVOS))
      .then(() => self.skipWaiting())
  );
});

/* ---------- ACTIVATE ----------
   Roda quando o SW assume o controle.
   Limpa caches antigos (de versões anteriores do app). */
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

/* ---------- FETCH ----------
   Intercepta TODA requisição.
   Estratégia: cache primeiro, rede como fallback.
   Se não tem nem cache nem rede, devolve o index.html. */
self.addEventListener('fetch', (event) => {
  /* Ignora requisições que não são GET (ex: POST) */
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((respostaCache) => {
      if (respostaCache) {
        return respostaCache;
      }
      return fetch(event.request)
        .then((respostaRede) => {
          /* Guarda no cache tudo que for baixado da rede */
          return caches.open(CACHE).then((cache) => {
            cache.put(event.request, respostaRede.clone());
            return respostaRede;
          });
        })
        .catch(() => {
          /* Sem rede e sem cache: devolve o app */
          return caches.match('./index.html');
        });
    })
  );
});
