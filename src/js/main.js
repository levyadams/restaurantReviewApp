import lazy from './lazyloader.js';
window.addEventListener('load',()=>{
  console.log('ran');
  CreateNavBar();
  FillNavigationBar('products','/products');
  FillNavigationBar('about','/about');
})

function CreateNavBar(){
  let container = document.createElement('div');
  container.id='navigation-elements';
  let navbar = document.getElementById('nav');
  navbar.append(container);
}

function FillNavigationBar(name,url){
  let container = document.getElementById('navigation-elements');
  let title = document.createElement('button');
  title.setAttribute('onclick',`location.href="${url}";`);
  title.setAttribute('value',`button for ${name}`);
  title.innerText = name;
  let tmp = document.createElement('h1');
  tmp.append(title);
  container.append(tmp);
}