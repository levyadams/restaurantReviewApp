import DBHelper from './dbhelper.js';
import lazy from './lazyloader.js';
let mymap;
let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.addEventListener('load', (event) => {
  loadMap();
});
document.addEventListener('DOMContentLoaded', (event) => {
  fetchRestaurantFromURL((error, restaurant) => { if (error) { console.error(error); } });
});
function loadMap() {
  mymap = L.map('mapid', { center: [40.722216, -73.987501], zoom: 12 });
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
  }).addTo(mymap);
  markersForStaticMap();
};

function markersForStaticMap(restaurant = self.restaurant) {
    let marker = L.marker([restaurant.latlng.lat, restaurant.latlng.lng], {
      keyboard: false,
      bounceOnAdd: true,
      bounceOnAddOptions: { duration: 500, height: 100 },
    }).addTo(mymap);
    marker.bindPopup(`<a href="${DBHelper.urlForRestaurant(restaurant)}">${restaurant.name}</a>`);
}

window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
let fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
let fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.setAttribute("aria-label", "Restaurant Adress");
  address.innerHTML = restaurant.address;

  const image = document.createElement('picture');
  const imageSource = document.getElementById('details-img');
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
  let container = document.getElementById('restaurant-container');
  container.insertBefore(image, container.childNodes[1]);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */

let fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    day.setAttribute("class", "table-day");
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    time.setAttribute("class", "table-time");
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
let fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
let createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = review.date;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.setAttribute("class", "restaurant-rating");
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
let fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
let getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


