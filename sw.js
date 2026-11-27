/* みっちーClip工房 Service Worker
   アプリ本体（HTML・マニフェスト・アイコン）をキャッシュして、インストール後すぐ開けるようにする。
   ページ本体はネットワーク優先（更新が届くように）。 */
const CACHE = "svm-v42";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./アイコン192.png",
  "./アイコン512.png",
  "./マスカブルアイコン.png",
  "./iPhone用アイコン.png",
  "./materials/materials.json"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(ASSETS.map((a) => c.add(a))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then((r) => {
          const cp = r.clone();
          caches.open(CACHE).then((c) => c.put("./index.html", cp));
          return r;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(
      (m) =>
        m ||
        fetch(e.request).then((r) => {
          const cp = r.clone();
          caches.open(CACHE).then((c) => c.put(e.request, cp));
          return r;
        })
    )
  );
});
