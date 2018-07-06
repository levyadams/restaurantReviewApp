import lazy from './lazyloader.js';
import theme from './themeloader.js';
let postIndex = [{
    "id": 1,
    "title": "EasyAvatar goes commercial",
    "details": "EasyAvatar(name may change later) only has a few fixes before being submitted! Notice the bleed-through on the skin? This is caused by depth render order being too close together in unity, causing us to see the skin underneath! It also happens from good 'ol fashion meshes moving past each other. To solve this, we use unity render order, a custom shader, and some functional programming methods to ensure people using the asset can add whatever clothing they want without bleed-through or other horrid camera effects. Pretty cool, eh?",
    "media": "/images/clothesbroken",
    "user": "@LeviAdams14",
    "userAvatar": '/images/svg/GameDevLogo.svg',
    "userHeader": 'Levy - Webmaster/Coder'

  },
  {
    "id": 0,
    "title": "GameDevStudent.com is online!",
    "details": "Wow, can you believe this is our first post ever? Pretty freaking crazy! This site will be a resource for people learning game development, mainly c#. As our lives progress, so will this website, I'm sure! We plan on offering several small assets for cheaper than you see on the unity asset store for similar packages, as ours will be cut and dry, with not much for bells or whistles. We have found that bulky packages make it hard for people making games who use assets to understand the base functionality of the system they are using. Most of our assets will come with a suite of videos and written tutorials for the game dev student to understand the core of the coding principles, instead of re-coding the same old poorly scoped functions.",
    "media": "/images/IDE",
    "user": "@LeviAdams14",
    "userAvatar": '/images/svg/GameDevLogo.svg',
    "userHeader": 'Levy - Webmaster/Coder'

  }
];
window.addEventListener('DOMContentLoaded', () => {
  // fetchPosts();
  FillFrontPagePosts();
})



function FillFrontPagePosts() {
  let container = document.getElementById('post-list');

  postIndex.forEach(function (post) {
    const li = document.createElement('li');
    let card = document.createElement('div');
    card.id = 'post-card';
    li.id = post.id;
    let header_container = document.createElement('div');
    header_container.id = 'post-header';
    let userAvatar = document.createElement('img');
    userAvatar.id = 'user-avatar';
    userAvatar.src = post.userAvatar;
    const title = document.createElement('h1');
    title.id = 'post-title';
    title.innerHTML = post.title;
    header_container.append(userAvatar,title);
    let userInfo = document.createElement('h2');
    userInfo.id='post-user-info';
    userInfo.innerHTML = post.userHeader;
    card.append(header_container);
    card.append(userInfo);
    li.append(card);
    container.append(li);

    const image = document.createElement('picture');
    const imageSource = document.createElement('img');
    imageSource.className = 'post-img';
    const sourceJpeg = document.createElement('source');
    const sourceWebp = document.createElement('source');
    let imageURL = `${post.media}`;
    if (imageURL === '/images/undefined') {
      imageURL = '/images/no_image';
    }
    imageSource.setAttribute('src', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcPiWrHgAFdQIWjjm6lwAAAABJRU5ErkJggg==');
    imageSource.setAttribute('data-src', `${imageURL}_small_1x.webp`);
    sourceWebp.setAttribute("srcset", `${imageURL}_small_1x.webp 550w, ${imageURL}_medium_1x.webp 800w,
  ${imageURL}_large_1x.webp 1600w`);
    sourceJpeg.setAttribute("srcset", `${imageURL}_small_1x.jpg 550w, ${imageURL}_medium_1x.jpg 800w,
  ${imageURL}_large_1x.jpg 1600w`);
    imageSource.setAttribute("alt", `Image for ${post.title}`);
    image.alt = `Image for ${post.title}`;
    image.append(imageSource, sourceWebp, sourceJpeg);
    card.append(image);

    const details = document.createElement('p');
    details.innerHTML = post.details;
    card.append(details);

    const user = document.createElement('p');
    user.innerHTML = post.user;
    user.setAttribute("aria-label", "user who made the post");
    card.append(user);
  });
}



/**
 * Fetch all restaurants.
 */
function fetchPosts(posts = self.frontPagePosts) {
  let xhr = new XMLHttpRequest();
  xhr.open('GET', "./html/data/posts.json");
  xhr.onload = () => {
    if (xhr.status === 200) { // Got a success response from server!
      const json = JSON.parse(xhr.responseText);
      self.postIndex = json;
      FillFrontPagePosts();
      // callback(null, json);
    } else { // Oops!. Got an error from server.
      const error = (`Request failed. Returned status of ${xhr.status}`);
      // callback(error, null);
    }
  };
  xhr.send();
}