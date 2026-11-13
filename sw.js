// Offline cache. build.mjs fills in the version and the file list.
const CACHE = "khtn-908e3ee8240d";
const PRECACHE = ["./","./app.js","./data.js","./icons/icon-180.png","./icons/icon-192.png","./icons/icon-512-maskable.png","./icons/icon-512.png","./icons/icon.svg","./index.html","./katex/fonts/KaTeX_AMS-Regular.woff2","./katex/fonts/KaTeX_Caligraphic-Bold.woff2","./katex/fonts/KaTeX_Caligraphic-Regular.woff2","./katex/fonts/KaTeX_Fraktur-Bold.woff2","./katex/fonts/KaTeX_Fraktur-Regular.woff2","./katex/fonts/KaTeX_Main-Bold.woff2","./katex/fonts/KaTeX_Main-BoldItalic.woff2","./katex/fonts/KaTeX_Main-Italic.woff2","./katex/fonts/KaTeX_Main-Regular.woff2","./katex/fonts/KaTeX_Math-BoldItalic.woff2","./katex/fonts/KaTeX_Math-Italic.woff2","./katex/fonts/KaTeX_SansSerif-Bold.woff2","./katex/fonts/KaTeX_SansSerif-Italic.woff2","./katex/fonts/KaTeX_SansSerif-Regular.woff2","./katex/fonts/KaTeX_Script-Regular.woff2","./katex/fonts/KaTeX_Size1-Regular.woff2","./katex/fonts/KaTeX_Size2-Regular.woff2","./katex/fonts/KaTeX_Size3-Regular.woff2","./katex/fonts/KaTeX_Size4-Regular.woff2","./katex/fonts/KaTeX_Typewriter-Regular.woff2","./katex/katex.min.css","./katex/katex.min.js","./katex/mhchem.min.js","./manifest.webmanifest","./style.css"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Cache first; fall back to the network, and to the app shell for navigations.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(
      (hit) =>
        hit ||
        fetch(e.request).catch(() => (e.request.mode === "navigate" ? caches.match("./") : Response.error())),
    ),
  );
});
