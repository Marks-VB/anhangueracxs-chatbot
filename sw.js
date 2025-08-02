// Nome do cache. Mude este valor se você atualizar os arquivos para forçar a atualização do cache.
const CACHE_NAME = 'ajuda-ti-cache-v5'; // Versão incrementada para garantir a atualização

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
        // É importante que todos os caminhos estejam corretos, senão a instalação falha.
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Evento 'fetch': é acionado para cada requisição que a página faz.
self.addEventListener('fetch', event => {
  // Ignoramos as requisições para a API da IA, pois elas precisam de conexão.
  if (event.request.url.includes('generativelanguage.googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna do cache se encontrar, senão busca na rede.
        return response || fetch(event.request);
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
