import DBHelper from './dbhelper.js';
import lazy from './lazyloader.js';

let mapURL;
let restaurants,
  neighborhoods,
  cuisines
let map
let markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
window.addEventListener('load', (event) => {
  loadMap();
});
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
  document.getElementById("neighborhoods-select").focus();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
let fetchNeighborhoods = () => {
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
let fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
    updateRestaurants();
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
let fetchCuisines = () => {
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
let fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');
  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}
function loadMap() {
  let staticMap = document.createElement('img');
  staticMap.className = 'map-image';
  staticMap.src = markersForStaticMap();
  map = document.getElementById('map');
  map.append(staticMap);
};
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
  addMarkersToMap();
}

/**
 * Update page and map for current restaurants.
 */
let updateRestaurants = () => {
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
let resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';
  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(m => m.setMap(null));
    self.markers = [];
  }
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
let fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
}

/**
 * Create restaurant HTML.
 */
let createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  li.className = 'list-item';
  li.id = restaurant.id;
  const name = document.createElement('h1');
  name.innerHTML = restaurant.name;
  li.append(name);

  const image = document.createElement('picture');
  const imageSource = document.createElement('img');
  imageSource.className = 'restaurant-img';
  const sourceJpeg = document.createElement('source');
  const sourceWebp = document.createElement('source');
  let imageURL = DBHelper.imageUrlForRestaurant(restaurant);
  if (imageURL === '/images/undefined') {
    imageURL = '/images/no_image';
  }
  imageSource.setAttribute('src', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcPiWrHgAFdQIWjjm6lwAAAABJRU5ErkJggg==');
  imageSource.setAttribute('data-src', `${imageURL}_small_1x.webp`);
  sourceWebp.setAttribute("srcset", `${imageURL}_small_1x.webp 550w, ${imageURL}_medium_1x.webp 800w,
  ${imageURL}_large_1x.webp 1600w`);
  sourceJpeg.setAttribute("srcset", `${imageURL}_small_1x.jpg 550w, ${imageURL}_medium_1x.jpg 800w,
  ${imageURL}_large_1x.jpg 1600w`);
  imageSource.setAttribute("alt", `Image of ${restaurant.name}`);
  image.alt = `Image of ${restaurant.name}`;
  image.append(imageSource, sourceWebp, sourceJpeg);
  li.append(image);

  const neighborhood = document.createElement('h2');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);


  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  address.setAttribute("aria-label", "Address");
  li.append(address);

  const more = document.createElement('a');
  const text = document.createElement('p');
  const moreDiv = document.createElement('div');

  moreDiv.setAttribute("class", "more-div");
  text.setAttribute("class", "more-text");

  more.append(moreDiv);
  moreDiv.append(text);

  text.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  moreDiv.setAttribute("aria-label", `${restaurant.name} ${restaurant.neighborhood} ${restaurant.address}`);
  li.append(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
let addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url;
    });
    markers.push(marker);
  });
}

function markersForStaticMap() {
  let mapAdd = 'https://maps.googleapis.com/maps/api/staticmap?center=40.722216,-73.987501&size=640x320&zoom=11.5&scale=2&maptype=roadmap'
  self.restaurants.forEach(restaurant => {
    let tmp = `&markers=${restaurant.latlng.lat},${restaurant.latlng.lng}`;
    mapAdd += tmp;
  })
  return mapAdd;
}



