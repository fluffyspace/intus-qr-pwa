// Bump VERSION whenever any file below changes, so installed apps pick up the update.
var VERSION = "intus-qr-v1";
var ASSETS = [
  "./",
  "index.html",
  "style.css",
  "app.js",
  "lib/qrcode.js",
  "logo.svg",
  "manifest.webmanifest",
  "fonts/ibmplexsans_regular.ttf",
  "fonts/ibmplexsans_semibold.otf",
  "icons/icon-180.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-192.png",
  "icons/maskable-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(VERSION)
      .then(function (cache) { return cache.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== VERSION; })
          .map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

// Cache first: the app never needs the network after install.
self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      if (event.request.mode === "navigate") return caches.match("index.html");
      return fetch(event.request);
    })
  );
});
