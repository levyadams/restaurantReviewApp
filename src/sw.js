
let staticCacheName = 'restaurantReviews-static-v1';
//for some reason passing the cache in the function no work right, so do it outside of it like a dis
let urlToCache = 
[
  '/index.html',
  '/restaurant.html',
  '/js/main.js',
  '/js/restaurant_info.js',
 
];
let offlineReview ={};
let reviewToSend = false;
self.addEventListener('install', function (event) {
  //we add a waitUntil event for caches.open to load completely, then with a promise add the directories we want to cache.
  event.waitUntil(
    caches.open(staticCacheName).then(function (cache) {
      return cache.addAll(urlToCache);
    })
  );
});

self.addEventListener('message', function(event){
  offlineReview = event.data;
  console.log(event.data);
});

self.addEventListener('fetch', function (event) {
  if (event.request.method != "POST") {
    event.respondWith(
      caches.match(event.request)
      .then(function (response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // IMPORTANT: Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the response.
        var fetchRequest = event.request.clone();
        return fetch(fetchRequest).then(
          function (response) {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              //this could be more robust possibly
              return response;
            }
            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            var responseToCache = response.clone();
            caches.open(staticCacheName)
              .then(function (cache) {
                cache.put(event.request, responseToCache);
              });
            return response;
          }
        );
      })
    );
  }
  else{
    console.log('POST!');
  }
});