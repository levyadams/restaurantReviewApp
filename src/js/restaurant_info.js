let restaurant;
var map;



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
    address.setAttribute("aria-label","Restaurant Adress");
    address.innerHTML = restaurant.address;
    
    const image = document.getElementById('restaurant-img');
    image.className = 'restaurant-img'
    image.alt=`Image of ${restaurant.name}`;
    image.src = DBHelper.imageUrlForRestaurant(restaurant);
    image.setAttribute("srcset",`${image.src}__550_small_1x.jpg 550w, ${image.src}__800_medium_1x.jpg 800w,
    ${image.src}__1600_large_1x 1600w.jpg`);
    
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
      day.setAttribute("class","table-day");
      row.appendChild(day);
      
      const time = document.createElement('td');
      time.innerHTML = operatingHours[key];
      time.setAttribute("class","table-time");
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
    rating.setAttribute("class","restaurant-rating");
    li.appendChild(rating);
    
    const comments = document.createElement('p');
    comments.innerHTML = review.comments;
    li.appendChild(comments);
    
    return li;
  }
  
  /**
   * Add restaurant name to the breadcrumb navigation menu
   */
  let fillBreadcrumb = (restaurant=self.restaurant) => {
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

  exports.module={
    fetchRestaurantFromURL,
    fillRestaurantHTML,
    fillRestaurantHoursHTML,
    fillReviewsHTML
  }
  
