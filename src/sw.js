//Ultra-lite service-worker, written somewhat by Levy Adams.
//**---->https://github.com/levyadams<-----**//



let staticCacheName = 'restaurantReviews-static-v1';
//for some reason passing the cache in the function no work right, so do it outside of it like a dis
let urlToCache = [
  '/index.html',
  '/restaurant.html',
  '/js/main.js',
  '/js/restaurant_info.js',
  '/js/dbhelper.js',
  '/js/lazyloader.js'
  
  
];
//we add a event listener for the "install" service worker event, triggered when the SW is installed properly.
// self.addEventListener('install', function(event) {
//   //we add a waitUntil event for caches.open to load completely, then with a promise add the directories we want to cache.
//     event.waitUntil(
//       caches.open(staticCacheName).then(function(cache) {
//         return cache.addAll(urlToCache);
//       })
//     );
//   });
//   //An event listener that catches all outgoing http attempts at the server, and returns those fetches 
//   //items from the current skeleton framework that exist in the cache.
//   self.addEventListener('fetch', function(event) {
//     //we take the url request
//     // var requestedUrl = new URL(event.request.url);
//    //if the root request is from the same origin..
//     if(event.request.url.origin===location.origin){
//       //if the pathname involves anything to do with the entire directory...
//       if(event.request.url ='/'){
//         //respond with the cache data instead. Wow, magic.
//         event.respondWith(caches.match(event.request));
//       }
//     }
//   //If the origin is not the same as the root origin, we check the cache still, and if nothing is there
//   //we fetch the request finally from the server.
//     event.respondWith(
//       caches.match(event.request).then(function(response) {
//         return response || fetch(event.request);
//       })
//     );
//   });
// //we use skip waiting to force the service worker to become active.
//   self.addEventListener('message', function(event) {
//     if (event.data.action === 'skipWaiting') {
//         self.skipWaiting();
//     }
//   });
  self.addEventListener('fetch', function(event) {
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
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
            function(response) {
              // Check if we received a valid response
              if(!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
  
              // IMPORTANT: Clone the response. A response is a stream
              // and because we want the browser to consume the response
              // as well as the cache consuming the response, we need
              // to clone it so we have two streams.
              var responseToCache = response.clone();
  
              caches.open(staticCacheName)
                .then(function(cache) {
                  cache.put(event.request, responseToCache);
                });
  
              return response;
            }
          );
        })
      );
  });
