// Сервис-воркер для быстрого запуска (браузер, PWA, APK; внутри Telegram он не включается).
// Файлы приложения открываются сразу из кэша, а свежая версия подтягивается в фоне: обновление кода приходит со следующего запуска.
// Сбросить кэш у всех: увеличь VERSION. Выключить совсем: "pwa": false в config.js (воркер снимется, кэш очистится).
// Запросы к серверу бота (API, фото) идут на другой адрес и воркером не перехватываются.
const VERSION = 1;
const CACHE = "soulmate-v" + VERSION;
const FILES = ["./", "index.html", "style.css", "app.js", "config.js", "manifest.json", "icons/icon-192.png", "icons/icon-512.png", "icons/icon.svg"];

// Ключ кэша без «?v=…» и «#…»: файл один и тот же, адреса могут отличаться параметрами.
const keyOf = (u) => { const x = new URL(u, self.registration.scope); x.search = ""; x.hash = ""; return x.href; };

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((cache) =>
    Promise.all(FILES.map((f) => fetch(new URL(f, self.registration.scope).href, { cache: "reload" })
      .then((res) => { if (res.ok) return cache.put(keyOf(f), res); }).catch(() => {})))
  ).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith("soulmate-") && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || req.headers.has("range")) return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // сервер бота, Telegram и т.д. не трогаем
  const key = keyOf(req.url);
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(key);
    const fresh = fetch(req.url, { cache: "no-cache" })
      .then((res) => { if (res && res.ok) cache.put(key, res.clone()); return res; })
      .catch(() => null);
    if (cached) { e.waitUntil(fresh); return cached; } // сразу из кэша, обновление в фоне
    return (await fresh) || Response.error();
  })());
});
