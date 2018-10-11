import idb from 'idb';

let tmpReviewContainer = {};
/**
 * Common database helper functions.
 */
if ('serviceWorker' in navigator) {
  //add event listener to the, "loaded" event that the page sends after it has downloaded all the things.
  window.addEventListener('load', function () {
    //we tell the browsers service worker to register our script as its main functional script, then on a promise we either
    //tell the user hey you did it or wow you did not do it and spit out either response.
    checkOfflineReviews();
    navigator.serviceWorker.register('/sw.js').then(function (response) {}, function (err) {
      console.log('ServiceWorker registration failed: ', err);
      //at this point sw.js runs. Turn the page.
    });
  });
}

let checkOfflineReviews = () => {
  offlineReviewsDB.then(db => {
    const tx = db.transaction('reviews', 'readwrite');
    let store = tx.objectStore('reviews');
    let index = store.index('by-name');
    index.getAll().then(function (object) {
      if (object.length === 0) {
        return;
      } else {
        DBHelper.submitReview(object);
        console.log('review sent, huzzah!');
        store.clear();
      }
    })
  })
};

//create new database with idb-promises library
let restaurantDB = idb.open('restaurant_db', 1, upgradeDB => {
  let store = upgradeDB.createObjectStore('restaurants', {
    keyPath: 'id',
  });
  store.createIndex('by-name', 'name');
});
let reviewsDB = idb.open('reviews_db', 1, upgradeDB => {
  let store = upgradeDB.createObjectStore('reviews', {
    keyPath: 'id',
  });
  store.createIndex('by-name', 'name');
});
let mainUserDB = idb.open('user_db', 1, upgradeDB => {
  let store = upgradeDB.createObjectStore('mainUser', {
    keyPath: 'name'
  });
  store.createIndex('by-name', 'name');

});
let offlineReviewsDB = idb.open('offline_review_db', 1, upgradeDB => {
  let store = upgradeDB.createObjectStore('reviews', {
    keyPath: 'name'
  });
  store.createIndex('by-name', 'name');

});

export default class DBHelper {

  static addRestaurantsToDB(objects) {
    restaurantDB.then(db => {
      const tx = db.transaction('restaurants', 'readwrite');
      let store = tx.objectStore('restaurants');
      objects.forEach(function (object) {
        store.put(object);
      });
    });
  };
  static addReviewsToDB(objects) {
    reviewsDB.then(db => {
      const tx = db.transaction('reviews', 'readwrite');
      let store = tx.objectStore('reviews');
      objects.forEach(function (object) {
        store.put(object);
      });
    });
  };
  static addReviewsToOfflineDB(review) {
    alert("Offline! Review will be added when reconnected..");
    offlineReviewsDB.then(db => {
      const tx = db.transaction('reviews', 'readwrite');
      let store = tx.objectStore('reviews');
      store.put(review);
    });
  };
  static addMainUserToDB(object) {
    mainUserDB.then(db => {
      const tx = db.transaction('mainUser', 'readwrite');
      let store = tx.objectStore('mainUser');
      store.put(object);
    });
  };


  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', DBHelper.DATABASE_URL);
    xhr.onload = () => {
      if (xhr.status === 200) { // Got a success response from server!
        const json = JSON.parse(xhr.responseText);
        // const restaurants = json.restaurants;
        this.addRestaurantsToDB(json);
        callback(null, json);
      } else { // Oops!. Got an error from server.
        restaurantDB.then(db => {
          const tx = db.transaction('restaurants', 'readwrite');
          let store = tx.objectStore('restaurants');
          let index = store.index('by-name');
          index.getAll().then(function (object) {
            callback(null, json);
          });
        });
        // const error = (`Request failed. Returned status of ${xhr.status}`);
        // callback(error, null);
      }
    };
    xhr.send();
  }
  static fetchReviews(callback) {
    fetch('http://localhost:1337/reviews/', {
        method: 'GET',
      }).then(res => res.json())
      .then(response => this.addReviewsToDB(response))
      .catch(error => console.error('Fetch Reviews Error:', error))
  }

  static fetchReviewsByID(id, callback) {
    fetch(`http://localhost:1337/reviews/?restaurant_id=${id}`, {
        method: 'GET',
      }).then(res => res.json())
      .then(res => callback(null, res))
      .catch(error => console.error('Fetch Reviews Error:', error))

  }

  static fetchMainUser(callback) {
    mainUserDB.then(db => {
      const tx = db.transaction('mainUser', 'readwrite');
      let store = tx.objectStore('mainUser');
      let index = store.index('by-name');
      index.getAllKeys().then(function (object) {
        callback(object);
      });
    });
  };

  static submitReview(review) {
    tmpReviewContainer = review;
    fetch('http://localhost:1337/reviews/', {
        method: 'POST',
        body: JSON.stringify(review), // data can be `string` or {object}!
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => res.json())
      .then(response => console.log('Success:', JSON.stringify(response)))
      .catch(error => this.addReviewsToOfflineDB(tmpReviewContainer))
  }

  static updateReview(id, review) {
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", `http://localhost:1337/reviews/${id}`);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onload = () => {
      console.log(`${xhr.status} is the status after update.`);
      if (xhr.status === 200) {
        console.log("submitted!");
      } else {
        callback('Review not updated!', null);
      }
    }
    xhr.send(JSON.stringify(review));
  }

  static favoriteRestaurant(id, isFavorite) {
    let url = `http://localhost:1337/restaurants/${id}/?`;
    console.log(isFavorite);
    if (isFavorite) {
      var data = {
        is_favorite: false
      };
      fetch(url, {
          method: 'PUT',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(res => res.json())
        .then(response => console.log('Success:', JSON.stringify(response)))
        .catch(error => console.error('Error:', error));

    } else {
      var data = {
        is_favorite: true
      };
      fetch(url, {
          method: 'PUT',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(res => res.json())
        .then(response => console.log('Success:', JSON.stringify(response)))
        .catch(error => console.error('Error:', error));
    }

  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */

  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */

  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/images/${restaurant.photograph}`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP
    });
    return marker;
  }

}