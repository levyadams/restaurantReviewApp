import DBHelper from './DBHelper';

document.addEventListener('DOMContentLoaded', (event) => {
    let index = new Main();
    document.getElementById("neighborhoods-select").focus();
  }
);
class Main{
  constructor(){
    
    window.initMap = this.initMap.bind(this);
    this.fetchNeighborhoods();
    this.fetchCuisines();
    let restaurants,
    neighborhoods,
    cuisines
    var map
    let markers = []
  }
  
    
   initMap(){
    let loc = {
      lat: 40.722216,
      lng: -73.987501
    };
    this.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 12,
      center: loc,
      scrollwheel: false
    });
    this.updateRestaurants();
  }
  /**
   * Fetch neighborhoods and cuisines as soon as the page is loaded.
   */
  
  /**
   * Fetch all neighborhoods and set their HTML.
   */
  
   fetchNeighborhoods(){
     console.log('ran');
    DBHelper.fetchNeighborhoods((error, neighborhoods) => {
      if (error) { // Got an error
        console.error(error);
      } else {
        this.neighborhoods = neighborhoods;
        this.fillNeighborhoodsHTML(neighborhoods);
      }
    });
  }
  
  /**
   * Set neighborhoods HTML.
   */
  
   fillNeighborhoodsHTML(neighborhoods = this.neighborhoods){
    const select = document.getElementById('neighborhoods-select');
    neighborhoods.forEach(neighborhood => {
      const option = document.createElement('option');
      option.innerHTML = neighborhood;
      option.value = neighborhood;
      select.append(option);
    });
    this.addMarkersToMap();
  }
  
  /**
   * Fetch all cuisines and set their HTML.
   */
  
   fetchCuisines(){
    DBHelper.fetchCuisines((error, cuisines) => {
      if (error) { // Got an error!
        console.error(error);
      } else {
        this.cuisines = cuisines;
        this.fillCuisinesHTML();
      }
    });
  }
  
  /**
   * Set cuisines HTML.
   */
  
   fillCuisinesHTML(cuisines = this.cuisines){
    const select = document.getElementById('cuisines-select');
    
    cuisines.forEach(cuisine => {
      const option = document.createElement('option');
      option.innerHTML = cuisine;
      option.value = cuisine;
      select.append(option);
    });
  }
  
  /**
   * Update page and map for current restaurants.
   */
   updateRestaurants(){
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
        this.resetRestaurants(restaurants);
        this.fillRestaurantsHTML(restaurants);
      }
    })
  }
  
  /**
   * Clear current restaurants, their HTML and remove their map markers.
   */
  
   resetRestaurants(restaurants){
    // Remove all restaurants
    this.restaurants = [];
    const ul = document.getElementById('restaurants-list');
    ul.innerHTML = '';
    
    // Remove all map markers
    this.markers.forEach(m => m.setMap(null));
    this.markers = [];
    this.restaurants = restaurants;
  }
  
  /**
   * Create all restaurants HTML and add them to the webpage.
   */
   fillRestaurantsHTML(restaurants = this.restaurants){
    const ul = document.getElementById('restaurants-list');
    restaurants.forEach(restaurant => {
      ul.append(createRestaurantHTML(restaurant));
    });
  }
  
  /**
   * Create restaurant HTML.
   */
   createRestaurantHTML(restaurant){
    const li = document.createElement('li');
    
    const name = document.createElement('h1');
    name.innerHTML = restaurant.name;
    li.append(name);
    
    const image = document.createElement('picture');
    const sourceJpeg = document.createElement('source');
    const sourceWebp = document.createElement('source');
    const imageSource = document.createElement('img'); 
    imageSource.className = 'restaurant-img';
    imageSource.src = DBHelper.imageUrlForRestaurant(restaurant);
    sourceWebp.setAttribute("srcset",`${imageSource.src}_small_1x.webp 550w, ${imageSource.src}_medium_1x.webp 800w,
    ${imageSource.src}_large_1x.webp 1600w`);
    sourceJpeg.setAttribute("srcset",`${imageSource.src}_small_1x.jpg 550w, ${imageSource.src}_medium_1x.jpg 800w,
    ${imageSource.src}_large_1x.jpg 1600w`);
    imageSource.setAttribute("alt",`Image of ${restaurant.name}`);
    image.alt = `Image of ${restaurant.name}`;
    
    image.append(sourceWebp,sourceJpeg,imageSource);
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
   addMarkersToMap(restaurants = this.restaurants){
    restaurants.forEach(restaurant => {
      // Add marker to the map
      const marker = DBHelper.mapMarkerForRestaurant(restaurant, this.map);
      google.maps.event.addListener(marker, 'click', () => {
        window.location.href = marker.url
      });
      this.markers.push(marker);
    });
  }
}



