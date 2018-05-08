self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open(staticCacheName).then(function(cache) {
        return cache.addAll([
          '/skeleton',
          'js/main/main.js',
          'js/main/restaurant_info.js',
          'js/database/dbhelper.js',
          'css/main.css',
          'css/responsive.css'
        ]);
      })
    );
  });
  
  self.addEventListener('activate', function(event) {
    event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.filter(function(cacheName) {
            return cacheName.startsWith('restaurantReviews-') &&
                   cacheName != staticCacheName;
          }).map(function(cacheName) {
            return caches.delete(cacheName);
          })
        );
      })
    );
  });
  
  self.addEventListener('fetch', function(event) {
    var requestedUrl = new URL(event.request.url);
    if(requestedUrl.origin===location.origin){
      if(requestedUrl.pathname ==='/'){
        event.respondWith(caches.match('skeleton'));
      }
    }
  
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
    );
  });
  
  self.addEventListener('message', function(event) {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
  });