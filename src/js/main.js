import lazy from './lazyloader.js';
let frontPagePosts;
window.addEventListener('DOMContentLoaded', () => {
  CreateNavBar();
  FillNavigationBar('products', '/products');
  FillNavigationBar('about', '/about');
  
  fetchPosts();
})

function CreateNavBar() {
  let container = document.createElement('div');
  container.id = 'navigation-elements';
  let navbar = document.getElementById('nav');
  navbar.append(container);
}

function FillNavigationBar(name, url) {
  let container = document.getElementById('navigation-elements');
  let title = document.createElement('button');
  title.setAttribute('onclick', `location.href="${url}";`);
  title.setAttribute('value', `button for ${name}`);
  title.innerText = name;
  let tmp = document.createElement('h1');
  tmp.append(title);
  container.append(tmp);
}

function FillFrontPagePosts() {
  let container = document.getElementById('main-content');
  let list = document.createElement('ul');
  list.setAttribute('id', `post-list`);
  frontPagePosts.forEach(function (post) {
    const li = document.createElement('li');
    li.className = 'post-item';
    li.id = post.id;
    const title = document.createElement('h1');
    name.innerHTML = post.title;
    li.append(name);

    const image = document.createElement('picture');
    const imageSource = document.createElement('img');
    imageSource.className = 'post-img';
    const sourceJpeg = document.createElement('source');
    const sourceWebp = document.createElement('source');
    let imageURL = `/images/${post.id}`;
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
    image.alt = `Image for ${post.title}`;
    image.append(imageSource, sourceWebp, sourceJpeg);
    li.append(image);

    const details = document.createElement('h2');
    details.innerHTML = post.details;
    li.append(details);

    const user = document.createElement('p');
    user.innerHTML = post.user;
    user.setAttribute("aria-label", "user who made the post");
    li.append(user);
  });
}

/**
  * Database URL.
  * Change this to restaurants.json file location on your server.
  */
function DATABASE_URL() {
  const port = 3000 // Change this to your server port
  return `http://localhost:${port}/data/posts.json`;
}

/**
 * Fetch all restaurants.
 */
function fetchPosts(callback) {
  let xhr = new XMLHttpRequest();
  xhr.open('GET', DBHelper.DATABASE_URL);
  xhr.onload = () => {
    if (xhr.status === 200) { // Got a success response from server!
      const json = JSON.parse(xhr.responseText);
      frontPagePosts = json;
      callback(null, posts);
    } else { // Oops!. Got an error from server.
      const error = (`Request failed. Returned status of ${xhr.status}`);
      callback(error, null);
    }
  };
  xhr.send();
}

