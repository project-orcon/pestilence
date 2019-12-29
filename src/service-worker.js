//cache all the images from firebase storage. 

workbox.core.setCacheNameDetails({prefix: "scoutxyz"});
 
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
 
/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.routing.registerRoute(
    new RegExp('https://firebasestorage\\.googleapis\\.com.*'),
    new workbox.strategies.CacheFirst({
      cacheName: 'images-cache',
      plugins: [
        new workbox.expiration.Plugin({
          maxEntries: 50,
          maxAgeSeconds: 60 * 24 * 60 * 60, // 60 Days
        }),
        //force the caching of an opaque response
        new workbox.cacheableResponse.Plugin({
            statuses: [0, 200]
          })
      ]
    })
  );




