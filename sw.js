// Nome do cache. Mude este valor se você atualizar os arquivos para forçar a atualização do cache.
const CACHE_NAME = 'ajuda-ti-cache-v7'; // Versão incrementada para forçar a atualização

// Lista de arquivos essenciais para o funcionamento offline do app.
const URLS_TO_CACHE = [
  './', // A página inicial
  './index.html',
  './manifest.json',
  './logo.png', // Ícone do robô (PWA, favicon, chat)
  './images/logo.png', // Logo da Anhanguera (cabeçalho)
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

// Evento 'install': é acionado quando o service worker é instalado.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto. Adicionando URLs ao cache.');
        // O addAll faz a requisição e armazena os arquivos.
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Evento 'fetch': Adotando a estratégia "Network First" para garantir atualizações.
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // Ignora pedidos para a API do chat, que nunca devem ser cacheados.
  if (requestUrl.pathname.startsWith('/api/chat')) {
    return; // Deixa o pedido passar diretamente para a rede, sem cache.
  }

  event.respondWith(
    // 1. Tenta obter a resposta da rede primeiro.
    fetch(event.request).then(networkResponse => {
      // 2. Se conseguir, armazena a nova resposta no cache.
      return caches.open(CACHE_NAME).then(cache => {
        cache.put(event.request, networkResponse.clone());
        // 3. Retorna a resposta da rede para o navegador.
        return networkResponse;
      });
    }).catch(() => {
      // 4. Se a rede falhar (offline), tenta obter do cache.
      return caches.match(event.request);
    })
  );
});


// Evento 'activate': é acionado quando o service worker é ativado.
// Limpa caches antigos para evitar conflitos de versão.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('A deletar cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});