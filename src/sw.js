//Ultra-lite service-worker, written somewhat by Levy Adams.
//**---->https://github.com/levyadams<-----**//



let staticCacheName = 'restaurantReviews-static-v1';
//for some reason passing the cache in the function no work right, so do it outside of it like a dis
let urlToCache = [
  '/index.html',
  '/restaurant.html',
  '/js/main.js',
  '/js/restaurant_info.js'
];
//we add a event listener for the "install" service worker event, triggered when the SW is installed properly.
self.addEventListener('install', function(event) {
  //we add a waitUntil event for caches.open to load completely, then with a promise add the directories we want to cache.
    event.waitUntil(
      caches.open(staticCacheName).then(function(cache) {
        return cache.addAll(urlToCache);
      })
    );
  });
  //An event listener that catches all outgoing http attempts at the server, and returns those fetches 
  //items from the current skeleton framework that exist in the cache.
  self.addEventListener('fetch', function(event) {
    //we take the url request
    // var requestedUrl = new URL(event.request.url);
   //if the root request is from the same origin..
    if(event.request.url.origin===location.origin){
      //if the pathname involves anything to do with the entire directory...
      if(event.request.url ='/'){
        //respond with the cache data instead. Wow, magic.
        event.respondWith(caches.match(event.request));
      }
    }
  //If the origin is not the same as the root origin, we check the cache still, and if nothing is there
  //we fetch the request finally from the server.
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
    );
  });
//we use skip waiting to force the service worker to become active.
  self.addEventListener('message', function(event) {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
  });

