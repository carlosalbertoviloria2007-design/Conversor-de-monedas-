const CACHE_NAME = "currency-converter-v2";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./currencies.js",
  "./manifest.json",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png"
];

// Instalación del Service Worker y almacenamiento en caché de los activos locales
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activación y limpieza de versiones antiguas de caché
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Interceptar peticiones con estrategia de respaldo seguro
self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // Solo gestionar peticiones HTTP/HTTPS (ignorar esquemas chrome-extension://, file://, etc.)
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return;
  }

  // Ignorar métodos que no sean GET
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Guardar en caché respuestas válidas de recursos estáticos
        if (networkResponse && (networkResponse.status === 200 || networkResponse.type === "opaque")) {
          // No almacenar en caché las respuestas de la API en vivo para que siempre se renueven
          if (!url.includes("open.er-api.com")) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
        }
        return networkResponse;
      })
      .catch(async () => {
        // En caso de fallo de red, intentar servir desde la caché
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Fallback especial para navegación principal
        if (event.request.mode === "navigate") {
          const fallbackPage = await caches.match("./index.html");
          if (fallbackPage) return fallbackPage;
        }

        // Respuesta limpia en lugar de undefined para evitar errores no capturados
        return new Response("Recurso no disponible sin conexión", {
          status: 503,
          statusText: "Service Unavailable",
          headers: new Headers({ "Content-Type": "text/plain; charset=utf-8" })
        });
      })
  );
});
