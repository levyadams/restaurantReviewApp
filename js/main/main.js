
let restaurants,
  neighborhoods,
  cuisines
var map
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
  document.getElementById("neighborhoods-select").focus();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  
  const name = document.createElement('h1');
  name.innerHTML = restaurant.name;
  li.append(name);
  
  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.setAttribute("alt",`Image of ${restaurant.name}`);
  image.setAttribute("srcset",`${image.src}-550_small_1x.jpg 550w, ${image.src}-800_medium_1x.jpg 800w,
  ${image.src}-1600_large_1x.jpg 1600w`);
  image.alt = `Image of ${restaurant.name}`;
  li.append(image);
  
  const neighborhood = document.createElement('h2');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);
  
  
  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  address.setAttribute("aria-label","Address");
  li.append(address);
  
  const more = document.createElement('a');
  const text = document.createElement('p');
  const moreDiv = document.createElement('div');
  moreDiv.setAttribute("class","more-div");
  text.setAttribute("class","more-text");
  more.append(moreDiv);
  moreDiv.append(text);
  text.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  moreDiv.setAttribute("aria-label",`${restaurant.name} ${restaurant.neighborhood} ${restaurant.address}`);
  // more.alt = `${restaurant.name} ${restaurant.neighborhood} ${restaurant.address}`

  li.append(more)
  
  return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}

/**
 * Service Worker
 */
//if the browser supports service worker. This can and needs to be scaled in a commercial scale.
if ('serviceWorker' in navigator) {
  //add event listener to the, "loaded" event that the page sends after it has downloaded all the things.
  window.addEventListener('load', function() {
    //we tell the browsers service worker to register our script as its main functional script, then on a promise we either
    //tell the user hey you did it or wow you did not do it and spit out either response.
    navigator.serviceWorker.register('/sw.js').then(function(response) {
      console.log('ServiceWorker registration successful with scope: ', response.scope);
    }, function(err) {
      console.log('ServiceWorker registration failed: ', err);
      //at this point sw.js runs. Turn the page.
    });
  });
}

