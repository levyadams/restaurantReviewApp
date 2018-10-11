import DBHelper from './dbhelper.js';
import lazy from './lazyloader.js';
let mymap;
let restaurant;
var map;
let currentReviews = [];
let userReviewRating;
let userReview = [];
let favoriteButton;
let nameFieldInput;
let hasReviews = false;
let commentInput;
let currentUser = {
  "name": ""
};

/**
 * Initialize Google map, called from HTML.
 */
window.addEventListener('load', (event) => {
  loadMap();
});
document.addEventListener('DOMContentLoaded', (event) => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) {
      console.error(error);
    }
  });
});

function loadMap() {
  mymap = L.map('mapid', {
    center: [40.722216, -73.987501],
    zoom: 12
  });
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
    bounceOnAddOptions: {
      duration: 500,
      height: 100
    },
  }).addTo(mymap);
  marker.bindPopup(`<a href="${DBHelper.urlForRestaurant(restaurant)}">${restaurant.name}</a>`);
}

window.initMap = () => {

  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 16,
    center: restaurant.latlng,
    scrollwheel: false
  });
  fillBreadcrumb();
  DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
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
      fetchRestaurantReviews();
      fetchMainUser();
      callback(null, restaurant)
    });
  }
}
let fetchRestaurantReviews = () => {
  let thisID = self.restaurant.id;
  DBHelper.fetchReviewsByID(thisID, (error, reviews) => {
    if (error) {
      console.error(error);
    } else {
      currentReviews = reviews;
      DBHelper.addReviewsToDB(reviews);
      if (!hasReviews) {
        fillReviewsHTML();
        hasReviews = true;
      }
    }
  });
}



let fetchMainUser = () => {
  DBHelper.fetchMainUser((user) => {
    currentUser = user;
  });
};

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

let changeRestaurantRating = (rating) => {
  userReviewRating = rating;
};

let checkAndSendReview = (user, review) => {
  let tmpUser = {
    "name": user
  }
  let isUpdate = false;
  let commentID;

  if (tmpUser.name === "") {
    alert("Please enter a username!");
    return;
  }
  if (currentUser) {
    currentReviews.forEach(review => {
      if (tmpUser.name === review.name) {
        isUpdate = true;
        commentID = review.id;
      }
    });
  }

  if (userReviewRating === undefined) {
    alert("Please choose a rating from 0 (dislike) - 5 (like).");
  }
  if (review === "") {
    alert("Please enter a review!");
    return;
  }
  let newReview = {
    "restaurant_id": self.restaurant.id,
    "name": user,
    "rating": userReviewRating,
    "comments": review
  }
  let updateReview = {
    "name": tmpUser.name,
    "rating": userReviewRating,
    "comments": review
  }
  if (isUpdate) {
    DBHelper.updateReview(commentID, newReview);
  } else {
    currentUser = tmpUser;
    DBHelper.submitReview(newReview);
    DBHelper.addMainUserToDB(currentUser);
  }
  nameFieldInput.innerHTML = '';
  commentInput.innerHTML = '';

};
let favoriteOrUnfavoriteRestaurant = () => {
  if (self.restaurant.is_favorite) {
    DBHelper.favoriteRestaurant(self.restaurant.id, true);
    favoriteButton.innerHTML = "Favorite This Restaurant";
  } else {
    DBHelper.favoriteRestaurant(self.restaurant.id, false);
    favoriteButton.innerHTML = "UnFavorite This Restaurant";
  }

}

/**
 * Create all reviews HTML and add them to the webpage.
 */
let fillReviewsHTML = (reviews = currentReviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  let userReviewContainer = document.createElement("div");
  userReviewContainer.setAttribute("class", "user-review-container");
  let userReviewTitle = document.createElement('h3');
  userReviewTitle.innerHTML = "Add your review";
  userReviewContainer.appendChild(userReviewTitle);

  let userReviewFavoriteButton = document.createElement("button");
  userReviewFavoriteButton.setAttribute("alt", "Button to favorite this website.");
  favoriteButton = userReviewFavoriteButton;
  if (self.restaurant.is_favorite === true) {
    userReviewFavoriteButton.innerHTML = "Unfavorite this place";
  } else if (self.restaurant.is_favorite === false) {
    userReviewFavoriteButton.innerHTML = "Favorite this place";
  }
  userReviewFavoriteButton.onclick = function () {
    favoriteOrUnfavoriteRestaurant();

  };
  userReviewFavoriteButton.setAttribute("class", "favorite-Button");
  userReviewContainer.appendChild(userReviewFavoriteButton);




  let userReviewNameTitle = document.createElement('h4');
  userReviewNameTitle.innerHTML = "Your Name";
  let userReviewNameInput = document.createElement('input');
  userReviewNameInput.setAttribute("alt", "Enter your name here.");

  nameFieldInput = userReviewNameInput;
  userReviewNameInput.setAttribute("class", "name-input");
  userReviewNameInput.innerHTML = "name here";
  userReviewContainer.appendChild(userReviewNameTitle);
  userReviewContainer.appendChild(userReviewNameInput);

  let userReviewRatingTitle = document.createElement('h4');
  userReviewRatingTitle.innerHTML = "Your Rating";

  let ratingButtonContainer = document.createElement('div');
  ratingButtonContainer.setAttribute("class", "rating-button-container");
  let zeroRatingButton = document.createElement("button");
  zeroRatingButton.setAttribute("alt", "Review rating of : 0 (bad)");

  zeroRatingButton.onclick = function () {
    changeRestaurantRating(0)
  };
  zeroRatingButton.innerHTML = "0";
  ratingButtonContainer.appendChild(zeroRatingButton);

  let oneRatingButton = document.createElement("button");
  oneRatingButton.setAttribute("alt", "Review rating of : 1");
  oneRatingButton.innerHTML = "1";
  oneRatingButton.onclick = function () {
    changeRestaurantRating(1)
  };

  ratingButtonContainer.appendChild(oneRatingButton);

  let twoRatingButton = document.createElement("button");
  twoRatingButton.setAttribute("alt", "Review rating of : 2");
  twoRatingButton.innerHTML = "2";
  twoRatingButton.onclick = function () {
    changeRestaurantRating(2)
  };

  ratingButtonContainer.appendChild(twoRatingButton);

  let threeRatingButton = document.createElement("button");
  threeRatingButton.setAttribute("alt", "Review rating of : 3");
  threeRatingButton.innerHTML = "3";
  threeRatingButton.onclick = function () {
    changeRestaurantRating(3)
  };

  ratingButtonContainer.appendChild(threeRatingButton);

  let fourRatingButton = document.createElement("button");
  fourRatingButton.setAttribute("alt", "Review rating of : 4");
  fourRatingButton.innerHTML = "4";
  fourRatingButton.onclick = function () {
    changeRestaurantRating(4)
  };

  ratingButtonContainer.appendChild(fourRatingButton);

  let fiveRatingButton = document.createElement("button");
  fiveRatingButton.setAttribute("alt", "Review rating of : 5");
  fiveRatingButton.innerHTML = "5";
  fiveRatingButton.onclick = function () {
    changeRestaurantRating(5)
  };
  ratingButtonContainer.appendChild(fiveRatingButton);
  userReviewContainer.appendChild(ratingButtonContainer);

  let userReviewCommentTitle = document.createElement('h4');
  userReviewCommentTitle.innerHTML = "Your Review";
  let userReviewCommentInput = document.createElement("input");
  userReviewCommentInput.setAttribute("alt","enter your review into this box");
  commentInput = userReviewCommentInput;
  userReviewCommentInput.setAttribute("class", "comment-box");
  let userReviewCommentSubmitButton = document.createElement('button');
  userReviewCommentSubmitButton.setAttribute("alt","Submit your review button.");
  userReviewCommentSubmitButton.setAttribute("id", "review-submit-button");
  userReviewCommentSubmitButton.onclick = function () {
    checkAndSendReview(userReviewNameInput.value, userReviewCommentInput.value)
  };
  userReviewCommentSubmitButton.innerHTML = "Submit Review";
  userReviewContainer.appendChild(userReviewCommentTitle);
  userReviewContainer.appendChild(userReviewCommentInput);
  userReviewContainer.appendChild(userReviewCommentSubmitButton);

  container.appendChild(userReviewContainer);

  if (!currentReviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  currentReviews.forEach(review => {
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

  // const date = document.createElement('p');
  // date.innerHTML = review.date;
  // li.appendChild(date);

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