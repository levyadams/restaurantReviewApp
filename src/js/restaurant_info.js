import DBHelper from './DBHelper';


document.addEventListener('DOMContentLoaded', (event) => {
  let restaurant = new restaurant();
}
);

class restaurant{
  constructor(){
    window.initMap = this.initMap.bind(this);
    
    let restaurant;
    var map;
  }

    initMap(){
      fetchRestaurantFromURL((error, restaurant) => {
        if (error) { // Got an error!
          console.error(error);
        } else {
          this.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 16,
            center: restaurant.latlng,
            scrollwheel: false
          });
          DBHelper.mapMarkerForRestaurant(this.restaurant, this.map);
        }
      });
    }
  
  /**
   * Get current restaurant from page URL.
   */
   fetchRestaurantFromURL(callback){
    if (this.restaurant) { // restaurant already fetched!
      callback(null, this.restaurant)
      return;
    }
    const id = getParameterByName('id');
    if (!id) { // no id found in URL
      error = 'No restaurant id in URL'
      callback(error, null);
    } else {
      DBHelper.fetchRestaurantById(id, (error, restaurant) => {
        this.restaurant = restaurant;
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
   fillRestaurantHTML(restaurant = this.restaurant){
    const name = document.getElementById('restaurant-name');
    name.innerHTML = restaurant.name;
    
    const address = document.getElementById('restaurant-address');
    address.setAttribute("aria-label","Restaurant Adress");
    address.innerHTML = restaurant.address;
    
    const image = document.getElementById('restaurant-img');
    image.className = 'restaurant-img';
    const sourceJpeg = document.createElement('source');
    const sourceWebp = document.createElement('source');
    const imageSource = document.createElement('img'); 
    imageSource.alt=`Image of ${restaurant.name}`;
    imageSource.src = DBHelper.imageUrlForRestaurant(restaurant);
    sourceWebp.setAttribute("srcset",`${imageSource.src}_small_1x.webp 550w, ${imageSource.src}_medium_1x.webp 800w,
    ${imageSource.src}_large_1x.webp 1600w`);
    sourceJpeg.setAttribute("srcset",`${imageSource.src}_small_1x.jpg 550w, ${imageSource.src}_medium_1x.jpg 800w,
    ${imageSource.src}_large_1x.jpg 1600w`);
    image.append(sourceWebp,sourceJpeg,imageSource);
    

    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;
    
    // fill operating hours
    if (restaurant.operating_hours) {
      this.fillRestaurantHoursHTML();
    }
    // fill reviews
    this.fillReviewsHTML();
  }
  
  /**
   * Create restaurant operating hours HTML table and add it to the webpage.
   */
  
   fillRestaurantHoursHTML(operatingHours = this.restaurant.operating_hours){
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
   fillReviewsHTML(reviews = this.restaurant.reviews){
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
   createReviewHTML(review){
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

   fillBreadcrumb(restaurant = this.restaurant){
    const breadcrumb = document.getElementById('breadcrumb');
    const li = document.createElement('li');
    li.innerHTML = restaurant.name;
    breadcrumb.appendChild(li);
  }
  
  /**
   * Get a parameter by name from page URL.
   */

   getParameterByName(name, url){
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
}


  
 
 
  
